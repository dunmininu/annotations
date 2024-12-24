from django.contrib.auth.models import User
from django.db import models
from django.forms.models import model_to_dict


class BaseModel(models.Model):
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)

    class Meta:
        abstract = True

    def to_dict(self) -> dict:
        return model_to_dict(self)


class Project(BaseModel):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="projects",
    )
    name = models.CharField(max_length=256, db_index=True)
    description = models.TextField(blank=True)


class Task(BaseModel):
    url = models.URLField()
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="tasks",
    )


class Annotations(BaseModel):
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="annotations",
    )
    coordinates = models.TextField(blank=True)
    labels = models.TextField(blank=True)
    data = models.JSONField()
