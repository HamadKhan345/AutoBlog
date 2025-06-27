from django.shortcuts import render, get_object_or_404
from .models import Category , Blog

# Create your views here.
def home(request):
    return render(request, 'core/home.html')

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