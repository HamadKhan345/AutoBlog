from django.shortcuts import render, redirect
from core.models import Blog
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth import logout as auth_logout

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

@ login_required
def dashboard(request):
  return render(request, 'admin_dashboard/admin_base.html')

# All Posts
@ login_required
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


# Add New Post
@ login_required
def add_new_post(request):
  return render(request, 'admin_dashboard/add_new_post.html')