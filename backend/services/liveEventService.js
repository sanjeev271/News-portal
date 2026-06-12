const LiveEvent = require("../models/LiveEvent");
const slugify = require("slugify");

async function uniqueSlug(title) {
  const base = slugify(title, { lower: true, strict: true });
  let slug = base;
  let n = 1;
  while (await LiveEvent.findOne({ slug })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

const populateOpts = [
  { path: "category" },
  { path: "createdBy", select: "name email role avatar" },
  { path: "liveStream" },
  { path: "assignedReporters", select: "name email avatar role" },
];

module.exports = { uniqueSlug, populateOpts };
