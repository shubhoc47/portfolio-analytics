"""
Authentication service.

Coordinates registration, password verification, and token creation.
"""

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.auth import UserCreate


class AuthService:
    """Business logic for local email/password authentication."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repository = UserRepository(db)

    async def register_user(self, payload: UserCreate) -> User:
        existing = await self.repository.get_by_email(payload.email)
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists",
            )

        try:
            user = await self.repository.create(
                payload,
                hashed_password=hash_password(payload.password),
            )
            await self.db.commit()
            return user
        except IntegrityError as exc:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists",
            ) from exc
        except Exception:
            await self.db.rollback()
            raise

    async def authenticate_user(self, email: str, password: str) -> User | None:
        user = await self.repository.get_by_email(email)
        if user is None or not verify_password(password, user.hashed_password):
            return None
        if not user.is_active:
            return None
        return user

    async def get_user_by_id(self, user_id: int) -> User | None:
        return await self.repository.get_by_id(user_id)

    def create_user_access_token(self, user: User) -> str:
        return create_access_token(subject=str(user.id))
