from django.shortcuts import render, get_object_or_404
from .models import Category , Blog
from datetime import timedelta
from django.utils import timezone

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

def category_posts(request, category_slug):
  category = get_object_or_404(Category, slug=category_slug)
  blogs = Blog.objects.filter(category=category, status=Blog.PUBLISHED).order_by('-created_at')
  return render(request, 'core/category_posts.html', context={'category': category, 'blogs': blogs})


# Blog Page

def blog(request, blog_slug):
  blog = get_object_or_404(Blog, slug=blog_slug, status=Blog.PUBLISHED)
  blog.view_count += 1
  blog.save()

  now = timezone.now() 
  one_week_ago = now - timedelta(days=30)
  popular = Blog.objects.filter(created_at__gte=one_week_ago, status=Blog.PUBLISHED).order_by('-view_count')[:3]
  
  return render(request, 'core/blog.html', context={'blog': blog, 'popular': popular}) 

# Temp Urls

def authors(request):
  return render(request, 'core/authors.html')