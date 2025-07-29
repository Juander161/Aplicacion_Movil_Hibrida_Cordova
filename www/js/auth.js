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
        const token = Storage.get(CONFIG.STORAGE_KEYS.TOKEN);
        const userData = Storage.get(CONFIG.STORAGE_KEYS.USER);

        if (token && userData) {
            try {
                // Verificar si el token es válido
                const response = await api.getProfile();
                this.currentUser = response.usuario || userData;
                this.isAuthenticated = true;
                this.updateUI();
                
                // Mostrar vista principal
                if (window.showMainView) {
                    window.showMainView();
                }
                
                Logger.info('Usuario autenticado:', this.currentUser.nombre);
            } catch (error) {
                Logger.error('Error verificando autenticación:', error);
                this.logout();
            }
        } else {
            this.logout();
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Perfil form
        const perfilForm = document.getElementById('perfil-form');
        if (perfilForm) {
            perfilForm.addEventListener('submit', (e) => this.handleUpdateProfile(e));
        }
    }

    // Manejar login
    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        // Validaciones
        if (!email || !password) {
            this.showToast('Por favor, completa todos los campos', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showToast('Por favor, ingresa un email válido', 'error');
            return;
        }

        try {
            this.setLoading(true);
            
            const response = await api.login(email, password);
            
            if (response.token && response.usuario) {
                // Guardar datos de sesión
                Storage.set(CONFIG.STORAGE_KEYS.TOKEN, response.token);
                Storage.set(CONFIG.STORAGE_KEYS.USER, response.usuario);
                
                this.currentUser = response.usuario;
                this.isAuthenticated = true;
                
                this.showToast(`¡Bienvenido ${response.usuario.nombre}!`, 'success');
                this.updateUI();
                
                // Mostrar vista principal
                if (window.showMainView) {
                    window.showMainView();
                }
                
                Logger.info('Login exitoso:', response.usuario.email);
            } else {
                throw new Error('Respuesta inválida del servidor');
            }
        } catch (error) {
            Logger.error('Error en login:', error);
            this.showToast(error.message || 'Error al iniciar sesión', 'error');
        } finally {
            this.setLoading(false);
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
        if (!this.validateUserData(userData)) {
            return;
        }

        try {
            this.setLoading(true);
            
            const response = await api.register(userData);
            
            if (response.usuario) {
                this.showToast('¡Registro exitoso! Por favor, inicia sesión', 'success');
                
                // Limpiar formulario
                event.target.reset();
                
                // Ir al login
                if (window.showLogin) {
                    window.showLogin();
                }
                
                Logger.info('Registro exitoso:', userData.email);
            } else {
                throw new Error('Respuesta inválida del servidor');
            }
        } catch (error) {
            Logger.error('Error en registro:', error);
            this.showToast(error.message || 'Error al registrarse', 'error');
        } finally {
            this.setLoading(false);
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
        if (!this.validateProfileData(userData)) {
            return;
        }

        try {
            this.setLoading(true);
            
            const response = await api.updateUsuario(this.currentUser._id, userData);
            
            if (response.usuario) {
                this.currentUser = response.usuario;
                Storage.set(CONFIG.STORAGE_KEYS.USER, response.usuario);
                
                this.showToast('Perfil actualizado exitosamente', 'success');
                this.updateUI();
                
                Logger.info('Perfil actualizado:', response.usuario.email);
            } else {
                throw new Error('Respuesta inválida del servidor');
            }
        } catch (error) {
            Logger.error('Error actualizando perfil:', error);
            this.showToast(error.message || 'Error al actualizar perfil', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    // Cerrar sesión
    logout() {
        // Limpiar datos de sesión
        Storage.remove(CONFIG.STORAGE_KEYS.TOKEN);
        Storage.remove(CONFIG.STORAGE_KEYS.USER);
        
        this.currentUser = null;
        this.isAuthenticated = false;
        
        this.updateUI();
        
        // Mostrar login
        if (window.showLogin) {
            window.showLogin();
        }
        
        this.showToast('Sesión cerrada', 'info');
        Logger.info('Sesión cerrada');
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
            if (this.currentUser.rol === 'admin') {
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
            'admin': ['all'],
            'veterinario': ['view_historiales', 'edit_historiales', 'view_citas', 'edit_citas'],
            'recepcionista': ['view_usuarios', 'view_citas', 'edit_citas'],
            'cliente': ['view_own_mascotas', 'edit_own_mascotas', 'view_own_citas', 'create_citas']
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
        if (role === 'admin') {
            return true;
        }

        // Cliente solo puede acceder a sus propios recursos
        if (role === 'cliente') {
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
        return this.getUserRole() === 'admin';
    }

    // Verificar si es veterinario
    isVeterinario() {
        return this.getUserRole() === 'veterinario';
    }

    // Verificar si es recepcionista
    isRecepcionista() {
        return this.getUserRole() === 'recepcionista';
    }

    // Verificar si es cliente
    isCliente() {
        return this.getUserRole() === 'cliente';
    }

    // === VALIDACIONES ===
    validateUserData(userData) {
        if (!userData.nombre || userData.nombre.length < 2) {
            this.showToast('El nombre debe tener al menos 2 caracteres', 'error');
            return false;
        }

        if (!this.isValidEmail(userData.email)) {
            this.showToast('Por favor, ingresa un email válido', 'error');
            return false;
        }

        if (!this.isValidPhone(userData.telefono)) {
            this.showToast('Por favor, ingresa un teléfono válido', 'error');
            return false;
        }

        if (!userData.direccion || userData.direccion.length < 5) {
            this.showToast('La dirección debe tener al menos 5 caracteres', 'error');
            return false;
        }

        if (!userData.password || userData.password.length < 6) {
            this.showToast('La contraseña debe tener al menos 6 caracteres', 'error');
            return false;
        }

        if (!userData.rol) {
            this.showToast('Debes seleccionar un rol', 'error');
            return false;
        }

        return true;
    }

    validateProfileData(userData) {
        if (!userData.nombre || userData.nombre.length < 2) {
            this.showToast('El nombre debe tener al menos 2 caracteres', 'error');
            return false;
        }

        if (!this.isValidEmail(userData.email)) {
            this.showToast('Por favor, ingresa un email válido', 'error');
            return false;
        }

        if (!this.isValidPhone(userData.telefono)) {
            this.showToast('Por favor, ingresa un teléfono válido', 'error');
            return false;
        }

        if (!userData.direccion || userData.direccion.length < 5) {
            this.showToast('La dirección debe tener al menos 5 caracteres', 'error');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
    }

    // === UTILIDADES ===
    setLoading(loading) {
        const buttons = document.querySelectorAll('form .btn-primary');
        buttons.forEach(btn => {
            btn.disabled = loading;
            if (loading) {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
            } else {
                // Restaurar texto original
                const originalText = btn.dataset.originalText;
                if (originalText) {
                    btn.innerHTML = originalText;
                }
            }
        });
    }

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Crear instancia global de autenticación
const auth = new Auth();

// Función global para logout
window.logout = () => auth.logout();

// Exportar para uso global
window.auth = auth;

Logger.info('Módulo de autenticación cargado correctamente'); 