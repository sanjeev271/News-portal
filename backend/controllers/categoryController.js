const Category =
require("../models/Category");

const slugify =
require("slugify");

// Create Category

exports.createCategory =
async (req, res) => {

  try {

    const category =
    await Category.create({

      name:
      req.body.name,

      slug:
      slugify(
        req.body.name,
        {
          lower: true,
          strict: true
        }
      ),

      description:
      req.body.description

    });

    res
    .status(201)
    .json(category);

  } catch (error) {

    res
    .status(500)
    .json({
      message:
      error.message
    });

  }

};

// Get All Categories

exports.getCategories =
async (req, res) => {

  try {

    const categories =
    await Category.find();

    res.json(
      categories
    );

  } catch (error) {

    res
    .status(500)
    .json({
      message:
      error.message
    });

  }

};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    if (req.body.name) {
      category.name = req.body.name;
      category.slug = slugify(req.body.name, { lower: true, strict: true });
    }
    if (req.body.description !== undefined) category.description = req.body.description;

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};