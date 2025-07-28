// Módulo de navegación
class Navigation {
    constructor() {
        this.currentScreen = 'loginScreen';
        this.screenHistory = [];
        this.init();
    }

    // Inicializar navegación
    init() {
        this.setupGlobalFunctions();
    }

    // Configurar funciones globales de navegación
    setupGlobalFunctions() {
        window.showLogin = () => this.showScreen('loginScreen');
        window.showRegister = () => this.showScreen('registerScreen');
        window.showDashboard = () => this.showScreen('dashboardScreen');
        window.showMascotas = () => this.showScreen('mascotasScreen');
        window.showAddMascota = () => this.showScreen('addMascotaScreen');
        window.showCitas = () => this.showScreen('citasScreen');
        window.showAddCita = () => this.showScreen('addCitaScreen');
        window.showHistoriales = () => this.showScreen('historialesScreen');
        window.showPerfil = () => this.showScreen('perfilScreen');
        window.showUsuarios = () => this.showScreen('usuariosScreen');
    }

    // Mostrar una pantalla específica
    showScreen(screenId) {
        // Verificar autenticación para pantallas protegidas
        if (this.isProtectedScreen(screenId) && !auth.getIsAuthenticated()) {
            showToast('Debes iniciar sesión para acceder a esta sección', 'error');
            this.showScreen('loginScreen');
            return;
        }

        // Verificar permisos para pantallas específicas
        if (!this.hasPermissionForScreen(screenId)) {
            showToast('No tienes permisos para acceder a esta sección', 'error');
            return;
        }

        // Ocultar todas las pantallas
        this.hideAllScreens();

        // Mostrar la pantalla solicitada
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenId;
            
            // Agregar a historial
            this.addToHistory(screenId);
            
            // Cargar datos específicos de la pantalla
            this.loadScreenData(screenId);
            
            // Scroll al top
            screen.scrollTop = 0;
        } else {
            console.error(`Pantalla no encontrada: ${screenId}`);
        }
    }

    // Ocultar todas las pantallas
    hideAllScreens() {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
    }

    // Verificar si una pantalla requiere autenticación
    isProtectedScreen(screenId) {
        const protectedScreens = [
            'dashboardScreen',
            'mascotasScreen',
            'addMascotaScreen',
            'citasScreen',
            'addCitaScreen',
            'historialesScreen',
            'perfilScreen',
            'usuariosScreen'
        ];
        
        return protectedScreens.includes(screenId);
    }

    // Verificar permisos para una pantalla específica
    hasPermissionForScreen(screenId) {
        if (!auth.getIsAuthenticated()) {
            return false;
        }

        const userRole = auth.getUserRole();

        // Pantallas específicas por rol
        const rolePermissions = {
            [CONFIG.ROLES.ADMIN]: [
                'dashboardScreen',
                'mascotasScreen',
                'addMascotaScreen',
                'citasScreen',
                'addCitaScreen',
                'historialesScreen',
                'perfilScreen',
                'usuariosScreen'
            ],
            [CONFIG.ROLES.VETERINARIO]: [
                'dashboardScreen',
                'mascotasScreen',
                'citasScreen',
                'addCitaScreen',
                'historialesScreen',
                'perfilScreen'
            ],
            [CONFIG.ROLES.RECEPCIONISTA]: [
                'dashboardScreen',
                'mascotasScreen',
                'citasScreen',
                'addCitaScreen',
                'perfilScreen',
                'usuariosScreen'
            ],
            [CONFIG.ROLES.CLIENTE]: [
                'dashboardScreen',
                'mascotasScreen',
                'addMascotaScreen',
                'citasScreen',
                'addCitaScreen',
                'perfilScreen'
            ]
        };

        const allowedScreens = rolePermissions[userRole] || [];
        return allowedScreens.includes(screenId);
    }

    // Agregar pantalla al historial
    addToHistory(screenId) {
        // No agregar la misma pantalla consecutivamente
        if (this.screenHistory[this.screenHistory.length - 1] !== screenId) {
            this.screenHistory.push(screenId);
        }
        
        // Mantener solo las últimas 10 pantallas
        if (this.screenHistory.length > 10) {
            this.screenHistory.shift();
        }
    }

    // Ir a la pantalla anterior
    goBack() {
        if (this.screenHistory.length > 1) {
            this.screenHistory.pop(); // Remover pantalla actual
            const previousScreen = this.screenHistory[this.screenHistory.length - 1];
            this.showScreen(previousScreen);
        } else {
            // Si no hay historial, ir al dashboard
            this.showScreen('dashboardScreen');
        }
    }

    // Cargar datos específicos de cada pantalla
    loadScreenData(screenId) {
        switch (screenId) {
            case 'dashboardScreen':
                this.loadDashboardData();
                break;
            case 'mascotasScreen':
                this.loadMascotasData();
                break;
            case 'citasScreen':
                this.loadCitasData();
                break;
            case 'historialesScreen':
                this.loadHistorialesData();
                break;
            case 'usuariosScreen':
                this.loadUsuariosData();
                break;
            case 'addCitaScreen':
                this.loadAddCitaData();
                break;
        }
    }

    // Cargar datos del dashboard
    async loadDashboardData() {
        try {
            // Aquí podrías cargar estadísticas o información resumida
            console.log('Dashboard cargado');
        } catch (error) {
            console.error('Error cargando dashboard:', error);
        }
    }

    // Cargar datos de mascotas
    async loadMascotasData() {
        try {
            const mascotas = await api.getMascotas();
            displayMascotas(mascotas.mascotas || []);
        } catch (error) {
            console.error('Error cargando mascotas:', error);
            api.handleNetworkError(error);
        }
    }

    // Cargar datos de citas
    async loadCitasData() {
        try {
            const citas = await api.getCitas();
            displayCitas(citas.citas || []);
        } catch (error) {
            console.error('Error cargando citas:', error);
            api.handleNetworkError(error);
        }
    }

    // Cargar datos de historiales
    async loadHistorialesData() {
        try {
            const historiales = await api.getHistoriales();
            displayHistoriales(historiales.historiales || []);
        } catch (error) {
            console.error('Error cargando historiales:', error);
            api.handleNetworkError(error);
        }
    }

    // Cargar datos de usuarios
    async loadUsuariosData() {
        try {
            if (!auth.isAdmin()) {
                showToast('No tienes permisos para ver usuarios', 'error');
                return;
            }
            
            const usuarios = await api.getUsers();
            displayUsuarios(usuarios.usuarios || []);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            api.handleNetworkError(error);
        }
    }

    // Cargar datos para agregar cita
    async loadAddCitaData() {
        try {
            const mascotas = await api.getMascotas();
            const mascotasSelect = document.getElementById('citaMascota');
            
            if (mascotasSelect) {
                mascotasSelect.innerHTML = '<option value="">Selecciona mascota</option>';
                
                const mascotasList = mascotas.mascotas || [];
                mascotasList.forEach(mascota => {
                    const option = document.createElement('option');
                    option.value = mascota._id;
                    option.textContent = `${mascota.nombre} (${mascota.especie})`;
                    mascotasSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error cargando mascotas para cita:', error);
            api.handleNetworkError(error);
        }
    }

    // Obtener pantalla actual
    getCurrentScreen() {
        return this.currentScreen;
    }

    // Obtener historial de pantallas
    getScreenHistory() {
        return [...this.screenHistory];
    }

    // Verificar si se puede ir hacia atrás
    canGoBack() {
        return this.screenHistory.length > 1;
    }

    // Navegar a una pantalla específica con parámetros
    navigateTo(screenId, params = {}) {
        // Guardar parámetros en sessionStorage
        if (Object.keys(params).length > 0) {
            sessionStorage.setItem('navigation_params', JSON.stringify(params));
        }
        
        this.showScreen(screenId);
    }

    // Obtener parámetros de navegación
    getNavigationParams() {
        const params = sessionStorage.getItem('navigation_params');
        if (params) {
            sessionStorage.removeItem('navigation_params');
            return JSON.parse(params);
        }
        return {};
    }

    // Limpiar historial de navegación
    clearHistory() {
        this.screenHistory = [];
    }

    // Refrescar pantalla actual
    refreshCurrentScreen() {
        this.loadScreenData(this.currentScreen);
    }
}

// Crear instancia global de navegación
const navigation = new Navigation();

// Función global para ir hacia atrás
window.goBack = () => navigation.goBack();

// Exportar para uso global
window.navigation = navigation; 