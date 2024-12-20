const User = require('../models/user');
const News = require('../models/news');
const Tag = require('../models/tag');
const { cloudinary } = require('../cloudinary/postCloud');
const cheerio = require('cheerio');
const MainCate = require('../models/mainCategory');
const SubCate = require('../models/subCategory');
const mongoose = require('mongoose'); 

module.exports.renderHome = async (req, res) => {
    const role = req.user ? req.user.role : "";
    
    const allMainCate = await MainCate.find({});
    const mainCateWithSub = await Promise.all(
        allMainCate.map(async (mainCate) => {
            const subcategories = await SubCate.find({ belongTo: mainCate._id });
            return { ...mainCate.toObject(), subcategories };
        })
    );

    const topHotNews = await News.find({
        status: 'published',
        "publish.publishedDate": { $lt: new Date() }
    })
        .sort({ views: -1 })
        .limit(10)
        .populate('author', '_id bio penName profilePic')
        .populate('category', '_id name')
        .populate('tags', '_id name');

    const listNews = await News.find({
        status: 'published',
        "publish.publishedDate": { $lt: new Date() },
    })
        .sort({ 'publish.publishedDate': -1 })
        .limit(10)
        .populate('author', '_id bio penName profilePic')
        .populate('category', '_id name')
        .populate('tags', '_id name');

    const listHotNews = await News.find({
        status: 'published',
        "publish.publishedDate": { $lt: new Date() },
    })
        .sort({ 'publish.publishedDate': -1 })
        .sort({ views: -1 })
        .limit(4)
        .populate('author', '_id bio penName profilePic')
        .populate('category', '_id name')
        .populate('tags', '_id name');
    
    const topSubCategories = await News.aggregate([
        { $match: { category: { $ne: null } } },
        { $group: { _id: "$category", totalViews: { $sum: "$views" } } },
        { $sort: { totalViews: -1, _id: 1 } },
        { $limit: 4 },
        {
            $lookup: {
                from: "subcategories",
                localField: "_id",
                foreignField: "_id",
                as: "subcategoryDetails",
            }
        },
        { $unwind: "$subcategoryDetails" },
        { $project: { _id: 0, subCategoryId: "$_id", name: "$subcategoryDetails.name", totalViews: 1 } }
    ]);

    const topSubCategoriesWithNews = await Promise.all(
        topSubCategories.map(async (subCategory) => {
            const newestNews = await News.findOne({ category: subCategory.subCategoryId })
                .sort({ 'publish.publishedDate': -1, _id: -1 }) 
                .populate('author', '_id penName')
                .populate('tags', '_id name');

            return {
                subCategoryId: subCategory.subCategoryId,
                name: subCategory.name,
                totalViews: subCategory.totalViews,
                news: newestNews
                    ? {
                        _id: newestNews._id,
                        title: newestNews.title,
                        brief: newestNews.brief,
                        thumbnail: newestNews.thumbnail,
                        createdAt: newestNews.createdAt,
                        author: newestNews.author.penName,
                        tags: newestNews.tags.map(tag => tag.name),
                        publish: newestNews.publish.publishedDate
                    }
                    : null,
            };
        })
    );

    res.render('home', {
        allMainCate: mainCateWithSub,
        listNews,
        topHotNews,
        topSubCategoriesWithNews,
        listHotNews
    });
};

module.exports.renderDetailsNews = async (req,res) => {
    const role = req.user ? req.user.role : "";
    const { newsId } = req.params;

    const news = await News.findByIdAndUpdate(
        newsId,
        { $inc: { views: 1 } }, 
        { new: true } 
    )
        .populate('author', '_id bio penName profilePic')
        .populate('category', '_id name')
        .populate('tags', '_id name');

    const relevantNews = await News.find({
        _id: { $ne: news._id }, 
        $or: [
            { category: news.category._id }, 
        ]
    })
        .limit(5) 
        .sort({ createdAt: -1 }) 
        .select('title thumbnail brief views createdAt') 
        .populate('category', '_id name') 
        .populate('tags', '_id name'); 
    
    if (!news) {
        return res.status(404).send('News not found');
    }
    res.render('general/detail', {
        news,
        relevantNews
    });    
}

