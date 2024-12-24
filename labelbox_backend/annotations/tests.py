from .usecases import SignupUseCase


def test_signup_use_case():
    response = SignupUseCase.execute(
        username="testuser",
        email="testuser@example.com",
        password="securepassword",
    )
    assert response["message"] == "User created successfully"
