// Importar todos los componentes
import ElementoArrastrable from './ElementoArrastrable.vue';
import ElementoLogo from './ElementoLogo.vue';
import ElementoTexto from './ElementoTexto.vue';
import ControladorLateral from './ControladorLateral.vue';
import BotonesAccion from './BotonesAccion.vue';
import VisualizadorPlantilla from './VisualizadorPlantilla.vue';

// Exportar componentes individualmente
export {
  ElementoArrastrable,
  ElementoLogo,
  ElementoTexto,
  ControladorLateral,
  BotonesAccion,
  VisualizadorPlantilla
};

// Exportar un objeto con todos los componentes para registro global
export default {
  install(app) {
    app.component('ElementoArrastrable', ElementoArrastrable);
    app.component('ElementoLogo', ElementoLogo);
    app.component('ElementoTexto', ElementoTexto);
    app.component('ControladorLateral', ControladorLateral);
    app.component('BotonesAccion', BotonesAccion);
    app.component('VisualizadorPlantilla', VisualizadorPlantilla);
  }
}; 