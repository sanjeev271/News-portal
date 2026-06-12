const Article = require("../models/Article");
const LiveEvent = require("../models/LiveEvent");
const LiveUpdate = require("../models/LiveUpdate");
const Category = require("../models/Category");
const User = require("../models/User");
const SearchLog = require("../models/SearchLog");

const ATLAS_INDEX = process.env.ATLAS_SEARCH_INDEX || "default";
const USE_ATLAS = process.env.ATLAS_SEARCH_ENABLED === "true";

const articlePopulate = [
  { path: "category" },
  { path: "author", select: "name email role avatar" },
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text, query) {
  if (!text || !query) return text || "";
  const re = new RegExp(`(${escapeRegex(query)})`, "gi");
  return text.replace(re, "<mark>$1</mark>");
}

function buildSnippet(text, query, maxLen = 160) {
  if (!text) return "";
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return text.slice(0, maxLen) + (text.length > maxLen ? "…" : "");
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + q.length + 80);
  const snippet = (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
  return highlightText(snippet, query);
}

async function atlasSearchArticles(query, { page, limit, locale, category }) {
  const filter = [{ equals: { path: "status", value: "published" } }];
  if (locale) filter.push({ equals: { path: "locale", value: locale } });
  if (category) filter.push({ equals: { path: "category", value: category } });

  const pipeline = [
    {
      $search: {
        index: ATLAS_INDEX,
        compound: {
          must: [
            {
              text: {
                query,
                path: ["title", "summary", "content", "tags", "keywords"],
                fuzzy: { maxEdits: 1, prefixLength: 2 },
              },
            },
          ],
          filter,
        },
        highlight: { path: ["title", "summary"] },
      },
    },
    { $addFields: { score: { $meta: "searchScore" } } },
    { $sort: { score: -1 } },
    {
      $facet: {
        items: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        total: [{ $count: "count" }],
      },
    },
  ];

  const [result] = await Article.aggregate(pipeline);
  const ids = (result?.items || []).map((a) => a._id);
  const articles = await Article.find({ _id: { $in: ids } }).populate(articlePopulate);
  const order = new Map(ids.map((id, i) => [String(id), i]));
  articles.sort((a, b) => order.get(String(a._id)) - order.get(String(b._id)));

  return {
    items: articles.map((a) => ({
      ...a.toObject(),
      _type: "article",
      highlight: {
        title: highlightText(a.title, query),
        summary: buildSnippet(a.summary || a.content, query),
      },
    })),
    total: result?.total?.[0]?.count || 0,
  };
}

async function regexSearchArticles(query, { page, limit, locale, category, sort = "publishedAt" }) {
  const filter = { status: "published" };
  if (locale) filter.locale = locale;
  if (category) filter.category = category;

  const re = new RegExp(escapeRegex(query), "i");
  const textFilter = {
    ...filter,
    $or: [
      { title: re },
      { summary: re },
      { content: re },
      { tags: re },
      { keywords: re },
    ],
  };

  const sortObj = sort === "views" ? { views: -1 } : sort === "likes" ? { likes: -1 } : { publishedAt: -1 };

  const [articles, total] = await Promise.all([
    Article.find(textFilter).populate(articlePopulate).sort(sortObj).skip((page - 1) * limit).limit(limit),
    Article.countDocuments(textFilter),
  ]);

  return {
    items: articles.map((a) => ({
      ...a.toObject(),
      _type: "article",
      highlight: {
        title: highlightText(a.title, query),
        summary: buildSnippet(a.summary || a.content, query),
      },
    })),
    total,
  };
}

async function searchArticles(query, opts) {
  if (USE_ATLAS) {
    try {
      return await atlasSearchArticles(query, opts);
    } catch {
      /* fall through to regex */
    }
  }
  return regexSearchArticles(query, opts);
}

async function searchLiveEvents(query, { page, limit }) {
  const re = new RegExp(escapeRegex(query), "i");
  const filter = { $or: [{ title: re }, { description: re }, { location: re }] };
  const [items, total] = await Promise.all([
    LiveEvent.find(filter).populate("category").sort({ status: 1, startedAt: -1 }).skip((page - 1) * limit).limit(limit),
    LiveEvent.countDocuments(filter),
  ]);
  return {
    items: items.map((e) => ({
      ...e.toObject(),
      _type: "liveEvent",
      highlight: { title: highlightText(e.title, query) },
    })),
    total,
  };
}

async function searchLiveUpdates(query, { page, limit }) {
  const re = new RegExp(escapeRegex(query), "i");
  const filter = { $or: [{ text: re }, { title: re }, { quote: re }, { officialStatement: re }] };
  const [items, total] = await Promise.all([
    LiveUpdate.find(filter).populate("author", "name avatar").populate("liveEvent", "title slug").skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
    LiveUpdate.countDocuments(filter),
  ]);
  return {
    items: items.map((u) => ({
      ...u.toObject(),
      _type: "liveUpdate",
      highlight: { title: highlightText(u.title || u.text?.slice(0, 80), query) },
    })),
    total,
  };
}

async function searchCategories(query, { limit = 10 } = {}) {
  const re = new RegExp(escapeRegex(query), "i");
  const items = await Category.find({ $or: [{ name: re }, { description: re }] }).limit(limit);
  return items.map((c) => ({ ...c.toObject(), _type: "category", highlight: { title: highlightText(c.name, query) } }));
}

