// Módulo de navegación
class NavigationManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.history = [];
        this.maxHistory = 10;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardNavigation();
    }

    setupEventListeners() {
        // Navegación por botones
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-nav]')) {
                e.preventDefault();
                const section = e.target.dataset.nav;
                this.navigateTo(section);
            }
        });

        // Navegación por enlaces
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const section = e.target.getAttribute('href').substring(1);
                this.navigateTo(section);
            }
        });

        // Botón atrás del navegador
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.section) {
                this.showSection(e.state.section, false);
            }
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Navegación con teclas
            switch (e.key) {
                case 'Escape':
                    this.handleEscape();
                    break;
                case 'Backspace':
                    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                        this.goBack();
                    }
                    break;
            }
        });
    }

    navigateTo(section, addToHistory = true) {
        if (addToHistory) {
            this.addToHistory(this.currentSection);
            this.updateURL(section);
        }
        
        this.showSection(section);
    }

    showSection(section, updateHistory = true) {
        try {
            // Ocultar todas las secciones
            document.querySelectorAll('.content-section').forEach(sec => {
                sec.classList.remove('active');
            });

            // Mostrar sección seleccionada
            const sectionElement = document.getElementById(`${section}-content`);
            if (sectionElement) {
                sectionElement.classList.add('active');
                this.currentSection = section;
                
                // Actualizar navegación activa
                this.updateActiveNavigation(section);
                
                // Actualizar título del header
                this.updateHeaderTitle(section);
                
                // Cargar datos de la sección
                this.loadSectionData(section);
                
                Logger.info('Navegación a sección:', section);
            } else {
                Logger.warn('Sección no encontrada:', section);
                this.showSection('dashboard');
            }
        } catch (error) {
            Logger.error('Error navegando a sección:', error);
            this.showToast('Error al cargar la sección', 'error');
        }
    }

    updateActiveNavigation(section) {
        // Remover clase activa de todos los elementos de navegación
        document.querySelectorAll('.nav-item, [data-nav]').forEach(item => {
            item.classList.remove('active');
        });

        // Agregar clase activa al elemento correspondiente
        const activeNav = document.querySelector(`[data-nav="${section}"], .nav-item[onclick*="${section}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }
    }

    updateHeaderTitle(section) {
        const headerTitle = document.getElementById('header-title');
        if (!headerTitle) return;

        const titles = {
            dashboard: 'Dashboard',
            mascotas: 'Mis Mascotas',
            citas: 'Citas',
            historiales: 'Historiales Médicos',
            usuarios: 'Usuarios',
            perfil: 'Mi Perfil'
        };

        headerTitle.textContent = titles[section] || 'Patitas Felices';
    }

    async loadSectionData(section) {
        try {
            // Cargar datos específicos de la sección
            switch (section) {
                case 'dashboard':
                    if (window.app && window.app.loadDashboard) {
                        await window.app.loadDashboard();
                    }
                    break;
                case 'mascotas':
                    if (window.loadMascotas) {
                        await window.loadMascotas();
                    }
                    break;
                case 'citas':
                    if (window.loadCitas) {
                        await window.loadCitas();
                    }
                    break;
                case 'historiales':
                    if (window.loadHistoriales) {
                        await window.loadHistoriales();
                    }
                    break;
                case 'usuarios':
                    if (window.loadUsuarios) {
                        await window.loadUsuarios();
                    }
                    break;
                case 'perfil':
                    if (window.app && window.app.loadProfile) {
                        await window.app.loadProfile();
                    }
                    break;
            }
        } catch (error) {
            Logger.error(`Error cargando datos de ${section}:`, error);
        }
    }

    addToHistory(section) {
        this.history.push(section);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }

    goBack() {
        if (this.history.length > 0) {
            const previousSection = this.history.pop();
            this.showSection(previousSection, false);
        } else {
            // Si no hay historial, ir al dashboard
            this.showSection('dashboard');
        }
    }

    updateURL(section) {
        if (window.history && window.history.pushState) {
            const url = new URL(window.location);
            url.hash = section;
            window.history.pushState({ section }, '', url);
        }
    }

    handleEscape() {
        // Cerrar modales abiertos
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            this.closeModal(activeModal);
            return;
        }

        // Si estamos en una sección diferente al dashboard, ir al dashboard
        if (this.currentSection !== 'dashboard') {
            this.navigateTo('dashboard');
        }
    }

    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // === NAVEGACIÓN ESPECÍFICA ===
    showDashboard() {
        this.navigateTo('dashboard');
    }

    showMascotas() {
        this.navigateTo('mascotas');
    }

    showCitas() {
        this.navigateTo('citas');
    }

    showHistoriales() {
        this.navigateTo('historiales');
    }

    showUsuarios() {
        this.navigateTo('usuarios');
    }

    showPerfil() {
        this.navigateTo('perfil');
    }

    // === NAVEGACIÓN CON ROLES ===
    setupRoleBasedNavigation() {
        const currentUser = Storage.get(CONFIG.STORAGE_KEYS.USER);
        if (!currentUser) return;

        const role = currentUser.rol;
        const navItems = {
            'nav-historiales': role === 'veterinario' || role === 'admin',
            'nav-usuarios': role === 'admin' || role === 'recepcionista',
            'nav-mascotas': true // Todos pueden ver mascotas
        };

        Object.entries(navItems).forEach(([navId, shouldShow]) => {
            const navElement = document.getElementById(navId);
            if (navElement) {
                navElement.style.display = shouldShow ? 'flex' : 'none';
            }
        });
    }

    // === UTILIDADES ===
    getCurrentSection() {
        return this.currentSection;
    }

    getHistory() {
        return [...this.history];
    }

    clearHistory() {
        this.history = [];
    }

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // === NAVEGACIÓN EXTERNA ===
    openExternalLink(url) {
        if (window.cordova && window.cordova.InAppBrowser) {
            window.cordova.InAppBrowser.open(url, '_blank');
        } else {
            window.open(url, '_blank');
        }
    }

    // === NAVEGACIÓN PROFUNDA ===
    handleDeepLink(link) {
        // Manejar enlaces profundos
        const sections = ['dashboard', 'mascotas', 'citas', 'historiales', 'usuarios', 'perfil'];
        const section = sections.find(s => link.includes(s));
        
        if (section) {
            this.navigateTo(section);
            return true;
        }
        
        return false;
    }
}

// Crear instancia global
const navigationManager = new NavigationManager();

// Funciones globales
window.showSection = (section) => {
    navigationManager.navigateTo(section);
};

window.showDashboard = () => {
    navigationManager.showDashboard();
};

window.showMascotas = () => {
    navigationManager.showMascotas();
};

window.showCitas = () => {
    navigationManager.showCitas();
};

window.showHistoriales = () => {
    navigationManager.showHistoriales();
};

window.showUsuarios = () => {
    navigationManager.showUsuarios();
};

window.showPerfil = () => {
    navigationManager.showPerfil();
};

window.goBack = () => {
    navigationManager.goBack();
};

// Exportar para uso global
window.navigationManager = navigationManager;

Logger.info('Módulo de navegación cargado correctamente'); 