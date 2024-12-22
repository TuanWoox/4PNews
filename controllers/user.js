const whoFor = 'USER'
const User = require('../models/user');
const PremiumBill = require('../models/premiumBill');
const { cloudinary } = require('../cloudinary/postCloud');
module.exports.renderUserProfile = async (req, res) => {
    const user = await User.findById(req.params.id);
    // Format the dateOfBirth field to DD-MM-YYYY
    const formattedDateOfBirth = user.dateOfBirth
        ? user.dateOfBirth.toLocaleDateString('en-GB')  // 'en-GB' format is DD/MM/YYYY
        : null;

    // Pass the formatted dateOfBirth to the template
    res.render('user/profile', {
        layout: 'main',
        user,
        whoFor,
        title: '4P NEWS USER PROFILE',
        formattedDateOfBirth
    });
};
module.exports.renderUserEditProfile = async (req,res) => {
    const user = await User.findById(req.params.id);
   
    const formattedDateOfBirth = user.dateOfBirth
        ? user.dateOfBirth.toLocaleDateString('en-GB') 
        : null;

    res.render('user/editProfile', {
        layout: 'main',
        user,
        whoFor,
        title: '4P NEWS USER PROFILE',
        formattedDateOfBirth
    });
}
module.exports.editProfile = async (req,res) => {
    const updatedData = {
        ...req.body.user
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

module.exports.buyPremium = async (req,res) => {
    const userId = req.params.id;
    const newpremiumBill = new PremiumBill({
        buyerId: userId
    })
    await newpremiumBill.save();
    req.flash('success', "Đã gửi đơn mua premium thành công");
    res.redirect(`/user/${req.params.id}/profile`);
}
module.exports.premiumBillHistory = async (req,res) => {
    try {
            const status = req.query.status || 'all';
            const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
            const limit = parseInt(req.query.limit) || 10;  // Default to 10 items per page if not provided
            
            let query = {
                buyerId: req.params.id
            };
            console.log(query);
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
            res.render('user/premiumBillHistory', {
                layout: 'main',
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
}