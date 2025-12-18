-- Создание таблицы для видео
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    video_url VARCHAR(1000) NOT NULL,
    thumbnail_url VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT true
);

-- Добавление индекса для быстрого поиска опубликованных видео
CREATE INDEX idx_videos_published ON videos(is_published, created_at DESC);

-- Вставка примера видео
INSERT INTO videos (title, description, video_url, thumbnail_url) VALUES 
('Процесс создания вазы из капа', 'Смотрите, как рождается уникальное изделие из природного материала', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1611224885990-ab7363d1f2a9?w=800&q=80');