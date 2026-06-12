const Subscriber = require("../models/Subscriber");

exports.subscribe = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Valid email required" });
    }

    let sub = await Subscriber.findOne({ email });
    if (sub) {
      if (sub.status === "unsubscribed") {
        sub.status = "active";
        await sub.save();
      }
      return res.json({ message: "Subscribed successfully" });
    }

    await Subscriber.create({ email });
    res.status(201).json({ message: "Subscribed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
