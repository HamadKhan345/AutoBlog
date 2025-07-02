from django.shortcuts import render, HttpResponse
from core.models import Blog
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
# from django.contrib.auth.decorators import login_required

# Create your views here.
# @login_required
def dashboard(request):
  return HttpResponse("Welcome to the Admin Dashboard")

def base(request):
  return render(request, 'admin_dashboard/admin_base.html')

def login(request):
  return render(request, 'admin_dashboard/login.html')

# Posts

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