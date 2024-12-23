const express = require('express');
const router = express.Router({mergeParams: true});
const adminController = require('../controllers/admin');
const multer = require('multer');
const { storage } = require('../cloudinary/postCloud');
const upload = multer({storage});
const { storeReturnTo, isLoggedIn, isAdmin} = require('../middlewares/checkMiddleware');



//Main Category

router.route('/mainCategories')
.get(isLoggedIn,isAdmin,adminController.renderMainCategoryIndex)

router.route('/mainCategories/add')
.get(isLoggedIn,isAdmin,adminController.renderAddingMainCategoriesForm)
.post(isLoggedIn,isAdmin,adminController.addNewMainCategory)


router.route('/mainCategories/:mainCateId')
.patch(isLoggedIn,isAdmin,adminController.editMainCate)
.delete(isLoggedIn,isAdmin,adminController.deleteMainCate)

router.route('/mainCategories/:mainCateId/edit')
.get(isLoggedIn,isAdmin,adminController.renderEditMainCategory)


//Sub Category
router.route('/mainCategories/:mainCateId/viewSubCatgories')
.get(isLoggedIn,isAdmin,adminController.renderSubCategoryIndex)

router.route('/mainCategories/:mainCateId/addSubCategory')
.get(isLoggedIn,isAdmin,adminController.renderAddingSubCategoriesForm)
.post(isLoggedIn,isAdmin,adminController.addNewSubCategory)

router.route('/mainCategories/:mainCateId/:subCateId')
.patch(isLoggedIn,isAdmin,adminController.editSubCate)
.delete(isLoggedIn,isAdmin,adminController.deleteSubCate)

router.route('/mainCategories/:mainCateId/editSubCate/:subCateId')
.get(isLoggedIn,isAdmin,adminController.renderEditSubCategory);


//Tag
router.route('/tags')
.get(isLoggedIn,isAdmin,adminController.renderTagIndex);

router.route('/tags/add')
.get(isLoggedIn,isAdmin,adminController.renderAddTagForm)
.post(isLoggedIn,isAdmin,adminController.addTag)

router.route('/tags/:tagId')
.patch(isLoggedIn,isAdmin,adminController.editTag)
.delete(isLoggedIn,isAdmin,adminController.deleteTag)

router.route('/tags/:tagId/edit')
.get(isLoggedIn,isAdmin,adminController.renderEditTagForm)

//News
router.route('/news')
.get(isLoggedIn,isAdmin,adminController.renderNewsIndex);

router.route('/news/detailNews/:newsId')
.get(isLoggedIn,isAdmin,adminController.renderShowNews);


router.route('/news/:newsId')
.patch(isLoggedIn,isAdmin,adminController.publishNews)
.delete(isLoggedIn,isAdmin,adminController.deleteNews)

router.route('/news/:newsId/rejectNews')
.get(isLoggedIn,isAdmin,adminController.renderRejectNews)
.post(isLoggedIn,isAdmin,adminController.rejectNews)


//User route
router.route('/users')
.get(isLoggedIn,isAdmin,adminController.renderUserIndex);

router.route('/users/:userId')
.patch(isLoggedIn,isAdmin,adminController.editUser)
.delete(isLoggedIn,isAdmin,adminController.deleteUser)

router.route('/users/:userId/edit')
.get(isLoggedIn,isAdmin,adminController.renderUserEditForm);

router.route('/createUser')
.get(isLoggedIn,isAdmin,adminController.renderCreateUserForm)
.post(isLoggedIn,isAdmin,adminController.createUser)
//Premium routes
router.route('/premiums')
.get(isLoggedIn,isAdmin,adminController.renderPremiumIndex);


router.route('/rejectPremium/:premiumBillId')
.get(isLoggedIn,isAdmin,adminController.rejectPremiumBill);

router.route('/approvePremium/:premiumBillId')
.get(isLoggedIn,isAdmin,adminController.approvePremiumBill);



router.route('/:id')
.get(isLoggedIn,isAdmin,adminController.redirectToWorkSpace)





module.exports = router;