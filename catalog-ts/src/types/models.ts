// Доменные модели — типизированы строго по полям из БД.

export interface Product {
    id: number;
    name: string;
    description: string | null;
    price: number;          // в БД NUMERIC -> pg отдаёт строкой, приводим к number
    stock_quantity: number;
    created_at: Date;       // строго Date (преобразуем строку из БД)
}

export interface Review {
    id: number;
    product_id: number;
    reviewer_name: string;
    rating: number;
    comment: string | null;
    created_at: Date;
}

// Сложный тип: товар + агрегаты, посчитанные в БД (AVG рейтинга и кол-во отзывов).
export interface ProductWithStats extends Product {
    avg_rating: number | null;
    review_count: number;
}

// "Сырые" строки, как их реально возвращает драйвер pg
// (NUMERIC, AVG и COUNT приходят строками, timestamp — объектом Date).
export interface ProductRow {
    id: number;
    name: string;
    description: string | null;
    price: string;
    stock_quantity: number;
    created_at: Date;
}

export interface ProductStatsRow extends ProductRow {
    avg_rating: string | null;
    review_count: string;
}

export interface ReviewRow {
    id: number;
    product_id: number;
    reviewer_name: string;
    rating: number;
    comment: string | null;
    created_at: Date;
}
