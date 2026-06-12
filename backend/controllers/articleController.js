const Article = require("../models/Article");
const slugify = require("slugify");
const { normalizeArticleFields } = require("../utils/articleFormat");
const { emitArticlePublished, emitArticleUpdated } = require("../socket/emitter");
const { createNotification } = require("../services/notificationService");
const searchService = require("../services/searchService");

const populateOpts = [
  { path: "category" },
  { path: "author", select: "name email role avatar" },
  { path: "createdBy", select: "name email role" },
  { path: "approvedBy", select: "name email role" },
];

function parseBool(val) {
  return val === true || val === "true";
}

function buildArticleData(body, files) {
  const normalized = normalizeArticleFields(body, files);

  const tags = body.tags
    ? Array.isArray(body.tags)
      ? body.tags
      : body.tags.split(",").map((k) => k.trim())
    : [];

  const keywords = body.keywords
    ? Array.isArray(body.keywords)
      ? body.keywords
      : body.keywords.split(",").map((k) => k.trim())
    : tags;

  const data = {
    title: normalized.title,
    subtitle: body.subtitle || "",
    summary: normalized.summary,
    content: normalized.content,
    category: body.category,
    status: body.status || "draft",
    isBreaking: parseBool(body.isBreaking),
    isFeatured: parseBool(body.isFeatured),
    isTrending: parseBool(body.isTrending),
    mediaType: body.mediaType || "article",
    locale: body.locale || "en",
    seoTitle: normalized.seoTitle,
    seoDescription: normalized.seoDescription,
    tags,
    keywords,
  };

  if (body.scheduledAt) data.scheduledAt = new Date(body.scheduledAt);
  if (body.status === "published") data.publishedAt = new Date();

  if (normalized.featuredImage) data.featuredImage = normalized.featuredImage;
  const toUploadPath = (filePath) => {
    const p = filePath.replace(/\\/g, "/");
    return p.includes("/uploads/") ? p.slice(p.indexOf("uploads/")) : p;
  };
  if (files?.video?.[0]) data.videoUrl = toUploadPath(files.video[0].path);
  if (files?.gallery) {
    data.gallery = files.gallery.map((f) => ({ url: toUploadPath(f.path), caption: "" }));
  }

  return data;
}

