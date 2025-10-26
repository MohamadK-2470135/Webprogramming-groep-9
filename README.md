# SeMoRecepts - Recipe Pinterest Web Application

A Pinterest-like web application for managing personal recipe collections. Built with Node.js, Express, and SQLite.

## 📋 Project Overview

This is a university project (80% of grade) for the Web Programming course 2025-2026. The application allows users to:

- Register and login with secure authentication
- Create, read, update, and delete recipes
- Search and filter recipes by category
- Store recipes with ingredients, steps, images, and notes
- View recipes in a Pinterest-style masonry grid layout

## 🏗️ Architecture

### Backend (Node.js + Express)
- **MVC Pattern**: Models, Controllers, Routes separation
- **Database**: SQLite with better-sqlite3
- **Authentication**: bcrypt password hashing + express-session
- **Validation**: express-validator for input sanitization
- **API**: RESTful endpoints

### Frontend
- **Templating**: EJS for server-side rendering
- **Styling**: Custom CSS (no Bootstrap)
- **JavaScript**: Vanilla JS with Fetch API
- **Layout**: Responsive masonry grid

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

#### Recipes Table
```sql
CREATE TABLE recipes (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  time TEXT,
  servings INTEGER DEFAULT 2,
  category TEXT,
  source_url TEXT,
  image_url TEXT,
  image_path TEXT,
  ingredients TEXT NOT NULL,  -- JSON array
  steps TEXT NOT NULL,         -- JSON array
  notes TEXT,
  is_scraped INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Docker (optional, for containerized deployment)

### Installation

1. **Clone the repository**
```bash
cd /workspace/project
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the application**
```bash
npm start
```

The server will start on http://localhost:8080

### Development Mode
```bash
npm run dev
```
This uses Node's `--watch` flag to automatically restart on file changes.

## 🐳 Docker Deployment

### Build and run with Docker Compose
```bash
docker-compose up --build
```

The application will be available at http://localhost:8080

### Stop the application
```bash
docker-compose down
```

### Stop and remove data (delete database)
```bash
docker-compose down -v
```

### Docker Volume
The database is stored in a Docker volume named `recipe-data`, which persists data even when the container is removed. The volume is mounted at `/website/data` inside the container.

## 📁 Project Structure

```
/workspace/project/
├── app.js                      # Main Express application
├── db.js                       # Database initialization
├── package.json                # Dependencies and scripts
├── docker-compose.yml          # Docker configuration
├── Dockerfile                  # Docker image definition
│
├── controllers/                # Business logic
│   ├── authController.js       # Login, register, logout
│   └── recipeController.js     # Recipe CRUD operations
│
├── middleware/                 # Custom middleware
│   └── auth.js                 # Authentication middleware
│
├── models/                     # Database models
│   ├── User.js                 # User CRUD operations
│   └── Recipe.js               # Recipe CRUD operations
│
├── routes/                     # Route definitions
│   ├── auth.js                 # Auth routes: /api/auth/*
│   └── recipes.js              # Recipe routes: /api/recipes/*
│
├── views/                      # EJS templates
│   ├── auth.ejs                # Login/register page
│   └── recipes.ejs             # Recipe dashboard
│
├── public/                     # Static files
│   ├── css/
│   │   └── style.css           # Custom CSS styling
│   ├── js/
│   │   ├── auth.js             # Client-side auth logic
│   │   └── recipes.js          # Client-side recipe logic
│   └── uploads/                # User-uploaded images
│
└── data/                       # Database storage (gitignored)
    └── database.db             # SQLite database file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login existing user
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/me` - Get current user info

### Recipes (all require authentication)
- `GET /api/recipes` - Get all recipes for current user
- `GET /api/recipes/:id` - Get single recipe by ID
- `POST /api/recipes` - Create new recipe
- `PUT /api/recipes/:id` - Update existing recipe
- `DELETE /api/recipes/:id` - Delete recipe
- `GET /api/recipes/search?q=query` - Search recipes

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: Server-side sessions with httpOnly cookies
- **Input Validation**: express-validator for all user inputs
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: Input sanitization and escaping
- **CSRF Protection**: (to be implemented)

## 📊 Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **better-sqlite3** - SQLite database
- **bcrypt** - Password hashing
- **express-session** - Session management
- **express-validator** - Input validation
- **EJS** - Templating engine

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styling (no Bootstrap)
- **JavaScript (ES6+)** - Client-side logic
- **Fetch API** - HTTP requests

## 🎯 Project Requirements Met

### Core Functionality
- ✅ User authentication (register, login, logout)
- ✅ Recipe CRUD operations
- ✅ Responsive design
- ✅ Database integration with proper schema
- ✅ RESTful API architecture
- ✅ Server-side session management

### JavaScript Requirements
- ✅ DOM manipulation
- ✅ Event handling
- ✅ Fetch API for AJAX requests
- ✅ Async/await for asynchronous operations
- ✅ ES6+ features (arrow functions, template literals, destructuring)
- ✅ JSON data handling
- ✅ Form validation

### Backend Requirements
- ✅ Node.js + Express server
- ✅ Database CRUD operations
- ✅ RESTful API endpoints
- ✅ Authentication and authorization
- ✅ Input validation and sanitization
- ✅ Security measures (password hashing, parameterized queries)

### Browser APIs (3 required)
- ✅ **Fetch API** (mandatory) - All HTTP requests
- ⏳ **localStorage** - To be implemented for preferences
- ⏳ **Clipboard API** - To be implemented for sharing

### External API (1 required)
- ⏳ **LLM API** - To be implemented for recipe scraping from URLs

### Additional Features (2 custom extensions required)
- ⏳ To be implemented in later phase

## 🔄 Development Phases

### Phase 1: ✅ Backend Foundation (COMPLETED)
- [x] Database schema design
- [x] User authentication system
- [x] Recipe CRUD operations
- [x] API endpoints
- [x] Session management

### Phase 2: ✅ Frontend Integration (COMPLETED)
- [x] EJS templates
- [x] Client-side JavaScript
- [x] Fetch API integration
- [x] Form handling
- [x] Responsive design

### Phase 3: ⏳ Advanced Features (TODO)
- [ ] LLM API integration for URL scraping
- [ ] File upload for recipe images
- [ ] localStorage for user preferences
- [ ] Clipboard API for sharing
- [ ] Print/PDF export
- [ ] Two custom functional extensions

## 🐛 Known Issues

- URL scraping is not yet implemented (placeholder modal exists)
- Image upload is not yet implemented (only URL input)
- Edit recipe functionality is not yet implemented
- No CSRF protection yet

## 📝 Notes

- The database file is stored in `./data/database.db`
- Sessions are stored in memory (will be lost on server restart)
- In production, use environment variables for SESSION_SECRET
- The application uses Dutch language for UI (as per project requirements)

## 👥 Authors

University Web Programming Project 2025-2026

## 📄 License

This is a university project for educational purposes.