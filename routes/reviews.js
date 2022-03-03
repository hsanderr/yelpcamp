const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware')
const reviews = require('../controllers/reviews')

router.post('/', isLoggedIn, validateReview, wrapAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviews.deleteReview));

module.exports = router;