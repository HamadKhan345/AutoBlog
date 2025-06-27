from django.shortcuts import render, get_object_or_404
from .models import Category , Blog
from datetime import datetime, timedelta

# Create your views here.
def home(request):
  tech = Blog.objects.filter(category__name='Tech', status=Blog.PUBLISHED).order_by('-created_at')[:5]
  politics = Blog.objects.filter(category__name='Politics', status=Blog.PUBLISHED).order_by('-created_at')[:5]
  entertainment = Blog.objects.filter(category__name='Entertainment', status=Blog.PUBLISHED).order_by('-created_at')[:5]
  finance = Blog.objects.filter(category__name='Finance', status=Blog.PUBLISHED).order_by('-created_at')[:5]
  music = Blog.objects.filter(category__name='Music', status=Blog.PUBLISHED).order_by('-created_at')[:5]
  life = Blog.objects.filter(category__name='Life', status=Blog.PUBLISHED).order_by('-created_at')[:5]

  # Trending
  now = datetime.now()
  one_week_ago = now - timedelta(days=2)
  trending_blogs = Blog.objects.filter(created_at__gte=one_week_ago, status=Blog.PUBLISHED).order_by('-view_count')[:5]

  blogs = {'Trending': trending_blogs, 'Tech': tech, 'Politics': politics, 'Entertainment': entertainment, 'Finance': finance, 'Music': music, 'Life': life} 
  return render(request, 'core/home.html', context={ 'blogs' : blogs })

def contact(request):
  return render(request, 'core/contact.html')

def about(request):
  return render(request, 'core/about.html')


# Categories Page
def categories(request):

  return render(request, 'core/categories.html')

def category_posts(request, slug):
  category = get_object_or_404(Category, slug=slug)
  blogs = Blog.objects.filter(category=category, status=Blog.PUBLISHED).order_by('-created_at')
  return render(request, 'core/category_posts.html', context={'category': category, 'blogs': blogs})

# Temp Urls
def blog(request):
  return render(request, 'core/blog.html')

def authors(request):
  return render(request, 'core/authors.html')