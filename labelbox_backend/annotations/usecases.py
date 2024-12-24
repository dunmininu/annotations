from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import QuerySet, Count
from ninja.errors import HttpError

from .dtos import (
    CreateAnnotationSchema,
    ProjectSchema,
    SignupSchema,
    UpdateAnnotationSchema,
    UpdateProjectSchema,
)
from .models import Annotations, Project, Task


class BaseUseCase:
    def __init__(self, user: User):
        self.user = user

    def validate_user(self, project: Project):
        if self.user != project.user:
            raise HttpError(400, "Not the creating user")


class DashboardMetricsUseCase:
    def __init__(self, user):
        self.user = user

    def execute(self):
        total_projects = Project.objects.filter(user=self.user).count()

        total_tasks = Task.objects.filter(project__user=self.user).count()

        total_annotations = Annotations.objects.filter(
            task__project__user=self.user
        ).count()

        recent_annotations = Annotations.objects.filter(
            task__project__user=self.user
        ).order_by("-created_at")[:5]

        return {
            "total_projects": total_projects,
            "total_tasks": total_tasks,
            "total_annotations": total_annotations,
            "recent_annotations": list(
                recent_annotations.values("coordinates", "labels", "created_at")
            ),
        }


class CreateProjectUseCase:
    def __init__(self, data: ProjectSchema, user: User):
        self.name = data.name
        self.description = data.description
        self.user = user

    def execute(self) -> Project:
        project = Project(name=self.name, description=self.description, user=self.user)
        project.save()
        return project


class ListProjectsUseCase:
    def __init__(self, user: User):
        self.user = user

    def execute(self) -> QuerySet[Project]:
        return Project.objects.filter(user=self.user)


class UpdateProjectUseCase(BaseUseCase):
    def __init__(self, project_id: int, user: User, data: UpdateProjectSchema):
        super().__init__(user=user)
        self.project_id = project_id
        self.data = data.model_dump(exclude_none=True)
        self.user = user

    def execute(self) -> Project:
        project = Project.objects.filter(id=self.project_id)
        if not project.exists():
            raise ValueError("Project does not exist.")

        self.validate_user(project=project.first())

        project.update(**self.data)
        return project


class GetProjectUseCase(BaseUseCase):
    def __init__(self, project_id: int, user: User):
        super().__init__(user=user)
        self.project_id = project_id

    def execute(self) -> Project:
        project = Project.objects.filter(id=self.project_id).prefetch_related(
            "tasks", "tasks__annotations"
        )
        if not project.exists():
            raise ValueError("Project does not exist.")

        self.validate_user(project=project.first())
        return project.first()


class DeleteProjectUseCase(BaseUseCase):
    def __init__(self, project_id: int, user: User):
        super().__init__(user=user)

        self.project_id = project_id

    def execute(self):
        try:
            project = Project.objects.get(id=self.project_id)
            self.validate_user(project=project)
            project.delete()
        except ObjectDoesNotExist:
            raise ValueError("Project does not exist.")


class CreateTaskUseCase:
    def __init__(self, project_id: int, url: str):
        self.project_id = project_id
        self.url = url

    def execute(self) -> Task:
        try:
            project = Project.objects.get(id=self.project_id)
        except ObjectDoesNotExist:
            raise ValueError("Project does not exist.")

        task = Task(project=project, url=self.url)
        task.save()
        return task


class UpdateTaskUseCase:
    def __init__(self, task_id: int, url: str = None):
        self.task_id = task_id
        self.url = url

    def execute(self) -> Task:
        try:
            task = Task.objects.get(id=self.task_id)
        except ObjectDoesNotExist:
            raise ValueError("Task does not exist.")

        if self.url is not None:
            task.url = self.url
        task.save()
        return task


class ListTasksUseCase:
    def __init__(self, project_id: int):
        self.project_id = project_id

    def execute(self) -> QuerySet[Task]:
        return Task.objects.filter(project_id=self.project_id)


class DeleteTaskUseCase:
    def __init__(self, task_id: int):
        self.task_id = task_id

    def execute(self):
        try:
            task = Task.objects.get(id=self.task_id)
            task.delete()
        except ObjectDoesNotExist:
            raise ValueError("Task does not exist.")


class CreateAnnotationUseCase:
    def __init__(self, data: CreateAnnotationSchema):
        self.data = data.model_dump(exclude_none=True)
        self.task_id = self.data.pop("task_id", None)
        if not self.task_id:
            raise ValueError("Task ID is required.")

    def execute(self) -> Annotations:
        try:
            task = Task.objects.get(id=self.task_id)
        except ObjectDoesNotExist:
            raise ValueError("Task does not exist.")

        annotation = Annotations(
            task=task,
            **self.data,
        )
        annotation.save()
        return annotation


class ListAnnotationsUseCase:
    def __init__(self, task_id: int):
        self.task_id = task_id

    def execute(self) -> QuerySet[Annotations]:
        return Annotations.objects.filter(task_id=self.task_id)


class UpdateAnnotationUseCase:
    def __init__(self, annotation_id: int, data: UpdateAnnotationSchema):
        self.annotation_id = annotation_id
        self.data = data.model_dump(exclude_none=True)

    def execute(self) -> Annotations:
        try:
            annotation = Annotations.objects.get(id=self.annotation_id)
        except ObjectDoesNotExist:
            raise ValueError("Annotation does not exist.")

        for key, value in self.data.items():
            if hasattr(annotation, key):
                setattr(annotation, key, value)

        annotation.save()
        return annotation


class DeleteAnnotationUseCase:
    def __init__(self, annotation_id: int):
        self.annotation_id = annotation_id

    def execute(self) -> None:
        try:
            annotation = Annotations.objects.get(id=self.annotation_id)
        except ObjectDoesNotExist:
            raise ValueError("Annotation does not exist.")

        annotation.delete()


class SignupUseCase:
    def __init__(self, data: SignupSchema):
        self.username = data.username
        self.email = data.email
        self.password = data.password

    def validate_password(self, password: str) -> None:
        if len(password) < 8:  # noqa PLR2004
            raise HttpError(400, "Password must be at least 8 characters long.")

        if not any(char.isdigit() for char in password):
            raise HttpError(400, "Password must contain at least one number.")

    def execute(self) -> User:
        self.validate_password(self.password)

        if User.objects.filter(username=self.username).exists():
            raise HttpError(400, "Username already taken.")
        if User.objects.filter(email=self.email).exists():
            raise HttpError(400, "Email already in use.")

        # Create the user
        user = User.objects.create_user(
            username=self.username,
            email=self.email,
            password=self.password,
        )

        return user
