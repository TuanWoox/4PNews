const whoFor = 'USER'
const User = require('../models/user');
const { cloudinary } = require('../cloudinary/postCloud');
module.exports.renderUserProfile = async (req, res) => {
    const user = await User.findById(req.params.id);
    // Format the dateOfBirth field to DD-MM-YYYY
    const formattedDateOfBirth = user.dateOfBirth
        ? user.dateOfBirth.toLocaleDateString('en-GB')  // 'en-GB' format is DD/MM/YYYY
        : null;

    // Pass the formatted dateOfBirth to the template
    res.render('user/profile', {
        layout: 'general',
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
        layout: 'general',
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