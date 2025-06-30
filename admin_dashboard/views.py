from django.shortcuts import render, HttpResponse
# from django.contrib.auth.decorators import login_required

# Create your views here.
# @login_required
def dashboard(request):
  return HttpResponse("Welcome to the Admin Dashboard")

def base(request):
  return render(request, 'admin_dashboard/admin_base.html')

def login_view(request):
  return render(request, 'admin_dashboard/login.html')