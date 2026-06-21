from app.routers.auth import router as auth_router

from fastapi import FastAPI

from app.database.base import Base
from app.database.session import engine

import app.models

from app.routers.users import router as users_router

from app.models.problem import Problem

from app.routers.problems import router as problems_router

from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Leetcode Tracker API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

app.include_router(users_router)

app.include_router(problems_router)

@app.get("/")
def root():
    return {
        "message": "API Running"
    }