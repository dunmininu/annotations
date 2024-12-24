from django.db import transaction
from ninja import Router

from .data_types import HttpRequest
from .dtos import SignupSchema, UserOutSchema
from .usecases import SignupUseCase

router = Router(tags=["auth"])


@router.post(
    "/signup",
    response={200: UserOutSchema},
)
@transaction.atomic
def signup(request: HttpRequest, payload: SignupSchema):
    use_case = SignupUseCase(data=payload)
    user = use_case.execute()
    return user
