const mongoose = require('mongoose');
const { Schema } = mongoose;
const News = require('../models/news');
const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Trim whitespace
    },
    belongTo: {
      type: Schema.Types.ObjectId,
      ref: 'MainCategory',
      required: true, // Ensure every subcategory belongs to a main category
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

// Index for faster querying by `belongTo`
subCategorySchema.index({ belongTo: 1 });

subCategorySchema.post('findOneAndDelete', async function (deletedSubCategory) {
    if (deletedSubCategory) {
        try {
          const listNews = await News.find({category: deletedSubCategory._id})
          for(const news of listNews)
          {
            await News.findByIdAndDelete(news._id);
          }
        } catch (err) {
            console.error('Error while cleaning up after deletion:', err);
        }
    }
});

module.exports = mongoose.model('SubCategory', subCategorySchema);
