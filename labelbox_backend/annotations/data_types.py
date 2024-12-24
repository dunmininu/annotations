import typing
from typing import Annotated

from django.http import HttpRequest as DjangoHttpRequest
from pydantic import HttpUrl

if typing.TYPE_CHECKING:
    from django.contrib.auth.models import User


class HttpRequest(DjangoHttpRequest):
    user: "User"


HttpUrlType = Annotated[str, HttpUrl]
