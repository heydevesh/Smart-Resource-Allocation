from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class NeedSchema(BaseModel):
    title: str
    category: str
    urgency: str
    lat: float
    lng: float
    status: str = "pending"
    assignedVolunteers: List[str] = []

class TaskSchema(BaseModel):
    title: str
    priority: str
    volunteerIds: List[str] = []
    status: str = "active"
    progress: int = 0
    dueAt: Optional[datetime] = None
    category: str

class VolunteerSchema(BaseModel):
    name: str
    phone: str
    skills: List[str] = []
    availabilitySchedule: str
    tasksCompleted: int = 0
    lat: float
    lng: float

class MatchRequest(BaseModel):
    task_id: str
    task_details: str
