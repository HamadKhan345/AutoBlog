# 🤖 AutoBlog - AI-Powered Blogging Platform

<div align="center">

![Python](https://img.shields.io/badge/Python-3.13-blue?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.x-green?logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-Proprietary-red)

**AutoBlog** is an intelligent Django-based blogging platform that leverages AI to automate content creation. Simply provide a topic, and the integrated AI system will research the web, gather information, and automatically generate a well-written, publish-ready blog post.

</div>

---

## 🌟 Key Features

### 🧠 AI-Powered Blog Generation
The core feature of AutoBlog is its **AI content generation system**:
- **Automated Research**: The AI searches the web for relevant, up-to-date information on your topic
- **Source Verification**: Scraped content is processed and verified for accuracy
- **Complete Blog Creation**: Generates title, excerpt, full content, and relevant tags
- **Featured Image Scraping**: Automatically finds and downloads appropriate featured images
- **Configurable Output**: Customize word count and research depth
- **Multiple Research Types**: Choose between different AI research methodologies

### 📝 Full-Featured Blog Management
- **Post Management**: Create, edit, publish, and delete blog posts
- **Rich Text Editing**: CKEditor 5 integration for professional content formatting
- **Categories & Tags**: Organize content with hierarchical categories and tags
- **Draft/Published Status**: Save drafts and publish when ready
- **Trending Posts**: Automatic trending detection based on views and recency

### 👥 User & Role Management
- **Role-Based Access Control**: Admin, Moderator, and Editor roles
- **Author Profiles**: Bio and profile pictures for authors
- **Activity Logging**: Complete audit trail of all user actions
- **Secure Authentication**: Django's built-in authentication system

### 📁 Media Library
- **Centralized Asset Management**: Upload and manage images, documents, videos, and audio
- **Search & Filter**: Find media by name, type, or date
- **Image Metadata**: Automatic resolution detection and file info display

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Python 3.13, Django 5.x |
| **Database** | PostgreSQL 17 |
| **Frontend** | HTML5, CSS3, JavaScript |
| **Rich Editor** | CKEditor 5 |
| **AI Service** | Custom AI Agent (runs on port 8001) |
| **HTTP Client** | httpx (async) |
| **Static Files** | WhiteNoise |
| **WSGI/ASGI** | Gunicorn + Uvicorn Worker |
| **Containerization** | Docker & Docker Compose |
| **Images** | Pillow |

---

## 🧠 AI System Architecture

AutoBlog's AI system is the heart of the platform, designed to create high-quality blog content automatically.

### How It Works

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User Input    │────▶│   AI Service     │────▶│   Blog Created  │
│   - Topic       │     │   (Port 8001)    │     │   - Title       │
│   - Category    │     │                  │     │   - Excerpt     │
│   - Word Count  │     │   • Web Search   │     │   - Content     │
│   - Status      │     │   • Scraping     │     │   - Tags        │
│                 │     │   • AI Writing   │     │   - Image       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### AI Request Payload

The AI service accepts the following parameters:

```json
{
  "topic": "Your blog topic",
  "max_results": 10,
  "word_count": 700,
  "scrape_thumbnail": true,
  "method": "quick|deep"
}
```

### AI Response Structure

```json
{
  "blog_data": {
    "title": "Generated SEO-optimized title",
    "excerpt": "Compelling excerpt for previews",
    "content": "Full HTML-formatted blog content",
    "tags": ["relevant", "topic", "tags"]
  },
  "featured_image": {
    "success": true,
    "image_url": "https://example.com/image.jpg"
  }
}
```

### AI Features
- **Research Types**: Quick research for faster results, deep research for comprehensive coverage
- **Configurable Word Count**: Set target word count (default: 700 words)
- **Auto-Tagging**: AI generates relevant tags based on content
- **Featured Image**: Automatically scrapes and downloads appropriate images
- **Async Processing**: Non-blocking AI requests using httpx async client

---

## 📂 Project Structure

```
AutoBlog/
├── AutoBlog/               # Django project settings
│   ├── settings.py         # Main configuration
│   ├── urls.py             # Root URL configuration
│   └── asgi.py             # ASGI application
│
├── core/                   # Main blog application
│   ├── models.py           # Blog, Category, Tag, Author models
│   ├── views.py            # Public-facing views (home, blog, search)
│   ├── urls.py             # Public URL routes
│   ├── templates/          # Public templates
│   └── static/             # Public static assets
│
├── admin_dashboard/        # Admin interface application
│   ├── views.py            # Dashboard, CRUD, AI generation views
│   ├── urls.py             # Admin URL routes
│   ├── templates/          # Admin templates
│   └── static/             # Admin static assets (CSS, JS)
│
├── media/                  # User uploaded files
├── static/                 # Collected static files
├── templates/              # Base templates
│
├── Dockerfile              # Container build instructions
├── docker-compose.yml      # Multi-container setup
├── requirements.txt        # Python dependencies
├── gunicorn.conf.py        # Gunicorn configuration
├── entrypoint.sh           # Docker entrypoint script
└── env_example             # Environment variables template
```

---

## 🗃️ Database Models

### Author
- Links to Django User model
- Profile picture with validation (JPEG, PNG, WebP, max 5MB)
- Bio field
- Role-based permissions (Admin, Moderator, Editor)

### Category
- Name and description
- Auto-generated slug
- Thumbnail image
- Protected "Uncategorized" default category

### Blog
- Title with auto-generated unique slugs
- Rich HTML content
- Excerpt for previews
- Featured thumbnail with caption
- Status (Draft/Published)
- View counter for analytics
- Many-to-many relationship with Tags
- Foreign key relationships with Author and Category

### Tag
- Unique name
- Auto-generated slug

---

## 🚀 Getting Started

### Prerequisites
- Python 3.13+
- PostgreSQL 17+
- Docker & Docker Compose (optional)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/HamadKhan345/AutoBlog.git
   cd AutoBlog
   ```

2. **Create environment file**
   ```bash
   cp env_example .env
   # Edit .env with your configuration
   ```

3. **Generate a secret key**
   ```python
   python manage.py shell
   >>> from django.core.management.utils import get_random_secret_key
   >>> print(get_random_secret_key())
   ```

### Running with Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Access the application
# Web: http://localhost
```

### Running Locally

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
.\venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic

# Run development server
python manage.py runserver
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | Required |
| `DEBUG` | Debug mode (0/1) | `1` |
| `ALLOWED_HOSTS` | Comma-separated hosts | `localhost,127.0.0.1` |
| `DATABASE_HOST` | PostgreSQL host | `localhost` |
| `DATABASE_PORT` | PostgreSQL port | `5432` |
| `DATABASE_NAME` | Database name | `autoblog` |
| `DATABASE_USER` | Database user | `postgres` |
| `DATABASE_PASSWORD` | Database password | Required |
| `GUNICORN_WORKERS` | Number of workers | `1` |
| `GUNICORN_TIMEOUT` | Request timeout | `120` |

### AI Service Configuration

The AI service runs separately on port `8001`. Ensure it's running before using the "Create Using AI" feature:

```
AI Service URL: http://localhost:8001/generate_blog
```

---

## 📱 Admin Dashboard Features

| Feature | Path | Description |
|---------|------|-------------|
| Dashboard | `/dashboard/` | Analytics and activity overview |
| All Posts | `/dashboard/all_posts/` | View, filter, and manage posts |
| Add/Edit Post | `/dashboard/add_or_edit_post/` | Manual post creation |
| **Create Using AI** | `/dashboard/create_using_ai/` | **AI-powered blog generation** |
| Categories | `/dashboard/categories/` | Manage categories |
| Media Library | `/dashboard/media_library/` | Upload and manage media |
| All Users | `/dashboard/all_users/` | User management |
| Profile | `/dashboard/profile/` | Edit your profile |
| Account Settings | `/dashboard/account_settings/` | Change username/password |

---

## 🔒 Security Features

- CSRF protection on all forms
- Role-based access control
- Password hashing with Django's default hasher
- Image validation (type and size limits)
- SQL injection protection via Django ORM
- XSS protection with template escaping

---

## 🐳 Docker Deployment

The project includes production-ready Docker configuration:

```yaml
services:
  db:     # PostgreSQL 17
  web:    # Django application with Gunicorn/Uvicorn
```

**Production Image**: `ghcr.io/hamadkhan345/autoblog-web:latest`

---

## 📝 Production Notes

- Set `DEBUG=0` in production
- Configure proper `ALLOWED_HOSTS`
- Run `python manage.py collectstatic` when `DEBUG=0`
- WhiteNoise serves static files in production
- Set appropriate `GUNICORN_WORKERS` based on CPU cores

---

## 🤝 Contributing

We welcome feedback, suggestions, and contributions! Please open an issue or pull request if you'd like to help.

---

## 📄 License

This project is proprietary software. All rights reserved.

