from django.urls import path
from core import views

urlpatterns = [
    path('', views.home, name='home'),
    path('home/', views.home, name='home'),
    path('contact-us/', views.contact, name='contact'),
    path('about-us/', views.about, name='about'),
    path('categories/', views.categories, name='categories'),
    path('category/<slug:category_slug>/', views.category_posts, name='category_posts'),
    path('blog/<slug:blog_slug>/', views.blog, name='blog'),
  #  Temp url
    path('blog/', views.blog, name='blog'),
    path('authors/', views.authors, name='authors'),  
]