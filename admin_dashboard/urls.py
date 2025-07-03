from django.urls import path
from admin_dashboard import views

urlpatterns = [
    # Login / Logout
    path('', views.login, name='login'),
    path('logout/', views.logout, name='logout'),

    # Dashboard
    path('dashboard/', views.dashboard, name='dashboard'),
    path('dashboard/all_posts/', views.all_posts, name='all_posts'),
    path('dashboard/add_new_post/', views.add_new_post, name='add_new_post'),
    
    
]