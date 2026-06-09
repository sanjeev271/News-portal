const express =
require("express");

const router =
express.Router();

const auth =
require(
"../middleware/authMiddleware"
);

const allowRoles =
require(
"../middleware/roleMiddleware"
);

const {
createCategory,
getCategories,
updateCategory,
deleteCategory
}=
require(
"../controllers/categoryController"
);

router.post(
"/",
auth,
allowRoles("admin"),
createCategory
);

router.get(
"/",
getCategories
);

router.put("/:id", auth, allowRoles("admin"), updateCategory);
router.delete("/:id", auth, allowRoles("admin"), deleteCategory);

module.exports =
router;