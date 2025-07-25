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

  ROLE_CHOICES = [
    ('admin', 'Admin'),
    ('moderator', 'Moderator'),
    ('editor', 'Editor'),
  ]
  role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='editor')

  def __str__(self):
    return f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username
  
  def save(self, *args, **kwargs):
    # If updating and profile picture changed, delete old file (unless default)
    if self.pk:
      try:
        old = Author.objects.get(pk=self.pk)
        if old.profile_picture and self.profile_picture != old.profile_picture:
          if old.profile_picture.name != 'authors/default.jpg' and os.path.isfile(old.profile_picture.path):
            os.remove(old.profile_picture.path)
      except Author.DoesNotExist:
        pass
    super().save(*args, **kwargs)
  
  def delete(self, *args, **kwargs):
    if self.profile_picture and self.profile_picture.name != 'authors/default.jpg':
      if os.path.isfile(self.profile_picture.path):
        os.remove(self.profile_picture.path)
    super().delete(*args, **kwargs)


# Category Model
class Category(models.Model):  
  name = models.CharField(max_length=20, blank=False, null=False)
  slug = models.SlugField(unique=True, blank=True)
  description = models.CharField(max_length=500, blank=False, null=False,)
  thumbnail = models.ImageField(upload_to='categories/', blank=False, null=False, default='categories/default.jpg', validators=[validate_image_size, validate_image_type])

  def __str__(self):
    return self.name
  
  def save(self, *args, **kwargs):
    if self.pk:
      try:
        old = Category.objects.get(pk=self.pk)
        if old.thumbnail and self.thumbnail != old.thumbnail:
          if old.thumbnail.name != 'categories/default.jpg' and os.path.isfile(old.thumbnail.path):
            os.remove(old.thumbnail.path)
      except Category.DoesNotExist:
        pass
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
  title = models.CharField(max_length=200, blank=False, null=False)
  slug = models.SlugField(unique=True, blank=True, max_length=200)
  content = models.TextField(blank=False, null=False)
  excerpt = models.CharField(max_length=200, blank=False, null=False)
  thumbnail = models.ImageField(upload_to='blogs/', blank=False, null=False, default='blogs/default.jpg', validators=[validate_image_size, validate_image_type])
  thumbnail_caption = models.CharField(max_length=255, blank=True, null=True)
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

  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    self._original_thumbnail = self.thumbnail

  def save(self, *args, **kwargs):
    # If updating and thumbnail changed, delete old file (unless default)
    if self.pk:
      try:
        old = Blog.objects.get(pk=self.pk)
        if old.thumbnail and self.thumbnail != old.thumbnail:
          if old.thumbnail.name != 'blogs/default.jpg' and os.path.isfile(old.thumbnail.path):
            os.remove(old.thumbnail.path)
      except Blog.DoesNotExist:
        pass
    if not self.slug:
      self.slug = slugify(self.title)
    super().save(*args, **kwargs)
    self._original_thumbnail = self.thumbnail

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
