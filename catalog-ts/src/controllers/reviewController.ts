import { Request, Response, NextFunction } from 'express';
import { getProductById } from '../services/productService';
import { createReview } from '../services/reviewService';
import { ReviewFormViewModel, CreateReviewBody } from '../types/view-models';

// GET /products/:id/reviews/new — форма добавления отзыва.
// :id доступен благодаря mergeParams во вложенном роутере.
export async function showNewReviewForm(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const id = parseInt(req.params.id, 10);
        const product = await getProductById(id);
        if (!product) {
            res.status(404).send('Товар не найден');
            return;
        }
        const vm: ReviewFormViewModel = { title: `Новый отзыв — ${product.name}`, product };
        res.render('reviews/new', vm);
    } catch (err) {
        next(err);
    }
}

// POST /products/:id/reviews — создание отзыва, редирект на товар.
export async function createReviewHandler(
    req: Request<{ id: string }, unknown, CreateReviewBody>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const id = parseInt(req.params.id, 10);
        const { reviewer_name, rating, comment } = req.body;
        await createReview(id, reviewer_name.trim(), parseInt(rating, 10), comment ?? '');
        res.redirect(`/products/${id}`);
    } catch (err) {
        next(err);
    }
}
