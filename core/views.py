from django.shortcuts import render, get_object_or_404
from .models import Category , Blog, Author
from datetime import timedelta
from django.utils import timezone
from django.http import JsonResponse
from django.core.paginator import Paginator
from django.db.models import Q

# Create your views here.
def home(request):
  blogs = {}
  categories = Category.objects.all()
  for category in categories:
    blogs[category.name] = Blog.objects.filter(category=category, status=Blog.PUBLISHED).order_by('-created_at')[:5]

  # Trending
  now = timezone.now() 
  one_week_ago = now - timedelta(days=2)
  trending_blogs = Blog.objects.filter(created_at__gte=one_week_ago, status=Blog.PUBLISHED).order_by('-view_count')[:5]

  blogs['Trending'] = trending_blogs

  return render(request, 'core/home.html', context={ 'blogs' : blogs })

def contact(request):
  return render(request, 'core/contact.html')

def about(request):
  return render(request, 'core/about.html')


# Categories Page
def categories(request):

  return render(request, 'core/categories.html')

# Category Posts Page
def category_posts(request, category_slug):
  category = get_object_or_404(Category, slug=category_slug)
  return render(request, 'core/category_posts.html', context={'category': category})

# Load More Blogs via AJAX
def category_posts_api(request, category_slug):
    page = int(request.GET.get('page', 1))
    per_page = 6  # Number of posts per page

    category = get_object_or_404(Category, slug=category_slug)
    blogs = Blog.objects.filter(category=category, status=Blog.PUBLISHED).order_by('-created_at')
    paginator = Paginator(blogs, per_page)
    page_obj = paginator.get_page(page)

    posts_data = []
    for blog in page_obj:
        posts_data.append({
            'title': blog.title,
            'excerpt': (blog.excerpt or '')[:150] + '...',
            'thumbnail': blog.thumbnail.url,
            'url': blog.get_absolute_url(),
            'author': str(blog.author),
            'time_since': blog.created_at.strftime('%b %d, %Y'),
            'category_name': category.name
        })

    return JsonResponse({
        'posts': posts_data,
        'has_more': page_obj.has_next()
    })

# Blog Page

def blog(request, blog_slug):
  blog = get_object_or_404(Blog, slug=blog_slug, status=Blog.PUBLISHED)
  blog.view_count += 1
  blog.save()

  now = timezone.now() 
  one_week_ago = now - timedelta(days=30)
  popular = Blog.objects.filter(created_at__gte=one_week_ago, status=Blog.PUBLISHED).order_by('-view_count')[:3]
  
  return render(request, 'core/blog.html', context={'blog': blog, 'popular': popular}) 

# Search Page

def search(request):
  query = request.GET.get('q', '').strip()
  results = Blog.objects.none()
  if query:
    results = Blog.objects.filter(
        Q(title__icontains=query) |
        Q(content__icontains=query) |
        Q(excerpt__icontains=query),
        status=Blog.PUBLISHED
    ).distinct().order_by('-created_at')

  paginator = Paginator(results, 10)
  page_obj = paginator.get_page(request.GET.get('page'))

  return render(request, 'core/search.html', {
      'query': query,
      'page_obj': page_obj,
  })

# Authors Page

def authors(request):
  authors = Author.objects.all()
  return render(request, 'core/authors.html', context={'authors': authors})

