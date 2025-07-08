from django.shortcuts import render, redirect, get_object_or_404
from core.models import Blog
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth import logout as auth_logout
from django.contrib import messages
from django.views.decorators.http import require_POST
from core.models import Blog, Category, Tag, Author
import json
from django.http import JsonResponse
from django.core.files.storage import default_storage
import os
from PIL import Image
from datetime import datetime, timedelta
import traceback
from django.utils.text import slugify

# Create your views here.

# Login
def login(request):
  if request.user.is_authenticated:
    user = request.user
    return redirect('dashboard') # Already Logged In
  
    
  
  message = None
  if request.method == "POST":
    username = request.POST.get('username')
    password = request.POST.get('password')
    
    user = authenticate(request, username=username, password=password)
    if user is not None:
      auth_login(request, user)
      return redirect('dashboard') # Redirect to Dashboard
    else:
      messages.error(request, 'Invalid username or password.')
      
  return render(request, 'admin_dashboard/login.html')
  
# Logout
def logout(request):
  if request.user.is_authenticated:
    auth_logout(request)  # Log out the user
  return redirect('login')

# Dashboard

@login_required
def dashboard(request):
  return render(request, 'admin_dashboard/admin_base.html')

# All Posts
@login_required
def all_posts(request):
  blogs = Blog.objects.all().order_by('-created_at')
  
  search_query = request.GET.get('search', '')  # Get the search query from the query parameters
  status_filter = request.GET.get('status', '')  # Get the status filter from the query parameters
  category_filter = request.GET.get('category', '')  # Get the category filter from the query parameters
  
  if search_query:
    blogs = blogs.filter(title__icontains=search_query)  # Filter posts by title containing the search query
  
  if status_filter:
    blogs = blogs.filter(status=status_filter)  # Filter posts by status
  
  if category_filter:
    if category_filter == "None":
      blogs = blogs.filter(category__isnull=True)  # Filter posts with no category
    else:
      blogs = blogs.filter(category__name=category_filter)  # Filter posts by category name


  page = request.GET.get('page', 1)  # Get the page number from the query parameters, default to 1

  paginator = Paginator(blogs, 10)  # Show 10 posts per page

  try:
    blogs_page = paginator.page(page)  # Get the posts for the requested page
  except PageNotAnInteger:
    blogs_page = paginator.page(1)
  except EmptyPage:
    blogs_page = paginator.page(paginator.num_pages)

  context = {
    'blogs': blogs_page,
    'search_query': search_query,
    'status_filter': status_filter,
    'category_filter': category_filter,
  }
  

  return render(request, 'admin_dashboard/all_posts.html', context=context)

# Delete Post
@login_required
@require_POST
def delete_post(request):
    # Bulk delete
    bulk_ids = request.POST.get('bulk_delete_ids')
    if bulk_ids:
        ids = [int(i) for i in bulk_ids.split(',') if i.isdigit()]
        for blog in Blog.objects.filter(id__in=ids):
            blog.delete()  # This will call your custom delete method
        return redirect('all_posts')
    # Single delete
    post_id = request.POST.get('delete_post')
    if post_id:
        try:
            blog = Blog.objects.get(id=post_id)
            blog.delete()
        except Blog.DoesNotExist:
            pass
    return redirect('all_posts')

# Add New Post
@login_required
def add_or_edit_post(request, post_id=None):
    blog = None
    selected_tags = []
    if post_id:
        blog = get_object_or_404(Blog, id=post_id)
        selected_tags = list(blog.tags.values_list('name', flat=True))  # or adjust for your tag model
    context = {
        'blog': blog,
        'selected_tags': selected_tags,
    }
    return render(request, 'admin_dashboard/add_or_edit_post.html', context)

