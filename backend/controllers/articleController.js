const Article = require("../models/Article");
const slugify = require("slugify");
const { normalizeArticleFields } = require("../utils/articleFormat");

const populateOpts = [
  { path: "category" },
  { path: "author", select: "name email role" }
];

function parseBool(val) {
  return val === true || val === "true";
}

function buildArticleData(body, files) {
  const normalized = normalizeArticleFields(body, files);

  const data = {
    title: normalized.title,
    summary: normalized.summary,
    content: normalized.content,
    category: body.category,
    status: body.status || "draft",
    isBreaking: parseBool(body.isBreaking),
    mediaType: body.mediaType || "article",
    locale: body.locale || "en",
    seoTitle: normalized.seoTitle,
    seoDescription: normalized.seoDescription,
    keywords: body.keywords ? (Array.isArray(body.keywords) ? body.keywords : body.keywords.split(",").map((k) => k.trim())) : []
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

exports.createArticle = async (req, res) => {
  try {
    const data = buildArticleData(req.body, req.files);
    data.slug = await uniqueSlug(data.title);
    data.author = req.user.id;

    if (data.scheduledAt && data.scheduledAt > new Date()) {
      data.status = "scheduled";
    }

    const article = await Article.create(data);
    const populated = await Article.findById(article._id).populate(populateOpts);

    const io = req.app.get("io");
    if (io && populated.status === "published") {
      io.emit("new_article", populated);
      io.emit("push_notification", { title: "Breaking News", message: populated.title });
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
    if (req.query.locale) filter.locale = req.query.locale;
    if (req.query.type) filter.mediaType = req.query.type;

    const articles = await Article.find(filter)
      .populate(populateOpts)
      .sort({ publishedAt: -1, createdAt: -1 });

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminArticles = async (req, res) => {
  try {
    const articles = await Article.find()
      .populate(populateOpts)
      .sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchArticles = async (req, res) => {
  try {
    const q = req.query.q || "";
    if (!q.trim()) return res.json([]);

    const articles = await Article.find(
      { $text: { $search: q }, status: "published" },
      { score: { $meta: "textScore" } }
    )
      .populate(populateOpts)
      .sort({ score: { $meta: "textScore" } })
      .limit(20);

    res.json(articles);
  } catch (error) {
    const articles = await Article.find({
      status: "published",
      $or: [
        { title: { $regex: req.query.q, $options: "i" } },
        { summary: { $regex: req.query.q, $options: "i" } }
      ]
    }).populate(populateOpts).limit(20);
    res.json(articles);
  }
};

exports.getTrending = async (req, res) => {
  try {
    const articles = await Article.find({ status: "published" })
      .populate(populateOpts)
      .sort({ views: -1, likes: -1 })
      .limit(10);
    res.json(articles);
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
    if (normalized.featuredImage) article.featuredImage = normalized.featuredImage;

    ["category", "status", "mediaType", "locale"].forEach((f) => {
      if (req.body[f] !== undefined) article[f] = req.body[f];
    });

    if (req.body.isBreaking !== undefined) article.isBreaking = parseBool(req.body.isBreaking);
    if (req.body.keywords) {
      article.keywords = Array.isArray(req.body.keywords)
        ? req.body.keywords
        : req.body.keywords.split(",").map((k) => k.trim());
    }
    if (req.body.scheduledAt) article.scheduledAt = new Date(req.body.scheduledAt);
    if (req.body.status === "published" && article.status !== "published") {
      article.publishedAt = new Date();
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

    const updated = await article.save();
    const populated = await Article.findById(updated._id).populate(populateOpts);

    const io = req.app.get("io");
    if (io && populated.status === "published") {
      io.emit("new_article", populated);
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    await article.deleteOne();
    res.json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
