import { Router } from 'express';
import { showNewReviewForm, createReviewHandler } from '../controllers/reviewController';
import { validateReview } from '../middleware/validateReview';

// mergeParams: true — чтобы из вложенного роутера был доступен :id товара
// из родительского пути /products/:id/reviews.
const router = Router({ mergeParams: true });

router.get('/new', showNewReviewForm);
router.post('/', validateReview, createReviewHandler);

export default router;
