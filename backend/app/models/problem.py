from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime
)

from sqlalchemy.orm import relationship

from app.database.base import Base


class Problem(Base):
    __tablename__ = "problems"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String,
        nullable=False
    )

    difficulty = Column(
        String,
        nullable=False
    )

    topic = Column(
        String,
        nullable=False
    )

    leetcode_id = Column(
        Integer,
        nullable=True
    )

    status = Column(
        String,
        default="Solved"
    )

    notes = Column(
        String,
        nullable=True
    )

    solution_link = Column(
        String,
        nullable=True
    )

    solved_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    owner = relationship(
        "User",
        back_populates="problems"
    )