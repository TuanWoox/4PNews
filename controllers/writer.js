const whoFor = 'WRITER';
const User = require('../models/user');
const News = require('../models/news');
const Tag = require('../models/tag');
const { cloudinary } = require('../cloudinary/postCloud');
const cheerio = require('cheerio');
const MainCate = require('../models/mainCategory');
const SubCate = require('../models/subCategory');
module.exports.renderWriterProfileForm = async (req,res) => {
    const writer = await User.findById(req.params.id);
    if(writer.role === "writer")
    {
        const formattedDateOfBirth = writer.dateOfBirth
        ? writer.dateOfBirth.toLocaleDateString('en-GB')  // 'en-GB' format is DD/MM/YYYY
        : null;

        res.render('writer/profile', {
            layout: 'workspace',
            whoFor,
            formattedDateOfBirth,
            writer
        })
    } else {
        req.flash('error','Không thể thực hiện thao tác');
        res.redirect('/');
    }
}
module.exports.renderEditProfileForm = async (req,res) => {
    const writer = await User.findById(req.params.id);
    if(writer.role === "writer")
    {
        const formattedDateOfBirth = writer.dateOfBirth
        ? writer.dateOfBirth.toLocaleDateString('en-GB')  // 'en-GB' format is DD/MM/YYYY
        : null;
        res.render('writer/editProfile', {
            layout: 'workspace',
            whoFor,
            formattedDateOfBirth,
            writer
        })
    } else {
        req.flash('error','Không thể thực hiện thao tác');
        res.redirect('/');
    }
}
module.exports.editProfile = async (req,res) => {
    const updatedData = {
        ...req.body.writer
    }
    const dobParts = updatedData.dateOfBirth.split('/'); 
    const formattedDob = `${dobParts[2]}-${dobParts[1]}-${dobParts[0]}`;
    const dateOfBirthConvert = new Date(formattedDob);
    updatedData.dateOfBirth = dateOfBirthConvert;
    if(updatedData.gender === 'Nam' ) updatedData.gender = "male" 
    else updatedData.gender = "female" 
    const user = await User.findByIdAndUpdate(req.params.id,updatedData,{ new: true, runValidators: true })
    {
        if(req.file)
        {
            cloudinary.uploader.destroy(user.profilePic.filename);
            user.profilePic = {url: req.file.path, filename: req.file.filename}
            await user.save();
        }
        
    }
    req.flash('success', 'Cập nhật thông tin thành công')
    res.redirect(`/user/${req.params.id}/profile`);
}
module.exports.renderWriterNewsForm = async (req, res) => {
    const { status = 'all', page = 1 } = req.query; // Default to 'all' for status, and page 1 if not specified
    const perPage = 5; // Number of news per page
    const currentPage = parseInt(page); // Convert page to an integer for calculations

    const query = {
        author: req.user._id,
    };
    if (status !== 'all') {
        query.status = status; 
        // If status is "published", add the condition for publishedDate
        if (status === 'published') {
            query['publish.publishedDate'] = { $lt: new Date() }; // Only fetch news with publishedDate < now
        }
        if (status === 'approved')
        {
            query.status = "published"; 
            query['publish.publishedDate'] = { $gt: new Date() }; // Only fetch news with publishedDate > now
        }
    }

    try {
        // Fetch the total count of documents matching the query
        const totalCount = await News.countDocuments(query);

        // Fetch the news list with pagination
        const listNews = await News.find(query)
            .skip((currentPage - 1) * perPage) // Skip documents based on page
            .limit(perPage) // Limit the number of documents
            .populate('tags', '_id name'); // Populate tags

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalCount / perPage);

        // Map status to Vietnamese equivalents
        let statusVietNam;
        if (status === 'all') statusVietNam = "Tất cả";
        if (status === 'approved') statusVietNam = "Đã được duyệt";
        if (status === 'rejected') statusVietNam = "Đã bị từ chối";
        if (status === 'published') statusVietNam = "Đã được xuất bản";
        if (status === 'draft') statusVietNam = "Bản thảo";

        // Render the view
        res.render('writer/writerNews', {
            layout: 'workspace',
            listNews,
            status, // Pass the current status,
            whoFor,
            statusVietNam,
            currentPage, // Pass the current page
            totalPages, // Pass the total number of pages
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

  
module.exports.renderAddNewsForm = async (req,res) => {
    const allMainCate = await MainCate.find({})
    const firstSubOfMainCate = await SubCate.find({belongTo: allMainCate[0]._id});
    res.render('writer/addNews', {
        layout: 'workspace',
        allMainCate,
        firstSubOfMainCate,
        whoFor
    });
}
module.exports.createNews = async (req, res) => {
    const { content, images, premium } = req.body.news;
    let imagesParsed;
    let thumbnailParsed;

    if (images) imagesParsed = JSON.parse(images);

    if (content) {
        const $ = cheerio.load(content);
        const firstImageSrc = $('img').first().attr('src');
        if (firstImageSrc) {
            thumbnailParsed = firstImageSrc;
        }
    }

    // Convert premium from string to boolean
    const premiumBoolean = premium === 'true';

    const newNews = new News({
        ...req.body.news,
        images: imagesParsed,
        author: req.user._id,
        tags: [],
        thumbnail: thumbnailParsed,
        isPremium: premiumBoolean // Save as a boolean
    });

    // Parse tags and extract the value field
    const tagsArray = JSON.parse(req.body.news.tags)
        .map(tag => tag.value) // Extract the 'value' field
        .filter(tag => tag.trim() !== ''); // Remove empty or invalid tags

    // Create an array of promises to handle asynchronous tag updates
    const tagPromises = tagsArray.map(async (element) => {
        let tag = await Tag.findOne({ name: element });
        if (tag) {
            // If the tag exists, update it
            tag.newsList.push(newNews.id);
            newNews.tags.push(tag.id);
            await tag.save();
        } else {
            // Create and save a new tag if it doesn't exist
            const newTag = new Tag({ name: element });
            newTag.newsList.push(newNews._id);
            newNews.tags.push(newTag._id);
            await newTag.save();
        }
    });

    await Promise.all(tagPromises);
    await newNews.save();
    req.flash('success', 'Tạo bài báo thành công');
    res.redirect(`/writer/${req.params.id}/viewNews/${newNews._id}`);
};


module.exports.viewANews = async (req,res) => {
    const news = await News.findById(req.params.newsId)
    .populate('author', '_id bio penName profilePic')
    .populate('category', '_id name')
    .populate('tags', '_id name')
    
    res.render('writer/previewNews', {
        layout: 'workspace',
        news,
        whoFor
    });
}
module.exports.deleteANews = async (req,res) => {
    await News.findByIdAndDelete(req.params.newsId);
    req.flash('success','Xóa bài thành công');
    res.redirect(`/writer/${req.params.id}/writerNews`);
}
module.exports.renderEditNewsForm = async (req,res) => {
    const news = await News.findById(req.params.newsId)
    .populate('author', '_id bio penName profilePic')
    .populate('category', '_id name belongTo')
    .populate('tags', '_id name')
    const allMainCate = await MainCate.find({})
    const subOfMainCate = await SubCate.find({belongTo: news.category.belongTo });

    const imagesOfPost = JSON.stringify(news.images)
    const tagsJson = JSON.stringify(news.tags.map(tag => tag.name)); // Preprocess the tags
    res.render('writer/editNews', {
        layout: 'workspace',
        news,
        imagesOfPost,
        allMainCate,
        subOfMainCate,
        tagsJson,
        whoFor
    });
}
module.exports.editANews = async (req, res) => {
    const id = req.params.newsId;
    const news = await News.findById(req.params.newsId)
    .populate('tags', 'name _id');
    let newImgs;
    if(req.body.news.newsImages)
    {
        newImgs = JSON.parse(req.body.news.newsImages);
        news.images.push(...newImgs); 
    }
    let deletedImages;
    if(req.body.news.deletedImages)
    {
        deletedImages = JSON.parse(req.body.news.deletedImages);
        if (deletedImages && deletedImages.length > 0) {
          news.images = news.images.filter(image => !deletedImages.includes(image.filename));
          await Promise.all(deletedImages.map(filename => cloudinary.uploader.destroy(filename)));
        }
    }
    if(req.body.news.content)
    {
        const $ = cheerio.load(news.content);
        const firstImageSrc = $('img').first().attr('src');
        if (firstImageSrc) {
            news.thumbnail = firstImageSrc;
        }   
    }
    const tagsArray = JSON.parse(req.body.news.tags)
        .map(tag => tag.value) // Extract the 'value' field
        .filter(tag => tag.trim() !== ''); // Remove empty or invalid tags

    const existingTagNames = news.tags.map(tag => tag.name);
    const tagsToRemove = existingTagNames.filter(tagName => !tagsArray.includes(tagName));

    for (let tagName of tagsToRemove) {
        const tag = await Tag.findOne({ name: tagName });
        if (tag) {
            tag.newsList = tag.newsList.filter(newsId => !newsId.equals(id));
            await tag.save();
            news.tags = news.tags.filter(tag => tag.name !== tagName);
        }
    }
    for (let newTagName of tagsArray) {
        const existingTag = news.tags.find(tag => tag.name === newTagName);
        if (!existingTag) {
            let tag = await Tag.findOne({ name: newTagName });
                if (tag) {
                    // If the tag exists, update it
                    tag.newsList.push(news.id);
                    news.tags.push(tag.id);
                    await tag.save();
                } else {
                    // Create and save a new tag if it doesn't exist
                    const newTag = new Tag({ name: newTagName });
                    newTag.newsList.push(news._id);
                    news.tags.push(newTag._id);
                    await newTag.save();
                }       
         }
    }
    news.title = req.body.news.title;
    news.brief = req.body.news.brief;
    news.content = req.body.news.content;
    news.isPremium = req.body.news.premium === 'true';
    news.category = req.body.news.category;
    await news.save();
    req.flash('success', 'Sửa bài viết thành công')
    res.redirect(`/writer/${req.params.id}/viewNews/${req.params.newsId}`);
  }
module.exports.viewRejectedNews = async (req,res) => {
    const rejectedNews = await News.findById(req.params.newsId)
    .populate('tags', '_id name')
    .populate({
        path: 'reject', // Populate the rejected object
        populate: {
            path: 'whoRejected', // Populate the whoRejected field inside rejected
            select: '_id fullName' // Select the desired fields
        }
    });
    res.render('writer/rejectedNews', {
        layout: 'workspace',
        rejectedNews,
        whoFor
    });
}