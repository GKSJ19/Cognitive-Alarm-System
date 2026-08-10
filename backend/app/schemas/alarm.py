from pydantic import BaseModel


class AlarmCreate(BaseModel):
    user_id: int
    title: str
    alarm_time: str
    challenge_type: str
    difficulty: str = "easy"


class AlarmResponse(BaseModel):
    id: int
    user_id: int
    title: str
    alarm_time: str
    challenge_type: str
    difficulty: str
    is_active: bool