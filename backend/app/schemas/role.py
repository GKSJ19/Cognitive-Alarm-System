import uuid
from pydantic import BaseModel, ConfigDict

class RoleBase(BaseModel):
    name: str
    description: str | None = None

class RoleCreate(RoleBase):
    pass

class RoleResponse(RoleBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
