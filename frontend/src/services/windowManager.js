// Servicio para manejar ventanas secundarias
class WindowManager {
    constructor() {
        // Almacena la referencia a la ventana secundaria
        this.secondWindow = null;
        // Almacena la última URL mostrada
        this.currentUrl = null;
    }

    // Abre una nueva ventana o actualiza la existente
    openSecondWindow(url, title = 'Segunda Pantalla') {
        // Si la ventana ya existe y no está cerrada
        if (this.secondWindow && !this.secondWindow.closed) {
            // Si la URL es diferente, navegar a ella
            if (this.currentUrl !== url) {
                this.secondWindow.location.href = url;
                this.currentUrl = url;
            }
        } else {
            // Abrir nueva ventana
            const width = 1024;
            const height = 768;
            const left = window.screen.width;
            const top = 0;

            this.secondWindow = window.open(
                url,
                title,
                `width=${width},height=${height},left=${left},top=${top}`
            );
            this.currentUrl = url;
        }

        // Asegurarse de que la ventana tenga el foco
        if (this.secondWindow) {
            this.secondWindow.focus();
        }

        return this.secondWindow;
    }

    // Cierra la ventana secundaria si está abierta
    closeSecondWindow() {
        if (this.secondWindow && !this.secondWindow.closed) {
            this.secondWindow.close();
        }
        this.secondWindow = null;
        this.currentUrl = null;
    }

    // Verifica si la ventana secundaria está abierta
    isSecondWindowOpen() {
        return this.secondWindow && !this.secondWindow.closed;
    }

    // Obtiene la URL actual de la ventana secundaria
    getCurrentUrl() {
        return this.currentUrl;
    }
}

// Exportar una única instancia para toda la aplicación
export const windowManager = new WindowManager(); 