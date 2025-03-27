from .campeonato import router as campeonato
from .pareja import router as pareja
from .mesa import router as mesa
from .resultados import router as resultados
from .ranking import router as ranking
from .plantilla import router as plantilla

__all__ = [
    "campeonato",
    "pareja",
    "mesa",
    "resultados",
    "ranking",
    "plantilla"
] 