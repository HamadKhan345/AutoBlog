from django.urls import path
from core import views

urlpatterns = [
    path('', views.home, name='home'),
    path('home/', views.home, name='home'),
    path('contact-us/', views.contact, name='contact'),
    path('about-us/', views.about, name='about'),
    path('categories/', views.categories, name='categories'),
    path('Tech/', views.tech, name='tech'),
    path('Politics/', views.politics, name='politics'),
    path('Entertainment/', views.entertainment, name='entertainment'),
    path('Finance/', views.finance, name='finance'),
    path('Music/', views.music, name='music'),
    path('Life/', views.life, name='life'),

  #  Temp url
    path('blog/', views.blog, name='blog'),
    path('category/', views.category, name='category'),
    path('blog/', views.blog, name='blog'),
]