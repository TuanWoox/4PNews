const express = require('express');
const router = express.Router({mergeParams: true});
const writerController = require('../controllers/writer');
const multer = require('multer');
const { storage } = require('../cloudinary/postCloud');
const upload = multer({storage});
const { storeReturnTo, isLoggedIn, IsYou,IsAuthorNews, canWriterEdit} = require('../middlewares/checkMiddleware');


router.route('/:id/profile')
.get(writerController.renderWriterProfileForm);


router.route('/:id/editProfile')
.get(isLoggedIn,IsYou,writerController.renderEditProfileForm)
.patch(isLoggedIn,IsYou,upload.single('avatar'),writerController.editProfile)

router.route('/:id/writerNews')
.get(isLoggedIn,IsYou,writerController.renderWriterNewsForm)


router.route('/:id/addNews')
.get(isLoggedIn,IsYou,writerController.renderAddNewsForm)
.post(isLoggedIn,IsYou,writerController.createNews);

router.route('/:id/viewNews/:newsId')
.get(isLoggedIn,IsAuthorNews,writerController.viewANews)
.delete(isLoggedIn,IsAuthorNews,writerController.deleteANews)
.patch(isLoggedIn,IsAuthorNews,canWriterEdit,writerController.editANews)

router.route('/:id/viewRejectedNews/:newsId')
.get(isLoggedIn,IsAuthorNews,writerController.viewRejectedNews);

router.route('/:id/editNews/:newsId')
.get(isLoggedIn,IsAuthorNews,canWriterEdit,writerController.renderEditNewsForm);
module.exports = router;