"""
Authentication endpoints.
"""

from fastapi import APIRouter, HTTPException, status

from app.api.deps import AuthServiceDep, CurrentUserDep
from app.schemas.auth import Token, UserCreate, UserLogin, UserRead

router = APIRouter()


@router.post("/signup", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserCreate, service: AuthServiceDep) -> UserRead:
    """Create a new email/password account."""
    return await service.register_user(payload)


@router.post("/login", response_model=Token)
async def login(payload: UserLogin, service: AuthServiceDep) -> Token:
    """Authenticate a user and return a bearer access token."""
    user = await service.authenticate_user(payload.email, payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return Token(access_token=service.create_user_access_token(user))


@router.get("/me", response_model=UserRead)
async def read_current_user(current_user: CurrentUserDep) -> UserRead:
    """Return the current authenticated user."""
    return current_user
