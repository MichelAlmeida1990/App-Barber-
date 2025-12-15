from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Product(Base):
    """
    Modelo de produto para venda na barbearia.
    """
    __tablename__ = "products"
    
    # === IDENTIFICAÇÃO ===
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # === PREÇO E ESTOQUE ===
    price = Column(Float, nullable=False)
    cost_price = Column(Float, nullable=True)  # Preço de custo
    stock_quantity = Column(Integer, default=0)
    min_stock = Column(Integer, default=5)  # Estoque mínimo
    
    # === STATUS ===
    is_active = Column(Boolean, default=True)
    
    # === TIMESTAMPS ===
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # === RELACIONAMENTOS ===
    commissions = relationship("Commission", back_populates="product")
    
    def __repr__(self):
        return f"<Product(id={self.id}, name='{self.name}', price={self.price})>"
    
    @property
    def formatted_price(self) -> str:
        """Preço formatado"""
        return f"R$ {self.price:.2f}"
    
    @property
    def stock_status(self) -> str:
        """Status do estoque"""
        if self.stock_quantity <= 0:
            return "Sem estoque"
        elif self.stock_quantity <= self.min_stock:
            return "Estoque baixo"
        else:
            return "Em estoque"
    
    @property
    def is_low_stock(self) -> bool:
        """Verifica se o estoque está baixo"""
        return self.stock_quantity <= self.min_stock 