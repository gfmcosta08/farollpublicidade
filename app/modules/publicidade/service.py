import httpx
from typing import Optional, List, Dict, Any
import os

OPENSQUAD_SERVICE_URL = os.environ.get('OPENSQUAD_SERVICE_URL', 'http://localhost:3001')
TIMEOUT = 60.0


class PublicidadeService:
    
    @staticmethod
    async def _call(method: str, path: str, **kwargs) -> Dict:
        async with httpx.AsyncClient(base_url=OPENSQUAD_SERVICE_URL, timeout=TIMEOUT) as client:
            func = getattr(client, method)
            response = await func(path, **kwargs)
            response.raise_for_status()
            return response.json()
    
    @staticmethod
    async def health_check() -> Dict:
        return await PublicidadeService._call('get', '/health')
    
    @staticmethod
    async def list_squads() -> List[Dict]:
        data = await PublicidadeService._call('get', '/squads')
        return data.get('squads', [])
    
    @staticmethod
    async def get_squad(squad_id: str) -> Dict:
        data = await PublicidadeService._call('get', f'/squads/{squad_id}')
        return data.get('squad', {})
    
    @staticmethod
    async def run_squad(squad_name: str, input_data: Optional[Dict] = None) -> Dict:
        return await PublicidadeService._call('post', '/squads/run', json={
            'squadName': squad_name,
            'input': input_data or {}
        })
    
    @staticmethod
    async def get_execution(execution_id: str) -> Dict:
        return await PublicidadeService._call('get', f'/squads/run/{execution_id}')
    
    @staticmethod
    async def list_skills() -> List[Dict]:
        data = await PublicidadeService._call('get', '/skills')
        return data.get('skills', [])
    
    @staticmethod
    async def install_skill(skill_name: str) -> Dict:
        return await PublicidadeService._call('post', '/skills/install', json={'skillName': skill_name})
    
    @staticmethod
    async def uninstall_skill(skill_name: str) -> Dict:
        return await PublicidadeService._call('delete', f'/skills/{skill_name}')
    
    @staticmethod
    async def get_logs(limit: int = 50, offset: int = 0) -> List[Dict]:
        data = await PublicidadeService._call('get', '/logs', params={'limit': limit, 'offset': offset})
        return data.get('logs', [])
    
    @staticmethod
    async def get_log(execution_id: str) -> Dict:
        return await PublicidadeService._call('get', f'/logs/{execution_id}')
    
    @staticmethod
    async def get_dashboard(squad_name: str) -> Dict:
        return await PublicidadeService._call('get', '/dashboard', params={'squadName': squad_name})
    
    @staticmethod
    async def get_dashboard_url(squad_name: str) -> Dict:
        return await PublicidadeService._call('get', '/dashboard/url', params={'squadName': squad_name})
    
    @staticmethod
    def get_service_url() -> str:
        return OPENSQUAD_SERVICE_URL
