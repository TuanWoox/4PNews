
const SubCate = require('../models/subCategory');

module.exports.getSubCategory = async (req, res) => {
    const mainId = req.params.mainId;
    const subcategories = await SubCate.find({belongTo: mainId});
    res.json(subcategories);
}