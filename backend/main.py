from fastapi import FastAPI, Depends, HTTPException,status
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text
from sqlmodel import Session, SQLModel, select
from models import User
from db import get_session, engine
from schemas import UserCreate, UserPublic
from security import hash_password

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

@app.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED,)
def register_User(data:UserCreate,session: Session= Depends(get_session),):
  existing_user= session.exec(
    select(User).where(User.email == data.email)).first()

  if existing_user:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT, detail="Email already exist"
    )

  user = User(
    email = data.email,
    full_name= data.full_name,
    hashed_password=hash_password(data.password)
  )

  session.add(user)
  try:
    session.commit()
  except IntegrityError:
    session.rollback()
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="Email already registered"
    )

  session.refresh(user)

  if user.id is None:
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="User was created, but the ID was not generated",
    )

  return UserPublic(
    id = user.id,
    email= user.email,
    full_name=user.full_name
  )