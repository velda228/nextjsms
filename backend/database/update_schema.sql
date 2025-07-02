-- Обновление схемы базы данных для поддержки страниц в главах

-- Добавляем поле pages в таблицу chapters, если его еще нет
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chapters' AND column_name = 'pages'
    ) THEN
        ALTER TABLE chapters ADD COLUMN pages TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Создаем индекс для быстрого поиска глав по манге
CREATE INDEX IF NOT EXISTS idx_chapters_manga_id ON chapters(manga_id);

-- Создаем уникальный индекс для предотвращения дублирования глав
CREATE UNIQUE INDEX IF NOT EXISTS idx_chapters_manga_number ON chapters(manga_id, chapter_number); 