async function searchTags(query, { limit = 10 } = {}) {
  const re = new RegExp(escapeRegex(query), "i");
  const articles = await Article.find({ status: "published", tags: re }).select("tags").limit(100);
  const tagSet = new Set();
  articles.forEach((a) => {
    (a.tags || []).forEach((tag) => {
      if (re.test(tag)) tagSet.add(tag);
    });
  });
  return [...tagSet].slice(0, limit).map((tag) => ({ _type: "tag", tag, highlight: { title: highlightText(tag, query) } }));
}

async function searchReporters(query, { limit = 10 } = {}) {
  const re = new RegExp(escapeRegex(query), "i");
  const items = await User.find({ role: "reporter", $or: [{ name: re }, { email: re }] })
    .select("name email avatar role")
    .limit(limit);
  return items.map((r) => ({ ...r.toObject(), _type: "reporter", highlight: { title: highlightText(r.name, query) } }));
}

async function universalSearch(query, options = {}) {
  const {
    types = ["articles", "liveEvents", "liveUpdates", "categories", "tags", "reporters"],
    page = 1,
    limit = 12,
    locale,
    category,
    sort = "publishedAt",
    userId,
  } = options;

  const q = (query || "").trim();
  if (!q) {
    return { query: q, results: {}, totals: {}, total: 0, page, pages: 0 };
  }

  const results = {};
  const totals = {};
  let total = 0;

  const tasks = [];

  if (types.includes("articles")) {
    tasks.push(
      searchArticles(q, { page, limit, locale, category, sort }).then((r) => {
        results.articles = r.items;
        totals.articles = r.total;
        total += r.total;
      })
    );
  }

  if (types.includes("liveEvents")) {
    tasks.push(
      searchLiveEvents(q, { page, limit: Math.min(limit, 8) }).then((r) => {
        results.liveEvents = r.items;
        totals.liveEvents = r.total;
        total += r.total;
      })
    );
  }

  if (types.includes("liveUpdates") && page === 1) {
    tasks.push(
      searchLiveUpdates(q, { page: 1, limit: 8 }).then((r) => {
        results.liveUpdates = r.items;
        totals.liveUpdates = r.total;
        total += r.total;
      })
    );
  }

  if (types.includes("categories") && page === 1) {
    tasks.push(
      searchCategories(q).then((items) => {
        results.categories = items;
        totals.categories = items.length;
        total += items.length;
      })
    );
  }

  if (types.includes("tags") && page === 1) {
    tasks.push(
      searchTags(q).then((items) => {
        results.tags = items;
        totals.tags = items.length;
        total += items.length;
      })
    );
  }

  if (types.includes("reporters") && page === 1) {
    tasks.push(
      searchReporters(q).then((items) => {
        results.reporters = items;
        totals.reporters = items.length;
        total += items.length;
      })
    );
  }

  await Promise.all(tasks);

  SearchLog.create({ query: q.toLowerCase(), user: userId || null, locale, resultCount: total }).catch(() => {});

  const articleTotal = totals.articles || 0;
  return {
    query: q,
    results,
    totals,
    total,
    page,
    pages: Math.ceil(articleTotal / limit) || 1,
  };
}

async function autocomplete(query, { locale, limit = 8 } = {}) {
  const q = (query || "").trim();
  if (!q) return { suggestions: [] };

  const [articles, events, categories] = await Promise.all([
    searchArticles(q, { page: 1, limit: 5, locale }),
    searchLiveEvents(q, { page: 1, limit: 3 }),
    searchCategories(q, { limit: 3 }),
  ]);

  const suggestions = [
    ...articles.items.map((a) => ({
      type: "article",
      id: a._id,
      title: a.title,
      slug: a.slug,
      url: `/article/${a.slug}`,
    })),
    ...events.items.map((e) => ({
      type: "liveEvent",
      id: e._id,
      title: e.title,
      slug: e.slug,
      url: `/live-event/${e.slug}`,
    })),
    ...categories.map((c) => ({
      type: "category",
      id: c._id,
      title: c.name,
      slug: c.slug,
      url: `/category/${c.slug}`,
    })),
  ].slice(0, limit);

  return { suggestions };
}

async function getTrendingSearches({ limit = 8, days = 7 } = {}) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await SearchLog.aggregate([
    { $match: { createdAt: { $gte: since }, query: { $ne: "" } } },
    { $group: { _id: "$query", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
  return rows.map((r) => ({ query: r._id, count: r.count }));
}

async function getRecentSearches(userId, { limit = 8 } = {}) {
  if (!userId) return [];
  const rows = await SearchLog.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit * 3)
    .select("query createdAt");

  const seen = new Set();
  const unique = [];
  for (const row of rows) {
    if (seen.has(row.query)) continue;
    seen.add(row.query);
    unique.push({ query: row.query, searchedAt: row.createdAt });
    if (unique.length >= limit) break;
  }
  return unique;
}

module.exports = {
  universalSearch,
  autocomplete,
  getTrendingSearches,
  getRecentSearches,
  searchArticles,
  highlightText,
  buildSnippet,
};
