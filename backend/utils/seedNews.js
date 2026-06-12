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
  { name: "World", nameNe: "विश्व", slug: "world", description: "Global news and international affairs" },
  { name: "Technology", nameNe: "प्रविधि", slug: "technology", description: "Tech industry and innovation" },
  { name: "Business", nameNe: "व्यापार", slug: "business", description: "Markets, economy and finance" },
  { name: "Science", nameNe: "विज्ञान", slug: "science", description: "Science and environment" },
  { name: "Sports", nameNe: "खेलकुद", slug: "sports", description: "Sports news and results" },
  { name: "Politics", nameNe: "राजनीति", slug: "politics", description: "Political news and policy" },
  { name: "Culture", nameNe: "संस्कृति", slug: "culture", description: "Arts, culture and entertainment" },
  { name: "Opinion", nameNe: "विचार", slug: "opinion", description: "Analysis and opinion" },
];

const NEPALI_ARTICLES = [
  {
    title: "नेपालमा मनसुन सक्रिय — पहाडी जिल्लामा भारी वर्षाको सम्भावना",
    slug: "nepal-monsoon-heavy-rain-forecast",
    summary: "मौसम विज्ञान विभागले आगामी ४८ घण्टामा गण्डकी, लुम्बिनी र कर्णाली प्रदेशका केही स्थानमा भारी वर्षा हुने जनाएको छ।",
    category: "world",
    isBreaking: true,
    isFeatured: true,
  },
  {
    title: "काठमाडौंमा सार्वजनिक यातायात विस्तार योजना पेश",
    slug: "kathmandu-public-transport-expansion",
    summary: "सरकारले राजधानीमा बिजुली बस र मेट्रो क्षेत्रको प्रारम्भिक अध्ययन सुरु गर्ने निर्णय गरेको छ।",
    category: "business",
  },
  {
    title: "नेपाली क्रिकेट टोलीले विश्व कप क्वालिफायरमा जित हासिल गर्‍यो",
    slug: "nepal-cricket-world-cup-qualifier-win",
    summary: "नेपालले निर्णायक खेलमा शानदार प्रदर्शन गर्दै अर्को चरणमा प्रवेश पाएको छ।",
    category: "sports",
    isFeatured: true,
  },
  {
    title: "कृत्रिम बुद्धिमत्ताले स्वास्थ्य सेवामा नयाँ सम्भावना देखाएको अध्ययन",
    slug: "ai-healthcare-nepal-study",
    summary: "स्थानीय अस्पतालहरूमा AI-आधारित निदान प्रणाली परीक्षण सुरु भएको छ।",
    category: "technology",
  },
  {
    title: "हिमाली क्षेत्रमा हिउँ पर्ने गति बढ्यो — यात्रा प्रभावित",
    slug: "himalayan-snowfall-travel-alert",
    summary: "उच्च हिमाली मार्गहरूमा सावधानी अपनाउन पर्यटन तथा परिवहन मन्त्रालयले आग्रह गरेको छ।",
    category: "world",
  },
  {
    title: "शेयर बजारमा सकारात्मक सूचक — निवेशकको विश्वास बढ्दो",
    slug: "nepse-market-positive-trend",
    summary: "नेप्से सूचकांक लगातार दोस्रो दिन वृद्धि भएपछि बजार विश्लेषकहरू सतर्क रहेका छन्।",
    category: "business",
  },
  {
    title: "लोक दोहोरी उत्सवमा रेकर्ड दर्शक सहभागिता",
    slug: "folk-dohari-festival-record-crowd",
    summary: "पोखरामा आयोजित उत्सवले स्थानीय संस्कृतिको जीवन्तता प्रदर्शन गरेको छ।",
    category: "culture",
  },
  {
    title: "संविधान संशोधन विषयमा दलहरू बीच संवाद जारी",
    slug: "constitution-amendment-dialogue",
    summary: "प्रमुख राजनीतिक दलहरूले संसदीय समितिमा संयुक्त प्रस्ताव तयार पार्ने तयारी गरेका छन्।",
    category: "politics",
  },
  {
    title: "जलवायु परिवर्तनले हिमाली जलाशयमा पारेको प्रभाव",
    slug: "climate-change-himalayan-waters",
    summary: "नयाँ अनुसन्धानले ग्लेसियर पग्लने दर बढेको र पानी स्रोत अस्थिर भएको देखाएको छ।",
    category: "science",
  },
  {
    title: "विदेश निर्भरता घटाउन ऊर्जा स्वयंस्फूर्तताको आवश्यकता",
    slug: "energy-self-reliance-opinion",
    summary: "विचारकहरूले जलविद्युत र सौर्य ऊर्जाको संयुक्त रणनीति अपनाउनुपर्ने बताएका छन्।",
    category: "opinion",
  },
  {
    title: "भारत-चीन सम्बन्धमा नयाँ व्यापार सम्झौताको असर",
    slug: "india-china-trade-impact-region",
    summary: "क्षेत्रीय अर्थतन्त्रमा निर्यात-आयात दायरा परिवर्तन हुन सक्ने विश्लेषण गरिएको छ।",
    category: "world",
  },
  {
    title: "५G नेटवर्क विस्तार योजना अर्को चरणमा",
    slug: "5g-network-expansion-nepal",
    summary: "दूरसञ्चार प्राधिकरणले मुख्य शहरहरूमा परीक्षण सफल भएको जनाएको छ।",
    category: "technology",
  },
  {
    title: "राष्ट्रिय फुटबल लिगको नयाँ सिजन आजदेखि सुरु",
    slug: "national-football-league-new-season",
    summary: "१२ टोली सहभागी हुने लिगमा उत्साहजनक प्रतिस्पर्धा अपेक्षा गरिएको छ।",
    category: "sports",
  },
  {
    title: "पर्यटन पुनरुत्थान — अन्तर्राष्ट्रिय आगमन बढ्दो",
    slug: "tourism-revival-international-arrivals",
    summary: "पहिलो त्रैमासिकमा विदेशी पर्यटक संख्या गत वर्षको तुलनामा उल्लेख्य वृद्धि भएको छ।",
    category: "business",
  },
  {
    title: "नेपाली चलचित्रले अन्तर्राष्ट्रिय पुरस्कार जित्यो",
    slug: "nepali-film-international-award",
    summary: "दक्षिण एसियाली चलचित्र महोत्सवमा प्रदर्शित फिल्मले सर्वश्रेष्ठ कथा पुरस्कार प्राप्त गर्‍यो।",
    category: "culture",
  },
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
    if (!doc) {
      doc = await Category.create(cat);
    } else if (cat.nameNe && doc.nameNe !== cat.nameNe) {
      doc.nameNe = cat.nameNe;
      await doc.save();
    }
    map[cat.slug] = doc._id;
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

function buildNepaliContent(summary) {
  return `<p>${summary}</p><p>यो समाचार सम्पादकीय टोलीद्वारा तयार पारिएको हो। थप अपडेटका लागि हाम्रो प्रत्यक्ष अपडेट खण्ड हेर्नुहोस्।</p>`;
}

async function seedNepaliArticles(categoryMap, admin) {
  let created = 0;
  for (let i = 0; i < NEPALI_ARTICLES.length; i++) {
    const item = NEPALI_ARTICLES[i];
    const exists = await Article.findOne({ slug: item.slug });
    if (exists) continue;

    const image = `https://picsum.photos/seed/${encodeURIComponent(item.slug)}/1200/675`;
    await Article.create({
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      content: buildNepaliContent(item.summary),
      category: categoryMap[item.category],
      author: admin._id,
      status: "published",
      locale: "ne",
      isBreaking: !!item.isBreaking,
      isFeatured: !!item.isFeatured,
      isTrending: i < 6,
      mediaType: "article",
      featuredImage: image,
      views: Math.floor(Math.random() * 8000) + 500,
      likes: Math.floor(Math.random() * 400) + 20,
      publishedAt: new Date(Date.now() - i * 1800000),
      seoTitle: item.title,
      seoDescription: item.summary,
    });
    created++;
  }
  return created;
}

async function seedNews({ force = false, maxPerFeed = 4 } = {}) {
  const nepaliCount = await Article.countDocuments({ status: "published", locale: "ne" });
  const publishedCount = await Article.countDocuments({ status: "published" });
  if (!force && nepaliCount >= 10) {
    console.log(`Skipping news seed — ${nepaliCount} Nepali articles already published.`);
    return { skipped: true, count: publishedCount, nepaliCount };
  }

  const admin = await User.findOne({ role: "admin" });
  if (!admin) throw new Error("Admin user not found. Run seedAdmin first.");

  const categoryMap = await ensureCategories();
  let created = 0;

  const nepaliCreated = await seedNepaliArticles(categoryMap, admin);
  created += nepaliCreated;

  for (const feed of RSS_FEEDS) {
    let items;
    try {
      items = await fetchFeed(feed.url);
    } catch (err) {
      console.warn(`Could not fetch ${feed.url}:`, err.message);
      continue;
    }

    for (const item of items.slice(0, maxPerFeed)) {
      const baseSlug = `en-${slugify(item.title, { lower: true, strict: true }).slice(0, 75)}`;
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
        locale: "en",
        mediaType: "article",
        featuredImage: image,
        views: Math.floor(Math.random() * 5000) + 200,
        likes: Math.floor(Math.random() * 300) + 10,
        publishedAt: new Date(Date.now() - (created + 1) * 3600000),
        seoTitle: item.title,
        seoDescription: summary,
      });
      created++;
    }
  }

  console.log(`Seeded ${created} articles (${nepaliCreated} Nepali, ${created - nepaliCreated} English RSS).`);
  return { skipped: false, created, nepaliCreated };
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
