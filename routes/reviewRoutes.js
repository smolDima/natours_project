const express = require('express');

const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });
// The mergeParams: true option is typically used when you're defining a router in Express.js and
// you want to merge the parameters from a parent router with the parameters of a child router.
// It's often used when you have nested routers and you want to access parameters defined in the parent
// router within the child router.   (POST /tour/398234823/reviews,  POST /reviews)

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  );

module.exports = router;
