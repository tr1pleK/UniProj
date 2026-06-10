import express, { Application, Request, Response } from 'express';
import path from 'path';
import productRoutes from './routes/productRoutes';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

// EJS как шаблонизатор
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Разбор данных HTML-форм
app.use(express.urlencoded({ extended: true }));

// Маршруты
app.get('/', (_req: Request, res: Response) => res.redirect('/products'));
app.use('/products', productRoutes);

// Обработчик ошибок — последним
app.use(errorHandler);

export default app;
