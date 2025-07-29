// Cliente API para aplicación móvil de la Clínica Veterinaria
class APIClient {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.token = Storage.get(CONFIG.STORAGE_KEYS.TOKEN);
        this.retryAttempts = CONFIG.NETWORK.RETRY_ATTEMPTS;
        this.retryDelay = CONFIG.NETWORK.RETRY_DELAY;
    }

    // Configurar token de autenticación
    setToken(token) {
        this.token = token;
        Storage.set(CONFIG.STORAGE_KEYS.TOKEN, token);
        Logger.debug('Token actualizado');
    }

    // Limpiar token
    clearToken() {
        this.token = null;
        Storage.remove(CONFIG.STORAGE_KEYS.TOKEN);
        Logger.debug('Token eliminado');
    }

    // Headers por defecto
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Método HTTP genérico con reintentos
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: 'GET',
            headers: this.getHeaders(),
            timeout: CONFIG.NETWORK.TIMEOUT,
            ...options
        };

        Logger.debug(`${config.method} ${url}`, config);

        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                // Verificar conexión antes de hacer la petición
                if (!isOnline()) {
                    throw new Error('Sin conexión a internet');
                }

                const response = await this.fetchWithTimeout(url, config);
                
                // Manejar respuestas de error HTTP
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `HTTP ${response.status}`);
                }

                // Verificar si la respuesta tiene contenido
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    // Si no es JSON, verificar si hay contenido
                    const text = await response.text();
                    if (!text.trim()) {
                        // Respuesta vacía, devolver objeto por defecto
                        Logger.warn('Respuesta vacía del servidor, usando datos por defecto');
                        return this.getDefaultResponse(endpoint);
                    }
                    // Intentar parsear como JSON
                    try {
                        const data = JSON.parse(text);
                        Logger.debug('Respuesta exitosa:', data);
                        return data;
                    } catch (parseError) {
                        Logger.warn('Error parseando JSON, usando datos por defecto');
                        return this.getDefaultResponse(endpoint);
                    }
                }

                // Intentar parsear JSON
                const data = await response.json().catch(async (parseError) => {
                    Logger.warn('Error parseando JSON, intentando leer como texto');
                    const text = await response.text();
                    if (!text.trim()) {
                        return this.getDefaultResponse(endpoint);
                    }
                    try {
                        return JSON.parse(text);
                    } catch (finalError) {
                        Logger.error('No se pudo parsear la respuesta como JSON');
                        return this.getDefaultResponse(endpoint);
                    }
                });

                Logger.debug('Respuesta exitosa:', data);
                return data;

            } catch (error) {
                Logger.warn(`Intento ${attempt} falló:`, error.message);

                // Si es el último intento o es un error de autenticación, lanzar el error
                if (attempt === this.retryAttempts || error.message.includes('401') || error.message.includes('403')) {
                    if (error.message.includes('401')) {
                        this.handleUnauthorized();
                    }
                    throw error;
                }

                // Esperar antes del siguiente intento
                await this.delay(this.retryDelay * attempt);
            }
        }
    }

    // Fetch con timeout
    async fetchWithTimeout(url, config) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        try {
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Tiempo de espera agotado');
            }
            throw error;
        }
    }

    // Manejar errores de autenticación
    handleUnauthorized() {
        Logger.warn('Token expirado o inválido');
        this.clearToken();
        
        // Redirigir al login
        if (window.showLogin) {
            window.showLogin();
        }
        
        // Mostrar notificación
        if (window.showToast) {
            window.showToast('Sesión expirada. Por favor, inicia sesión nuevamente.', 'error');
        }
    }

    // Función de delay para reintentos
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Métodos HTTP básicos
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // === ENDPOINTS DE AUTENTICACIÓN ===
    async login(email, password) {
        try {
            const response = await this.post('/auth/login', { email, password });
            
            if (response.token) {
                this.setToken(response.token);
                Storage.set(CONFIG.STORAGE_KEYS.USER, response.usuario);
                Logger.info('Login exitoso');
            }
            
            return response;
        } catch (error) {
            Logger.error('Error en login:', error);
            throw error;
        }
    }

    async register(userData) {
        try {
            const response = await this.post('/auth/registro', userData);
            Logger.info('Registro exitoso');
            return response;
        } catch (error) {
            Logger.error('Error en registro:', error);
            throw error;
        }
    }

    async getProfile() {
        try {
            const response = await this.get('/auth/perfil');
            Storage.set(CONFIG.STORAGE_KEYS.USER, response.usuario);
            return response;
        } catch (error) {
            Logger.error('Error obteniendo perfil:', error);
            throw error;
        }
    }

    // === ENDPOINTS DE USUARIOS ===
    async getUsuarios(filtro = '') {
        const endpoint = filtro ? `/usuarios?rol=${filtro}` : '/usuarios';
        return this.get(endpoint);
    }

    async getUsuario(id) {
        return this.get(`/usuarios/${id}`);
    }

    async updateUsuario(id, userData) {
        return this.put(`/usuarios/${id}`, userData);
    }

    async deleteUsuario(id) {
        return this.delete(`/usuarios/${id}`);
    }

    // === ENDPOINTS DE MASCOTAS ===
    async getMascotas() {
        return this.get('/mascotas');
    }

    async getMascota(id) {
        return this.get(`/mascotas/${id}`);
    }

    async createMascota(mascotaData) {
        return this.post('/mascotas', mascotaData);
    }

    async updateMascota(id, mascotaData) {
        return this.put(`/mascotas/${id}`, mascotaData);
    }

    async deleteMascota(id) {
        return this.delete(`/mascotas/${id}`);
    }

    // === ENDPOINTS DE CITAS ===
    async getCitas(estado = '') {
        const endpoint = estado ? `/citas?estado=${estado}` : '/citas';
        return this.get(endpoint);
    }

    async getCita(id) {
        return this.get(`/citas/${id}`);
    }

    async createCita(citaData) {
        return this.post('/citas', citaData);
    }

    async updateCita(id, citaData) {
        return this.put(`/citas/${id}`, citaData);
    }

    async deleteCita(id) {
        return this.delete(`/citas/${id}`);
    }

    // === ENDPOINTS DE HISTORIALES ===
    async getHistoriales() {
        return this.get('/historiales');
    }

    async getHistorial(id) {
        return this.get(`/historiales/${id}`);
    }

    async createHistorial(historialData) {
        return this.post('/historiales', historialData);
    }

    async updateHistorial(id, historialData) {
        return this.put(`/historiales/${id}`, historialData);
    }

    async deleteHistorial(id) {
        return this.delete(`/historiales/${id}`);
    }

    // === MÉTODOS PARA DATOS ESPECÍFICOS ===
    async getVeterinarios() {
        try {
            const response = await this.getUsuarios('veterinario');
            return response.usuarios || [];
        } catch (error) {
            Logger.error('Error obteniendo veterinarios:', error);
            return [];
        }
    }

    async getMascotasByPropietario(propietarioId) {
        try {
            const response = await this.getMascotas();
            return response.mascotas?.filter(m => m.id_propietario === propietarioId) || [];
        } catch (error) {
            Logger.error('Error obteniendo mascotas del propietario:', error);
            return [];
        }
    }

    // === MÉTODO PARA VERIFICAR CONECTIVIDAD ===
    async checkConnection() {
        try {
            await this.get('/auth/perfil');
            return true;
        } catch (error) {
            Logger.warn('Error verificando conexión:', error);
            return false;
        }
    }

    // === MÉTODOS PARA MODO OFFLINE ===
    saveOfflineData(key, data) {
        const offlineData = Storage.get(CONFIG.STORAGE_KEYS.OFFLINE_DATA) || {};
        offlineData[key] = {
            data: data,
            timestamp: Date.now()
        };
        Storage.set(CONFIG.STORAGE_KEYS.OFFLINE_DATA, offlineData);
    }

    getOfflineData(key) {
        const offlineData = Storage.get(CONFIG.STORAGE_KEYS.OFFLINE_DATA) || {};
        return offlineData[key]?.data || null;
    }

    clearOfflineData() {
        Storage.remove(CONFIG.STORAGE_KEYS.OFFLINE_DATA);
    }

    // === SINCRONIZACIÓN DE DATOS ===
    async syncOfflineData() {
        if (!isOnline()) {
            Logger.warn('Sin conexión para sincronizar datos');
            return false;
        }

        try {
            const offlineData = Storage.get(CONFIG.STORAGE_KEYS.OFFLINE_DATA) || {};
            const pendingActions = offlineData.pendingActions || [];

            for (const action of pendingActions) {
                try {
                    await this.executeAction(action);
                    Logger.info('Acción sincronizada:', action);
                } catch (error) {
                    Logger.error('Error sincronizando acción:', action, error);
                }
            }

            // Limpiar acciones pendientes después de sincronizar
            delete offlineData.pendingActions;
            Storage.set(CONFIG.STORAGE_KEYS.OFFLINE_DATA, offlineData);

            return true;
        } catch (error) {
            Logger.error('Error en sincronización:', error);
            return false;
        }
    }

    async executeAction(action) {
        const { method, endpoint, data } = action;
        
        switch (method) {
            case 'POST':
                return await this.post(endpoint, data);
            case 'PUT':
                return await this.put(endpoint, data);
            case 'DELETE':
                return await this.delete(endpoint);
            default:
                throw new Error(`Método no soportado: ${method}`);
        }
    }

    queueOfflineAction(method, endpoint, data = null) {
        const offlineData = Storage.get(CONFIG.STORAGE_KEYS.OFFLINE_DATA) || {};
        const pendingActions = offlineData.pendingActions || [];
        
        pendingActions.push({
            id: Date.now(),
            method,
            endpoint,
            data,
            timestamp: Date.now()
        });
        
        offlineData.pendingActions = pendingActions;
        Storage.set(CONFIG.STORAGE_KEYS.OFFLINE_DATA, offlineData);
        
        Logger.info('Acción encolada para sincronización:', { method, endpoint });
    }

    // Obtener respuesta por defecto según el endpoint
    getDefaultResponse(endpoint) {
        const defaults = {
            '/mascotas': { mascotas: [] },
            '/citas': { citas: [] },
            '/usuarios': { usuarios: [] },
            '/historiales': { historiales: [] },
            '/auth/perfil': { usuario: null },
            '/auth/login': { token: null, usuario: null },
            '/auth/register': { usuario: null }
        };

        // Buscar el endpoint más cercano
        for (const [key, value] of Object.entries(defaults)) {
            if (endpoint.includes(key.replace('/', ''))) {
                return value;
            }
        }

        // Respuesta genérica
        return { success: true, data: [] };
    }
}

// Instancia global del cliente API
window.api = new APIClient();

// Funciones de conveniencia para uso global
window.handleOnline = function() {
    Logger.info('Conexión restaurada, sincronizando datos...');
    if (window.showToast) {
        window.showToast('Conexión restaurada', 'success');
    }
    
    // Sincronizar datos offline
    api.syncOfflineData();
    
    // Recargar datos si es necesario
    if (window.reloadCurrentSection) {
        window.reloadCurrentSection();
    }
};

window.handleOffline = function() {
    Logger.warn('Conexión perdida, modo offline activado');
    if (window.showToast) {
        window.showToast('Sin conexión. Trabajando en modo offline', 'warning');
    }
};

Logger.info('Cliente API inicializado');