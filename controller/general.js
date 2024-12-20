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
    // Fetch all Main Categories and their Subcategories
    const allMainCate = await MainCate.find({});
    const mainCateWithSub = await Promise.all(
        allMainCate.map(async (mainCate) => {
            const subcategories = await SubCate.find({ belongTo: mainCate._id });
            return { ...mainCate.toObject(), subcategories };
        })
    );

    // Fetch Top Hot News (based on views)
    const topHotNews = await News.find({
        status: 'published',
        "publish.publishedDate": { $lt: new Date() }
    })
        .sort({ views: -1 })
        .limit(10)
        .populate('author', '_id bio penName profilePic')
        .populate('category', '_id name')
        .populate('tags', '_id name');

    // Fetch Latest News
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
    
    // Get Top SubCategories with the most total views
    const topSubCategories = await News.aggregate([
        { $match: { category: { $ne: null } } }, // Exclude invalid categories
        { $group: { _id: "$category", totalViews: { $sum: "$views" } } },
        { $sort: { totalViews: -1, _id: 1 } }, // Deterministic sorting
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

    // Attach the newest news for each top SubCategory
    const topSubCategoriesWithNews = await Promise.all(
        topSubCategories.map(async (subCategory) => {
            const newestNews = await News.findOne({ category: subCategory.subCategoryId })
                .sort({ 'publish.publishedDate': -1, _id: -1 }) // Deterministic sorting
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

        // Increment the views count
    const news = await News.findByIdAndUpdate(
        newsId,
        { $inc: { views: 1 } }, // Increment the 'views' field by 1
        { new: true } // Return the updated document
    )
        .populate('author', '_id bio penName profilePic')
        .populate('category', '_id name')
        .populate('tags', '_id name');

    const relevantNews = await News.find({
        _id: { $ne: news._id }, // Exclude the current news
        $or: [
            { category: news.category._id }, // Match the same category
        ]
    })
        .limit(5) // Limit to 5 results
        .sort({ createdAt: -1 }) // Sort by the most recently created
        .select('title thumbnail brief views createdAt') // Select fields to display
        .populate('category', '_id name') // Populate category for relevant news
        .populate('tags', '_id name'); // Populate tags for relevant news
    
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

    // Count the total number of news articles for the given tag
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

    // Fetch the paginated list of news articles
    const listNews = await News.find({
        status: 'published',
        "publish.publishedDate": { $lt: new Date() },
        tags: tagid
    })
        .sort({ 'publish.publishedDate': -1 })
        .skip(offset) // Apply the offset
        .limit(limit) // Apply the limit
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

    // Count the total number of news articles for the given tag
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
    const cate = req.query.category || ''; // Category name
    const time = req.query.time || '';
    const sort = req.query.sort || ''; 
    // Build filter object
    const filterConditions = [{ $text: { $search: query } }];
    
    if (cate) {
        const category = await MainCate.findOne({ name: cate }).lean(); // Find category by name
        const mainCategory = await MainCate.findOne({ name: cate }).lean();
    
        if (mainCategory) {
            // If a MainCategory is found, retrieve all related SubCategories
            const subCategories = await SubCate.find({ belongTo: mainCategory._id }).lean();
            const subCategoryIds = subCategories.map(subCate => subCate._id);
            console.log(subCategoryIds);
            // Add filter to include News items that belong to these SubCategories
            filterConditions.push({ category: { $in: subCategoryIds } });
        }
    }
    
    // Add time filter if specified
    if (time) {
        const now = new Date();
        let startDate;
    
        if (time === '1') startDate = new Date(now.setDate(now.getDate() - 1));
        else if (time === '2') startDate = new Date(now.setDate(now.getDate() - 7));
        else if (time === '3') startDate = new Date(now.setMonth(now.getMonth() - 1));
        else if (time === '4') startDate = new Date(now.setFullYear(now.getFullYear() - 1));
    
        if (startDate) {
            filterConditions.push({ "publish.publishedDate": { $gte: startDate } }); // Add time filter
        }
    }
    
    let sortCondition = { score: { $meta: 'textScore' } }; // Default to text score
    if (sort === 'newest') {
        sortCondition = { "publish.publishedDate": -1 }; // Newest first
    } else if (sort === 'popular') {
        sortCondition = { views: -1 }; // Most popular (based on a hypothetical `views` field)
    }

    const limit = 5;
    const page = +req.query.page || 1;
    const offset = (page - 1) * limit;

    // Count the total number of news articles for the given tag
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
            { score: { $meta: 'textScore' } } // Include text relevance score
        )
            .sort(sortCondition) // Sort by relevance
            .skip(offset) 
            .limit(limit) 
            .populate('category', '_id name')
            .populate('tags', 'name') // Populate tags if needed
            .exec();

        // Get all categories for rendering
        const categories = await MainCate.find({});
        const categories_items = categories.map((cat) => ({
            mainCate: cat,
            isActive: cate === cat.name
        }));
    
        // Render the search results page
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
