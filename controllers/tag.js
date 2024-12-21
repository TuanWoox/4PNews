const Tag = require('../models/tag');

module.exports.suggestTagByLetter = async (req,res) => {
    const { letter } = req.query; 
    let arrayTags;
    if(letter)
    {
        arraysTags = await Tag.find({ name: { $regex: letter, $options: "i" } });
    } else {
        arraysTags = await Tag.find();
    }
    res.status(200).json(arraysTags);
}