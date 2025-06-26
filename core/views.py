from django.shortcuts import render


# Create your views here.
def home(request):
    return render(request, 'core/home.html')

def contact(request):
    return render(request, 'core/contact.html')

def about(request):
    return render(request, 'core/about.html')

def categories(request):
    return render(request, 'core/categories.html')

# Category Views
def tech(request):
    name = {'category_name': 'Tech'}
    return render(request, 'core/category_posts.html', context=name)

def politics(request):
    name = {'category_name': 'Politics'}
    return render(request, 'core/category_posts.html', context=name)

def entertainment(request):
    name = {'category_name': 'Entertainment'}
    return render(request, 'core/category_posts.html', context=name)

def finance(request):
    name = {'category_name': 'Finance'}
    return render(request, 'core/category_posts.html', context=name)

def music(request):
    name = {'category_name': 'Music'}
    return render(request, 'core/category_posts.html', context=name)

def life(request):
    name = {'category_name': 'Life'}
    return render(request, 'core/category_posts.html', context=name)

# Temp Urls
def blog(request):
    return render(request, 'core/blog.html')

def category(request):
    return render(request, 'core/category.html')