# Save New or Edited Post
@login_required
def save_post(request):
    if request.method == 'POST':
        post_id = request.POST.get('post_id')
        title = request.POST.get('title')
        excerpt = request.POST.get('excerpt')
        content = request.POST.get('content')
        status = request.POST.get('status')
        category_id = request.POST.get('category')
        thumbnail = request.FILES.get('thumbnail')
        thumbnail_caption = request.POST.get('thumbnail_caption')
        tags_json = request.POST.get('tags', '[]')

        category = None
        if category_id:
            try:
                category = Category.objects.get(id=category_id)
            except Category.DoesNotExist:
                category = None

        blog = None
        if post_id:
            try:
                blog = Blog.objects.get(id=post_id)
            except Blog.DoesNotExist:
                blog = None

        if blog:
            # Update existing post
            blog.title = title
            blog.excerpt = excerpt
            blog.content = content
            blog.status = status
            blog.category = category
            if thumbnail:
                blog.thumbnail = thumbnail
            # If no thumbnail uploaded, keep existing (default or previous)
            blog.thumbnail_caption = thumbnail_caption
            blog.save()
        else:
            # Create new post
            author = request.user.author if hasattr(request.user, 'author') else None
            blog_data = {
                'title': title,
                'excerpt': excerpt,
                'content': content,
                'status': status,
                'category': category,
                'thumbnail_caption': thumbnail_caption,
                'author': author
            }
            if thumbnail:
                blog_data['thumbnail'] = thumbnail
            blog = Blog.objects.create(**blog_data)

        # Handle tags (assuming tags_json is a JSON array of tag names)
        tag_names = json.loads(tags_json)
        tags = []
        for tag_name in tag_names:
            tag_slug = slugify(tag_name)
            tag, _ = Tag.objects.get_or_create(
                slug=tag_slug,
                defaults={'name': tag_name}
            )
            tags.append(tag)
        blog.tags.set(tags)
        blog.save()

        return redirect('all_posts')

# Categories
@login_required
def dashboard_categories(request):
   return render(request, 'admin_dashboard/categories.html',)


# Save New or Edited Category
@login_required
def add_update_category(request):
    import traceback
    if request.method == 'POST':
        try:
            category_id = request.POST.get('category_id')
            name = request.POST.get('name', '').strip()
            description = request.POST.get('description', '').strip()
            thumbnail = request.FILES.get('thumbnail')

            # Validation
            if not name:
                return JsonResponse({'success': 0, 'error': 'Category name is required.'})
            if len(name) > 20:
                return JsonResponse({'success': 0, 'error': 'Category name cannot exceed 20 characters.'})
            if not description:
                return JsonResponse({'success': 0, 'error': 'Category description is required.'})

            # If updating, fetch the category
            if category_id:
                try:
                    category = Category.objects.get(id=category_id)
                except Category.DoesNotExist:
                    return JsonResponse({'success': 0, 'error': 'Category not found.'})

                # Check for duplicate name (exclude self)
                if Category.objects.filter(name__iexact=name).exclude(id=category_id).exists():
                    return JsonResponse({'success': 0, 'error': 'Another category with this name already exists.'})

                category.name = name
                category.description = description
                if thumbnail:
                    if thumbnail.size > 5 * 1024 * 1024:
                        return JsonResponse({'success': 0, 'error': 'Thumbnail size exceeds 5MB.'})
                    category.thumbnail = thumbnail
                category.save()
                return JsonResponse({
                    'success': 1,
                    'message': 'Category updated successfully.',
                    'category': {
                        'id': category.id,
                        'name': category.name,
                        'description': category.description,
                        'thumbnail_url': category.thumbnail.url,
                        'slug': category.slug,
                        'get_absolute_url': category.get_absolute_url(),
                    }
                })
            else:
                # Create new category
                if Category.objects.filter(name__iexact=name).exists():
                    return JsonResponse({'success': 0, 'error': 'Category with this name already exists.'})
                if thumbnail and thumbnail.size > 5 * 1024 * 1024:
                    return JsonResponse({'success': 0, 'error': 'Thumbnail size exceeds 5MB.'})
                category = Category.objects.create(
                    name=name,
                    description=description,
                    thumbnail=thumbnail
                )
                return JsonResponse({
                    'success': 1,
                    'message': 'Category created successfully.',
                    'category': {
                        'id': category.id,
                        'name': category.name,
                        'description': category.description,
                        'thumbnail_url': category.thumbnail.url,
                        'slug': category.slug,
                        'get_absolute_url': category.get_absolute_url(),
                    }
                })
        except Exception as e:
            print('Error in add_update_category:', e)
            traceback.print_exc()
            return JsonResponse({'success': 0, 'error': f'Server error: {str(e)}'})
    return JsonResponse({'success': 0, 'error': 'Invalid request method.'})

