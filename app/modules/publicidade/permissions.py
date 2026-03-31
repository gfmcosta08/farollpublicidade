from typing import Optional

def is_superadmin(admin) -> bool:
    if admin is None:
        return False
    if hasattr(admin, 'is_superuser'):
        return admin.is_superuser
    if hasattr(admin, 'is_superadmin'):
        return admin.is_superadmin
    if isinstance(admin, dict):
        return admin.get('is_superadmin', False)
    return False

def get_admin_id(admin) -> int:
    if admin is None:
        return 0
    if hasattr(admin, 'id'):
        return admin.id
    if isinstance(admin, dict):
        return admin.get('id', 0)
    return 0

def get_admin_email(admin) -> str:
    if admin is None:
        return 'unknown'
    if hasattr(admin, 'email'):
        return admin.email
    if isinstance(admin, dict):
        return admin.get('email', 'unknown')
    return 'unknown'

def require_superadmin(func):
    """
    Decorator to require superadmin access.
    Integration point - adapt to your existing auth system.
    """
    from functools import wraps
    
    @wraps(func)
    async def wrapper(request, *args, **kwargs):
        # Get current user from request
        # This integrates with your existing auth
        admin = getattr(request, 'auth', None)
        
        if not is_superadmin(admin):
            from ninja import HttpResponse
            return HttpResponse(status=403, content='{"error": "Superadmin access required"}')
        
        return await func(request, *args, **kwargs)
    
    return wrapper
