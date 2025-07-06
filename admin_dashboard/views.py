from django.shortcuts import render, redirect
from core.models import Blog
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth import logout as auth_logout
from django.views.decorators.http import require_POST
from core.models import Blog, Category, Tag, Author
import json
from django.http import JsonResponse
from django.core.files.storage import default_storage
import os
from PIL import Image
from datetime import datetime, timedelta

# Create your views here.

# Login
def login(request):
  if request.user.is_authenticated:
    user = request.user
    return render(request, 'admin_dashboard/admin_base.html') # Already Logged In
  
    
  
  message = None
  if request.method == "POST":
    username = request.POST.get('username')
    password = request.POST.get('password')
    
    user = authenticate(request, username=username, password=password)
    if user is not None:
      auth_login(request, user)
      return render(request, 'admin_dashboard/admin_base.html') # Redirect to Dashboard
    else:
      message = "Invalid username or password."
      
  return render(request, 'admin_dashboard/login.html', {'message': message})
  
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
        Blog.objects.filter(id__in=ids).delete()
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
def add_new_post(request):
  return render(request, 'admin_dashboard/add_new_post.html')


# Save Post
@login_required
def save_post(request):
    if request.method == 'POST':
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

        try:
            author = Author.objects.get(user=request.user)
        except Author.DoesNotExist:
            author = None

        

        blog_kwargs = dict(
            title=title,
            excerpt=excerpt,
            content=content,
            status=status,
            category=category,
            thumbnail_caption=thumbnail_caption,
            author=author
        )
        if thumbnail:
            blog_kwargs['thumbnail'] = thumbnail  # Only set if uploaded

        blog = Blog.objects.create(**blog_kwargs)

        try:
           tags_list = json.loads(tags_json)
           if not isinstance(tags_list, list):
             tags_list = []
           for tag_name in tags_list:
              tag_name = str(tag_name).strip()
              if not tag_name or len(tag_name) > 50:
                 continue  # Skip empty or too-long tags
              tag, created = Tag.objects.get_or_create(name=tag_name)
              blog.tags.add(tag)
        except Exception:
            pass

        return redirect('all_posts')


# Categories
@login_required
def dashboard_categories(request):
   return render(request, 'admin_dashboard/categories.html')

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

# Delete Media (robust, clear errors)
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
@login_required
def media_library_list_json(request):
    """
    Returns a paginated JSON list of image files in media/uploads/ for the media library modal.
    Supports ?search= and ?page= query params.
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