// dotenv должен загрузиться ДО импорта app (там создаётся пул БД, читающий env).
import 'dotenv/config';
import app from './app';

const PORT = parseInt(process.env.PORT || '3000', 10);

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