async function uniqueSlug(title) {
  const base = slugify(title, { lower: true, strict: true });
  let slug = base;
  let n = 1;
  while (await Article.findOne({ slug })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

function canReporterEdit(article, userId) {
  return (
    String(article.author) === userId ||
    String(article.createdBy) === userId
  );
}

function enforceReporterStatus(data, bodyStatus) {
  if (bodyStatus === "published") {
    data.status = "pending";
  } else if (["draft", "pending"].includes(bodyStatus)) {
    data.status = bodyStatus;
  } else {
    data.status = "draft";
  }
}

function addRevision(article, userId, note) {
  article.revisionHistory = article.revisionHistory || [];
  article.revisionHistory.push({
    editedBy: userId,
    status: article.status,
    note: note || "",
    editedAt: new Date(),
  });
}

exports.createArticle = async (req, res) => {
  try {
    const data = buildArticleData(req.body, req.files);
    data.slug = await uniqueSlug(data.title);
    data.author = req.user.id;
    data.createdBy = req.user.id;

    if (req.user.role === "reporter") {
      enforceReporterStatus(data, req.body.status);
    }

    if (data.scheduledAt && data.scheduledAt > new Date() && req.user.role === "admin") {
      data.status = "scheduled";
    }

    const article = await Article.create(data);
    addRevision(article, req.user.id, "Created");
    await article.save();

    const populated = await Article.findById(article._id).populate(populateOpts);

    if (populated.status === "published") {
      emitArticlePublished(req.app, populated);
      await createNotification(req.app, {
        type: "article_published",
        title: "New Article",
        message: populated.title,
        link: `/article/${populated.slug}`,
      });
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getArticles = async (req, res) => {
  try {
    const filter = { status: "published" };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.categorySlug) {
      const Category = require("../models/Category");
      const cat = await Category.findOne({ slug: req.query.categorySlug });
      if (cat) filter.category = cat._id;
      else if (req.query.page) return res.json({ articles: [], total: 0, page: 1, pages: 0, hasMore: false });
      else return res.json([]);
    }
    if (req.query.locale) filter.locale = req.query.locale;
    if (req.query.type) filter.mediaType = req.query.type;
    if (req.query.featured === "true") filter.isFeatured = true;
    if (req.query.breaking === "true") filter.isBreaking = true;
    if (req.query.trending === "true") filter.isTrending = true;

    const sortField = req.query.sort || "publishedAt";
    const sort = { [sortField]: -1, createdAt: -1 };

    const runQuery = async (activeFilter) => {
      if (req.query.page) {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);
        const skip = (page - 1) * limit;

        const [articles, total] = await Promise.all([
          Article.find(activeFilter).populate(populateOpts).sort(sort).skip(skip).limit(limit),
          Article.countDocuments(activeFilter),
        ]);

        return {
          articles,
          total,
          page,
          pages: Math.ceil(total / limit),
          hasMore: skip + articles.length < total,
        };
      }

      const articles = await Article.find(activeFilter).populate(populateOpts).sort(sort);
      return articles;
    };

    let result = await runQuery(filter);

    if (req.query.locale && req.query.page) {
      const empty = !result.articles?.length;
      if (empty && req.query.locale === "ne") {
        const fallbackFilter = { ...filter };
        delete fallbackFilter.locale;
        result = await runQuery(fallbackFilter);
      }
    } else if (req.query.locale && Array.isArray(result) && result.length === 0 && req.query.locale === "ne") {
      const fallbackFilter = { ...filter };
      delete fallbackFilter.locale;
      result = await runQuery(fallbackFilter);
    }

    if (req.query.page) return res.json(result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminArticles = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const articles = await Article.find(filter).populate(populateOpts).sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingArticles = async (req, res) => {
  try {
    const articles = await Article.find({ status: "pending" })
      .populate(populateOpts)
      .sort({ updatedAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReporterArticles = async (req, res) => {
  try {
    const articles = await Article.find({
      $or: [{ author: req.user.id }, { createdBy: req.user.id }],
    })
      .populate(populateOpts)
      .sort({ updatedAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchArticles = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ articles: [], total: 0, page: 1, pages: 0, hasMore: false });

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);

    const { items, total } = await searchService.searchArticles(q, {
      page,
      limit,
      locale: req.query.locale,
      category: req.query.category,
      sort: req.query.sort || "publishedAt",
    });

    res.json({
      articles: items,
      total,
      page,
      pages: Math.ceil(total / limit) || 0,
      hasMore: page * limit < total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTrending = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 20);
    const sort = { isTrending: -1, views: -1, likes: -1 };
    const baseFilter = { status: "published" };
    const locale = req.query.locale;

    let filter = { ...baseFilter };
    if (locale) filter.locale = locale;

    let articles = await Article.find(filter).populate(populateOpts).sort(sort).limit(limit);

    if (!articles.length && locale === "ne") {
      articles = await Article.find(baseFilter).populate(populateOpts).sort(sort).limit(limit);
    }

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRelated = async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug }).populate("category");
    if (!article) return res.status(404).json({ message: "Article not found" });

    const filter = {
      status: "published",
      _id: { $ne: article._id },
    };
    if (article.category) filter.category = article.category._id;

    let related = await Article.find(filter).populate(populateOpts).sort({ publishedAt: -1 }).limit(4);

    const tagList = article.tags?.length ? article.tags : article.keywords;
    if (related.length < 4 && tagList?.length) {
      const extra = await Article.find({
        status: "published",
        _id: { $nin: [article._id, ...related.map((a) => a._id)] },
        $or: [{ tags: { $in: tagList } }, { keywords: { $in: tagList } }],
      })
        .populate(populateOpts)
        .sort({ publishedAt: -1 })
        .limit(4 - related.length);
      related = [...related, ...extra];
    }

    res.json(related);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getByTag = async (req, res) => {
  try {
    const tag = decodeURIComponent(req.params.tag).trim();
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);
    const skip = (page - 1) * limit;
    const filter = {
      status: "published",
      $or: [{ tags: { $regex: new RegExp(`^${tag}$`, "i") } }, { keywords: { $regex: new RegExp(`^${tag}$`, "i") } }],
    };

    const [articles, total] = await Promise.all([
      Article.find(filter).populate(populateOpts).sort({ publishedAt: -1 }).skip(skip).limit(limit),
      Article.countDocuments(filter),
    ]);

    res.json({ articles, total, page, pages: Math.ceil(total / limit), hasMore: skip + articles.length < total, tag });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getByAuthor = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);
    const skip = (page - 1) * limit;
    const filter = { status: "published", author: req.params.authorId };

    const User = require("../models/User");
    const author = await User.findById(req.params.authorId).select("name email role avatar");
    if (!author) return res.status(404).json({ message: "Author not found" });

    const [articles, total] = await Promise.all([
      Article.find(filter).populate(populateOpts).sort({ publishedAt: -1 }).skip(skip).limit(limit),
      Article.countDocuments(filter),
    ]);

    res.json({ author, articles, total, page, pages: Math.ceil(total / limit), hasMore: skip + articles.length < total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getArticle = async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug }).populate(populateOpts);
    if (!article) return res.status(404).json({ message: "Article not found" });

    article.views += 1;
    await article.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("article_viewed", { articleId: article._id, views: article.views });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    if (req.user.role === "reporter" && !canReporterEdit(article, req.user.id)) {
      return res.status(403).json({ message: "Not authorized to edit this article" });
    }

    const normalized = normalizeArticleFields(
      { ...req.body, title: req.body.title ?? article.title },
      req.files,
      { title: article.title, featuredImage: article.featuredImage }
    );

    article.title = normalized.title;
    article.summary = normalized.summary;
    article.content = normalized.content;
    article.seoTitle = normalized.seoTitle;
    article.seoDescription = normalized.seoDescription;
    if (req.body.subtitle !== undefined) article.subtitle = req.body.subtitle;
    if (normalized.featuredImage) article.featuredImage = normalized.featuredImage;

    ["category", "mediaType", "locale"].forEach((f) => {
      if (req.body[f] !== undefined) article[f] = req.body[f];
    });

    if (req.body.isBreaking !== undefined) article.isBreaking = parseBool(req.body.isBreaking);
    if (req.body.isFeatured !== undefined) article.isFeatured = parseBool(req.body.isFeatured);
    if (req.body.isTrending !== undefined) article.isTrending = parseBool(req.body.isTrending);

    if (req.body.tags) {
      article.tags = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(",").map((k) => k.trim());
      article.keywords = article.tags;
    } else if (req.body.keywords) {
      article.keywords = Array.isArray(req.body.keywords) ? req.body.keywords : req.body.keywords.split(",").map((k) => k.trim());
    }

    if (req.body.scheduledAt) article.scheduledAt = new Date(req.body.scheduledAt);

    if (req.body.status !== undefined) {
      if (req.user.role === "reporter") {
        enforceReporterStatus(article, req.body.status);
      } else if (req.user.role === "admin") {
        article.status = req.body.status;
        if (req.body.status === "published" && !article.publishedAt) {
          article.publishedAt = new Date();
          article.approvedBy = req.user.id;
        }
      }
    }

    if (req.body.title) article.slug = slugify(req.body.title, { lower: true, strict: true });

    const toUploadPath = (filePath) => {
      const p = filePath.replace(/\\/g, "/");
      return p.includes("/uploads/") ? p.slice(p.indexOf("uploads/")) : p;
    };
    if (req.files?.video?.[0]) article.videoUrl = toUploadPath(req.files.video[0].path);
    if (req.files?.gallery) {
      article.gallery = [
        ...(article.gallery || []),
        ...req.files.gallery.map((f) => ({ url: toUploadPath(f.path), caption: "" })),
      ];
    }

    article.updatedBy = req.user.id;
    addRevision(article, req.user.id, req.body.revisionNote || "Updated");
    const updated = await article.save();
    const populated = await Article.findById(updated._id).populate(populateOpts);

    emitArticleUpdated(req.app, populated);
    if (populated.status === "published") {
      emitArticlePublished(req.app, populated);
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitForReview = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    if (!canReporterEdit(article, req.user.id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    article.status = "pending";
    article.updatedBy = req.user.id;
    addRevision(article, req.user.id, "Submitted for review");
    await article.save();

    res.json(await Article.findById(article._id).populate(populateOpts));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    article.status = "published";
    article.publishedAt = new Date();
    article.approvedBy = req.user.id;
    addRevision(article, req.user.id, "Approved and published");
    await article.save();

    const populated = await Article.findById(article._id).populate(populateOpts);
    emitArticlePublished(req.app, populated);

    if (article.author) {
      await createNotification(req.app, {
        user: article.author,
        type: "article_approved",
        title: "Article Approved",
        message: article.title,
        link: `/article/${article.slug}`,
      });
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    article.status = "rejected";
    article.rejectionReason = req.body.reason || "";
    article.approvedBy = req.user.id;
    addRevision(article, req.user.id, `Rejected: ${article.rejectionReason}`);
    await article.save();

    if (article.author) {
      await createNotification(req.app, {
        user: article.author,
        type: "article_rejected",
        title: "Article Needs Revision",
        message: article.rejectionReason || article.title,
        link: `/admin/edit/${article._id}`,
      });
    }

    res.json(await Article.findById(article._id).populate(populateOpts));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    if (req.user.role === "reporter" && !canReporterEdit(article, req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (req.user.role === "admin" && req.query.soft === "true") {
      article.status = "archived";
      await article.save();
      return res.json({ message: "Article archived" });
    }

    await article.deleteOne();
    res.json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
