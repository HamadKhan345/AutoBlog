from django.urls import path
from admin_dashboard import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('all_posts/', views.all_posts, name='all_posts'),
    path('add_new_post/', views.add_new_post, name='add_new_post'),


    #Temp Links
    path('base/', views.base, name='base'),
    path('login/', views.login, name='login'),
]