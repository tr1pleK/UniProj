import { Router } from 'express';
import { listProducts, showProduct } from '../controllers/productController';
import reviewRoutes from './reviewRoutes';

const router = Router();

router.get('/', listProducts);
router.get('/:id', showProduct);

// Вложенные роуты отзывов: /products/:id/reviews/...
router.use('/:id/reviews', reviewRoutes);

export default router;
