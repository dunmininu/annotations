from ninja.security import HttpBearer
from ninja_jwt.authentication import JWTAuth


class JWTBearer(HttpBearer):
    def authenticate(self, request, token):
        try:
            return JWTAuth().authenticate(request, token)
        except Exception as e:
            print(f"JWT Authentication failed: {str(e)}")
            raise
