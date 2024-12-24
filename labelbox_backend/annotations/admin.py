from django.contrib import admin

from .models import Project, Task


class BaseAdmin(admin.ModelAdmin):
    readonly_fields = ["created_at", "updated_at"]


@admin.register(Project)
class ProjectAdmin(BaseAdmin):
    list_display = ["name", "description", "user"]


@admin.register(Task)
class TaskAdmin(BaseAdmin):
    list_display = ["url", "project"]
