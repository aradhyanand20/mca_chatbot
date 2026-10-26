from fastapi import FastAPI, Depends, HTTPException,status
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text
from sqlmodel import Session, SQLModel, select
from models import User
from db import get_session, engine
from schemas import UserCreate, UserPublic, UserLogin
from security import hash_password, verify_password,  create_access_token, decode_access_token
from security import decode_access_token
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError


SQLModel.metadata.create_all(engine)
app = FastAPI()

oauth2_scheme =  OAuth2PasswordBearer(tokenUrl="/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
    )-> User: 
  credential_error =  HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED
    detail="COULD NOT VALIDATE",
    headers={"WWW-Authenticate": "Bearer"}
  )
  try:
    payload = decode_access_token(token)
    user_id =int(payload["sub"])
  except(InvalidTokenError, KeyError, TypeError,ValueError):
    raise credential_error

  user = session.get(User, user_id)

  if user is None:
    raise credential_error

  return user


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

@app.post("/login")
def login_user(
  data:UserLogin,
  session: Session = Depends(get_session),
):
  user = session.exec(
    select(User).where(User.email == data.email)
  ).first()

  if user is None or user.hashed_password is None:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail= "Invalid email or password"
    )

  if not verify_password(data.password, user.hashed_password):
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail= "Invalid password or email"
    )

  access_token= create_access_token(user.id)

  return{
    "access_token": access_token,
    "token_type": "bearer",
  }
