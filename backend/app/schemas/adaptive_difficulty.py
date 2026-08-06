from pydantic import BaseModel

class AdaptiveDifficultyCreate(BaseModel):
    user_id: int
    success_rate: float
    current_level: str

class AdaptiveDifficultyResponse(BaseModel):
    id: int
    user_id: int
    success_rate: float
    current_level: str
    next_level: str

    class Config:
        from_attributes = True