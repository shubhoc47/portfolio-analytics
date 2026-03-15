"""
Holding Pydantic schemas.
"""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class HoldingCreate(BaseModel):
    """Request body for creating a holding inside a portfolio."""

    ticker: str = Field(min_length=1, max_length=32)
    company_name: str | None = Field(default=None, max_length=255)
    asset_type: str = Field(min_length=1, max_length=50)
    sector: str | None = Field(default=None, max_length=100)
    quantity: Decimal = Field(gt=0)
    average_cost: Decimal = Field(gt=0)
    current_price: Decimal | None = Field(default=None, ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=10)
    weight_percent: Decimal | None = Field(default=None, ge=0, le=100)

    @field_validator("ticker", "currency")
    @classmethod
    def normalize_upper_text(cls, value: str) -> str:
        return value.strip().upper()

    @field_validator("asset_type")
    @classmethod
    def normalize_asset_type(cls, value: str) -> str:
        return value.strip()

    @field_validator("company_name", "sector")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class HoldingUpdate(BaseModel):
    """Request body for partially updating a holding."""

    ticker: str | None = Field(default=None, min_length=1, max_length=32)
    company_name: str | None = Field(default=None, max_length=255)
    asset_type: str | None = Field(default=None, min_length=1, max_length=50)
    sector: str | None = Field(default=None, max_length=100)
    quantity: Decimal | None = Field(default=None, gt=0)
    average_cost: Decimal | None = Field(default=None, gt=0)
    current_price: Decimal | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, min_length=3, max_length=10)
    weight_percent: Decimal | None = Field(default=None, ge=0, le=100)

    @field_validator("ticker", "currency")
    @classmethod
    def normalize_upper_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip().upper()

    @field_validator("asset_type")
    @classmethod
    def normalize_asset_type(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip()

    @field_validator("company_name", "sector")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None

    @model_validator(mode="after")
    def validate_non_empty_payload(self) -> "HoldingUpdate":
        if not self.model_fields_set:
            raise ValueError("At least one field must be provided for update")
        return self


class HoldingRead(BaseModel):
    """Response shape for holding resources."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    portfolio_id: int
    ticker: str
    company_name: str | None
    asset_type: str
    sector: str | None
    quantity: Decimal
    average_cost: Decimal
    current_price: Decimal | None
    currency: str
    weight_percent: Decimal | None
    created_at: datetime
    updated_at: datetime

