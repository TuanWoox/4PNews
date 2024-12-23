const MainCate = require('../models/mainCategory');
const SubCate = require('../models/subCategory');
const Tag = require('../models/tag');
const News = require('../models/news');
const User = require('../models/user');
const PremiumBill = require('../models/premiumBill');
const whoFor ="ADMIN"
module.exports.redirectToWorkSpace = async (req,res) => {
    return res.redirect('/admin/mainCategories');
}
//Category controllers
module.exports.renderMainCategoryIndex = async (req,res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerpage = 6;
        const totalMaincategories = await MainCate.countDocuments();
        const totalPages = Math.ceil(totalMaincategories  / itemsPerpage);
        const offset = (page - 1) * itemsPerpage; // Calculate the offset
        const mainCategories = await MainCate.find({})
            .skip((page-1)*itemsPerpage)
            .limit(itemsPerpage);
        res.render('admin/category/main/index', {
            layout: 'workspace',
            mainCategories,
            currentPage: page,
            totalPages: totalPages,
            offset,
            activePage:'category', 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}; 
module.exports.renderAddingMainCategoriesForm = (req,res) => {
    try {
        res.render('admin/category/main/add', {
            layout: 'workspace',
            activePage: 'category', 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};
module.exports.addNewMainCategory = async (req, res) => {
    try {
        const newMain = new MainCate({
            name: req.body.catName
        });
        await newMain.save();
        return res.redirect(`/admin/mainCategories`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};
module.exports.renderEditMainCategory = async (req,res) => {
    try {
        const mainCateId = req.params.mainCateId;
        const mainCate = await MainCate.findById(mainCateId);
        res.render('admin/category/main/edit', {
            layout: 'workspace',
            activePage: 'category', 
            mainCate,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};
module.exports.editMainCate = async (req,res) => {
    try {
        const mainCateId = req.params.mainCateId;
        const mainCate = await MainCate.findById(mainCateId);
        mainCate.name = req.body.catName;
        await mainCate.save();
        return res.redirect(`/admin/mainCategories`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};
module.exports.deleteMainCate = async (req, res) => {
    try {
        const mainCateId = req.params.mainCateId;
        await MainCate.findByIdAndDelete(mainCateId);
        return res.redirect(`/admin/mainCategories`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};
module.exports.renderSubCategoryIndex = async (req, res) => {
    try {
        const mainCateId = req.params.mainCateId;  // Get the main category ID from the URL
        const mainCate = await MainCate.findById(mainCateId);
        const page = parseInt(req.query.page) || 1;  
        const itemsPerPage = 6;
        const totalSubcategories = await SubCate.countDocuments({ belongTo: mainCateId });
        const totalPages = Math.ceil(totalSubcategories / itemsPerPage);
        const offset = (page - 1) * itemsPerPage;
        const listOfSubCates = await SubCate.find({ belongTo: mainCateId })
            .skip(offset)
            .limit(itemsPerPage);
        res.render('admin/category/sub/index', {
            layout: 'workspace',
            listOfSubCates,
            currentPage: page,
            totalPages: totalPages,
            offset: offset,
            mainCate,
            activePage: 'category',
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};
module.exports.renderAddingSubCategoriesForm = (req,res) => {
    try {
        res.render('admin/category/sub/add', {
            layout: 'workspace',
            activePage: 'category', 
            mainCateId: req.params.mainCateId
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};
module.exports.addNewSubCategory = async (req, res) => {
    try {
        const newSubMain = new SubCate({
            name: req.body.catName,
            belongTo: req.params.mainCateId,
        });
        await newSubMain.save();
        return res.redirect(`/admin/mainCategories/${req.params.mainCateId}/viewSubCatgories`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};
module.exports.renderEditSubCategory = async (req,res) => {
    try {
        const subCateId = req.params.subCateId;
        const subCate = await SubCate.findById(subCateId);
        res.render('admin/category/sub/edit', {
            layout: 'workspace',
            activePage: 'category', 
            subCate,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};
module.exports.editSubCate = async (req,res) => {
    try {
        const subCateId = req.params.subCateId;
        const subCate = await SubCate.findById(subCateId);
        subCate.name = req.body.catName;
        await subCate.save();
        return res.redirect(`/admin/mainCategories/${req.params.mainCateId}/viewSubCatgories`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};
module.exports.deleteSubCate = async (req, res) => {
    try {
        const subCateId = req.params.subCateId;
        await SubCate.findByIdAndDelete(subCateId);
        return res.redirect(`/admin/mainCategories/${req.params.mainCateId}/viewSubCatgories`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};
module.exports.renderTagIndex = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerpage = 10;
        const totalTags = await Tag.countDocuments();
        const totalPages = Math.ceil(totalTags / itemsPerpage);
        const offset = (page - 1) * itemsPerpage; // Calculate the offset
        const listTags = await Tag.find({})
            .skip(offset)
            .limit(itemsPerpage);
        res.render('admin/tag/index', {
            layout: 'workspace',
            activePage: 'tag', 
            listTags,
            currentPage: page,
            totalPages,
            offset,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};
module.exports.renderAddTagForm = (req, res) => {
    try {
        res.render('admin/tag/add', {
            layout: 'workspace',
            activePage: 'tag', 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};
module.exports.addTag = async (req, res) => {
    try {
        const name = req.body.tagName;
        const newTag = new Tag({
            name
        });
        await newTag.save();
        return res.redirect('/admin/tags');
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};
module.exports.renderEditTagForm = async (req, res) => {
    try {
        const tagId = req.params.tagId;
        const tag = await Tag.findById(tagId);
        res.render('admin/tag/edit', {
            layout: 'workspace',
            activePage: 'tag', 
            tag
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};
module.exports.editTag = async (req, res) => {
    try {
        const tagId = req.params.tagId;
        const tag = await Tag.findById(tagId);
        tag.name = req.body.tagName;
        await tag.save();
        return res.redirect('/admin/tags');
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};
module.exports.deleteTag = async (req, res) => {
    try {
        const tagId = req.params.tagId;
        await Tag.findByIdAndDelete(tagId);
        return res.redirect('/admin/tags');
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};
module.exports.renderNewsIndex = async (req, res) => {
    const category = req.query.category || 'all';
    const status = req.query.status || 'all';
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 10; // Default limit is 10
    try {
        // Fetch subcategories if a main category is selected
        let subCategories = [];
        if (category !== 'all') {
            subCategories = await SubCate.find({ belongTo: category });
        }

        // Build the query object based on filters
        const query = {};
        if (category !== 'all') query.category = { $in: subCategories.map((sub) => sub._id) };
        if (status !== 'all') query.status = status;
        if (status === 'published') {
            query["publish.publishedDate"] = { $lt: new Date() };
        } 
        if (status === 'approved') {
            query["publish.publishedDate"] = { $gt: new Date() };
        } 

        // Fetch total count for pagination
        const totalNews = await News.countDocuments(query);

        // Fetch filtered and paginated news
        const listNews = await News.find(query)
            .populate('category', '_id name')
            .populate('tags', '_id name')
            .sort({ createdAt: -1 }) // Sort newest first
            .skip((page - 1) * limit) // Skip documents for pagination
            .limit(limit);

        // Fetch all main categories for the filter dropdown
        const listMainCategories = await MainCate.find({});

        // Render the page with data
        res.render('admin/news/index', {
            layout: 'workspace',
            activePage: 'news',
            listNews,
            listMainCategories,
            currentPage: page,
            totalPages: Math.ceil(totalNews / limit),
            category,
            status,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching news.');
    }
};
module.exports.renderShowNews = async (req, res) => {
    try {
        const news = await News.findById(req.params.newsId)
            .populate('tags', '_id name')
            .populate('category', '_id name belongTo')
            .populate('author', '_id name penName bio profilePic');
        const category = news.category.belongTo;
        const status = news.status;
        res.render('admin/news/show', {
            layout: 'workspace',
            activePage: 'news', 
            news,
            category,
            status
        });
    } catch (error) {
        console.error("Error fetching news details:", error);
        res.status(500).send('An error occurred while fetching the news details.');
    }
};
module.exports.publishNews = async (req, res) => {
    const newsId = req.params.newsId;
    try {
        const news = await News.findByIdAndUpdate(
            newsId,
            {
                status: 'published',
                publish: {
                    whoApprove: req.user._id,
                    publishedDate: Date.now()
                }
            },
            { new: true } // Option to return the updated document
        );

        if (!news) {
            return res.status(404).send({ message: 'News not found' });
        }

        return res.redirect(`/admin/news/detailNews/${newsId}`);
    } catch (err) {
        console.error("Error publishing news:", err);
        return res.status(500).send({ message: 'Error publishing news', error: err.message });
    }
};
module.exports.renderRejectNews = async (req, res) => {
    try {
        const news = await News.findById(req.params.newsId)
            .populate('author', '_id bio penName profilePic')
            .populate('tags', '_id name');
        res.render('admin/news/rejectNews', {
            layout: 'workspace',
            news,
            activePage: 'news',
        });
    } catch (error) {
        console.error("Error fetching draft news:", error);
        res.status(500).send("Internal Server Error");
    }
};
module.exports.rejectNews = async (req, res) => {
    try {
        const newsId = req.params.newsId;
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
        );
        if (!updatedNews) {
            return res.status(404).json({ error: "News not found." });
        }
        res.redirect(`/admin/news/detailNews/${updatedNews._id}`);
    } catch (error) {
        console.error("Error rejecting news:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
module.exports.deleteNews = async (req, res) => {
    const newsId = req.params.newsId;
    try {
        const deletedNew = await News.findByIdAndDelete(newsId)
            .populate('category', '_id name belongTo');

        if (!deletedNew) {
            return res.status(404).send('News not found.');
        }

        const category = deletedNew.category.belongTo;
        const status = deletedNew.status;
        res.redirect(`/admin/news?category=${category}&status=${status}`);
    } catch (error) {
        console.error("Error deleting news:", error);
        res.status(500).send("An error occurred while deleting the news.");
    }
};
module.exports.renderUserIndex = async (req, res) => {
    try {
        const role = req.query.role || 'all';

        // Create the base query object
        const query = { role: { $ne: 'admin' } };

        // Add the role filter if it's not 'all'
        if (role !== 'all') {
            query.role = role;
        }

        // Additional filter for 'premium' role
        if (role === 'premium') {
            const now = new Date();
            query['premium.endDate'] = { $gt: now };
        }

        // Fetch users based on the constructed query
        const users = await User.find(query);

        // Render the page with the filtered users
        res.render('admin/user/index', {
            layout: 'workspace',
            activePage: 'users',
            users,
            role,
        });
    } catch (error) {
        console.error("Error rendering user index:", error);
        res.status(500).send("Internal Server Error");
    }
};
module.exports.renderUserEditForm = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('managedSubCate');
        let mainCateslist = await MainCate.find({});
        let subCatesList;
        if (user.role === "editor" && user.managedSubCate) {
            subCatesList = await SubCate.find({ belongTo: user.managedSubCate.belongTo });
        } else {
            const firstMainCate = mainCateslist[0]; // Fixed typo
            subCatesList = firstMainCate ? await SubCate.find({ belongTo: firstMainCate._id }) : [];
        }

        res.render('admin/user/edit', {
            layout: 'workspace',
            activePage: 'users',
            user,
            mainCateslist,
            subCatesList,
        });
    } catch (error) {
        console.error("Error rendering user edit form:", error);
        res.status(500).send("Internal Server Error");
    }
};
module.exports.editUser = async (req, res) => {
    try {
        const role = req.body.role; 
        const managedSubCate = req.body.managedSubCate;
        const user = await User.findById(req.params.userId);

        if (role === 'user') {
            user.role = role;
            await user.save();
        }

        if (role === 'writer') {
            if (!user.penName) { 
                user.penName = user.fullName; 
            }
            if (!user.bio) {
                user.bio = 'Nothing to show';
            }
            user.role = role;
            await user.save();
        }

        if (role === 'editor') {
            user.managedSubCate = managedSubCate;
            user.role = role; 
            await user.save();
        }

        res.redirect(`/admin/users/${user._id}/edit`);
    } catch (error) {
        console.error("Error editing user:", error);
        res.status(500).send("Internal Server Error");
    }
};
module.exports.renderCreateUserForm = (req, res) => {
    try {
        res.render('admin/user/createUser', {
            layout: 'workspace',
            activePage: 'users',
        });
    } catch (error) {
        console.error("Error rendering create user form:", error);
        res.status(500).send("Internal Server Error");
    }
};
module.exports.createUser = async (req, res) => {
    try {
        const { username, rawPassword, fullName, rawDob, email, gender, role } = req.body.user;
        const dobParts = rawDob.split('/'); 
        const formattedDob = `${dobParts[2]}-${dobParts[1]}-${dobParts[0]}`;
        const dateOfBirthConvert = new Date(formattedDob);

        const user = new User({
            username,
            fullName,
            dateOfBirth: dateOfBirthConvert,
            email,
            gender,
            role
        });

        const registeredUser = await User.register(user, rawPassword);

        if (registeredUser) {
            req.flash('success', 'Đã tạo user mới thành công!!!');
            res.redirect('/admin/users');
        }
    } catch (error) {
        console.error("Error creating user:", error);
        req.flash('error', 'Có lỗi xảy ra khi tạo user.');
        res.redirect('/admin/users');
    }
};
module.exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.userId);

        if (deletedUser) {
            req.flash('success', 'Xóa user thành công!!!');
            res.redirect('/admin/users');
        } else {
            req.flash('error', 'Không tìm thấy user');
            res.redirect('/admin/users');
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        req.flash('error', 'Có lỗi xảy ra khi xóa user.');
        res.redirect('/admin/users');
    }
};
module.exports.renderPremiumIndex = async (req, res) => {
    try {
        const status = req.query.status || 'all';
        const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10;  // Default to 10 items per page if not provided
        
        let query = {};
        if (status !== 'all') query.status = status;

        // Get the premium bills with pagination
        const premiumBills = await PremiumBill.find(query)
            .skip((page - 1) * limit)  // Skip the records for previous pages
            .limit(limit)  // Limit the number of records returned
            .populate('buyerId');

        // Get the total count of premium bills matching the query
        const totalBills = await PremiumBill.countDocuments(query);

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalBills / limit);

        // Render the page with pagination details
        res.render('admin/premium/index', {
            layout: 'workspace',
            activePage: 'premium',
            premiumBills,
            status,
            currentPage: page,
            totalPages,
            limit
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while fetching the premium bills.");
    }
};
module.exports.approvePremiumBill = async (req, res) => {
    try {
        const premiumBillId = req.params.premiumBillId;
        const premiumBill = await PremiumBill.findById(premiumBillId);
        if (!premiumBill) {
            return res.status(404).send("Premium bill not found.");
        }

        const user = await User.findById(premiumBill.buyerId);
        if (!user) {
            return res.status(404).send("User not found.");
        }

        const now = new Date(); // Define the current date and time
        const sevenDays = 7 * 24 * 60 * 60 * 1000; // Seven days in milliseconds

        if (user.premium) {
            if (user.premium < now) {
                // Premium expired: Start a new 7-day period from now
                user.premium = new Date(now.getTime() + sevenDays);
            } else {
                // Premium active: Extend by 7 days
                user.premium = new Date(user.premium.getTime() + sevenDays);
            }
        } else {
            // No premium: Start a new 7-day period from now
            user.premium = new Date(now.getTime() + sevenDays);
        }

        premiumBill.status = "approved";
        await premiumBill.save();
        await user.save();

        res.redirect("/admin/premiums");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while approving the premium bill.");
    }
};
module.exports.rejectPremiumBill = async (req, res) => {
    try {
        const premiumBillId = req.params.premiumBillId;
        const premiumBill = await PremiumBill.findById(premiumBillId);

        if (!premiumBill) {
            return res.status(404).send("Premium bill not found.");
        }

        premiumBill.status = 'rejected';
        await premiumBill.save();
        res.redirect("/admin/premiums");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while rejecting the premium bill.");
    }
};