# Delete Category
@login_required
@require_POST
def delete_category(request):
    try:
        category_id = request.POST.get('category_id')
        if not category_id:
            return JsonResponse({'success': 0, 'error': 'No category specified.'})
        try:
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return JsonResponse({'success': 0, 'error': 'Category not found.'})

        category.delete()
        return JsonResponse({'success': 1, 'message': 'Category deleted.'})
    except Exception as e:
        traceback.print_exc()
        return JsonResponse({'success': 0, 'error': f'Server error: {str(e)}'})

# Media Library
@login_required
def media_library(request):
    
    search_query = request.GET.get('search', '')
    type_filter = request.GET.get('type', '')
    date_filter = request.GET.get('date', '')
    page = request.GET.get('page', 1)

    media_files = []

    try:
        # Get list of files in the uploads directory
        upload_dirs = default_storage.listdir('uploads')[1]
        now = datetime.now()
        for file_name in upload_dirs:
            file_path = f'uploads/{file_name}'
            file_url = default_storage.url(file_path)
            file_extension = os.path.splitext(file_name)[1].lower()

            # Determine file type
            if file_extension in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']:
                file_type = 'image'
            elif file_extension in ['.pdf', '.doc', '.docx', '.txt', '.rtf']:
                file_type = 'document'
            elif file_extension in ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv']:
                file_type = 'video'
            elif file_extension in ['.mp3', '.wav', '.ogg', '.m4a', '.aac']:
                file_type = 'audio'
            else:
                file_type = 'other'

            # Get file size
            try:
                file_size = default_storage.size(file_path)
            except Exception:
                file_size = 0
            # Get file modification time
            try:
                file_modified_time = default_storage.get_modified_time(file_path)
            except Exception:
                file_modified_time = None
            # Format file size for display
            if file_size > 1024 * 1024:
                file_size_display = f"{file_size / (1024 * 1024):.2f} MB"
            elif file_size > 1024:
                file_size_display = f"{file_size / 1024:.2f} KB"
            else:
                file_size_display = f"{file_size} bytes"
            # Get image resolution if image
            resolution = ""
            if file_type == 'image':
                try:
                    with default_storage.open(file_path, 'rb') as f:
                        img = Image.open(f)
                        resolution = f"{img.width}x{img.height}"
                except Exception:
                    resolution = ""
            # Create file info dictionary
            file_info = {
                'name': file_name,
                'path': file_path,
                'url': file_url,
                'size': file_size,
                'size_display': file_size_display,
                'type': file_type,
                'extension': file_extension,
                'modified_time': file_modified_time,
                'resolution': resolution,
            }
            media_files.append(file_info)
        # Apply search filter
        if search_query:
            media_files = [file_info for file_info in media_files if search_query.lower() in file_info['name'].lower()]
        # Apply type filter
        if type_filter:
            media_files = [file_info for file_info in media_files if file_info['type'] == type_filter]
        # Apply date filter
        if date_filter:
            def in_date_range(file_time, filter_type):
                if not file_time:
                    return False
                if filter_type == 'today':
                    return file_time.date() == now.date()
                elif filter_type == 'week':
                    start_of_week = now - timedelta(days=now.weekday())
                    return file_time.date() >= start_of_week.date()
                elif filter_type == 'month':
                    return file_time.year == now.year and file_time.month == now.month
                elif filter_type == 'year':
                    return file_time.year == now.year
                return True
            media_files = [file_info for file_info in media_files if in_date_range(file_info['modified_time'], date_filter)]
        # Sort files by modification time (newest first)
        media_files.sort(key=lambda x: x['modified_time'] if x['modified_time'] else '', reverse=True)
        # PAGINATION: 20 files per page
        paginator = Paginator(media_files, 20)
        try:
            media_files_page = paginator.page(page)
        except PageNotAnInteger:
            media_files_page = paginator.page(1)
        except EmptyPage:
            media_files_page = paginator.page(paginator.num_pages)
    except Exception as e:
        print(f"Error loading media files: {e}")
        media_files_page = []
        paginator = None
    context = {
        'media_files': media_files_page,
        'search_query': search_query,
        'type_filter': type_filter,
        'date_filter': date_filter,
        'total_files': paginator.count if paginator else 0,
        'page_obj': media_files_page,
        'paginator': paginator,
    }
    return render(request, 'admin_dashboard/media_library.html', context)

