from datetime import datetime
from typing import Optional, List, Dict, Any
import json
import os

LOG_FILE = os.environ.get('PUBLICIDADE_LOG_FILE', 'logs/publicidade_admin.json')


class PublicidadeLogs:
    
    @staticmethod
    def _ensure_log_dir():
        log_dir = os.path.dirname(LOG_FILE)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir, exist_ok=True)
    
    @staticmethod
    def _read_logs() -> List[Dict]:
        PublicidadeLogs._ensure_log_dir()
        if not os.path.exists(LOG_FILE):
            return []
        try:
            with open(LOG_FILE, 'r') as f:
                return json.load(f)
        except:
            return []
    
    @staticmethod
    def _write_logs(logs: List[Dict]):
        PublicidadeLogs._ensure_log_dir()
        with open(LOG_FILE, 'w') as f:
            json.dump(logs, f, indent=2)
    
    @staticmethod
    def log_action(admin_id: int, admin_email: str, action: str, details: Dict[str, Any]):
        logs = PublicidadeLogs._read_logs()
        entry = {
            "id": len(logs) + 1,
            "timestamp": datetime.utcnow().isoformat(),
            "admin_id": admin_id,
            "admin_email": admin_email,
            "action": action,
            "details": details
        }
        logs.insert(0, entry)
        PublicidadeLogs._write_logs(logs[:1000])
        return entry
    
    @staticmethod
    def log_squad_execution(admin_id: int, admin_email: str, squad_name: str, execution_id: str, status: str):
        return PublicidadeLogs.log_action(admin_id, admin_email, "squad_execution", {
            "squad_name": squad_name,
            "execution_id": execution_id,
            "status": status
        })
    
    @staticmethod
    def log_skill_install(admin_id: int, admin_email: str, skill_name: str, success: bool):
        return PublicidadeLogs.log_action(admin_id, admin_email, "skill_install", {
            "skill_name": skill_name,
            "success": success
        })
    
    @staticmethod
    def log_view(admin_id: int, admin_email: str, resource: str):
        return PublicidadeLogs.log_action(admin_id, admin_email, "view", {
            "resource": resource
        })
    
    @staticmethod
    def get_logs(limit: int = 100, offset: int = 0) -> List[Dict]:
        logs = PublicidadeLogs._read_logs()
        return logs[offset:offset+limit]
    
    @staticmethod
    def get_logs_by_admin(admin_id: int, limit: int = 50) -> List[Dict]:
        logs = PublicidadeLogs._read_logs()
        admin_logs = [log for log in logs if log.get("admin_id") == admin_id]
        return admin_logs[:limit]
