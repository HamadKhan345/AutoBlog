from .models import Category, Tag

def categories_processor(request):
    return {
        'categories': Category.objects.all()
    }

def tags_processor(request):
    return {
        'all_tags': Tag.objects.all()
    }