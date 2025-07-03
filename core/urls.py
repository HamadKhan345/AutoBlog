from django.urls import path
from core import views

urlpatterns = [
    path('', views.home, name='home'),
    path('home/', views.home, name='home'),
    path('contact-us/', views.contact, name='contact'),
    path('about-us/', views.about, name='about'),
    path('categories/', views.categories, name='categories'),
    path('category/<slug:category_slug>/', views.category_posts, name='category_posts'),
    path('api/category/<slug:category_slug>/posts/', views.category_posts_api, name='category_posts_api'), 
    path('blog/<slug:blog_slug>/', views.blog, name='blog'),
    path('authors/', views.authors, name='authors'),
    path('search/', views.search, name='search'),
    
  #  Temp url
    path('blog/', views.blog, name='blog'),
]