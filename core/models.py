from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.core.exceptions import ValidationError
import os

# Image Validation
def validate_image_size(image):
  max_size = 5 * 1024 * 1024
  if image.size > max_size:
    raise ValidationError(f"Image size should not exceed {max_size / (1024 * 1024)} MB")
    
def validate_image_type(image):
    valid_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    valid_extensions = ['.jpg', '.jpeg', '.png', '.webp']
    
        # Debug: Print the actual content type
    
    content_type = getattr(image, 'content_type', None) or getattr(image.file, 'content_type', None)
    print(f"File name: {image.name}")
    print(f"Detected content type: {content_type}")
    if content_type is None:
        file_extension = os.path.splitext(image.name)[1].lower()
        if file_extension not in valid_extensions:
            raise ValidationError(f"Invalid image type. File extension '{file_extension}' not allowed. Only JPEG, PNG, and WebP are allowed.")
    elif content_type not in valid_types:
        raise ValidationError(f"Invalid image type '{content_type}'. Only JPEG, PNG, and WebP are allowed.")


# Create your models here.

#Author Model
class Author(models.Model):
  user = models.OneToOneField(User, on_delete=models.CASCADE)
  bio = models.TextField(blank=True, null=True)
  profile_picture = models.ImageField(upload_to='authors/', blank=False, null=False, default='authors/default.jpg', validators=[validate_image_size, validate_image_type])

  def __str__(self):
    return f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username
  
  def delete(self, *args, **kwargs):
    if self.profile_picture and self.profile_picture.name != 'authors/default.jpg':
      if os.path.isfile(self.profile_picture.path):
        os.remove(self.profile_picture.path)
    super().delete(*args, **kwargs)


# Category Model
class Category(models.Model):  
  name = models.CharField(max_length=100)
  slug = models.SlugField(unique=True, blank=True)
  description = models.TextField(blank=True, null=True)
  thumbnail = models.ImageField(upload_to='categories/', blank=False, null=False, default='categories/default.jpg', validators=[validate_image_size, validate_image_type])

  def __str__(self):
    return self.name
  
  def save(self, *args, **kwargs):
    if not self.slug:
      self.slug = slugify(self.name)
    super().save(*args, **kwargs)

  def delete(self, *args, **kwargs):
    if self.thumbnail and self.thumbnail.name != 'categories/default.jpg':
      if os.path.isfile(self.thumbnail.path):
        os.remove(self.thumbnail.path)
    super().delete(*args, **kwargs)

  def get_absolute_url(self):
    from django.urls import reverse
    return reverse('category_posts', args=[self.slug])


# Blog Model
class Blog(models.Model):
  title = models.CharField(max_length=200)
  slug = models.SlugField(unique=True, blank=True)
  content = models.TextField()
  thumbnail = models.ImageField(upload_to='blogs/', blank=False, null=False, default='blogs/default.jpg', validators=[validate_image_size, validate_image_type])
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
    return reverse('blog', args=[self.slug])
  
  def delete(self, *args, **kwargs):
    # Delete the thumbnail file when the blog is deleted
    if self.thumbnail and self.thumbnail.name != 'blogs/default.jpg':
      if os.path.isfile(self.thumbnail.path):
        os.remove(self.thumbnail.path)
    super().delete(*args, **kwargs)
  

# Tag Model
class Tag(models.Model):
  name = models.CharField(max_length=50, unique=True)
  slug = models.SlugField(unique=True, blank=True)
  
  def save(self, *args, **kwargs):
    if not self.slug:
      self.slug = slugify(self.name)
    super().save(*args, **kwargs)

  def __str__(self):
    return self.name