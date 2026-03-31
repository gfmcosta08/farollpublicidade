def register_publicidade_api(api):
    """
    Register Publicidade endpoints to the main Ninja API.
    Call this in your main api.py:
    
    from app.modules.publicidade.controller import router as publicidade_router
    api.add_router('/admin/publicidade', publicidade_router)
    """
    from .controller import router
    api.add_router('/admin/publicidade', router)

def init_publicidade(app):
    """
    Initialize Publicidade module.
    """
    return app
