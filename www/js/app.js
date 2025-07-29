// Aplicación principal móvil - Clínica Veterinaria Patitas Felices
class PatitasFelicesApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.isLoading = false;
        this.isOnline = true;
        
        this.init();
    }

    async init() {
        try {
            Logger.info('Inicializando aplicación...');
            
            // Mostrar loading screen
            this.showLoadingScreen();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Verificar autenticación
            await this.checkAuthentication();
            
            // Ocultar loading screen
            setTimeout(() => {
                this.hideLoadingScreen();
            }, 2000);
            
            Logger.info('Aplicación inicializada correctamente');
            
        } catch (error) {
            Logger.error('Error inicializando aplicación:', error);
            this.showToast('Error al inicializar la aplicación', 'error');
            this.hideLoadingScreen();
        }
    }

    // === LOADING SCREEN ===
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            loadingScreen.classList.remove('fade-out');
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    // === AUTENTICACIÓN ===
    async checkAuthentication() {
        const token = Storage.get(CONFIG.STORAGE_KEYS.TOKEN);
        const userData = Storage.get(CONFIG.STORAGE_KEYS.USER);
        
        if (token && userData) {
            try {
                // Verificar si el token sigue siendo válido
                const response = await api.getProfile();
                this.currentUser = response.usuario;
                this.showMainView();
                await this.loadDashboard();
            } catch (error) {
                Logger.warn('Token inválido, redirigiendo al login');
                this.logout();
            }
        } else {
            this.showLogin();
        }
    }

    async login(email, password) {
        try {
            this.setLoading(true);
            
            const response = await api.login(email, password);
            
            if (response.token && response.usuario) {
                this.currentUser = response.usuario;
                this.showToast(`¡Bienvenido ${response.usuario.nombre}!`, 'success');
                this.showMainView();
                await this.loadDashboard();
            }
            
        } catch (error) {
            Logger.error('Error en login:', error);
            this.showToast(error.message || 'Error al iniciar sesión', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async register(userData) {
        try {
            this.setLoading(true);
            
            await api.register(userData);
            this.showToast('Registro exitoso. Ahora puedes iniciar sesión.', 'success');
            this.showLogin();
            
        } catch (error) {
            Logger.error('Error en registro:', error);
            this.showToast(error.message || 'Error al registrarse', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    logout() {
        // Limpiar datos de sesión
        api.clearToken();
        Storage.clear();
        this.currentUser = null;
        
        // Mostrar login
        this.showLogin();
        this.showToast('Sesión cerrada', 'info');
        
        Logger.info('Sesión cerrada');
    }

    // === NAVEGACIÓN ENTRE VISTAS ===
    showLogin() {
        this.hideAllViews();
        document.getElementById('login-view').classList.add('active');
        this.resetLoginForm();
    }

    showRegister() {
        this.hideAllViews();
        document.getElementById('register-view').classList.add('active');
        this.resetRegisterForm();
    }

    showMainView() {
        this.hideAllViews();
        document.getElementById('main-view').classList.add('active');
        this.setupMainViewNavigation();
    }

    hideAllViews() {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
    }

    // === NAVEGACIÓN PRINCIPAL ===
    setupMainViewNavigation() {
        // Configurar navegación según el rol del usuario
        this.setupRoleBasedNavigation();
        
        // Mostrar sección por defecto
        this.showSection('dashboard');
    }

    setupRoleBasedNavigation() {
        const role = this.currentUser?.rol;
        const navHistoriales = document.getElementById('nav-historiales');
        const navUsuarios = document.getElementById('nav-usuarios');
        const navMascotas = document.getElementById('nav-mascotas');
        
        // Mostrar/ocultar navegación según el rol
        if (role === 'veterinario' || role === 'admin') {
            navHistoriales.style.display = 'flex';
        } else {
            navHistoriales.style.display = 'none';
        }
        
        if (role === 'admin' || role === 'recepcionista') {
            navUsuarios.style.display = 'flex';
        } else {
            navUsuarios.style.display = 'none';
        }
        
        if (role === 'cliente') {
            navMascotas.style.display = 'flex';
        } else {
            navMascotas.style.display = 'flex'; // Todos pueden ver mascotas
        }
    }

    showSection(section) {
        try {
            // Actualizar navegación activa
            this.updateActiveNavigation(section);
            
            // Ocultar todas las secciones
            document.querySelectorAll('.content-section').forEach(sec => {
                sec.classList.remove('active');
            });
            
            // Mostrar sección seleccionada
            const sectionElement = document.getElementById(`${section}-content`);
            if (sectionElement) {
                sectionElement.classList.add('active');
                this.currentSection = section;
                
                // Actualizar título del header
                this.updateHeaderTitle(section);
                
                // Cargar datos de la sección
                this.loadSectionData(section);
            }
            
        } catch (error) {
            Logger.error('Error mostrando sección:', error);
            this.showToast('Error al cargar la sección', 'error');
        }
    }

    updateActiveNavigation(section) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNav = document.querySelector(`[onclick="showSection('${section}')"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }
    }

    updateHeaderTitle(section) {
        const headerTitle = document.getElementById('header-title');
        const titles = {
            dashboard: 'Dashboard',
            mascotas: 'Mis Mascotas',
            citas: 'Citas',
            historiales: 'Historiales Médicos',
            usuarios: 'Usuarios',
            perfil: 'Mi Perfil'
        };
        
        if (headerTitle) {
            headerTitle.textContent = titles[section] || 'Patitas Felices';
        }
    }

    async loadSectionData(section) {
        try {
            this.setLoading(true);
            
            switch (section) {
                case 'dashboard':
                    await this.loadDashboard();
                    break;
                case 'mascotas':
                    if (window.loadMascotas) await window.loadMascotas();
                    break;
                case 'citas':
                    if (window.loadCitas) await window.loadCitas();
                    break;
                case 'historiales':
                    if (window.loadHistoriales) await window.loadHistoriales();
                    break;
                case 'usuarios':
                    if (window.loadUsuarios) await window.loadUsuarios();
                    break;
                case 'perfil':
                    await this.loadProfile();
                    break;
            }
            
        } catch (error) {
            Logger.error(`Error cargando datos de ${section}:`, error);
            this.showToast(`Error al cargar ${section}`, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    // === DASHBOARD ===
    async loadDashboard() {
        try {
            // Actualizar mensaje de bienvenida
            this.updateWelcomeMessage();
            
            // Cargar estadísticas
            await this.loadStats();
            
            // Cargar acciones rápidas
            this.loadQuickActions();
            
        } catch (error) {
            Logger.error('Error cargando dashboard:', error);
            this.showToast('Error al cargar el dashboard', 'error');
        }
    }

    updateWelcomeMessage() {
        const welcomeMessage = document.getElementById('welcome-message');
        const userRoleDisplay = document.getElementById('user-role-display');
        
        if (welcomeMessage && this.currentUser) {
            const hour = new Date().getHours();
            let greeting = 'Buen día';
            if (hour >= 12 && hour < 18) greeting = 'Buenas tardes';
            if (hour >= 18) greeting = 'Buenas noches';
            
            welcomeMessage.textContent = `${greeting}, ${this.currentUser.nombre}`;
        }
        
        if (userRoleDisplay && this.currentUser) {
            const roleNames = {
                admin: 'Administrador',
                veterinario: 'Veterinario',
                recepcionista: 'Recepcionista',
                cliente: 'Cliente'
            };
            
            userRoleDisplay.textContent = roleNames[this.currentUser.rol] || this.currentUser.rol;
        }
    }

    async loadStats() {
        const statsGrid = document.getElementById('stats-grid');
        if (!statsGrid) return;
        
        try {
            const stats = await this.fetchStats();
            this.renderStats(stats);
        } catch (error) {
            Logger.error('Error cargando estadísticas:', error);
            this.renderStatsError();
        }
    }

    async fetchStats() {
        const role = this.currentUser?.rol;
        let stats = {};
        
        try {
            if (role === 'cliente') {
                // Estadísticas para clientes
                const mascotas = await api.getMascotas();
                const citas = await api.getCitas();
                
                stats = {
                    mascotas: mascotas.mascotas?.length || 0,
                    citas: citas.citas?.length || 0,
                    citasPendientes: citas.citas?.filter(c => c.estado === 'pendiente').length || 0,
                    proximaCita: this.getNextAppointment(citas.citas || [])
                };
            } else {
                // Estadísticas para staff
                const [mascotas, citas, usuarios] = await Promise.all([
                    api.getMascotas().catch(() => ({ mascotas: [] })),
                    api.getCitas().catch(() => ({ citas: [] })),
                    role === 'admin' ? api.getUsuarios().catch(() => ({ usuarios: [] })) : { usuarios: [] }
                ]);
                
                stats = {
                    mascotas: mascotas.mascotas?.length || 0,
                    citas: citas.citas?.length || 0,
                    citasHoy: this.getTodayAppointments(citas.citas || []),
                    usuarios: usuarios.usuarios?.length || 0
                };
            }
        } catch (error) {
            Logger.warn('Error obteniendo algunas estadísticas:', error);
        }
        
        return stats;
    }

    renderStats(stats) {
        const statsGrid = document.getElementById('stats-grid');
        if (!statsGrid) return;
        
        const role = this.currentUser?.rol;
        let statsHtml = '';
        
        if (role === 'cliente') {
            statsHtml = `
                <div class="stat-card">
                    <i class="fas fa-paw stat-icon"></i>
                    <div class="stat-number">${stats.mascotas}</div>
                    <div class="stat-label">Mis Mascotas</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-calendar stat-icon"></i>
                    <div class="stat-number">${stats.citas}</div>
                    <div class="stat-label">Total Citas</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-clock stat-icon"></i>
                    <div class="stat-number">${stats.citasPendientes}</div>
                    <div class="stat-label">Pendientes</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-calendar-check stat-icon"></i>
                    <div class="stat-number">${stats.proximaCita}</div>
                    <div class="stat-label">Próxima Cita</div>
                </div>
            `;
        } else {
            statsHtml = `
                <div class="stat-card">
                    <i class="fas fa-paw stat-icon"></i>
                    <div class="stat-number">${stats.mascotas}</div>
                    <div class="stat-label">Mascotas</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-calendar stat-icon"></i>
                    <div class="stat-number">${stats.citas}</div>
                    <div class="stat-label">Total Citas</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-calendar-day stat-icon"></i>
                    <div class="stat-number">${stats.citasHoy}</div>
                    <div class="stat-label">Citas Hoy</div>
                </div>
                ${role === 'admin' ? `
                <div class="stat-card">
                    <i class="fas fa-users stat-icon"></i>
                    <div class="stat-number">${stats.usuarios}</div>
                    <div class="stat-label">Usuarios</div>
                </div>` : ''}
            `;
        }
        
        statsGrid.innerHTML = statsHtml;
    }

    renderStatsError() {
        const statsGrid = document.getElementById('stats-grid');
        if (!statsGrid) return;
        
        statsGrid.innerHTML = `
            <div class="stat-card">
                <i class="fas fa-exclamation-triangle stat-icon"></i>
                <div class="stat-number">-</div>
                <div class="stat-label">Error cargando</div>
            </div>
        `;
    }

    loadQuickActions() {
        const quickActions = document.getElementById('quick-actions');
        if (!quickActions) return;
        
        const role = this.currentUser?.rol;
        let actionsHtml = '';
        
        if (role === 'cliente') {
            actionsHtml = `
                <div class="quick-action" onclick="showAddMascota()">
                    <i class="fas fa-plus"></i>
                    <span>Agregar Mascota</span>
                </div>
                <div class="quick-action" onclick="showAddCita()">
                    <i class="fas fa-calendar-plus"></i>
                    <span>Nueva Cita</span>
                </div>
                <div class="quick-action" onclick="showSection('mascotas')">
                    <i class="fas fa-paw"></i>
                    <span>Mis Mascotas</span>
                </div>
                <div class="quick-action" onclick="showSection('citas')">
                    <i class="fas fa-calendar"></i>
                    <span>Mis Citas</span>
                </div>
            `;
        } else if (role === 'admin') {
            actionsHtml = `
                <div class="quick-action" onclick="showAddCita()">
                    <i class="fas fa-calendar-plus"></i>
                    <span>Nueva Cita</span>
                </div>
                <div class="quick-action" onclick="showAddHistorial()">
                    <i class="fas fa-file-medical-alt"></i>
                    <span>Nuevo Historial</span>
                </div>
                <div class="quick-action" onclick="showSection('usuarios')">
                    <i class="fas fa-users"></i>
                    <span>Gestionar Usuarios</span>
                </div>
                <div class="quick-action" onclick="showSection('citas')">
                    <i class="fas fa-calendar"></i>
                    <span>Todas las Citas</span>
                </div>
            `;
        } else if (role === 'veterinario') {
            actionsHtml = `
                <div class="quick-action" onclick="showAddHistorial()">
                    <i class="fas fa-file-medical-alt"></i>
                    <span>Nuevo Historial</span>
                </div>
                <div class="quick-action" onclick="showSection('citas')">
                    <i class="fas fa-calendar"></i>
                    <span>Ver Citas</span>
                </div>
                <div class="quick-action" onclick="showSection('historiales')">
                    <i class="fas fa-file-medical"></i>
                    <span>Historiales</span>
                </div>
                <div class="quick-action" onclick="showSection('mascotas')">
                    <i class="fas fa-paw"></i>
                    <span>Mascotas</span>
                </div>
            `;
        } else if (role === 'recepcionista') {
            actionsHtml = `
                <div class="quick-action" onclick="showAddCita()">
                    <i class="fas fa-calendar-plus"></i>
                    <span>Nueva Cita</span>
                </div>
                <div class="quick-action" onclick="showSection('citas')">
                    <i class="fas fa-calendar"></i>
                    <span>Gestionar Citas</span>
                </div>
                <div class="quick-action" onclick="showSection('usuarios')">
                    <i class="fas fa-users"></i>
                    <span>Ver Usuarios</span>
                </div>
                <div class="quick-action" onclick="showSection('mascotas')">
                    <i class="fas fa-paw"></i>
                    <span>Ver Mascotas</span>
                </div>
            `;
        }
        
        quickActions.innerHTML = actionsHtml;
    }

    // === PERFIL ===
    async loadProfile() {
        try {
            const response = await api.getProfile();
            this.currentUser = response.usuario;
            this.renderProfile();
        } catch (error) {
            Logger.error('Error cargando perfil:', error);
            this.showToast('Error al cargar el perfil', 'error');
        }
    }

    renderProfile() {
        const perfilInfo = document.getElementById('perfil-info');
        if (!perfilInfo || !this.currentUser) return;
        
        const user = this.currentUser;
        const initials = user.nombre ? user.nombre.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
        
        perfilInfo.innerHTML = `
            <div style="text-align: center; padding: 2rem 1rem;">
                <div class="profile-avatar">
                    ${initials}
                </div>
                <h3 style="margin-bottom: 2rem; color: var(--text-primary);">${user.nombre}</h3>
            </div>
            
            <div class="profile-field">
                <div class="profile-field-icon">
                    <i class="fas fa-user"></i>
                </div>
                <div class="profile-field-content">
                    <div class="profile-field-label">Nombre</div>
                    <div class="profile-field-value">${user.nombre}</div>
                </div>
            </div>
            
            <div class="profile-field">
                <div class="profile-field-icon">
                    <i class="fas fa-envelope"></i>
                </div>
                <div class="profile-field-content">
                    <div class="profile-field-label">Email</div>
                    <div class="profile-field-value">${user.email}</div>
                </div>
            </div>
            
            <div class="profile-field">
                <div class="profile-field-icon">
                    <i class="fas fa-phone"></i>
                </div>
                <div class="profile-field-content">
                    <div class="profile-field-label">Teléfono</div>
                    <div class="profile-field-value">${user.telefono || 'No especificado'}</div>
                </div>
            </div>
            
            <div class="profile-field">
                <div class="profile-field-icon">
                    <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="profile-field-content">
                    <div class="profile-field-label">Dirección</div>
                    <div class="profile-field-value">${user.direccion || 'No especificada'}</div>
                </div>
            </div>
            
            <div class="profile-field">
                <div class="profile-field-icon">
                    <i class="fas fa-user-tag"></i>
                </div>
                <div class="profile-field-content">
                    <div class="profile-field-label">Rol</div>
                    <div class="profile-field-value">${this.getRoleName(user.rol)}</div>
                </div>
            </div>
        `;
    }

    getRoleName(rol) {
        const roleNames = {
            admin: 'Administrador',
            veterinario: 'Veterinario',
            recepcionista: 'Recepcionista',
            cliente: 'Cliente'
        };
        return roleNames[rol] || rol;
    }

    // === UTILIDADES ===
    getNextAppointment(citas) {
        if (!citas || citas.length === 0) return 'Sin citas';
        
        const now = new Date();
        const futureCitas = citas
            .filter(cita => new Date(cita.fecha_hora) > now && cita.estado !== 'cancelada')
            .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));
        
        if (futureCitas.length === 0) return 'Sin citas';
        
        const nextCita = futureCitas[0];
        const date = new Date(nextCita.fecha_hora);
        const days = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Hoy';
        if (days === 1) return 'Mañana';
        return `${days} días`;
    }

    getTodayAppointments(citas) {
        if (!citas || citas.length === 0) return 0;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return citas.filter(cita => {
            const citaDate = new Date(cita.fecha_hora);
            return citaDate >= today && citaDate < tomorrow;
        }).length;
    }

    // === EVENT LISTENERS ===
    setupEventListeners() {
        // Formulario de login
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            this.login(email, password);
        });

        // Formulario de registro
        document.getElementById('register-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const userData = {
                nombre: document.getElementById('register-name').value,
                email: document.getElementById('register-email').value,
                telefono: document.getElementById('register-phone').value,
                direccion: document.getElementById('register-address').value,
                password: document.getElementById('register-password').value,
                rol: document.getElementById('register-role').value
            };
            this.register(userData);
        });

        // Eventos de red
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleOnlineStatus();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleOfflineStatus();
        });

        // Evento de botón atrás
        if (window.cordova) {
            document.addEventListener('backbutton', (e) => {
                this.handleBackButton(e);
            }, false);
        }

        // Pull to refresh (si está implementado)
        this.setupPullToRefresh();
    }

    handleOnlineStatus() {
        Logger.info('Aplicación en línea');
        this.showToast('Conexión restaurada', 'success');
        
        // Sincronizar datos offline si existen
        if (api.syncOfflineData) {
            api.syncOfflineData();
        }
        
        // Recargar sección actual
        this.reloadCurrentSection();
    }

    handleOfflineStatus() {
        Logger.warn('Aplicación offline');
        this.showToast('Sin conexión. Trabajando en modo offline', 'warning');
    }

    handleBackButton(e) {
        e.preventDefault();
        
        // Si hay un modal abierto, cerrarlo
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            this.closeAllModals();
            return;
        }
        
        // Si no estamos en dashboard, ir al dashboard
        if (this.currentSection !== 'dashboard') {
            this.showSection('dashboard');
            return;
        }
        
        // Si estamos en dashboard, mostrar diálogo de salida
        if (window.navigator && navigator.notification) {
            navigator.notification.confirm(
                '¿Deseas salir de la aplicación?',
                (buttonIndex) => {
                    if (buttonIndex === 1) {
                        navigator.app.exitApp();
                    }
                },
                'Salir de Patitas Felices',
                ['Sí', 'No']
            );
        } else {
            // Fallback para navegador
            if (confirm('¿Deseas salir de la aplicación?')) {
                window.close();
            }
        }
    }

    setupPullToRefresh() {
        // Implementar pull to refresh para móviles
        let startY = 0;
        let pullDistance = 0;
        const threshold = 80;
        
        const content = document.querySelector('.app-content');
        if (!content) return;
        
        content.addEventListener('touchstart', (e) => {
            startY = e.touches[0].pageY;
        }, { passive: true });
        
        content.addEventListener('touchmove', (e) => {
            if (content.scrollTop === 0) {
                pullDistance = e.touches[0].pageY - startY;
                if (pullDistance > 0 && pullDistance < threshold * 2) {
                    e.preventDefault();
                    // Aquí podrías agregar un indicador visual de pull to refresh
                }
            }
        }, { passive: false });
        
        content.addEventListener('touchend', () => {
            if (pullDistance > threshold && content.scrollTop === 0) {
                this.refreshCurrentSection();
            }
            pullDistance = 0;
        }, { passive: true });
    }

    async refreshCurrentSection() {
        this.showToast('Actualizando...', 'info');
        await this.loadSectionData(this.currentSection);
    }

    async reloadCurrentSection() {
        if (this.currentSection) {
            await this.loadSectionData(this.currentSection);
        }
    }

    // === UI HELPERS ===
    setLoading(loading) {
        this.isLoading = loading;
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(btn => {
            if (loading) {
                btn.disabled = true;
                btn.classList.add('loading');
                
                // Agregar spinner si no existe
                if (!btn.querySelector('.loading-spinner-small')) {
                    const spinner = document.createElement('div');
                    spinner.className = 'loading-spinner-small';
                    btn.insertBefore(spinner, btn.firstChild);
                }
            } else {
                btn.disabled = false;
                btn.classList.remove('loading');
                
                // Remover spinner
                const spinner = btn.querySelector('.loading-spinner-small');
                if (spinner) {
                    spinner.remove();
                }
            }
        });
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="${icons[type] || icons.info}"></i>
            <span class="toast-message">${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Mostrar toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remover toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, CONFIG.TOAST_DURATION);
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    resetLoginForm() {
        const form = document.getElementById('login-form');
        if (form) {
            form.reset();
            this.clearFormErrors(form);
        }
    }

    resetRegisterForm() {
        const form = document.getElementById('register-form');
        if (form) {
            form.reset();
            this.clearFormErrors(form);
        }
    }

    clearFormErrors(form) {
        form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
        });
        form.querySelectorAll('.error-message').forEach(msg => {
            msg.remove();
        });
    }

    showFormError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('error');
            
            // Remover mensaje de error anterior
            const existingError = formGroup.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            // Agregar nuevo mensaje de error
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            formGroup.appendChild(errorDiv);
        }
    }

    // === GUARDAR ESTADO ===
    saveAppState() {
        const appState = {
            currentSection: this.currentSection,
            timestamp: Date.now()
        };
        Storage.set('app_state', appState);
    }

    restoreAppState() {
        const appState = Storage.get('app_state');
        if (appState && appState.currentSection) {
            this.showSection(appState.currentSection);
        }
    }
}

// === FUNCIONES GLOBALES ===
window.showLogin = function() {
    app.showLogin();
};

window.showRegister = function() {
    app.showRegister();
};

window.showSection = function(section) {
    app.showSection(section);
};

window.showProfile = function() {
    app.showSection('perfil');
};

window.logout = function() {
    app.logout();
};

window.editProfile = function() {
    app.showToast('Función de edición en desarrollo', 'info');
};

window.togglePassword = function(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.toggle-password');
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
};

window.handleBackButton = function() {
    app.handleBackButton({ preventDefault: () => {} });
};

window.handleOnline = function() {
    app.handleOnlineStatus();
};

window.handleOffline = function() {
    app.handleOfflineStatus();
};

window.saveAppState = function() {
    app.saveAppState();
};

window.checkConnection = function() {
    return api.checkConnection();
};

window.reloadCurrentSection = function() {
    app.reloadCurrentSection();
};

// === INICIALIZACIÓN ===
let app;

// Esperar a que el dispositivo esté listo (Cordova) o el DOM cargue
if (window.cordova) {
    document.addEventListener('deviceready', initializeApp, false);
} else {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
}

function initializeApp() {
    Logger.info('Inicializando Patitas Felices App...');
    app = new PatitasFelicesApp();
    
    // Hacer la instancia global para debugging
    window.app = app;
}

Logger.info('App.js cargado correctamente');