module.exports.renderFindByTag = async (req, res) => {
    const tagid = req.params.tagId;
    const tag = await Tag.findById(tagid);

    const limit = 5;
    const page = +req.query.page || 1;
    const offset = (page - 1) * limit;

    const nRows = await News.countDocuments({
        status: 'published',
        "publish.publishedDate": { $lt: new Date() },
        tags: tagid
    });
    
    const nPages = Math.ceil(nRows / limit);
    const page_items = [];
    for (let i = 1; i <= nPages; i++) {
        const item = {
            value: i,
            isActive: i === page
        };
        page_items.push(item);
    }

    const listNews = await News.find({
        status: 'published',
        "publish.publishedDate": { $lt: new Date() },
        tags: tagid
    })
        .sort({ 'publish.publishedDate': -1 })
        .skip(offset) 
        .limit(limit) 
        .populate('author', '_id bio penName profilePic')
        .populate('category', '_id name')
        .populate('tags', '_id name');

    res.render('general/findTag', {
        tag,
        listNews,
        empty: listNews.length === 0, 
        page_items: page_items,
    });
};


module.exports.renderFindBySubCate = async (req,res) => {
    const subCateId = req.params.subCateId;

    const subCate = await SubCate.findById(subCateId);

    const mainCate = await MainCate.findById(subCate.belongTo);
    
    const listsubCate = await SubCate.find({ belongTo: mainCate._id });

    const subCates = listsubCate.map(element => ({
        name: element.name,
        id: element._id,
        active: subCateId === element._id.toString()
    }));

    const limit = 5;
    const page = +req.query.page || 1;
    const offset = (page - 1) * limit;

    const nRows = await News.countDocuments({
        status: 'published',
        "publish.publishedDate": { $lt: new Date() },
        category: subCateId
    });
    
    const nPages = Math.ceil(nRows / limit);
    const page_items = [];
    for (let i = 1; i <= nPages; i++) {
        const item = {
            value: i,
            isActive: i === page
        };
        page_items.push(item);
    }

    const listNews = await News.find({
        status: 'published',
        "publish.publishedDate": { $lt: new Date() },
        category: subCateId
    })
    .sort({ 'publish.publishedDate': -1 })
    .skip(offset) 
    .limit(limit) 
    .populate('author', '_id bio penName profilePic')
    .populate('category', '_id name')
    .populate('tags', '_id name');
    console.log(mainCate);
    res.render('general/findSubCate', {
        mainCate: mainCate,
        subCates,
        empty: listNews.length === 0, 
        listNews
    });
}


module.exports.searchNews = async (req, res) => { 
    const query = req.query.q?.trim() || '';
    const cate = req.query.category || ''; 
    const time = req.query.time || '';
    const sort = req.query.sort || ''; 
    // Build filter object
    const filterConditions = [{ $text: { $search: query } }];
    
    if (cate) {
        const category = await MainCate.findOne({ name: cate }).lean(); 
        const mainCategory = await MainCate.findOne({ name: cate }).lean();
    
        if (mainCategory) {
            const subCategories = await SubCate.find({ belongTo: mainCategory._id }).lean();
            const subCategoryIds = subCategories.map(subCate => subCate._id);
            console.log(subCategoryIds);
            filterConditions.push({ category: { $in: subCategoryIds } });
        }
    }
    
    if (time) {
        const now = new Date();
        let startDate;
    
        if (time === '1') startDate = new Date(now.setDate(now.getDate() - 1));
        else if (time === '2') startDate = new Date(now.setDate(now.getDate() - 7));
        else if (time === '3') startDate = new Date(now.setMonth(now.getMonth() - 1));
        else if (time === '4') startDate = new Date(now.setFullYear(now.getFullYear() - 1));
    
        if (startDate) {
            filterConditions.push({ "publish.publishedDate": { $gte: startDate } });
        }
    }
    
    let sortCondition = { score: { $meta: 'textScore' } };
    if (sort === 'newest') {
        sortCondition = { "publish.publishedDate": -1 };
    } else if (sort === 'popular') {
        sortCondition = { views: -1 }; 
    }

    const limit = 5;
    const page = +req.query.page || 1;
    const offset = (page - 1) * limit;

    const nRows = await News.countDocuments({ $and: filterConditions });

    const nPages = Math.ceil(nRows / limit);
    const page_items = [];
    for (let i = 1; i <= nPages; i++) {
        const item = {
            value: i,
            isActive: i === page
        };
        page_items.push(item);
    }
    try {
        const results = await News.find(
            { $and: filterConditions },
            { score: { $meta: 'textScore' } }
        )
            .sort(sortCondition)
            .skip(offset) 
            .limit(limit) 
            .populate('category', '_id name')
            .populate('tags', 'name')
            .exec();

        const categories = await MainCate.find({});
        const categories_items = categories.map((cat) => ({
            mainCate: cat,
            isActive: cate === cat.name
        }));
    
        res.render('general/search', {
            results,
            query,
            categories_items,
            time,
            page_items
        });
    } catch (error) {
        console.error('Error performing search:', error);
        res.status(500).send('An error occurred while searching. Please try again later.');
    }    
};
