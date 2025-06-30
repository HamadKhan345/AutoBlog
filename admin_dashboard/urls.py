from django.urls import path
from admin_dashboard import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),



    #Temp Links
    path('base/', views.base, name='base'),
    path('login/', views.login, name='login'),
]