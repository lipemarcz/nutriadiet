# This file makes the app directory a Python package
try:
    # Optional re-export
    from .pt_routes import setup_startup_seed  # noqa: F401
except Exception:
    pass