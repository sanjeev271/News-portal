const Article = require("../models/Article");
const BreakingNews = require("../models/BreakingNews");
const { emitArticlePublished } = require("../socket/emitter");
const { createNotification } = require("../services/notificationService");

function startScheduler(app) {
  setInterval(async () => {
    try {
      const due = await Article.find({
        status: "scheduled",
        scheduledAt: { $lte: new Date() },
      });

      for (const article of due) {
        article.status = "published";
        article.publishedAt = new Date();
        await article.save();

        const populated = await Article.findById(article._id)
          .populate("category")
          .populate("author", "name email");

        emitArticlePublished(app, populated);
        await createNotification(app, {
          type: "article_published",
          title: "Scheduled Post Live",
          message: populated.title,
          link: `/article/${populated.slug}`,
        });
      }

      await BreakingNews.updateMany(
        { isActive: true, expiresAt: { $lte: new Date() } },
        { isActive: false }
      );

      const scheduledBreaking = await BreakingNews.find({
        isActive: false,
        scheduledAt: { $lte: new Date() },
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
      });

      for (const item of scheduledBreaking) {
        item.isActive = true;
        await item.save();
      }
    } catch (err) {
      console.error("Scheduler error:", err.message);
    }
  }, 60000);
}

module.exports = startScheduler;
