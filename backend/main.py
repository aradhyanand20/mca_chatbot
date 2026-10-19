from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlmodel import Session
from db import get_session

app = FastAPI()

@app.get("/health")
def health(session: Session= Depends(get_session)):
  session.connection().execute(text("SELECT 1"))
  return{"database": "connected"}