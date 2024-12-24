from ninja_extra import NinjaExtraAPI
from ninja_jwt.controller import NinjaJWTDefaultController

from .auth_views import router as auth_router
from .views import router as annotations_router

api = NinjaExtraAPI()
api.register_controllers(NinjaJWTDefaultController)

api.add_router("", annotations_router)
api.add_router("", auth_router)
