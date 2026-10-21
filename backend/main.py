from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlmodel import Session, SQLModel
from models import User
from db import get_session, engine

SQLModel.metadata.create_all(engine)
app = FastAPI()

@app.get("/health")
def health(session: Session= Depends(get_session)):
  session.connection().execute(text("SELECT 1"))
  return{"database": "connected"}

@app.post("/test-user")
def create_test_user(session: Session = Depends(get_session)):
  user = User(email="sqlmodel-test@example.com")
  session.add(user)
  session.commit()
  session.refresh(user)
  return {"id":user.id, "email":user.email}