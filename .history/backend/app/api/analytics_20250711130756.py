from fastapi import APIRouter, Depends
from datetime import datetime
from app.api.auth import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.get("/test")
async def test_analytics():
    return {"message": "📊 API de Analytics funcionando!", "timestamp": datetime.utcnow().isoformat()}

@router.get("/dashboard")
async def get_dashboard(current_user: User = Depends(get_current_active_user)):
    return {"message": "Dashboard analytics (em implementação)"} 