const { cloudinary } = require('../cloudinary/postCloud');

// Upload function remains the same
module.exports.uploadTinyMCE = async (req, res) => {
    if (req.file) {
        res.json({ url: req.file.path, filename: req.file.filename });
    } else {
        res.status(400).json({ error: 'Image upload failed' });
    }
};

// New deleteMany function to handle multiple image deletions
module.exports.deleteManyTinyMCE = async (req, res) => {
    const { filenames } = req.body; // Get the filenames array from the request body;
    if (!filenames || !Array.isArray(filenames) || filenames.length === 0) {
        return res.status(400).json({ error: 'Invalid request, filenames should be a non-empty array' });
    }

    try {
        // Loop over each filename and delete it from Cloudinary
        for (let filename of filenames) {
            console.log(`Deleting image: ${filename}`);
            await cloudinary.uploader.destroy(filename); // Delete image from Cloudinary
        }
        res.status(200).json({ message: 'Images deleted successfully' });
    } catch (error) {
        console.error('Error deleting images:', error);
        res.status(500).json({ error: 'Failed to delete images' });
    }
};