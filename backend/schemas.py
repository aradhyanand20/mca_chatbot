from pydantic import BaseModel,EmailStr, Field

class UserCreate(BaseModel):
  email:EmailStr
  password: str = Field(min_length=8)
  full_name: str | None = None

  class UserPublic(BaseModel):
    email: EmailStr
    id: int
    full_name: str | None = None