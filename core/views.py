from django.shortcuts import render, get_object_or_404
from .models import Category

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
    return render(request, 'core/category_posts.html', context={'category': category})

# Temp Urls
def blog(request):
    return render(request, 'core/blog.html')