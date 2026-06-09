const mongoose = require("mongoose");
const slugify = require("slugify");
require("dotenv").config();

const Article = require("../models/Article");
const Category = require("../models/Category");
const User = require("../models/User");

const RSS_FEEDS = [
  { url: "http://feeds.bbci.co.uk/news/world/rss.xml", category: "World" },
  { url: "http://feeds.bbci.co.uk/news/technology/rss.xml", category: "Technology" },
  { url: "http://feeds.bbci.co.uk/news/business/rss.xml", category: "Business" },
  { url: "http://feeds.bbci.co.uk/news/science_and_environment/rss.xml", category: "Science" },
  { url: "http://feeds.bbci.co.uk/sport/rss.xml", category: "Sports" },
];

const CATEGORIES = [
  { name: "World", slug: "world", description: "Global news and international affairs" },
  { name: "Technology", slug: "technology", description: "Tech industry and innovation" },
  { name: "Business", slug: "business", description: "Markets, economy and finance" },
  { name: "Science", slug: "science", description: "Science and environment" },
  { name: "Sports", slug: "sports", description: "Sports news and results" },
  { name: "Politics", slug: "politics", description: "Political news and policy" },
];

function stripHtml(html = "") {
  return html.replace(/<[^>]+>/g, "").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
}

function parseRssItems(xml) {
  const items = xml.split("<item>").slice(1);
  return items.map((block) => {
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/s)?.[1]
      || block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/s)?.[2]
      || "";
    const description = block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/s)?.[1]
      || block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/s)?.[2]
      || "";
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] || "";
    const image =
      block.match(/url="(https?:\/\/[^"]+)"/)?.[1]
      || block.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1]
      || block.match(/<enclosure[^>]+url="([^"]+)"[^>]+type="image/)?.[1]
      || null;
    return { title: stripHtml(title), description: stripHtml(description), link, image };
  }).filter((item) => item.title && item.title !== "BBC News");
}

async function ensureCategories() {
  const map = {};
  for (const cat of CATEGORIES) {
    let doc = await Category.findOne({ slug: cat.slug });
    if (!doc) doc = await Category.create(cat);
    map[cat.name] = doc._id;
  }
  return map;
}

async function fetchFeed(url) {
  const res = await fetch(url, { headers: { "User-Agent": "NewsPortal/1.0" } });
  if (!res.ok) throw new Error(`Feed failed: ${url}`);
  const xml = await res.text();
  return parseRssItems(xml);
}

function buildContent(summary, sourceLink) {
  const paragraphs = summary.split(/(?<=[.!?])\s+/).filter(Boolean);
  const body = paragraphs.length
    ? paragraphs.map((p) => `<p>${p}</p>`).join("")
    : `<p>${summary}</p>`;
  return `${body}<p><em>Source: <a href="${sourceLink}" target="_blank" rel="noopener noreferrer">BBC News</a></em></p>`;
}

async function seedNews({ force = false, maxPerFeed = 4 } = {}) {
  const publishedCount = await Article.countDocuments({ status: "published" });
  if (!force && publishedCount >= 10) {
    console.log(`Skipping news seed — ${publishedCount} articles already published.`);
    return { skipped: true, count: publishedCount };
  }

  const admin = await User.findOne({ role: "admin" });
  if (!admin) throw new Error("Admin user not found. Run seedAdmin first.");

  const categoryMap = await ensureCategories();
  let created = 0;

  for (const feed of RSS_FEEDS) {
    let items;
    try {
      items = await fetchFeed(feed.url);
    } catch (err) {
      console.warn(`Could not fetch ${feed.url}:`, err.message);
      continue;
    }

    for (const item of items.slice(0, maxPerFeed)) {
      const baseSlug = slugify(item.title, { lower: true, strict: true }).slice(0, 80);
      const exists = await Article.findOne({ slug: baseSlug });
      if (exists) continue;

      const summary = item.description.slice(0, 280) || item.title;
      const image = item.image || `https://picsum.photos/seed/${encodeURIComponent(baseSlug)}/1200/675`;

      await Article.create({
        title: item.title,
        slug: baseSlug,
        summary,
        content: buildContent(summary, item.link || feed.url),
        category: categoryMap[feed.category],
        author: admin._id,
        status: "published",
        isBreaking: created === 0,
        mediaType: "article",
        featuredImage: image,
        views: Math.floor(Math.random() * 5000) + 200,
        likes: Math.floor(Math.random() * 300) + 10,
        publishedAt: new Date(Date.now() - created * 3600000),
        seoTitle: item.title,
        seoDescription: summary,
      });
      created++;
    }
  }

  console.log(`Seeded ${created} news articles from BBC RSS feeds.`);
  return { skipped: false, created };
}

module.exports = seedNews;

if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      const result = await seedNews({ force: process.argv.includes("--force") });
      console.log(result);
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
