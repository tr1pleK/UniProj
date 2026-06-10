import { query } from '../config/database';
import { Review, ReviewRow } from '../types/models';

function toReview(row: ReviewRow): Review {
    return {
        id: row.id,
        product_id: row.product_id,
        reviewer_name: row.reviewer_name,
        rating: row.rating,
        comment: row.comment,
        created_at: new Date(row.created_at),
    };
}

// Все отзывы на товар, новые сверху.
export async function getReviewsByProduct(productId: number): Promise<Review[]> {
    const result = await query<ReviewRow>(
        'SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC',
        [productId]
    );
    return result.rows.map(toReview);
}

// Создание отзыва.
export async function createReview(
    productId: number,
    reviewerName: string,
    rating: number,
    comment: string
): Promise<void> {
    await query(
        `INSERT INTO reviews (product_id, reviewer_name, rating, comment)
         VALUES ($1, $2, $3, $4)`,
        [productId, reviewerName, rating, comment]
    );
}
