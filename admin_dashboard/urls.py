from django.urls import path
from admin_dashboard import views

urlpatterns = [
    # Login / Logout
    path('', views.login, name='login'),
    path('logout/', views.logout, name='logout'),

    # Dashboard
    path('dashboard/', views.dashboard, name='dashboard'),

    
    # View, Delete Posts
    path('dashboard/all_posts/', views.all_posts, name='all_posts'),
    path('posts/delete/', views.delete_post, name='delete_post'),

    # Add, Edit, and Update Posts
    path('dashboard/add_or_edit_post/', views.add_or_edit_post, name='add_or_edit_post'),
    path('dashboard/edit_post/<int:post_id>/', views.add_or_edit_post, name='edit_post'),
    path('posts/add/', views.save_post, name='save_post'),

    # Create using AI
    path('dashboard/craete_using_ai/', views.create_using_ai, name='create_using_ai'),

    

    # Media Library
    path('dashboard/media_library/', views.media_library, name='media_library'),
    path('dashboard/media_library/upload/', views.upload_media, name='upload_media'),
    path('dashboard/media/delete/', views.delete_media, name='delete_media'),
    # List media library items in JSON format
    path('dashboard/media_library/list/', views.media_library_list_json, name='media_library_list_json'),


    # Categories
    path('dashboard/categories/', views.dashboard_categories, name='dashboard_categories'),
    path('dashboard/categories/add_update/', views.add_update_category, name='add_update_category'),
    path('dashboard/categories/delete/', views.delete_category, name='delete_category'),

  
    # Profile
    path('dashboard/profile/', views.profile, name='profile'),
    path('dashboard/profile/update/', views.update_profile, name='update_profile'),

    # Account Settings
    path('dashboard/account_settings/', views.account_settings, name='account_settings'),
    path('dashboard/account_settings/update/' , views.update_account_settings, name='update_account_settings'),


    # Users
    path('dashboard/all_users/', views.all_users, name='all_users'),
    path('dashboard/add_new_user/', views.add_new_user, name='add_new_user'),
    
]