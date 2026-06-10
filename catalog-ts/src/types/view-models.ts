import { Product, ProductWithStats, Review } from './models';

// Базовый интерфейс для данных, передаваемых во все представления
export interface BaseViewModel {
    title: string;
}

export interface ProductsListViewModel extends BaseViewModel {
    products: ProductWithStats[];
}

export interface ProductDetailViewModel extends BaseViewModel {
    product: Product;
    reviews: Review[];
}

export interface ReviewFormViewModel extends BaseViewModel {
    product: Product;
}

// Тело POST-запроса при создании отзыва
export interface CreateReviewBody {
    reviewer_name: string;
    rating: string;
    comment: string;
}
