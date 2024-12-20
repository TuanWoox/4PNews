const whoFor = 'EDITOR';
const User = require('../models/user');
const SubCate = require('../models/subCategory');
const MainCate = require('../models/mainCategory');
const News = require('../models/news');
const { cloudinary } = require('../cloudinary/postCloud');
const Tag = require('../models/tag');
module.exports.renderListDraft = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('managedMainCate', '_id name');
        const listOfSubCate = await SubCate.find({belongTo: user.managedMainCate._id});
        // Extract SubCate IDs into an array
        const subCateIds = listOfSubCate.map(subCate => subCate._id);
        // Filter News based on category and status
        let query = {
            category: { $in: subCateIds },
            
        };        
        const status = ["All", "Draft", "Approved", "Published", "Rejected"];
        const temp = req.query.status ? req.query.status.toLowerCase() : "all";

        if (temp !== "all") {
            query.status = temp; 
            if (temp === "published") {
                query['publish.publishedDate'] = { $lt: new Date() }; 
            } else if (temp === "approved") {
                query.status = 'published';
                query['publish.publishedDate'] = { $gt: new Date() }; 
            }
        }

        // Pagination setup
        const itemsPerPage = 5; // Change this to the desired number of items per page
        const page = parseInt(req.query.page) || 1; // Default to page 1 if no page is provided

        // Fetch the total count of matching news items
        const totalNewsCount = await News.countDocuments(query);

        // Calculate the number of pages
        const totalPages = Math.ceil(totalNewsCount / itemsPerPage);

        // Fetch the paginated news items
        const listNews = await News.find(query)
            .populate('author', 'bio penName profilePic')
            .populate('tags', '_id name')
            .skip((page - 1) * itemsPerPage) // Skip items for the current page
            .limit(itemsPerPage); // Limit the number of items per page

        const page_items = [];
        for (let i = 0; i < status.length; i++) {
            const item = {
                value: status[i],
                isActive: status[i].toLowerCase() === temp 
            }
            page_items.push(item);
        }

        const managedMainCategory = user.managedMainCate;

        res.render('editor/listNews', {
            layout: 'workspace',
            listNews: listNews,
            isEmpty: listNews.length === 0,
            page_items: page_items,
            managedMainCategory,
            currentPage: page,
            totalPages: totalPages,
            whoFor
        });

    } catch (error) {
        console.error("Error fetching draft news:", error);
        res.status(500).send("Internal Server Error");
    }
};


module.exports.detailsNews = async (req,res) => {
    const news = await News.findById(req.params.newsId)
    .populate('author', '_id bio penName profilePic')
    .populate('tags', '_id name')
    .populate('category', '_id name')
    res.render('editor/detailNews', {
        layout: 'workspace',
        news,
        whoFor
    });
}

module.exports.renderRejectNews = async (req, res) => {
    try {
        const news = await News.findById(req.params.newsId)
        .populate('author', '_id bio penName profilePic')
        .populate('tags', '_id name');
        
        res.render('editor/rejectNews', {
            layout: 'workspace',
            news,
            whoFor
        });
    } catch (error) {
        console.error("Error fetching draft news:", error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports.renderApproveNews = async (req, res) => {
    try {
       
        
        const news = await News.findById(req.params.newsId)
        .populate('author', '_id bio penName profilePic')
        .populate('category', '_id name belongTo')
        .populate('tags', '_id name')
        const allMainCate = await MainCate.find({})
        const subOfMainCate = await SubCate.find({belongTo: news.category.belongTo });
        const tagsJson = JSON.stringify(news.tags.map(tag => tag.name)); // Preprocess the tags
        res.render('editor/approveNews', {
            layout: 'workspace',
            news,
            subOfMainCate,
            allMainCate,
            tagsJson,
            whoFor
        });
    } catch (error) {
        console.error("Error fetching draft news:", error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports.rejectNews = async (req, res) => {
    try {
        const newsId = req.params.newsId;
        console.log(await News.findById(newsId));
        const userId = req.user.id; 
        const updatedNews = await News.findByIdAndUpdate(
            newsId,
            {
                status: 'rejected',
                reject: {
                    reason: req.body.reason,
                    whoRejected: userId,
                },
            },
            { new: true } 
        )
        if (!updatedNews) {
            return res.status(404).json({ error: "News not found." });
        }
        console.log(updatedNews);
        res.redirect(`/editor/${userId}/editorNews`);
    } catch (error) {
        console.error("Error rejecting news:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports.approveNews = async (req, res) => {
    try {
      const newsId = req.params.newsId;
      const userId = req.user.id;
      const { datetime, news } = req.body;
      
      // Parse and format the datetime input to a proper Date object
      const [datePart, timePart] = datetime.split(' ');
      const dPubParts = datePart.split('/');
      const formattedDate = `${dPubParts[2]}-${dPubParts[1]}-${dPubParts[0]}T${timePart}:00`;
      const dPubConverted = new Date(formattedDate);
  
      // Update the news document
      const updatedNews = await News.findByIdAndUpdate(
        newsId,
        {
          status: 'published',
          publish: {
            publishedDate: dPubConverted,
            whoApprove: userId,
          },
          category: news.category,
        },
        { new: true } // Return the updated document
      ).populate('tags', 'name _id');
      console.log(updatedNews);
      if (!updatedNews) {
        return res.status(404).json({ error: "News not found." });
      }
  
      // Process tags
      const tagsArray = JSON.parse(req.body.news.tags)
        .map(tag => tag.value)
        .filter(tag => tag.trim() !== ''); // Remove empty or invalid tags
      
      const existingTagNames = updatedNews.tags.map(tag => tag.name);
      const tagsToRemove = existingTagNames.filter(tagName => !tagsArray.includes(tagName));
  
      // Remove tags that are no longer associated with the news
      for (let tagName of tagsToRemove) {
        const tag = await Tag.findOne({ name: tagName });
        if (tag) {
          tag.newsList = tag.newsList.filter(newsId => !newsId.equals(newsId)); // Ensure it's updated with correct ID
          await tag.save();
          updatedNews.tags = updatedNews.tags.filter(tag => tag.name !== tagName);
        }
      }
  
      // Add new tags that are not already associated with the news
      for (let newTagName of tagsArray) {
        const existingTag = updatedNews.tags.find(tag => tag.name === newTagName);
        if (!existingTag) {
          let tag = await Tag.findOne({ name: newTagName });
          if (tag) {
            tag.newsList.push(updatedNews._id);
            updatedNews.tags.push(tag._id);
            await tag.save();
          } else {
            const newTag = new Tag({ name: newTagName });
            newTag.newsList.push(updatedNews._id);
            updatedNews.tags.push(newTag._id);
            await newTag.save();
          }
        }
      }
      await updatedNews.save();
      // Redirect to the editor's news page
      return res.redirect(`/editor/${userId}/editorNews`);
    } catch (error) {
      console.error("Error approving news:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
  

