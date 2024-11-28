from .campeonato import router as campeonato
from .pareja import router as pareja
from .mesa import router as mesa
from .resultado import router as resultado
from .ranking import router as ranking

__all__ = [
    "campeonato",
    "pareja",
    "mesa",
    "resultado",
    "ranking"
] 