# Upload Media (add login_required and robust error handling)
@login_required
def upload_media(request):
    if request.method == 'POST':
        media_file = request.FILES.get('media_file')
        if not media_file:
            return JsonResponse({'success': 0, 'error': 'No file provided.'})
        # 5MB limit
        if media_file.size > 5 * 1024 * 1024:
            return JsonResponse({'success': 0, 'error': 'File size exceeds 5MB.'})
        try:
            path = default_storage.save(f'uploads/{media_file.name}', media_file)
            file_url = default_storage.url(path)
            return JsonResponse({'success': 1, 'file': {'url': file_url}})
        except Exception as e:
            return JsonResponse({'success': 0, 'error': str(e)})
    return JsonResponse({'success': 0, 'error': 'Invalid request method.'})

# Delete Media
@require_POST
@login_required
def delete_media(request):
    """
    Delete one or more media files from the uploads directory.
    Accepts a POST parameter 'files' which is a JSON array of file names to delete.
    """
    try:
        files = request.POST.get('files')
        if not files:
            return JsonResponse({'success': 0, 'error': 'No files specified.'})
        file_list = json.loads(files) if isinstance(files, str) else files
        deleted = []
        errors = []
        for file_name in file_list:
            file_path = f'uploads/{file_name}'
            try:
                if default_storage.exists(file_path):
                    default_storage.delete(file_path)
                    deleted.append(file_name)
                else:
                    errors.append(f"{file_name} not found.")
            except Exception as e:
                errors.append(f"{file_name}: {str(e)}")
        return JsonResponse({
            'success': 1 if not errors else 0,
            'deleted': deleted,
            'errors': errors
        })
    except Exception as e:
        return JsonResponse({'success': 0, 'error': str(e)})
    
# Media Library List JSON For Quill etc.
@login_required
def media_library_list_json(request):
    """
    Returns a paginated JSON list of image files in media/uploads/ for the media library modal.

    """
    try:
        search_query = request.GET.get('search', '').strip().lower()
        page = int(request.GET.get('page', 1))
        files = default_storage.listdir('uploads')[1]
        image_files = []
        for file_name in files:
            file_extension = os.path.splitext(file_name)[1].lower()
            if file_extension in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']:
                if search_query and search_query not in file_name.lower():
                    continue
                file_path = f'uploads/{file_name}'
                file_url = default_storage.url(file_path)
                image_files.append({
                    'name': file_name,
                    'url': file_url,
                    'type': 'image',
                    'extension': file_extension
                })
        # Sort by name (or by date if you prefer)
        image_files.sort(key=lambda x: x['name'])
        # Pagination
        paginator = Paginator(image_files, 20)
        try:
            images_page = paginator.page(page)
        except (PageNotAnInteger, EmptyPage):
            images_page = paginator.page(1)
        return JsonResponse({
            'files': list(images_page),
            'page': images_page.number,
            'num_pages': paginator.num_pages,
            'total': paginator.count,
        })
    except Exception as e:
        return JsonResponse({'files': [], 'error': str(e)}, status=500)

# Profile
@login_required
def profile(request):
    # Total views calculation
    total_views = 0
    if hasattr(request.user, 'author'):
        total_views = sum(blog.view_count for blog in request.user.author.blogs.all())
    return render(request, 'admin_dashboard/profile.html', {'total_views': total_views})


