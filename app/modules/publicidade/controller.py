from ninja import Router, HttpResponse
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

from .service import PublicidadeService
from .permissions import require_superadmin, is_superadmin, get_admin_id, get_admin_email
from .logs import PublicidadeLogs

router = Router(tags=['publicidade'])

# --- Schemas ---

class SquadRunIn(BaseModel):
    squadName: str
    input: Optional[Dict[str, Any]] = None

class SquadRunOut(BaseModel):
    executionId: str
    message: str
    status: str

class SquadOut(BaseModel):
    name: str
    description: Optional[str] = ""
    agents: Optional[List[Dict]] = []
    tasks: Optional[List[Dict]] = []
    hasDashboard: bool = False
    lastRun: Optional[str] = None

class SquadsOut(BaseModel):
    squads: List[SquadOut]
    total: int

class ExecutionOut(BaseModel):
    id: str
    squadName: str
    status: str
    startedAt: str
    finishedAt: Optional[str] = None
    duration: Optional[int] = None
    logs: Optional[List[Dict]] = []
    result: Optional[Dict] = None
    error: Optional[str] = None

class SkillOut(BaseModel):
    name: str
    description: Optional[str] = None
    version: Optional[str] = None

class SkillsOut(BaseModel):
    skills: List[SkillOut]
    total: int

class LogEntry(BaseModel):
    id: int
    timestamp: str
    admin_id: int
    admin_email: str
    action: str
    details: Dict[str, Any]

class LogsOut(BaseModel):
    logs: List[LogEntry]
    total: int

class DashboardOut(BaseModel):
    squadName: str
    dashboardPath: Optional[str] = None
    exists: bool = False

class DashboardStats(BaseModel):
    total_squads: int
    recent_executions: List[Dict]
    recent_errors: List[Dict]
    stats: Dict[str, int]

# --- Endpoints ---

@router.get('/health')
def health(request):
    try:
        import asyncio
        result = asyncio.run(PublicidadeService.health_check())
        return {'status': 'ok', 'service': 'publicidade', 'opensquad_service': result}
    except Exception as e:
        return {'status': 'error', 'service': 'publicidade', 'opensquad_service_error': str(e)}


@router.get('/dashboard', response=DashboardStats)
@require_superadmin
async def get_dashboard(request):
    admin = getattr(request, 'auth', None)
    admin_id = get_admin_id(admin)
    admin_email = get_admin_email(admin)
    
    squads = await PublicidadeService.list_squads()
    executions = await PublicidadeService.get_logs(limit=10)
    recent_errors = [e for e in executions if e.get('status') == 'error']
    
    PublicidadeLogs.log_view(admin_id, admin_email, 'dashboard')
    
    return {
        'total_squads': len(squads),
        'recent_executions': executions[:5],
        'recent_errors': recent_errors,
        'stats': {
            'total_squads': len(squads),
            'running': len([e for e in executions if e.get('status') == 'running']),
            'completed': len([e for e in executions if e.get('status') == 'success']),
            'failed': len([e for e in executions if e.get('status') in ['error', 'failed']])
        }
    }


@router.get('/squads', response=SquadsOut)
@require_superadmin
async def list_squads(request):
    admin = getattr(request, 'auth', None)
    PublicidadeLogs.log_view(get_admin_id(admin), get_admin_email(admin), 'squads')
    
    squads = await PublicidadeService.list_squads()
    return {'squads': squads, 'total': len(squads)}


@router.get('/squads/{squad_id}', response=SquadOut)
@require_superadmin
async def get_squad(request, squad_id: str):
    admin = getattr(request, 'auth', None)
    PublicidadeLogs.log_view(get_admin_id(admin), get_admin_email(admin), f'squad/{squad_id}')
    
    squad = await PublicidadeService.get_squad(squad_id)
    return squad


@router.post('/squads/run', response=SquadRunOut)
@require_superadmin
async def run_squad(request, data: SquadRunIn):
    admin = getattr(request, 'auth', None)
    admin_id = get_admin_id(admin)
    admin_email = get_admin_email(admin)
    
    result = await PublicidadeService.run_squad(data.squadName, data.input)
    
    execution_id = result.get('executionId', 'unknown')
    PublicidadeLogs.log_squad_execution(admin_id, admin_email, data.squadName, execution_id, 'started')
    
    return result


@router.get('/squads/execution/{execution_id}', response=ExecutionOut)
@require_superadmin
async def get_execution(request, execution_id: str):
    admin = getattr(request, 'auth', None)
    PublicidadeLogs.log_view(get_admin_id(admin), get_admin_email(admin), f'execution/{execution_id}')
    
    execution = await PublicidadeService.get_execution(execution_id)
    return execution.get('execution', {})


@router.get('/skills', response=SkillsOut)
@require_superadmin
async def list_skills(request):
    admin = getattr(request, 'auth', None)
    PublicidadeLogs.log_view(get_admin_id(admin), get_admin_email(admin), 'skills')
    
    skills = await PublicidadeService.list_skills()
    return {'skills': skills, 'total': len(skills)}


@router.post('/skills/install')
@require_superadmin
async def install_skill(request, skillName: str):
    admin = getattr(request, 'auth', None)
    admin_id = get_admin_id(admin)
    admin_email = get_admin_email(admin)
    
    result = await PublicidadeService.install_skill(skillName)
    
    success = result.get('success', False)
    PublicidadeLogs.log_skill_install(admin_id, admin_email, skillName, success)
    
    return result


@router.delete('/skills/{skill_name}')
@require_superadmin
async def uninstall_skill(request, skill_name: str):
    admin = getattr(request, 'auth', None)
    admin_id = get_admin_id(admin)
    admin_email = get_admin_email(admin)
    
    result = await PublicidadeService.uninstall_skill(skill_name)
    
    success = result.get('success', False)
    PublicidadeLogs.log_skill_install(admin_id, admin_email, f"{skill_name} (uninstall)", success)
    
    return result


@router.get('/logs', response=LogsOut)
@require_superadmin
async def get_logs(request, limit: int = 100, offset: int = 0):
    logs = PublicidadeLogs.get_logs(limit=limit, offset=offset)
    return {'logs': logs, 'total': len(logs)}


@router.get('/logs/execution/{execution_id}')
@require_superadmin
async def get_execution_logs(request, execution_id: str):
    admin = getattr(request, 'auth', None)
    PublicidadeLogs.log_view(get_admin_id(admin), get_admin_email(admin), f'logs/{execution_id}')
    
    logs = await PublicidadeService.get_log(execution_id)
    return logs


@router.get('/dashboard/{squad_name}', response=DashboardOut)
@require_superadmin
async def get_squad_dashboard(request, squad_name: str):
    admin = getattr(request, 'auth', None)
    PublicidadeLogs.log_view(get_admin_id(admin), get_admin_email(admin), f'dashboard/{squad_name}')
    
    dashboard = await PublicidadeService.get_dashboard(squad_name)
    return dashboard


@router.get('/dashboard/{squad_name}/url')
@require_superadmin
async def get_squad_dashboard_url(request, squad_name: str):
    admin = getattr(request, 'auth', None)
    PublicidadeLogs.log_view(get_admin_id(admin), get_admin_email(admin), f'dashboard_url/{squad_name}')
    
    url_info = await PublicidadeService.get_dashboard_url(squad_name)
    return url_info


@router.get('/service-url')
def get_service_url(request):
    return {'url': PublicidadeService.get_service_url()}
