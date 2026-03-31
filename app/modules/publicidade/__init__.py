"""
PUBLICIDADE Module for OpenSquad Integration

This module provides a web interface for operating OpenSquad multi-agent framework.
Access: SUPERADMIN only

Integration Architecture:
- Layer 1: OpenSquad Core (unchanged)
- Layer 2: Node.js Engine Service (opensquad-service)
- Layer 3: Python Backend Integrator (Django Ninja)
- Layer 4: Frontend UI

Usage:
    from app.modules.publicidade.controller import router as publicidade_router
    api.add_router('/admin/publicidade', publicidade_router)
"""

from .controller import router
from .service import PublicidadeService
from .permissions import require_superadmin, is_superadmin
from .logs import PublicidadeLogs

__all__ = [
    'router',
    'PublicidadeService',
    'require_superadmin',
    'is_superadmin',
    'PublicidadeLogs',
]
