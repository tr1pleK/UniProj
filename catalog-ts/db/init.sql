CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    reviewer_name VARCHAR(100) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Тестовые данные
INSERT INTO products (name, description, price, stock_quantity) VALUES
    ('Беспроводные наушники Aurora', 'Накладные наушники с шумоподавлением и временем работы до 30 часов.', 4990.00, 25),
    ('Механическая клавиатура Nova', 'Компактная клавиатура на красных переключателях с RGB-подсветкой.', 7490.50, 12),
    ('Игровая мышь Vortex', 'Лёгкая мышь, сенсор 16000 DPI, 6 программируемых кнопок.', 2990.00, 0),
    ('Монитор Skyline 27"', 'IPS-монитор 2560x1440, 165 Гц, для игр и работы.', 24990.00, 7);

INSERT INTO reviews (product_id, reviewer_name, rating, comment) VALUES
    (1, 'Иван', 5, 'Отличный звук и удобная посадка.'),
    (1, 'Пётр', 4, 'Хорошие наушники, но чехол хлипкий.'),
    (1, 'Мария', 5, 'Шумоподавление работает на ура.'),
    (2, 'Анна', 5, 'Печатать одно удовольствие.'),
    (2, 'Сергей', 3, 'Подсветка ярковата, переключатели шумные.'),
    (4, 'Дмитрий', 5, 'Картинка сочная, частоты хватает с запасом.');
