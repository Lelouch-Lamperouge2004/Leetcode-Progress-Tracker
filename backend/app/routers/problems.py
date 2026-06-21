from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.dependencies import get_db
from app.models.problem import Problem
from app.models.user import User
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from fastapi import Query
from app.schemas.problem import (
    ProblemCreate,
    ProblemUpdate,
    ProblemResponse
)

router = APIRouter(
    prefix="/problems",
    tags=["Problems"]
)


@router.post("/", response_model=ProblemResponse)
def create_problem(
    problem: ProblemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_problem = Problem(
    leetcode_id=problem.leetcode_id,
    title=problem.title,
    difficulty=problem.difficulty,
    topic=problem.topic,
    status=problem.status,
    notes=problem.notes,
    solution_link=problem.solution_link,
    solved_at=problem.solved_at,
    user_id=current_user.id
)

    db.add(new_problem)
    db.commit()
    db.refresh(new_problem)

    return new_problem


@router.get("/", response_model=list[ProblemResponse])
def get_problems(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    problems = (
        db.query(Problem)
        .filter(Problem.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return problems

@router.get("/stats")
def get_problem_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    problems = (
        db.query(Problem)
        .filter(Problem.user_id == current_user.id)
        .all()
    )

    total = len(problems)

    easy = len([p for p in problems if p.difficulty.lower() == "easy"])
    medium = len([p for p in problems if p.difficulty.lower() == "medium"])
    hard = len([p for p in problems if p.difficulty.lower() == "hard"])

    return {
        "total": total,
        "easy": easy,
        "medium": medium,
        "hard": hard
    }
@router.put("/{problem_id}", response_model=ProblemResponse)
def update_problem(
    problem_id: int,
    problem_update: ProblemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    problem = (
        db.query(Problem)
        .filter(
            Problem.id == problem_id,
            Problem.user_id == current_user.id
        )
        .first()
    )

    if problem is None:
        raise HTTPException(
            status_code=404,
            detail="Problem not found"
        )

    if problem_update.title is not None:
        problem.title = problem_update.title
    
    if problem_update.leetcode_id is not None:
        problem.leetcode_id = problem_update.leetcode_id

    if problem_update.status is not None:
        problem.status = problem_update.status

    if problem_update.notes is not None:
        problem.notes = problem_update.notes

    if problem_update.solution_link is not None:
        problem.solution_link = problem_update.solution_link

    if problem_update.solved_at is not None:
        problem.solved_at = problem_update.solved_at
        
    if problem_update.difficulty is not None:
        problem.difficulty = problem_update.difficulty

    if problem_update.topic is not None:
        problem.topic = problem_update.topic

    db.commit()
    db.refresh(problem)

    return problem

@router.delete("/{problem_id}")
def delete_problem(
    problem_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    problem = (
        db.query(Problem)
        .filter(
            Problem.id == problem_id,
            Problem.user_id == current_user.id
        )
        .first()
    )

    if problem is None:
        raise HTTPException(
            status_code=404,
            detail="Problem not found"
        )

    db.delete(problem)
    db.commit()

    return {
        "message": "Problem deleted successfully"
    }

@router.get("/topic-stats")
def get_topic_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    problems = (
        db.query(Problem)
        .filter(Problem.user_id == current_user.id)
        .all()
    )

    topic_count = {}

    for problem in problems:
        topic = problem.topic

        if topic not in topic_count:
            topic_count[topic] = 0

        topic_count[topic] += 1

    return topic_count
@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    problems = (
        db.query(Problem)
        .filter(Problem.user_id == current_user.id)
        .all()
    )

    total = len(problems)

    easy = 0
    medium = 0
    hard = 0

    solved = 0
    unsolved = 0

    topics = {}

    for problem in problems:

        if problem.difficulty == "Easy":
            easy += 1

        elif problem.difficulty == "Medium":
            medium += 1

        elif problem.difficulty == "Hard":
            hard += 1

        if problem.status == "Solved":
            solved += 1
        else:
            unsolved += 1

        topics[problem.topic] = (
            topics.get(problem.topic, 0) + 1
        )

    return {
        "total_problems": total,
        "easy": easy,
        "medium": medium,
        "hard": hard,
        "solved": solved,
        "unsolved": unsolved,
        "topics": topics
    }

@router.get("/streak")
def get_streak(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    problems = (
        db.query(Problem)
        .filter(
            Problem.user_id == current_user.id,
            Problem.solved_at != None
        )
        .order_by(Problem.solved_at.desc())
        .all()
    )

    if not problems:
        return {
            "current_streak": 0
        }

    solved_dates = []

    for problem in problems:
        solved_dates.append(
            problem.solved_at.date()
        )

    solved_dates = sorted(
        list(set(solved_dates)),
        reverse=True
    )

    today = datetime.utcnow().date()

    if solved_dates[0] != today:
        return {
            "current_streak": 0
        }

    streak = 1

    for i in range(1, len(solved_dates)):

        difference = (
            solved_dates[i - 1]
            - solved_dates[i]
        ).days

        if difference == 1:
            streak += 1
        else:
            break

    return {
        "current_streak": streak
    }

@router.get("/longest-streak")
def get_longest_streak(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    problems = (
        db.query(Problem)
        .filter(
            Problem.user_id == current_user.id,
            Problem.solved_at != None
        )
        .order_by(Problem.solved_at.asc())
        .all()
    )

    if not problems:
        return {
            "longest_streak": 0
        }

    solved_dates = []

    for problem in problems:
        solved_dates.append(
            problem.solved_at.date()
        )

    solved_dates = sorted(
        list(set(solved_dates))
    )

    longest_streak = 1
    current_streak = 1

    for i in range(1, len(solved_dates)):

        difference = (
            solved_dates[i]
            - solved_dates[i - 1]
        ).days

        if difference == 1:
            current_streak += 1
        else:
            current_streak = 1

        longest_streak = max(
            longest_streak,
            current_streak
        )

    return {
        "longest_streak": longest_streak
    }
    
@router.get("/monthly-progress")
def get_monthly_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    problems = (
        db.query(Problem)
        .filter(
            Problem.user_id == current_user.id,
            Problem.solved_at != None
        )
        .all()
    )

    monthly_stats = {}

    for problem in problems:

        month_key = (
            problem.solved_at.strftime("%Y-%m")
        )

        monthly_stats[month_key] = (
            monthly_stats.get(month_key, 0) + 1
        )

    return monthly_stats

@router.get("/search")
def search_problems(
    keyword: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    problems = (
        db.query(Problem)
        .filter(
            Problem.user_id == current_user.id,
            Problem.title.ilike(f"%{keyword}%")
        )
        .all()
    )

    return problems

@router.get("/filter")
def filter_problems(
    difficulty: str | None = None,
    topic: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    query = db.query(Problem).filter(
        Problem.user_id == current_user.id
    )

    if difficulty is not None:
        query = query.filter(
            Problem.difficulty == difficulty
        )

    if topic is not None:
        query = query.filter(
            Problem.topic == topic
        )

    if status is not None:
        query = query.filter(
            Problem.status == status
        )

    problems = query.all()

    return problems