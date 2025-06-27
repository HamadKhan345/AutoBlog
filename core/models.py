from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
import os

# Create your models here.
class Author(models.Model):
  user = models.OneToOneField(User, on_delete=models.CASCADE)
  bio = models.TextField(blank=True, null=True)
  profile_picture = models.ImageField(upload_to='authors/', blank=False, null=False, default='authors/default.jpg')

  def __str__(self):
    return self.user.first_name + ' ' + self.user.last_name
  
  def delete(self, *args, **kwargs):
    if self.profile_picture:
      if os.path.isfile(self.profile_picture.path):
        os.remove(self.profile_picture.path)
    super().delete(*args, **kwargs)

# For Our Categories/
class Category(models.Model):  
  name = models.CharField(max_length=100)
  slug = models.SlugField(unique=True, blank=True)
  description = models.TextField(blank=True, null=True)
  thumbnail = models.ImageField(upload_to='categories/', blank=False, null=False, default='categories/default.jpg')

  def __str__(self):
    return self.name
  
  def save(self, *args, **kwargs):
    if not self.slug:
      self.slug = slugify(self.name)
    super().save(*args, **kwargs)

  def delete(self, *args, **kwargs):
    if self.thumbnail:
      if os.path.isfile(self.thumbnail.path):
        os.remove(self.thumbnail.path)
    super().delete(*args, **kwargs)

  def get_absolute_url(self):
    from django.urls import reverse
    return reverse('category_posts', args=[self.slug])
  
class Blog(models.Model):
  title = models.CharField(max_length=200)
  slug = models.SlugField(unique=True)
  content = models.TextField()
  thumbnail = models.ImageField(upload_to='blogs/', blank=False, null=False, default='blogs/default.jpg')
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
  
  def delete(self, *args, **kwargs):
    # Delete the thumbnail file when the blog is deleted
    if self.thumbnail:
      if os.path.isfile(self.thumbnail.path):
        os.remove(self.thumbnail.path)
    super().delete(*args, **kwargs)
  
class Tag(models.Model):
  name = models.CharField(max_length=50, unique=True)
  slug = models.SlugField(unique=True, blank=True)
  
  def save(self, *args, **kwargs):
    if not self.slug:
      self.slug = slugify(self.name)
    super().save(*args, **kwargs)

  def __str__(self):
    return self.name