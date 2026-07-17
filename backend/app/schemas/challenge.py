from pydantic import BaseModel


class ChallengeAnswer(BaseModel):
    correct_answer: str
    user_answer: str