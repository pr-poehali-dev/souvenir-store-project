-- Удаляем битые ссылки на изображения
UPDATE products 
SET image_url = NULL 
WHERE image_url LIKE '%10.13.43%';