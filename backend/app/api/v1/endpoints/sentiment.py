"""
Sentiment analysis endpoints.
"""

from typing import Annotated

from fastapi import APIRouter, Path

from app.api.deps import CurrentUserDep, SentimentServiceDep
from app.schemas.sentiment import SentimentAnalyzeResponse

router = APIRouter()


@router.post(
    "/portfolios/{portfolio_id}/analyze",
    response_model=SentimentAnalyzeResponse,
)
async def analyze_portfolio_sentiment(
    portfolio_id: Annotated[int, Path(ge=1)],
    service: SentimentServiceDep,
    current_user: CurrentUserDep,
) -> SentimentAnalyzeResponse:
    """Analyze local portfolio news and return article/holding/portfolio sentiment."""
    return await service.analyze_portfolio_sentiment(portfolio_id, current_user.id)

