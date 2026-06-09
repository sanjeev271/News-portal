const Article = require("../models/Article");
const LiveStream = require("../models/LiveStream");
const { defaultFeaturedImage } = require("./articleFormat");
const { uploadFileExists } = require("./ensureUploadDirs");

function isLocalUpload(url) {
  if (!url || typeof url !== "string") return false;
  return !url.startsWith("http");
}

async function repairMissingUploads() {
  let fixed = 0;

  const articles = await Article.find({
    $or: [
      { featuredImage: { $regex: /^uploads[/\\]/ } },
      { videoUrl: { $regex: /^uploads[/\\]/ } },
      { "gallery.url": { $regex: /^uploads[/\\]/ } },
    ],
  });

  for (const article of articles) {
    let changed = false;

    if (isLocalUpload(article.featuredImage) && !uploadFileExists(article.featuredImage)) {
      article.featuredImage = defaultFeaturedImage(article.title);
      changed = true;
    }

    if (isLocalUpload(article.videoUrl) && !uploadFileExists(article.videoUrl)) {
      article.videoUrl = undefined;
      changed = true;
    }

    if (Array.isArray(article.gallery)) {
      const gallery = article.gallery.filter((item) => {
        if (!isLocalUpload(item.url)) return true;
        return uploadFileExists(item.url);
      });
      if (gallery.length !== article.gallery.length) {
        article.gallery = gallery;
        changed = true;
      }
    }

    if (changed) {
      await article.save();
      fixed += 1;
    }
  }

  const streams = await LiveStream.find({
    recordingUrl: { $regex: /^uploads[/\\]/ },
  });

  for (const stream of streams) {
    if (isLocalUpload(stream.recordingUrl) && !uploadFileExists(stream.recordingUrl)) {
      stream.recordingUrl = undefined;
      await stream.save();
      fixed += 1;
    }
  }

  if (fixed > 0) {
    console.log(`Repaired ${fixed} record(s) with missing upload files`);
  }

  return fixed;
}

module.exports = repairMissingUploads;
