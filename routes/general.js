const express = require('express');
const router = express.Router({mergeParams: true});
const generalController = require('../controllers/general');
const {premiumNews,isLoggedIn} = require('../middlewares/checkMiddleware')
router.route('/detail/:newsId')
.get(premiumNews,generalController.renderDetailsNews)
.post(isLoggedIn, generalController.addComment)
router.route('/tag/:tagId')
.get(generalController.renderFindByTag);

router.route('/category/:subCateId')
.get(generalController.renderFindBySubCate);

router.route('/search')
.get(generalController.searchNews);

router.route('/')
.get(generalController.renderHome);


module.exports = router;