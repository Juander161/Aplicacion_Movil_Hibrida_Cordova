// Módulo de autenticación
class Auth {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    // Inicializar el módulo de autenticación
    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
    }

    // Verificar el estado de autenticación
    async checkAuthStatus() {
        const token = api.getAuthToken();
        const userData = localStorage.getItem(CONFIG.USER_KEY);

        if (token && userData) {
            try {
                // Verificar si el token es válido
                const profile = await api.getProfile();
                this.currentUser = profile.usuario || JSON.parse(userData);
                this.isAuthenticated = true;
                this.updateUI();
                showDashboard();
            } catch (error) {
                console.error('Error verificando autenticación:', error);
                this.logout();
            }
        } else {
            this.logout();
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Perfil form
        const perfilForm = document.getElementById('perfilForm');
        if (perfilForm) {
            perfilForm.addEventListener('submit', (e) => this.handleUpdateProfile(e));
        }
    }

    // Manejar login
    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Validaciones
        if (!email || !password) {
            showToast('Por favor, completa todos los campos', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showToast('Por favor, ingresa un email válido', 'error');
            return;
        }

        try {
            const response = await api.login(email, password);
            
            if (response.token && response.usuario) {
                api.setAuthToken(response.token);
                localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(response.usuario));
                
                this.currentUser = response.usuario;
                this.isAuthenticated = true;
                
                showToast('¡Bienvenido!', 'success');
                this.updateUI();
                showDashboard();
            } else {
                throw new Error('Respuesta inválida del servidor');
            }
        } catch (error) {
            console.error('Error en login:', error);
            api.handleNetworkError(error);
        }
    }

    // Manejar registro
    async handleRegister(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const userData = {
            nombre: formData.get('nombre').trim(),
            email: formData.get('email').trim(),
            password: formData.get('password'),
            telefono: formData.get('telefono').trim(),
            direccion: formData.get('direccion').trim(),
            rol: formData.get('rol')
        };

        // Validaciones
        if (!userData.nombre || !userData.email || !userData.password || 
            !userData.telefono || !userData.direccion || !userData.rol) {
            showToast('Por favor, completa todos los campos', 'error');
            return;
        }

        if (!isValidEmail(userData.email)) {
            showToast('Por favor, ingresa un email válido', 'error');
            return;
        }

        if (!isValidPhone(userData.telefono)) {
            showToast('Por favor, ingresa un teléfono válido', 'error');
            return;
        }

        if (userData.password.length < 6) {
            showToast('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        try {
            const response = await api.register(userData);
            
            if (response.usuario) {
                showToast('¡Registro exitoso! Por favor, inicia sesión', 'success');
                window.showLogin();
                event.target.reset();
            } else {
                throw new Error('Respuesta inválida del servidor');
            }
        } catch (error) {
            console.error('Error en registro:', error);
            api.handleNetworkError(error);
        }
    }

    // Manejar actualización de perfil
    async handleUpdateProfile(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const userData = {
            nombre: formData.get('nombre').trim(),
            email: formData.get('email').trim(),
            telefono: formData.get('telefono').trim(),
            direccion: formData.get('direccion').trim()
        };

        // Validaciones
        if (!userData.nombre || !userData.email || !userData.telefono || !userData.direccion) {
            showToast('Por favor, completa todos los campos', 'error');
            return;
        }

        if (!isValidEmail(userData.email)) {
            showToast('Por favor, ingresa un email válido', 'error');
            return;
        }

        if (!isValidPhone(userData.telefono)) {
            showToast('Por favor, ingresa un teléfono válido', 'error');
            return;
        }

        try {
            const response = await api.updateUser(this.currentUser._id, userData);
            
            if (response.usuario) {
                this.currentUser = response.usuario;
                localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(response.usuario));
                
                showToast('Perfil actualizado exitosamente', 'success');
                this.updateUI();
            } else {
                throw new Error('Respuesta inválida del servidor');
            }
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            api.handleNetworkError(error);
        }
    }

    // Cerrar sesión
    logout() {
        api.removeAuthToken();
        localStorage.removeItem(CONFIG.USER_KEY);
        
        this.currentUser = null;
        this.isAuthenticated = false;
        
        this.updateUI();
        window.showLogin();
        
        showToast('Sesión cerrada', 'info');
    }

    // Actualizar la interfaz de usuario
    updateUI() {
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');
        const dashboardUserName = document.getElementById('dashboardUserName');
        const adminElements = document.querySelectorAll('.admin-only');

        if (this.isAuthenticated && this.currentUser) {
            // Mostrar información del usuario
            if (userInfo) userInfo.style.display = 'flex';
            if (userName) userName.textContent = this.currentUser.nombre;
            if (dashboardUserName) dashboardUserName.textContent = this.currentUser.nombre;

            // Mostrar elementos de admin si corresponde
            if (this.currentUser.rol === CONFIG.ROLES.ADMIN) {
                adminElements.forEach(element => {
                    element.style.display = 'block';
                });
            } else {
                adminElements.forEach(element => {
                    element.style.display = 'none';
                });
            }

            // Llenar formulario de perfil
            this.fillProfileForm();
        } else {
            // Ocultar información del usuario
            if (userInfo) userInfo.style.display = 'none';
            if (userName) userName.textContent = '';
            if (dashboardUserName) dashboardUserName.textContent = '';

            // Ocultar elementos de admin
            adminElements.forEach(element => {
                element.style.display = 'none';
            });
        }
    }

    // Llenar formulario de perfil con datos actuales
    fillProfileForm() {
        if (!this.currentUser) return;

        const perfilNombre = document.getElementById('perfilNombre');
        const perfilEmail = document.getElementById('perfilEmail');
        const perfilTelefono = document.getElementById('perfilTelefono');
        const perfilDireccion = document.getElementById('perfilDireccion');

        if (perfilNombre) perfilNombre.value = this.currentUser.nombre || '';
        if (perfilEmail) perfilEmail.value = this.currentUser.email || '';
        if (perfilTelefono) perfilTelefono.value = this.currentUser.telefono || '';
        if (perfilDireccion) perfilDireccion.value = this.currentUser.direccion || '';
    }

    // Verificar si el usuario tiene permisos
    hasPermission(permission) {
        if (!this.isAuthenticated || !this.currentUser) {
            return false;
        }

        const role = this.currentUser.rol;

        // Permisos por rol
        const permissions = {
            [CONFIG.ROLES.ADMIN]: ['all'],
            [CONFIG.ROLES.VETERINARIO]: ['view_historiales', 'edit_historiales', 'view_citas', 'edit_citas'],
            [CONFIG.ROLES.RECEPCIONISTA]: ['view_usuarios', 'view_citas', 'edit_citas'],
            [CONFIG.ROLES.CLIENTE]: ['view_own_mascotas', 'edit_own_mascotas', 'view_own_citas', 'create_citas']
        };

        const userPermissions = permissions[role] || [];
        return userPermissions.includes('all') || userPermissions.includes(permission);
    }

    // Verificar si el usuario puede acceder a un recurso específico
    canAccessResource(resourceType, resourceId) {
        if (!this.isAuthenticated || !this.currentUser) {
            return false;
        }

        const role = this.currentUser.rol;

        // Admin puede acceder a todo
        if (role === CONFIG.ROLES.ADMIN) {
            return true;
        }

        // Cliente solo puede acceder a sus propios recursos
        if (role === CONFIG.ROLES.CLIENTE) {
            // Aquí deberías verificar si el recurso pertenece al usuario
            // Por ahora, asumimos que puede acceder
            return true;
        }

        // Veterinario y recepcionista pueden acceder a ciertos recursos
        return true;
    }

    // Obtener información del usuario actual
    getCurrentUser() {
        return this.currentUser;
    }

    // Verificar si está autenticado
    getIsAuthenticated() {
        return this.isAuthenticated;
    }

    // Obtener el rol del usuario
    getUserRole() {
        return this.currentUser ? this.currentUser.rol : null;
    }

    // Verificar si es admin
    isAdmin() {
        return this.getUserRole() === CONFIG.ROLES.ADMIN;
    }

    // Verificar si es veterinario
    isVeterinario() {
        return this.getUserRole() === CONFIG.ROLES.VETERINARIO;
    }

    // Verificar si es recepcionista
    isRecepcionista() {
        return this.getUserRole() === CONFIG.ROLES.RECEPCIONISTA;
    }

    // Verificar si es cliente
    isCliente() {
        return this.getUserRole() === CONFIG.ROLES.CLIENTE;
    }
}

// Crear instancia global de autenticación
const auth = new Auth();

// Función global para logout
window.logout = () => auth.logout();

// Exportar para uso global
window.auth = auth; 