# Update Profile
@login_required
@require_POST
def update_profile(request):
    try:
        user = request.user

        # Require current password for any update
        current_password = request.POST.get('current_password', '').strip()
        if not current_password:
            messages.error(request, 'Current password is required to update your profile.')
            return redirect('profile')
        if not user.check_password(current_password):
            messages.error(request, 'Current password is incorrect.')
            return redirect('profile')

        # Update User fields
        user.first_name = request.POST.get('first_name', '').strip()
        user.last_name = request.POST.get('last_name', '').strip()
        # user.email = request.POST.get('email', '').strip()

        # Validation
        if not user.first_name:
            messages.error(request, 'First name is required.')
            return redirect('profile')
        if not user.last_name:
            messages.error(request, 'Last name is required.')
            return redirect('profile')
        # if not user.email:
        #     messages.error(request, 'Email is required.')
        #     return redirect('profile')

        # Update Author fields if exists, create if doesn't exist
        author = getattr(user, 'author', None)
        if not author:
            author = Author.objects.create(user=user)

        # Update bio
        author.bio = request.POST.get('bio', '').strip()

        # Handle profile picture upload
        profile_picture = request.FILES.get('profile_picture')
        if profile_picture:
            # Validate file size (5MB limit)
            if profile_picture.size > 5 * 1024 * 1024:
                messages.error(request, 'Profile picture size exceeds 5MB.')
                return redirect('profile')

            # Validate file type
            valid_extensions = ['.jpg', '.jpeg', '.png', '.webp']
            file_extension = os.path.splitext(profile_picture.name)[1].lower()
            if file_extension not in valid_extensions:
                messages.error(request, 'Invalid image type. Only JPEG, PNG, and WebP are allowed.')
                return redirect('profile')

            author.profile_picture = profile_picture

        # Save changes
        author.save()
        user.save()

        messages.success(request, 'Profile updated successfully.')
        return redirect('profile')

    except Exception as e:
        traceback.print_exc()
        messages.error(request, f'Server error: {str(e)}')
        return redirect('profile')
        
    
# Account Settings
@login_required
def account_settings(request):
    """
    Render the account settings page.
    """
    return render(request, 'admin_dashboard/account_settings.html')

# ...existing code...

@login_required
@require_POST
def update_account_settings(request):
    user = request.user

    # Change Username
    if 'new_username' in request.POST:
        new_username = request.POST.get('new_username', '').strip()
        current_password = request.POST.get('current_password', '').strip()

        # Validation
        if not new_username or len(new_username) < 3 or len(new_username) > 30:
            messages.error(request, 'Username must be 3-30 characters long.')
            return redirect('account_settings')
        if not current_password or not user.check_password(current_password):
            messages.error(request, 'Current password is incorrect.')
            return redirect('account_settings')
        if new_username != user.username and \
           user.__class__.objects.filter(username__iexact=new_username).exists():
            messages.error(request, 'This username is already taken.')
            return redirect('account_settings')

        user.username = new_username
        user.save()
        messages.success(request, 'Username updated successfully.')
        return redirect('account_settings')

    # Change Password
    elif 'new_password' in request.POST:
        current_password = request.POST.get('current_password', '').strip()
        new_password = request.POST.get('new_password', '').strip()
        confirm_password = request.POST.get('confirm_password', '').strip()

        if not current_password or not user.check_password(current_password):
            messages.error(request, 'Current password is incorrect.')
            return redirect('account_settings')
        if len(new_password) < 8:
            messages.error(request, 'New password must be at least 8 characters long.')
            return redirect('account_settings')
        if new_password != confirm_password:
            messages.error(request, 'New password and confirmation do not match.')
            return redirect('account_settings')
        if current_password == new_password:
            messages.error(request, 'New password cannot be the same as the current password.')
            return redirect('account_settings')

        user.set_password(new_password)
        user.save()
        messages.success(request, 'Password updated successfully. Please log in again.')
        return redirect('login')

    # If neither form is submitted
    messages.error(request, 'Invalid request.')
    return redirect('account_settings')
# ...existing code...