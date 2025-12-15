# Database Models
from .user import User
from .barbershop import Barbershop
from .barber import Barber
from .client import Client
from .service import Service
from .appointment import Appointment
from .commission import Commission, CommissionType
from .product import Product
from .barber_block import BarberBlock

# Garantir que todos os modelos sejam importados para o SQLAlchemy
__all__ = [
    "User",
    "Barbershop", 
    "Barber",
    "Client",
    "Service",
    "Appointment",
    "Commission",
    "CommissionType",
    "Product",
    "BarberBlock"
] 