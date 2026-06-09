const router =
require("express").Router();

const auth =
require("../middleware/auth");

const newsController =
require("../controllers/newsController");

router.post(
"/",
auth,
newsController.createNews
);

module.exports = router;