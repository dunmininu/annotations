from enum import Enum
from typing import Any


class ErrorCode(Enum):
    ERROR_4001 = "4001"
    ERROR_4002 = "4002"
    ERROR_4003 = "4003"
    ERROR_4004 = "4004"
    ERROR_4005 = "4005"
    ERROR_4006 = "4006"
    ERROR_4007 = "4007"
    ERROR_4008 = "4008"
    ERROR_4009 = "4009"
    ERROR_4010 = "4010"
    ERROR_4011 = "4011"
    ERROR_4012 = "4012"
    ERROR_5001 = "5001"


class AppError(Exception):
    """
    Base class for creating custom exceptions tailored to
    application-specific errors.

    This class serves as a foundation for encapsulating diverse
    error scenarios that might arise within the application context.
    The associated error code enables precise identification
    of the nature of the error.

    Attributes:
        error_code (ErrorCode): The specific error code associated
                                with the exception.
        data (str | None): Optional contextual data relevant to the error,
                           used for formatting.
        message (str | None): An optional custom message that can replace the
                              default message if provided.
    """

    error_http_mapping = {
        ErrorCode.ERROR_4001: 400,  # Bad Request
        ErrorCode.ERROR_4002: 400,  # Bad Request
        ErrorCode.ERROR_4003: 403,  # Forbidden
        ErrorCode.ERROR_4004: 429,  # Too Many Requests
        ErrorCode.ERROR_4005: 404,  # Not Found
        ErrorCode.ERROR_4006: 400,  # Bad Request
        ErrorCode.ERROR_4007: 402,  # Payment Required
        ErrorCode.ERROR_4008: 400,  # Bad Request
        ErrorCode.ERROR_4009: 401,  # No auth specified
        ErrorCode.ERROR_4010: 400,  # Bad Request
        ErrorCode.ERROR_4011: 400,  # Bad Request
        ErrorCode.ERROR_4012: 400,  # Bad Request
        ErrorCode.ERROR_5001: 500,  # Internal Server Error
    }

    default_message = ""

    def __init__(
        self,
        error_code: ErrorCode,
        data: str | None = None,
        message: str | None = None,
    ):
        self.error_code = error_code
        self.data = data
        self.message = message

        super().__init__(self.get_message())

    def get_message(self) -> str:
        message = self.message or self.default_message

        return message.format(data=self.data)

    def http_error_code(self) -> int:
        return self.error_http_mapping.get(self.error_code, 500)

    def build(self) -> dict[str, Any]:
        return {
            "success": False,
            "code": self.error_code.value,
            "message": self.get_message(),
            "data": None,
        }


class InvalidInputError(AppError):
    error_code = ErrorCode.ERROR_4001
    default_message = "The {data} you entered is incorrect. Kindly check and try again."

    def __init__(
        self,
        data: str | None = None,
        message: str | None = None,
    ):
        super().__init__(self.error_code, data, message)
