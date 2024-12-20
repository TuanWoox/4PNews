const express = require('express');
const router = express.Router({mergeParams: true});
const userController = require('../controllers/user');
const passport = require('passport');
const multer = require('multer');
const { storage } = require('../cloudinary/postCloud');
const upload = multer({storage});
const { storeReturnTo, isLoggedIn, IsYou} = require('../middlewares/checkMiddleware');


router.route('/:id/profile')
.get(userController.renderUserProfile)

router.route('/:id/editProfile')
.get(isLoggedIn,IsYou,userController.renderUserEditProfile)
.patch(isLoggedIn,IsYou,upload.single('avatar'),userController.editProfile)
module.exports = router;