from datetime import date
from typing import Any, Generic, Optional, TypeVar

from django.conf import settings
from django.core.exceptions import FieldError
from ninja import Field, ModelSchema, Schema
from ninja.pagination import PaginationBase
from pydantic import BaseModel, EmailStr, conint, validator

from .data_types import HttpUrlType
from .exceptions_manager import InvalidInputError
from .models import Project

GenericResultsType = TypeVar("GenericResultsType")


class ProjectSchema(Schema):
    name: str
    description: str | None


class ProjectOutSchema(ModelSchema):
    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "created_at",
        ]


class TaskResponseSchema(Schema):
    id: int
    url: str
    project_id: int
    created_at: date


class ProjectDetailSchema(ModelSchema):
    tasks: list[TaskResponseSchema]

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "created_at",
        ]

    @staticmethod
    def resolve_tasks(root: Project):
        return root.tasks


class TaskSchema(Schema):
    project_id: int
    image_url: HttpUrlType


class AnnotationSchema(Schema):
    task_id: int
    annotation: dict


class CreateTaskSchema(Schema):
    project_id: int
    url: str


class CreateAnnotationSchema(Schema):
    task_id: int
    coordinates: Optional[str]
    labels: Optional[str]
    data: dict


class AnnotationResponseSchema(Schema):
    id: int
    task_id: int
    coordinates: str
    labels: str
    data: dict
    created_at: date


class SignupSchema(Schema):
    username: str = Field(
        ...,
        max_length=150,
        description="Unique username",
    )
    email: EmailStr
    password: str = Field(
        ...,
        min_length=8,
        description="Password (minimum 8 characters)",
    )


class UserOutSchema(Schema):
    id: int
    username: str


class UpdateProjectSchema(Schema):
    name: str = None
    description: str = None


class UpdateTaskSchema(Schema):
    url: str = None


class UpdateAnnotationSchema(Schema):
    coordinates: str = None
    labels: str = None
    data: dict = None


class PageFilter(Schema):
    page_index: int = Field(ge=1, default=1)
    page_size: conint(ge=1, le=100) = 10  # type: ignore
    ordering: Optional[str] = Field(
        None, alias="ordering", description="Ordering of the results"
    )

    @validator("page_index")
    def page_index_check(cls, page_index):  # noqa: N805
        if page_index <= 1:
            return 1
        return page_index

    def dict(
        self,
        *,
        exclude_none=True,
        exclude={"page_index", "page_size", "ordering"},
        by_alias: bool = False,
        skip_defaults: bool = None,
        exclude_unset: bool = False,
        exclude_defaults: bool = False,
    ) -> dict[str, Any]:
        return super().dict(
            exclude_none=exclude_none,
            exclude=exclude,
            by_alias=by_alias,
            skip_defaults=skip_defaults,
            exclude_unset=exclude_unset,
            exclude_defaults=exclude_defaults,
        )


class Paginator(PaginationBase):
    class Input(PageFilter): ...

    class Output(BaseModel, Generic[GenericResultsType]):
        message: Optional[str] = None
        success: bool = True
        total: int
        page_size: int
        page_index: int
        nb_pages: int
        previous: Optional[str]
        next: Optional[str]
        data: list[GenericResultsType]

    items_attribute: str = "data"

    def paginate_queryset(
        self,
        queryset,
        pagination: PageFilter,
        request,
        **params,
    ):
        if pagination.ordering:
            try:
                queryset = queryset.order_by(pagination.ordering)
            except FieldError:
                raise InvalidInputError(data=f"Ordering Field '{pagination.ordering}'")

        offset = (pagination.page_index - 1) * pagination.page_size
        total = self._items_count(queryset)

        next, prev = None, None

        if pagination.page_index > 1:
            prev = f"{settings.LIVE_URL}{request.path}{'?page_index=' + str(pagination.page_index - 1)}{'&page_size='+str(pagination.page_size)}"  # noqa

        if offset + pagination.page_size < total:
            next = f"{settings.LIVE_URL}{request.path}{'?page_index=' + str(pagination.page_index + 1)}{'&page_size='+str(pagination.page_size)}"  # noqa

        return {
            "total": total,
            "page_size": pagination.page_size,
            "page_index": pagination.page_index,
            "nb_pages": (total + pagination.page_size - 1) // pagination.page_size,
            "next": next,
            "previous": prev,
            "data": queryset[offset : offset + pagination.page_size],
        }


class RecentAnnotationSchema(Schema):
    coordinates: Optional[str]
    labels: Optional[str]
    created_at: date


class DashboardMetricsSchema(Schema):
    total_projects: int
    total_tasks: int
    total_annotations: int
    recent_annotations: list[RecentAnnotationSchema]
