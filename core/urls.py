from django.urls import path
from core import views

urlpatterns = [
    path('', views.home, name='home'),
    path('home/', views.home, name='home'),
    path('contact-us/', views.contact, name='contact'),
    path('about-us/', views.about, name='about'),
    path('categories/', views.categories, name='categories'),
    path('category/<slug:slug>/', views.category_posts, name='category_posts'),

  #  Temp url
    path('blog/', views.blog, name='blog'),
    path('authors/', views.authors, name='authors'),  
]