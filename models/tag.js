const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const tagSchema = new Schema({
   name: {
        type: String,
        required: true,
        unique: true, // Ensures the name is unique
   },
   newsList: [{
        type: Schema.Types.ObjectId,
        ref: 'News'
   }]
}, 
{timestamps: true}
);

// Use mongoose.model to access the News model at runtime
tagSchema.post('findOneAndDelete', async function (deletedTag) {
    if (deletedTag) {
        try {
            const News = mongoose.model('News'); // Access model dynamically
            await News.updateMany(
                { tags: deletedTag._id },
                { $pull: { tags: deletedTag._id } }
            );
        } catch (err) {
            console.error('Error while removing references to deleted tag:', err);
        }
    }
});
 


module.exports = mongoose.model('Tag', tagSchema);
