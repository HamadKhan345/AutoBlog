# Generated by Django 5.2.3 on 2025-07-13 12:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0014_alter_blog_slug'),
    ]

    operations = [
        migrations.AlterField(
            model_name='category',
            name='description',
            field=models.CharField(max_length=500),
        ),
    ]
