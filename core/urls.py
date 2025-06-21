from django.urls import path
from core import views

urlpatterns = [
    path('', views.home, name='home'),
    path('home/', views.home, name='home'),
    path('contact-us/', views.contact_us, name='contact_us'),
]