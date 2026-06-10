import { Request, Response, NextFunction } from 'express';
import { getAllProductsWithStats, getProductById } from '../services/productService';
import { getReviewsByProduct } from '../services/reviewService';
import {
    ProductsListViewModel,
    ProductDetailViewModel,
} from '../types/view-models';

// GET /products — список товаров (карточки со средним рейтингом).
export async function listProducts(
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const products = await getAllProductsWithStats();
        const vm: ProductsListViewModel = { title: 'Каталог товаров', products };
        res.render('products/list', vm);
    } catch (err) {
        next(err);
    }
}

// GET /products/:id — детальная страница товара + отзывы.
export async function showProduct(
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
        const reviews = await getReviewsByProduct(id);
        const vm: ProductDetailViewModel = { title: product.name, product, reviews };
        res.render('products/detail', vm);
    } catch (err) {
        next(err);
    }
}
