-- Создание таблицы для новостей
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT true
);

-- Добавление индекса для быстрого поиска опубликованных новостей
CREATE INDEX idx_news_published ON news(is_published, created_at DESC);

-- Вставка примера новости
INSERT INTO news (title, content, image_url) VALUES 
('Открытие новой коллекции', 'Рады представить новую коллекцию изделий из капа и сувеля. Уникальные узоры и формы, созданные самой природой.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80');