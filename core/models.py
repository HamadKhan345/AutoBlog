from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify

# Create your models here.
class Author(models.Model):
  user = models.OneToOneField(User, on_delete=models.CASCADE)
  bio = models.TextField(blank=True, null=True)
  profile_picture = models.ImageField(upload_to='authors/', blank=False, null=False)

  def __str__(self):
    return self.user.username

# For Our Categories/
class Category(models.Model):  
  name = models.CharField(max_length=100)
  slug = models.SlugField(unique=True, blank=True)
  description = models.TextField(blank=True, null=True)
  thumbnail = models.ImageField(upload_to='categories/', blank=False, null=False)

  def __str__(self):
    return self.name
  
  def save(self, *args, **kwargs):
    if not self.slug:
      self.slug = slugify(self.name)
    super().save(*args, **kwargs)
  
class Blog(models.Model):
  title = models.CharField(max_length=200)
  slug = models.SlugField(unique=True)
  content = models.TextField()
  thumbnail = models.ImageField(upload_to='blogs/', blank=True, null=True)
  author = models.ForeignKey(Author, on_delete=models.SET_NULL, null=True, blank=True, related_name='blogs')
  category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='blogs')
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)
  view_count = models.PositiveIntegerField(default=0)
  tags = models.ManyToManyField('Tag', blank=True, related_name='blogs') 

  DRAFT = 'draft'
  PUBLISHED = 'published'

  STATUS_CHOICES = [
    (DRAFT, 'Draft'),
    (PUBLISHED, 'Published'),
  ]

  status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=DRAFT)

  def save(self, *args, **kwargs):
    if not self.slug:
        self.slug = slugify(self.title)
    super().save(*args, **kwargs)

  def __str__(self):
    return self.title

  def get_absolute_url(self):
    from django.urls import reverse
    return reverse('blog_detail', args=[self.slug])
  
class Tag(models.Model):
  name = models.CharField(max_length=50, unique=True)
  slug = models.SlugField(unique=True, blank=True)
  
  def save(self, *args, **kwargs):
    if not self.slug:
      self.slug = slugify(self.name)
    super().save(*args, **kwargs)

  def __str__(self):
    return self.name