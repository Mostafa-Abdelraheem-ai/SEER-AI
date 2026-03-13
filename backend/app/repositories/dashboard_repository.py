from __future__ import annotations

from collections import Counter

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.analysis import Analysis
from app.models.incident_report import IncidentReport


class DashboardRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def analyses_for_user(self, user_id: str) -> list[Analysis]:
        return list(self.db.scalars(select(Analysis).where(Analysis.user_id == user_id)).all())

    def reports_for_user(self, user_id: str) -> list[IncidentReport]:
        statement = select(IncidentReport).join(Analysis).where(Analysis.user_id == user_id)
        return list(self.db.scalars(statement).all())

    @staticmethod
    def risk_distribution(analyses: list[Analysis]) -> list[dict]:
        buckets = {"0-39": 0, "40-69": 0, "70-100": 0}
        for item in analyses:
            if item.risk_score < 40:
                buckets["0-39"] += 1
            elif item.risk_score < 70:
                buckets["40-69"] += 1
            else:
                buckets["70-100"] += 1
        return [{"label": key, "value": value} for key, value in buckets.items()]

    @staticmethod
    def attack_types(analyses: list[Analysis]) -> list[dict]:
        counts = Counter(item.attack_prediction for item in analyses)
        return [{"attack_type": key, "count": value} for key, value in counts.items()]
