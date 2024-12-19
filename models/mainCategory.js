const mongoose = require('mongoose');
const { Schema } = mongoose;
const SubCate = require('../models/subCategory');

const mainCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Ensure main category names are unique
      trim: true,   // Trim whitespace
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);


mainCategorySchema.post('findOneAndDelete', async function (deletedMainCategory) {
    if (deletedMainCategory) {
        try {
            const listSubCategories = await SubCate.find({belongTo: deletedMainCategory._id})
            for(const subCate of listSubCategories)
            {
              await SubCate.findByIdAndDelete(subCate._id);
            }
        } catch (err) {
            console.error('Error while cleaning up after deletion:', err);
        }
    }
});

module.exports = mongoose.model('MainCategory', mainCategorySchema);
