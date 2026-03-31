from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class SquadRunRequest(BaseModel):
    squadName: str = Field(..., min_length=1)
    input: Optional[Dict[str, Any]] = None

class SkillInstallRequest(BaseModel):
    skillName: str = Field(..., min_length=1)

class DashboardQuery(BaseModel):
    squadName: str = Field(..., min_length=1)

class SquadResponse(BaseModel):
    name: str
    description: Optional[str] = ""
    agents: Optional[List[Dict]] = []
    tasks: Optional[List[Dict]] = []
    hasDashboard: bool = False
    lastRun: Optional[str] = None
    createdAt: Optional[str] = None

class SquadListResponse(BaseModel):
    squads: List[SquadResponse]
    total: int

class ExecutionResponse(BaseModel):
    id: str
    squadName: str
    status: str
    startedAt: str
    finishedAt: Optional[str] = None
    duration: Optional[int] = None
    logs: Optional[List[Dict]] = []
    result: Optional[Dict] = None
    error: Optional[str] = None

class SkillResponse(BaseModel):
    name: str
    description: Optional[str] = None
    version: Optional[str] = None

class SkillListResponse(BaseModel):
    skills: List[SkillResponse]

class LogEntry(BaseModel):
    id: int
    timestamp: str
    admin_id: int
    admin_email: str
    action: str
    details: Dict[str, Any]

class LogListResponse(BaseModel):
    logs: List[LogEntry]
    total: int

class DashboardInfo(BaseModel):
    squadName: str
    dashboardPath: Optional[str] = None
    exists: bool = False
    html: Optional[str] = None
    message: Optional[str] = None
