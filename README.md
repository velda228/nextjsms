# 📚 MangaReader - Платформа для чтения манги

Современная веб-платформа для чтения манги с собственным REST API для мобильных приложений.

## ✨ Возможности

- 📖 **Удобный ридер манги** с навигацией по страницам
- 🔍 **Поиск и фильтрация** по названию, жанрам, статусу
- 📱 **REST API** для мобильных приложений
- 👤 **Система пользователей** с избранным и историей
- 🛠 **Админ-панель** для управления контентом
- 🎨 **Современный UI** с адаптивным дизайном

## 🏗 Архитектура

```
manga-reader/
├── frontend/          # Next.js приложение
├── backend/           # Express API сервер
├── database/          # SQL скрипты и миграции
└── uploads/           # Загруженные изображения
```

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
npm run install:all
```

### 2. Настройка базы данных
```bash
npm run setup:db
```

### 3. Запуск в режиме разработки
```bash
npm run dev
```

Приложение будет доступно:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📱 API Endpoints

### Манга
- `GET /api/manga` - список всей манги
- `GET /api/manga/:id` - информация о манге
- `POST /api/manga` - добавление новой манги
- `PUT /api/manga/:id` - обновление манги
- `DELETE /api/manga/:id` - удаление манги

### Главы
- `GET /api/manga/:id/chapters` - главы манги
- `GET /api/chapters/:id` - информация о главе
- `POST /api/chapters` - добавление главы
- `PUT /api/chapters/:id` - обновление главы

### Пользователи
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход
- `GET /api/users/favorites` - избранное
- `POST /api/users/favorites` - добавить в избранное

## 🛠 Технологии

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **База данных**: PostgreSQL
- **Аутентификация**: JWT
- **Файлы**: Multer для загрузки изображений

## 📝 Лицензия

MIT License 