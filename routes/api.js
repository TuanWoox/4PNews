const express = require('express');
const multer = require('multer');
const imageHandlerController = require('../controllers/imageHandler');
const subCategoryController = require('../controllers/subCategory');
const tagController = require('../controllers/tag');
const accountController = require('../controllers/account');
const premiumController = require('../controllers/premiumBill');
const router = express.Router({mergeParams: true});
const { storage } = require('../cloudinary/postCloud');
const upload = multer({storage});


router.route('/imageHandler/upload')
.post(upload.single('image'), imageHandlerController.uploadTinyMCE);

// New route to handle multiple deletions
router.route('/imageHandler/deleteMany')
.delete(imageHandlerController.deleteManyTinyMCE);

router.route('/getSubCategories/:mainId')
.get(subCategoryController.getSubCategory);

router.route('/suggestTagByLetter')
.get(tagController.suggestTagByLetter);


router.route('/isAccountAvailable')
.get(accountController.isAccountAvailable)

router.route('/isEmailAvailable')
.get(accountController.isEmailAvailable)

router.route('/isBuyPremiumAvailable')
.get(premiumController.isAvailable)

module.exports = router