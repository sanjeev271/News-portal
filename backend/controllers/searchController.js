const searchService = require("../services/searchService");

exports.search = async (req, res) => {
  try {
    const types = req.query.types
      ? req.query.types.split(",").map((t) => t.trim())
      : ["articles", "liveEvents", "liveUpdates", "categories", "tags", "reporters"];

    const result = await searchService.universalSearch(req.query.q, {
      types,
      page: parseInt(req.query.page, 10) || 1,
      limit: Math.min(parseInt(req.query.limit, 10) || 12, 50),
      locale: req.query.locale,
      category: req.query.category,
      sort: req.query.sort || "publishedAt",
      userId: req.user?.id,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.autocomplete = async (req, res) => {
  try {
    const result = await searchService.autocomplete(req.query.q, {
      locale: req.query.locale,
      limit: Math.min(parseInt(req.query.limit, 10) || 8, 15),
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.trending = async (req, res) => {
  try {
    const items = await searchService.getTrendingSearches({
      limit: Math.min(parseInt(req.query.limit, 10) || 8, 20),
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.recent = async (req, res) => {
  try {
    const items = await searchService.getRecentSearches(req.user?.id, {
      limit: Math.min(parseInt(req.query.limit, 10) || 8, 20),
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchArticles = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ articles: [], total: 0, page: 1, pages: 0 });

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
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
