# Database Models
from .user import User
from .barbershop import Barbershop
from .barber import Barber
from .client import Client
from .service import Service
from .appointment import Appointment

# Garantir que todos os modelos sejam importados para o SQLAlchemy
__all__ = [
    "User",
    "Barbershop", 
    "Barber",
    "Client",
    "Service",
    "Appointment"
] 