const express = require('express');
const router = express.Router({mergeParams: true});
const editorController = require('../controllers/editor');
const multer = require('multer');
const { storage } = require('../cloudinary/postCloud');
const upload = multer({storage});
const { storeReturnTo, isLoggedIn, IsYou} = require('../middlewares/checkMiddleware');


router.route('/:id/editorNews')
.get(isLoggedIn, IsYou, editorController.renderListDraft);

router.route('/:id/editorNews/:newsId')
.get(isLoggedIn, IsYou, editorController.detailsNews);

router.route('/:id/editorNews/:newsId/reject')
.get(isLoggedIn, IsYou, editorController.renderRejectNews)
.patch(isLoggedIn, IsYou, editorController.rejectNews)

router.route('/:id/editorNews/:newsId/approve')
.get(isLoggedIn, IsYou, editorController.renderApproveNews)
.patch(isLoggedIn, IsYou, editorController.approveNews)


module.exports = router;