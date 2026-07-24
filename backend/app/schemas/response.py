from pydantic import BaseModel

class UserResponse(BaseModel):
    user_id: int
    challenge: str
    difficulty: str
    question: str
    user_answer: str
    correct: bool