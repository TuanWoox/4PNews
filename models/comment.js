const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const comment = new Schema(
  {
    reader: {
      type: Schema.Types.ObjectId,
      ref: 'User', 
      required: true, 
    },
    belongTo: {
      type: Schema.Types.ObjectId,
      ref: 'News', 
      required: true, 
    },
    content: {
      type: String,
      required: true, 
      trim: true,
      maxlength: 1500, 
    },
  },
  { timestamps: true } 
);

module.exports = mongoose.model('Comment', comment);
