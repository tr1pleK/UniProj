import { query } from '../config/database';
import {
    Product,
    ProductWithStats,
    ProductRow,
    ProductStatsRow,
} from '../types/models';

// Преобразование "сырой" строки БД в строго типизированную модель.
function toProduct(row: ProductRow): Product {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        stock_quantity: row.stock_quantity,
        created_at: new Date(row.created_at),
    };
}

function toProductWithStats(row: ProductStatsRow): ProductWithStats {
    return {
        ...toProduct(row),
        avg_rating: row.avg_rating !== null ? parseFloat(row.avg_rating) : null,
        review_count: parseInt(row.review_count, 10),
    };
}

// Список товаров со средним рейтингом и количеством отзывов (JOIN + GROUP BY).
export async function getAllProductsWithStats(): Promise<ProductWithStats[]> {
    const result = await query<ProductStatsRow>(`
        SELECT
            p.*,
            AVG(r.rating)  AS avg_rating,
            COUNT(r.id)    AS review_count
        FROM products p
        LEFT JOIN reviews r ON r.product_id = p.id
        GROUP BY p.id
        ORDER BY p.id
    `);
    return result.rows.map(toProductWithStats);
}

// Один товар по id (или null, если не найден).
export async function getProductById(id: number): Promise<Product | null> {
    const result = await query<ProductRow>(
        'SELECT * FROM products WHERE id = $1',
        [id]
    );
    const row = result.rows[0];
    return row ? toProduct(row) : null;
}
