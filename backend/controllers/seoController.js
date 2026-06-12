const Article = require("../models/Article");
const Settings = require("../models/Settings");

const SITE_URL = process.env.SITE_URL || "http://localhost:5173";

async function getSiteSeo() {
  const doc = await Settings.findOne({ key: "seo" });
  return doc?.value || {};
}

exports.getRobots = async (req, res) => {
  const seo = await getSiteSeo();
  const allowIndex = seo.robots !== "noindex";
  res.type("text/plain").send(
    `User-agent: *\n${allowIndex ? "Allow: /" : "Disallow: /"}\n\nSitemap: ${SITE_URL}/api/seo/sitemap.xml\n`
  );
};

exports.getRss = async (req, res) => {
  try {
    const articles = await Article.find({ status: "published" })
      .populate("author", "name")
      .populate("category", "name")
      .sort({ publishedAt: -1 })
      .limit(50);

    const seo = await getSiteSeo();
    const siteTitle = seo.siteTitle || "News Portal";
    const siteDescription = seo.siteDescription || "Latest news and live coverage";

    const items = articles
      .map((a) => {
        const pubDate = (a.publishedAt || a.createdAt).toUTCString();
        return `<item>
  <title><![CDATA[${a.title}]]></title>
  <link>${SITE_URL}/article/${a.slug}</link>
  <guid isPermaLink="true">${SITE_URL}/article/${a.slug}</guid>
  <description><![CDATA[${a.summary || ""}]]></description>
  <pubDate>${pubDate}</pubDate>
  ${a.author?.name ? `<author>${a.author.name}</author>` : ""}
  ${a.category?.name ? `<category>${a.category.name}</category>` : ""}
</item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${siteTitle}</title>
  <link>${SITE_URL}</link>
  <description>${siteDescription}</description>
  <language>en</language>
  <atom:link href="${SITE_URL}/api/seo/rss.xml" rel="self" type="application/rss+xml"/>
  ${items}
</channel>
</rss>`;

    res.type("application/rss+xml").send(xml);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSitemap = async (req, res) => {
  try {
    const articles = await Article.find({ status: "published" })
      .select("slug updatedAt publishedAt")
      .sort({ publishedAt: -1 })
      .limit(5000);

    const urls = [
      { loc: SITE_URL, priority: "1.0", changefreq: "hourly" },
      { loc: `${SITE_URL}/live`, priority: "0.9", changefreq: "always" },
      { loc: `${SITE_URL}/trending`, priority: "0.8", changefreq: "hourly" },
      ...articles.map((a) => ({
        loc: `${SITE_URL}/article/${a.slug}`,
        lastmod: (a.updatedAt || a.publishedAt).toISOString().split("T")[0],
        priority: "0.7",
        changefreq: "daily",
      })),
    ];

    const body = urls
      .map(
        (u) => `<url>
  <loc>${u.loc}</loc>
  ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}
  <changefreq>${u.changefreq}</changefreq>
  <priority>${u.priority}</priority>
</url>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${body}
</urlset>`;

    res.type("application/xml").send(xml);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNewsSitemap = async (req, res) => {
  try {
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const articles = await Article.find({
      status: "published",
      publishedAt: { $gte: twoDaysAgo },
    })
      .populate("category", "name")
      .sort({ publishedAt: -1 })
      .limit(1000);

    const seo = await getSiteSeo();
    const publicationName = seo.siteTitle || "News Portal";

    const entries = articles
      .map((a) => {
        const pubDate = (a.publishedAt || a.createdAt).toISOString();
        return `<url>
  <loc>${SITE_URL}/article/${a.slug}</loc>
  <news:news>
    <news:publication>
      <news:name>${publicationName}</news:name>
      <news:language>${a.locale || "en"}</news:language>
    </news:publication>
    <news:publication_date>${pubDate}</news:publication_date>
    <news:title>${a.title}</news:title>
    ${a.category?.name ? `<news:keywords>${a.category.name}</news:keywords>` : ""}
  </news:news>
</url>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries}
</urlset>`;

    res.type("application/xml").send(xml);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
