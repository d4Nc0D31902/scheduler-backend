const Category = require("../models/category"); // Updated import
const ErrorHandler = require("../utils/errorHandler");

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private (You can define your own authentication middleware)

exports.createCategory = async (req, res, next) => {
  // Updated function name
  try {
    const { name } = req.body;

    // Create a new instance of the Category model
    const newCategory = await Category.create({
      // Updated model name
      name,
    });

    res.status(201).json({
      success: true,
      newCategory,
    });
  } catch (error) {
    console.error(error); // Log the error
    next(new ErrorHandler("Category creation failed", 500)); // Updated error message
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public (you can define your own access control)

exports.getCategories = async (req, res, next) => {
  // Updated function name
  try {
    const categories = await Category.find(); // Updated model name
    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(new ErrorHandler("Failed to retrieve categories", 500)); // Updated error message
  }
};

// @desc    Get a single category by ID
// @route   GET /api/categories/:id
// @access  Public (you can define your own access control)

exports.getCategoryById = async (req, res, next) => {
  // Updated function name
  try {
    const category = await Category.findById(req.params.id); // Updated model name

    if (!category) {
      return next(new ErrorHandler("Category not found", 404)); // Updated error message
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    next(new ErrorHandler("Failed to retrieve the category", 500)); // Updated error message
  }
};

// @desc    Update a category by ID
// @route   PUT /api/categories/:id
// @access  Private (You can define your own authentication middleware)

exports.updateCategory = async (req, res, next) => {
  // Updated function name
  try {
    const { name } = req.body;
    const category = await Category.findById(req.params.id); // Updated model name

    if (!category) {
      return next(new ErrorHandler("Category not found", 404)); // Updated error message
    }

    // Update category properties
    category.name = name;

    const updatedCategory = await category.save();

    res.status(200).json({
      success: true,
      category: updatedCategory,
    });
  } catch (error) {
    next(new ErrorHandler("Failed to update the category", 500)); // Updated error message
  }
};

// @desc    Delete a category by ID
// @route   DELETE /api/categories/:id
// @access  Private (You can define your own access control)

exports.deleteCategory = async (req, res, next) => {
  // Updated function name
  try {
    const category = await Category.findById(req.params.id); // Updated model name

    if (!category) {
      return next(new ErrorHandler("Category not found", 404)); // Updated error message
    }

    await category.remove();
    res.status(200).json({
      success: true,
      message: "Category deleted",
    });
  } catch (error) {
    next(new ErrorHandler("Failed to delete the category", 500)); // Updated error message
  }
};

// @desc    Deactivate a category by ID
// @route   PUT /api/categories/:id/deactivate
// @access  Private (You can define your own authentication middleware)

exports.deactivateCategory = async (req, res, next) => {
  // Updated function name
  try {
    const category = await Category.findById(req.params.id); // Updated model name

    if (!category) {
      return next(new ErrorHandler("Category not found", 404)); // Updated error message
    }

    category.status = "inactive";

    const deactivatedCategory = await category.save();

    res.status(200).json({
      success: true,
      category: deactivatedCategory,
    });
  } catch (error) {
    next(new ErrorHandler("Failed to deactivate the category", 500)); // Updated error message
  }
};

// @desc    Reactivate a category by ID
// @route   PUT /api/categories/:id/reactivate
// @access  Private (You can define your own authentication middleware)

exports.reactivateCategory = async (req, res, next) => {
  // Updated function name
  try {
    const category = await Category.findById(req.params.id); // Updated model name

    if (!category) {
      return next(new ErrorHandler("Category not found", 404)); // Updated error message
    }

    category.status = "active";

    const reactivatedCategory = await category.save();

    res.status(200).json({
      success: true,
      category: reactivatedCategory,
    });
  } catch (error) {
    next(new ErrorHandler("Failed to reactivate the category", 500)); // Updated error message
  }
};
