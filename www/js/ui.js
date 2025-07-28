// Módulo de interfaz de usuario
class UI {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }

        // Mascota form
        const mascotaForm = document.getElementById('mascota-form');
        if (mascotaForm) {
            mascotaForm.addEventListener('submit', this.handleMascotaSubmit.bind(this));
        }

        // Cita form
        const citaForm = document.getElementById('cita-form');
        if (citaForm) {
            citaForm.addEventListener('submit', this.handleCitaSubmit.bind(this));
        }

        // Historial form
        const historialForm = document.getElementById('historial-form');
        if (historialForm) {
            historialForm.addEventListener('submit', this.handleHistorialSubmit.bind(this));
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            showLoading();
            const response = await api.login(email, password);
            
            if (response.token) {
                api.setAuthToken(response.token);
                localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(response.usuario));
                this.currentUser = response.usuario;
                
                showToast('Inicio de sesión exitoso', 'success');
                this.showMainView();
                this.loadDashboard();
            }
        } catch (error) {
            showToast(error.message || 'Error al iniciar sesión', 'error');
        } finally {
            hideLoading();
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        
        const userData = {
            nombre: document.getElementById('register-name').value,
            email: document.getElementById('register-email').value,
            telefono: document.getElementById('register-phone').value,
            direccion: document.getElementById('register-address').value,
            password: document.getElementById('register-password').value,
            rol: document.getElementById('register-role').value
        };

        try {
            showLoading();
            const response = await api.register(userData);
            
            showToast('Registro exitoso. Por favor, inicia sesión.', 'success');
            showLogin();
        } catch (error) {
            showToast(error.message || 'Error al registrarse', 'error');
        } finally {
            hideLoading();
        }
    }

    async handleMascotaSubmit(event) {
        event.preventDefault();
        
        const mascotaData = {
            nombre: document.getElementById('mascota-nombre').value,
            especie: document.getElementById('mascota-especie').value,
            raza: document.getElementById('mascota-raza').value,
            edad: parseFloat(document.getElementById('mascota-edad').value),
            peso: parseFloat(document.getElementById('mascota-peso').value)
        };

        const mascotaId = document.getElementById('mascota-id').value;

        try {
            showLoading();
            
            if (mascotaId) {
                await api.updateMascota(mascotaId, mascotaData);
                showToast('Mascota actualizada exitosamente', 'success');
            } else {
                await api.createMascota(mascotaData);
                showToast('Mascota creada exitosamente', 'success');
            }
            
            closeMascotaModal();
            loadMascotas();
        } catch (error) {
            showToast(error.message || 'Error al guardar mascota', 'error');
        } finally {
            hideLoading();
        }
    }

    async handleCitaSubmit(event) {
        event.preventDefault();
        
        const citaData = {
            id_mascota: document.getElementById('cita-mascota').value,
            id_veterinario: document.getElementById('cita-veterinario').value,
            fecha_hora: api.combineDateTime(
                document.getElementById('cita-fecha').value,
                document.getElementById('cita-hora').value
            ),
            motivo: document.getElementById('cita-motivo').value,
            estado: document.getElementById('cita-estado').value
        };

        const citaId = document.getElementById('cita-id').value;

        try {
            showLoading();
            
            if (citaId) {
                await api.updateCita(citaId, citaData);
                showToast('Cita actualizada exitosamente', 'success');
            } else {
                await api.createCita(citaData);
                showToast('Cita creada exitosamente', 'success');
            }
            
            closeCitaModal();
            loadCitas();
        } catch (error) {
            showToast(error.message || 'Error al guardar cita', 'error');
        } finally {
            hideLoading();
        }
    }

    async handleHistorialSubmit(event) {
        event.preventDefault();
        
        const historialData = {
            id_mascota: document.getElementById('historial-mascota').value,
            fecha_consulta: document.getElementById('historial-fecha').value,
            sintomas: document.getElementById('historial-sintomas').value,
            diagnostico: document.getElementById('historial-diagnostico').value,
            tratamiento: document.getElementById('historial-tratamiento').value,
            observaciones: document.getElementById('historial-observaciones').value
        };

        const historialId = document.getElementById('historial-id').value;

        try {
            showLoading();
            
            if (historialId) {
                await api.updateHistorial(historialId, historialData);
                showToast('Historial actualizado exitosamente', 'success');
            } else {
                await api.createHistorial(historialData);
                showToast('Historial creado exitosamente', 'success');
            }
            
            closeHistorialModal();
            loadHistoriales();
        } catch (error) {
            showToast(error.message || 'Error al guardar historial', 'error');
        } finally {
            hideLoading();
        }
    }

    checkAuthStatus() {
        const token = api.getAuthToken();
        const userData = localStorage.getItem(CONFIG.USER_KEY);
        
        if (token && userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.showMainView();
                this.loadDashboard();
            } catch (error) {
                this.logout();
            }
        } else {
            this.showLoginView();
        }
    }

    showLoginView() {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('login-view').classList.add('active');
        document.getElementById('register-view').classList.remove('active');
        document.getElementById('main-view').classList.remove('active');
    }

    showMainView() {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('login-view').classList.remove('active');
        document.getElementById('register-view').classList.remove('active');
        document.getElementById('main-view').classList.add('active');
        
        this.updateNavigation();
    }

    updateNavigation() {
        if (!this.currentUser) return;

        const { rol } = this.currentUser;
        
        // Mostrar/ocultar elementos según el rol
        const navHistoriales = document.getElementById('nav-historiales');
        const navUsuarios = document.getElementById('nav-usuarios');
        
        if (rol === CONFIG.ROLES.VETERINARIO || rol === CONFIG.ROLES.ADMIN) {
            navHistoriales.style.display = 'block';
        } else {
            navHistoriales.style.display = 'none';
        }
        
        if (rol === CONFIG.ROLES.ADMIN || rol === CONFIG.ROLES.RECEPCIONISTA) {
            navUsuarios.style.display = 'block';
        } else {
            navUsuarios.style.display = 'none';
        }
    }

    async loadDashboard() {
        if (!this.currentUser) return;

        const welcomeMessage = document.getElementById('welcome-message');
        const userRoleDisplay = document.getElementById('user-role-display');
        
        welcomeMessage.textContent = `Bienvenido, ${this.currentUser.nombre}`;
        userRoleDisplay.textContent = `Rol: ${this.currentUser.rol}`;

        await this.loadStats();
        await this.loadQuickActions();
    }

    async loadStats() {
        try {
            const statsGrid = document.getElementById('stats-grid');
            const { rol } = this.currentUser;
            
            let stats = [];
            
            if (rol === CONFIG.ROLES.CLIENTE) {
                const mascotas = await api.getMascotas();
                const citas = await api.getCitas();
                
                stats = [
                    { title: 'Mis Mascotas', value: mascotas.length, icon: 'fas fa-paw', color: '#28a745' },
                    { title: 'Mis Citas', value: citas.length, icon: 'fas fa-calendar', color: '#007bff' }
                ];
            } else if (rol === CONFIG.ROLES.VETERINARIO) {
                const historiales = await api.getHistoriales();
                const citas = await api.getCitas();
                
                stats = [
                    { title: 'Historiales', value: historiales.length, icon: 'fas fa-file-medical', color: '#17a2b8' },
                    { title: 'Citas', value: citas.length, icon: 'fas fa-calendar', color: '#007bff' }
                ];
            } else if (rol === CONFIG.ROLES.ADMIN || rol === CONFIG.ROLES.RECEPCIONISTA) {
                const usuarios = await api.getUsers();
                const mascotas = await api.getMascotas();
                const citas = await api.getCitas();
                const historiales = await api.getHistoriales();
                
                stats = [
                    { title: 'Usuarios', value: usuarios.length, icon: 'fas fa-users', color: '#6f42c1' },
                    { title: 'Mascotas', value: mascotas.length, icon: 'fas fa-paw', color: '#28a745' },
                    { title: 'Citas', value: citas.length, icon: 'fas fa-calendar', color: '#007bff' },
                    { title: 'Historiales', value: historiales.length, icon: 'fas fa-file-medical', color: '#17a2b8' }
                ];
            }
            
            statsGrid.innerHTML = stats.map(stat => `
                <div class="stat-card" style="border-left-color: ${stat.color}">
                    <div class="stat-icon" style="color: ${stat.color}">
                        <i class="${stat.icon}"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${stat.value}</h3>
                        <p>${stat.title}</p>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadQuickActions() {
        const quickActions = document.getElementById('quick-actions');
        const { rol } = this.currentUser;
        
        let actions = [];
        
        if (rol === CONFIG.ROLES.CLIENTE) {
            actions = [
                { title: 'Agregar Mascota', icon: 'fas fa-plus', action: 'showAddMascota()', color: '#28a745' },
                { title: 'Nueva Cita', icon: 'fas fa-calendar-plus', action: 'showAddCita()', color: '#007bff' }
            ];
        } else if (rol === CONFIG.ROLES.VETERINARIO) {
            actions = [
                { title: 'Nuevo Historial', icon: 'fas fa-file-medical', action: 'showAddHistorial()', color: '#17a2b8' },
                { title: 'Ver Citas', icon: 'fas fa-calendar', action: 'showSection(\'citas\')', color: '#007bff' }
            ];
        } else if (rol === CONFIG.ROLES.ADMIN || rol === CONFIG.ROLES.RECEPCIONISTA) {
            actions = [
                { title: 'Ver Usuarios', icon: 'fas fa-users', action: 'showSection(\'usuarios\')', color: '#6f42c1' },
                { title: 'Ver Citas', icon: 'fas fa-calendar', action: 'showSection(\'citas\')', color: '#007bff' }
            ];
        }
        
        quickActions.innerHTML = actions.map(action => `
            <button class="quick-action-btn" onclick="${action.action}" style="border-color: ${action.color}">
                <i class="${action.icon}" style="color: ${action.color}"></i>
                <span>${action.title}</span>
            </button>
        `).join('');
    }

    logout() {
        api.removeAuthToken();
        localStorage.removeItem(CONFIG.USER_KEY);
        this.currentUser = null;
        this.showLoginView();
        showToast('Sesión cerrada', 'info');
    }
}

// Crear instancia global de UI
const ui = new UI();

// Funciones globales para navegación
window.showLogin = () => {
    document.getElementById('login-view').classList.add('active');
    document.getElementById('register-view').classList.remove('active');
};

window.showRegister = () => {
    document.getElementById('login-view').classList.remove('active');
    document.getElementById('register-view').classList.add('active');
};

window.logout = () => {
    ui.logout();
};

window.showProfile = () => {
    showSection('perfil');
    loadProfile();
};

// Funciones de navegación de secciones
window.showSection = (section) => {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(el => {
        el.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    document.getElementById(`${section}-content`).classList.add('active');
    
    // Actualizar navegación
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
    });
    
    // Actualizar título del header
    const titles = {
        'dashboard': 'Dashboard',
        'mascotas': 'Mis Mascotas',
        'citas': 'Citas',
        'historiales': 'Historiales Médicos',
        'usuarios': 'Usuarios',
        'perfil': 'Mi Perfil'
    };
    
    document.getElementById('header-title').textContent = titles[section] || 'Dashboard';
    
    // Cargar datos según la sección
    switch(section) {
        case 'dashboard':
            ui.loadDashboard();
            break;
        case 'mascotas':
            loadMascotas();
            break;
        case 'citas':
            loadCitas();
            break;
        case 'historiales':
            loadHistoriales();
            break;
        case 'usuarios':
            loadUsuarios();
            break;
        case 'perfil':
            loadProfile();
            break;
    }
};

// Funciones de utilidad
window.togglePassword = (inputId) => {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
};

// Exportar para uso global
window.ui = ui; 