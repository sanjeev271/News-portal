const Article = require("../models/Article");

function startScheduler(app) {
  setInterval(async () => {
    try {
      const due = await Article.find({
        status: "scheduled",
        scheduledAt: { $lte: new Date() }
      });

      for (const article of due) {
        article.status = "published";
        article.publishedAt = new Date();
        await article.save();

        const populated = await Article.findById(article._id)
          .populate("category")
          .populate("author", "name email");

        const io = app.get("io");
        if (io) {
          io.emit("new_article", populated);
          io.emit("push_notification", { title: "Scheduled Post Live", message: populated.title });
        }
      }
    } catch (err) {
      console.error("Scheduler error:", err.message);
    }
  }, 60000);
}

module.exports = startScheduler;
