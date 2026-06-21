from datetime import datetime
from pydantic import BaseModel


class ProblemCreate(BaseModel):
    leetcode_id: int | None = None
    title: str
    difficulty: str
    topic: str
    status: str = "Solved"
    notes: str | None = None
    solution_link: str | None = None
    solved_at: datetime | None = None


class ProblemUpdate(BaseModel):
    leetcode_id: int | None = None
    title: str | None = None
    difficulty: str | None = None
    topic: str | None = None
    status: str | None = None
    notes: str | None = None
    solution_link: str | None = None
    solved_at: datetime | None = None


class ProblemResponse(BaseModel):
    id: int
    leetcode_id: int | None
    title: str
    difficulty: str
    topic: str
    status: str | None
    notes: str | None
    solution_link: str | None
    solved_at: datetime | None
    user_id: int

    class Config:
        from_attributes = True