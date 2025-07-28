// Módulo principal de la aplicación
class App {
    constructor() {
        this.init();
    }

    init() {
        this.setupGlobalFunctions();
        this.setupEventListeners();
        this.hideLoadingScreen();
    }

    setupGlobalFunctions() {
        // Funciones globales de utilidad
        window.showLoading = this.showLoading;
        window.hideLoading = this.hideLoading;
        window.showToast = this.showToast;
        window.loadProfile = this.loadProfile;
        window.editProfile = this.editProfile;
    }

    setupEventListeners() {
        // Cerrar modales al hacer clic fuera de ellos
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Prevenir que se cierren los modales al hacer clic dentro del contenido
        document.querySelectorAll('.modal-content').forEach(modal => {
            modal.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });

        // Manejar filtros
        const citasFilter = document.getElementById('citas-filter');
        if (citasFilter) {
            citasFilter.addEventListener('change', () => {
                citasManager.renderCitas();
            });
        }

        const usuariosFilter = document.getElementById('usuarios-filter');
        if (usuariosFilter) {
            usuariosFilter.addEventListener('change', () => {
                usuariosManager.renderUsuarios();
            });
        }
    }

    hideLoadingScreen() {
        // Ocultar pantalla de carga después de un tiempo mínimo
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
        }, 1500);
    }

    showLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        toastContainer.appendChild(toast);

        // Auto-remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, CONFIG.TOAST_DURATION);
    }

    getToastIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    async loadProfile() {
        try {
            const userData = localStorage.getItem(CONFIG.USER_KEY);
            if (!userData) return;

            const user = JSON.parse(userData);
            const perfilInfo = document.getElementById('perfil-info');
            
            if (!perfilInfo) return;

            perfilInfo.innerHTML = `
                <div class="profile-section">
                    <h3>Información Personal</h3>
                    <div class="profile-field">
                        <label>Nombre:</label>
                        <span>${user.nombre}</span>
                    </div>
                    <div class="profile-field">
                        <label>Email:</label>
                        <span>${user.email}</span>
                    </div>
                    <div class="profile-field">
                        <label>Teléfono:</label>
                        <span>${user.telefono || 'No especificado'}</span>
                    </div>
                    <div class="profile-field">
                        <label>Dirección:</label>
                        <span>${user.direccion || 'No especificada'}</span>
                    </div>
                    <div class="profile-field">
                        <label>Rol:</label>
                        <span class="role-badge" style="background-color: ${this.getRoleColor(user.rol)}">
                            ${user.rol}
                        </span>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    getRoleColor(role) {
        const colors = {
            'admin': '#dc3545',
            'veterinario': '#17a2b8',
            'recepcionista': '#6f42c1',
            'cliente': '#28a745'
        };
        return colors[role] || '#6c757d';
    }

    editProfile() {
        showToast('Función de edición de perfil en desarrollo', 'info');
    }
}

// Crear instancia global de la aplicación
const app = new App();

// Funciones globales adicionales
window.showLoading = app.showLoading.bind(app);
window.hideLoading = app.hideLoading.bind(app);
window.showToast = app.showToast.bind(app);
window.loadProfile = app.loadProfile.bind(app);
window.editProfile = app.editProfile.bind(app);

// Exportar para uso global
window.app = app; 