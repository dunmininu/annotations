from cloudinary import uploader
from django.conf import settings
from django.shortcuts import render
from ninja import File, UploadedFile
from ninja.pagination import paginate
from ninja_extra import Router

from .bearer import JWTBearer
from .data_types import HttpRequest
from .dtos import (
    AnnotationResponseSchema,
    CreateAnnotationSchema,
    CreateTaskSchema,
    DashboardMetricsSchema,
    Paginator,
    ProjectDetailSchema,
    ProjectOutSchema,
    ProjectSchema,
    TaskResponseSchema,
    UpdateAnnotationSchema,
    UpdateProjectSchema,
    UpdateTaskSchema,
)
from .usecases import (
    CreateAnnotationUseCase,
    CreateProjectUseCase,
    CreateTaskUseCase,
    DashboardMetricsUseCase,
    DeleteAnnotationUseCase,
    DeleteProjectUseCase,
    DeleteTaskUseCase,
    GetProjectUseCase,
    ListAnnotationsUseCase,
    ListProjectsUseCase,
    ListTasksUseCase,
    UpdateAnnotationUseCase,
    UpdateProjectUseCase,
    UpdateTaskUseCase,
)

router = Router(
    auth=JWTBearer(),
    tags=["annotations"],
)


@router.post("/projects/", response={201: ProjectOutSchema})
def create_project(request: HttpRequest, data: ProjectSchema):
    project = CreateProjectUseCase(data=data, user=request.user).execute()
    return project


@router.get("/projects/", response=list[ProjectOutSchema])
@paginate(Paginator)
def list_projects(request: HttpRequest):
    return ListProjectsUseCase(user=request.user).execute()


@router.put("/projects/{project_id}/", response=ProjectOutSchema)
def update_project(request: HttpRequest, project_id: int, payload: UpdateProjectSchema):
    use_case = UpdateProjectUseCase(
        project_id=project_id,
        data=payload,
        user=request.user,
    )
    project = use_case.execute()
    return project


@router.get("/projects/{project_id}/", response=ProjectDetailSchema)
def get_project(request: HttpRequest, project_id: int):
    use_case = GetProjectUseCase(
        project_id=project_id,
        user=request.user,
    )
    project = use_case.execute()
    return project


@router.delete("/projects/{project_id}/", response={204: None})
def delete_project(request, project_id: int):
    use_case = DeleteProjectUseCase(
        project_id=project_id,
        user=request.user,
    )
    use_case.execute()
    return 204, None


@router.get("/list-tasks/{project_id}", response=list[TaskResponseSchema])
@paginate(Paginator)
def list_tasks(request: HttpRequest, project_id: int):
    use_case = ListTasksUseCase(project_id=project_id)
    tasks = use_case.execute()
    return tasks


@router.put("/update-task/{task_id}/", response=TaskResponseSchema)
def update_task(request, task_id: int, payload: UpdateTaskSchema):
    use_case = UpdateTaskUseCase(task_id=task_id, url=payload.url)
    task = use_case.execute()
    return task.to_dict()


@router.delete("/delete-task/{task_id}/", response={204: None})
def delete_task(request, task_id: int):
    use_case = DeleteTaskUseCase(task_id=task_id)
    use_case.execute()
    return 204, None


@router.post("/create-task/", response=TaskResponseSchema)
def create_task(request: HttpRequest, payload: CreateTaskSchema):
    use_case = CreateTaskUseCase(project_id=payload.project_id, url=payload.url)
    task = use_case.execute()
    return task


@router.get("/list-annotations/{task_id}/", response=list[AnnotationResponseSchema])
@paginate(Paginator)
def list_annotations(request: HttpRequest, task_id: int):
    use_case = ListAnnotationsUseCase(task_id=task_id)
    annotations = use_case.execute()
    return annotations


@router.put("/update-annotation/{annotation_id}/", response=AnnotationResponseSchema)
def update_annotation(request, annotation_id: int, payload: UpdateAnnotationSchema):
    use_case = UpdateAnnotationUseCase(
        annotation_id=annotation_id,
        data=payload,
    )
    annotation = use_case.execute()
    return annotation.to_dict()


@router.delete("/delete-annotation/{annotation_id}/", response={204: None})
def delete_annotation(request, annotation_id: int):
    use_case = DeleteAnnotationUseCase(annotation_id=annotation_id)
    use_case.execute()
    return 204, None


@router.post("/create-annotation/", response=AnnotationResponseSchema)
def create_annotation(request: HttpRequest, payload: CreateAnnotationSchema):
    use_case = CreateAnnotationUseCase(
        data=payload,
    )
    annotation = use_case.execute()
    return annotation


@router.get("/metrics", response=DashboardMetricsSchema)
def get_dashboard_metrics(request: HttpRequest):
    use_case = DashboardMetricsUseCase(user=request.user)
    metrics = use_case.execute()

    return metrics


@router.post("/upload-image/", response={200: str, 400: dict})
def upload_image(request: HttpRequest, file: UploadedFile = File(...)):
    """Upload an image to Cloudinary and return the URL."""
    if file.content_type not in settings.ALLOWED_FILE_TYPES:
        return 400, {"error": "Unsupported file type"}

    try:
        upload_result = uploader.upload(file.file)
        return upload_result["url"]
    except Exception as e:
        return 400, {"error": str(e)}


def index(request):
    return render(request, "index.html")
