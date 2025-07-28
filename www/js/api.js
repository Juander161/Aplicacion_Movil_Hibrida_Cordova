// Módulo de API para comunicaciones con el backend
class API {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.timeout = CONFIG.REQUEST_TIMEOUT;
    }

    // Función para obtener el token de autenticación
    getAuthToken() {
        return localStorage.getItem(CONFIG.TOKEN_KEY);
    }

    // Función para establecer el token de autenticación
    setAuthToken(token) {
        localStorage.setItem(CONFIG.TOKEN_KEY, token);
    }

    // Función para eliminar el token de autenticación
    removeAuthToken() {
        localStorage.removeItem(CONFIG.TOKEN_KEY);
    }

    // Función para obtener headers de autenticación
    getAuthHeaders() {
        const token = this.getAuthToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    // Función para hacer peticiones HTTP
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            headers: this.getAuthHeaders(),
            timeout: this.timeout
        };

        const requestOptions = {
            ...defaultOptions,
            ...options
        };

        try {
            showLoading();
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            
            const response = await fetch(url, {
                ...requestOptions,
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            hideLoading();

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            hideLoading();
            
            if (error.name === 'AbortError') {
                throw new Error('La petición tardó demasiado tiempo');
            }
            
            if (error.message.includes('401')) {
                // Token expirado o inválido
                this.removeAuthToken();
                showLogin();
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }
            
            throw error;
        }
    }

    // Métodos GET
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // Métodos POST
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Métodos PUT
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // Métodos DELETE
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // ===== ENDPOINTS DE AUTENTICACIÓN =====
    
    // Login
    async login(email, password) {
        return this.post('/auth/login', { email, password });
    }

    // Registro
    async register(userData) {
        return this.post('/auth/registro', userData);
    }

    // Obtener perfil del usuario
    async getProfile() {
        return this.get('/auth/perfil');
    }

    // ===== ENDPOINTS DE USUARIOS =====
    
    // Obtener todos los usuarios
    async getUsers() {
        return this.get('/usuarios');
    }

    // Obtener usuario por ID
    async getUser(id) {
        return this.get(`/usuarios/${id}`);
    }

    // Actualizar usuario
    async updateUser(id, userData) {
        return this.put(`/usuarios/${id}`, userData);
    }

    // Eliminar usuario
    async deleteUser(id) {
        return this.delete(`/usuarios/${id}`);
    }

    // ===== ENDPOINTS DE MASCOTAS =====
    
    // Obtener todas las mascotas
    async getMascotas() {
        return this.get('/mascotas');
    }

    // Obtener mascota por ID
    async getMascota(id) {
        return this.get(`/mascotas/${id}`);
    }

    // Crear nueva mascota
    async createMascota(mascotaData) {
        return this.post('/mascotas', mascotaData);
    }

    // Actualizar mascota
    async updateMascota(id, mascotaData) {
        return this.put(`/mascotas/${id}`, mascotaData);
    }

    // Eliminar mascota
    async deleteMascota(id) {
        return this.delete(`/mascotas/${id}`);
    }

    // ===== ENDPOINTS DE HISTORIALES MÉDICOS =====
    
    // Obtener todos los historiales
    async getHistoriales() {
        return this.get('/historiales');
    }

    // Obtener historial por ID
    async getHistorial(id) {
        return this.get(`/historiales/${id}`);
    }

    // Crear nuevo historial
    async createHistorial(historialData) {
        return this.post('/historiales', historialData);
    }

    // Actualizar historial
    async updateHistorial(id, historialData) {
        return this.put(`/historiales/${id}`, historialData);
    }

    // Eliminar historial
    async deleteHistorial(id) {
        return this.delete(`/historiales/${id}`);
    }

    // ===== ENDPOINTS DE CITAS =====
    
    // Obtener todas las citas
    async getCitas() {
        return this.get('/citas');
    }

    // Obtener cita por ID
    async getCita(id) {
        return this.get(`/citas/${id}`);
    }

    // Crear nueva cita
    async createCita(citaData) {
        return this.post('/citas', citaData);
    }

    // Actualizar cita
    async updateCita(id, citaData) {
        return this.put(`/citas/${id}`, citaData);
    }

    // Eliminar cita
    async deleteCita(id) {
        return this.delete(`/citas/${id}`);
    }

    // ===== FUNCIONES DE UTILIDAD =====
    
    // Función para manejar errores de red
    handleNetworkError(error) {
        console.error('Error de red:', error);
        
        if (!navigator.onLine) {
            showToast('No hay conexión a internet', 'error');
            return;
        }
        
        if (error.message.includes('fetch')) {
            showToast('Error de conexión con el servidor', 'error');
            return;
        }
        
        showToast(error.message || 'Error desconocido', 'error');
    }

    // Función para validar respuesta
    validateResponse(response) {
        if (!response) {
            throw new Error('Respuesta vacía del servidor');
        }
        
        if (response.error) {
            throw new Error(response.error);
        }
        
        return response;
    }

    // Función para formatear datos antes de enviar
    formatDataForAPI(data) {
        // Eliminar campos undefined o null
        const cleanData = {};
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
                cleanData[key] = data[key];
            }
        });
        return cleanData;
    }

    // Función para formatear fechas para la API
    formatDateForAPI(date) {
        if (!date) return null;
        
        const d = new Date(date);
        return d.toISOString();
    }

    // Función para combinar fecha y hora
    combineDateTime(date, time) {
        if (!date || !time) return null;
        
        const dateTime = new Date(`${date}T${time}`);
        return dateTime.toISOString();
    }
}

// Crear instancia global de la API
const api = new API();

// Exportar para uso global
window.api = api; 