from django.shortcuts import render


# Create your views here.
def home(request):
    myval = {'abc':'Hello World'}
    return render(request, 'core/home.html', context=myval)

def contact(request):
    return render(request, 'core/contact.html')

def about(request):
    return render(request, 'core/about.html')

def tech(request):
    return render(request, 'core/category.html')

def politics(request):
    return render(request, 'core/category.html')

def entertainment(request):
    return render(request, 'core/category.html')

def finance(request):
    return render(request, 'core/category.html')

def music(request):
    return render(request, 'core/category.html')

def life(request):
    return render(request, 'core/category.html')

# Temp Urls
def blog(request):
    return render(request, 'core/blog.html')

def category(request):
    return render(request, 'core/category.html')