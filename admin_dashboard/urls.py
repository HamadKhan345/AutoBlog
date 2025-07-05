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
    path('dashboard/categories/', views.dashboard_categories, name='dashboard_categories'),
    

    # Media Library
    path('dashboard/media_library/', views.media_library, name='media_library'),
    path('dashboard/media_library/upload/', views.upload_media, name='upload_media'),
    path('dashboard/media/delete/', views.delete_media, name='delete_media'),
    path('dashboard/media_library/list/', views.media_library_list_json, name='media_library_list_json'),

    # Add new category
    # path('categories/add/', views.add_new_category, name='add_new_category'),

    # Delete post
    path('posts/delete/', views.delete_post, name='delete_post'),

    # Add new post
    path('posts/add/', views.save_post, name='save_post'),


    
    
]