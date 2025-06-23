from django.urls import path
from core import views

urlpatterns = [
    path('', views.home, name='home'),
    path('home/', views.home, name='home'),
    path('contact-us/', views.contact, name='contact'),
    path('about-us/', views.about, name='about'),
    path('Tech/', views.tech, name='tech'),  # Category URL
    path('Politics/', views.politics, name='politics'),  # Category URL
    path('Entertainment/', views.entertainment, name='entertainment'),  # Category URL
    path('Finance/', views.finance, name='finance'),  # Category URL
    path('Music/', views.music, name='music'),  # Category URL
    path('Life/', views.life, name='life'),  # Category URL

  #  Temp url
    path('blog/', views.blog, name='blog'),
    path('category/', views.category, name='category'),
]