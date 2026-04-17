from fastapi import APIRouter, HTTPException
from typing import List, Dict
from pydantic import BaseModel
from api.models import NeedSchema, TaskSchema, VolunteerSchema, MatchRequest
from services.gemini_service import smart_match_volunteer

router = APIRouter()

# Temporary in-memory stores replacing direct db calls for prototype
# In a real app, substitute with Firebase Admin SDK queries
mock_needs = {
    "n1": {
        "title": "Medical Supply Shortage",
        "category": "Health",
        "urgency": "critical",
        "lat": 19.0760,
        "lng": 72.8777,
        "status": "pending",
        "assignedVolunteers": []
    }
}
mock_tasks = {
    "t1": {
        "title": "Deliver Bandages to Dharavi",
        "priority": "high",
        "volunteerIds": [],
        "status": "active",
        "progress": 0,
        "dueAt": "2026-04-17T10:00:00Z",
        "category": "Health"
    }
}
mock_volunteers = {
    "v1": {"name": "Alice", "skills": ["Medical", "Driving"], "availabilitySchedule": "Morning"},
    "v2": {"name": "Bob", "skills": ["Logistics", "Heavy Lifting"], "availabilitySchedule": "Afternoon"}
}

@router.get("/needs")
def get_needs():
    return {"needs": mock_needs}

@router.post("/needs")
def create_need(need: NeedSchema):
    need_id = f"need_{len(mock_needs) + 1}"
    mock_needs[need_id] = need.model_dump()
    return {"id": need_id, "message": "Need recorded successfully"}

@router.get("/tasks")
def get_tasks():
    return {"tasks": mock_tasks}

@router.get("/volunteers")
def get_volunteers():
    return {"volunteers": mock_volunteers}

@router.post("/smart-match")
def get_smart_match(request: MatchRequest):
    """
    Triggers Gemini AI to analyze the task and assign the best available volunteer.
    """
    if not mock_volunteers:
        raise HTTPException(status_code=400, detail="No volunteers available")
        
    volunteers_list = [{"id": k, **v} for k, v in mock_volunteers.items()]
    
    # Offload intelligence to Gemini via Service
    ai_result = smart_match_volunteer(request.task_details, volunteers_list)
    return {"matched_data": ai_result}
