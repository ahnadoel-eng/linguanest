# 🌍 LinguaNest

**LinguaNest** — бесплатная платформа для изучения языков с видеозвонками, системой ролей (учитель/ученик) и отслеживанием прогресса обучения.

## ✨ Возможности

- 🎓 **Teacher Dashboard** — создание уроков, управление учениками, видеозвонки
- 📚 **Student Dashboard** — мои уроки, присоединение к звонкам, прогресс обучения
- 📹 **Видеозвонки** — встроенный Jitsi Meet SDK
- 🔐 **Google OAuth 2.0** — авторизация через Google
- 🎨 **Современный UI** — glassmorphism, dark theme, анимации

## 🛠 Технологии

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Vue.js 3 (CDN)
- Jitsi Meet SDK

### Backend
- Node.js + Express
- PostgreSQL
- JWT Authentication
- Google Auth Library

## 🚀 Запуск

### Backend
```bash
cd backend
npm install
# Настройте .env (скопируйте из .env.example)
npm start
```

### Frontend
Откройте `index.html` в браузере или используйте Live Server.

## 📁 Структура проекта

```
LinguaNest/
├── index.html              # Landing page
├── auth.html               # Авторизация
├── dashboard-teacher.html  # Панель учителя
├── dashboard-student.html  # Панель ученика
├── admin.html              # Админ панель
├── css/                    # Стили
├── js/                     # JavaScript
│   ├── api.js              # API клиент
│   ├── auth.js             # Авторизация
│   ├── dashboard-teacher.js
│   └── dashboard-student.js
└── backend/                # Node.js API
    ├── server.js
    ├── db.js
    ├── schema.sql
    ├── routes/
    └── middleware/
```

## 📄 Лицензия

MIT
