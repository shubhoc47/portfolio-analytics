"""
Portfolio Pydantic schemas.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class PortfolioCreate(BaseModel):
    """Request body for creating a portfolio."""

    name: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    base_currency: str = Field(default="USD", min_length=3, max_length=10)
    owner_name: str | None = Field(default=None, max_length=200)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        return value.strip()

    @field_validator("description", "owner_name")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None

    @field_validator("base_currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        return value.strip().upper()


class PortfolioUpdate(BaseModel):
    """Request body for updating a portfolio."""

    name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    base_currency: str | None = Field(default=None, min_length=3, max_length=10)
    owner_name: str | None = Field(default=None, max_length=200)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip()

    @field_validator("description", "owner_name")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None

    @field_validator("base_currency")
    @classmethod
    def normalize_currency(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip().upper()

    @model_validator(mode="after")
    def validate_non_empty_payload(self) -> "PortfolioUpdate":
        if not self.model_fields_set:
            raise ValueError("At least one field must be provided for update")
        return self


class PortfolioRead(BaseModel):
    """Response shape for portfolio resources."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    base_currency: str
    owner_name: str | None
    created_at: datetime
    updated_at: datetime

