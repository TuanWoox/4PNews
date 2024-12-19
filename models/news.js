const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Tag = require('../models/tag');
const { cloudinary } = require('../cloudinary/postCloud');
const newSchema = new Schema({
    title:{
        type: String,
        required: [true , 'Hãy nhập tựa đề bài viết']
    },
    brief: {
        type: String,
        required: [true, "Hãy nhập vào nội dung tóm tắt bài viết"]
    },
    content:{
        type: String,
        required: [true,'Hãy nhập nội dung bài viết']
    },
    images: [{
        url: { type: String},
        filename: { type: String }
    }],
    thumbnail: {
        type: String,
    },
    author: {
        type : Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['draft', 'rejected','published'],
        default: 'draft'
    },
    reject: {
        reason: {
            type: String
        },
        whoRejected: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    publish: {
        whoApprove: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        publishedDate: {
            type: Date
        }
    },
    isPremium : {
        type: Boolean,
        default: false
    },
    category: {
        type: Schema.Types.ObjectId,
        ref:'SubCategory',
    },
    tags: [{
        type: Schema.Types.ObjectId,
        ref: 'Tag'
    }],
    views: { 
        type: Number,
        default: 0
    },
}, {timestamps: true});

newSchema.post('findOneAndDelete', async function (deletedNews) {
    if (deletedNews) {
        try {
            await Tag.updateMany(
                { newsList: deletedNews._id },
                { $pull: { newsList: deletedNews._id } }
            );

            if (deletedNews.images) {
                for (let image of deletedNews.images) {
                    await cloudinary.uploader.destroy(image.filename);
                }
            }
        } catch (err) {
            console.error('Error while cleaning up after deletion:', err);
        }
    }
});


module.exports =  mongoose.model('News',newSchema);