// Configuración de la aplicación móvil
const CONFIG = {
    // URL de la API - Ajustar según el entorno
    API_BASE_URL: (function() {
        // Detectar si estamos en un dispositivo móvil
        if (window.cordova) {
            // En producción, usar la IP del servidor donde corre Docker
            return 'http://192.168.1.100:3000/api'; // Cambiar por tu IP
        } else {
            // Para desarrollo en navegador - usar localhost o 127.0.0.1
            return 'http://127.0.0.1:3000/api';
        }
    })(),
    
    // Configuraciones de la aplicación
    APP_NAME: 'Patitas Felices',
    VERSION: '1.0.0',
    
    // Configuraciones de UI
    TOAST_DURATION: 3000,
    LOADING_TIMEOUT: 10000,
    
    // Configuraciones de almacenamiento local
    STORAGE_KEYS: {
        TOKEN: 'auth_token',
        USER: 'user_data',
        SETTINGS: 'app_settings',
        OFFLINE_DATA: 'offline_data'
    },
    
    // Configuraciones de red
    NETWORK: {
        TIMEOUT: 10000,
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000
    },
    
    // Configuraciones específicas para móvil
    MOBILE: {
        VIBRATION_DURATION: 100,
        CAMERA_QUALITY: 50,
        GEOLOCATION_TIMEOUT: 15000,
        GEOLOCATION_MAX_AGE: 300000
    },
    
    // Estados de conexión
    CONNECTION_STATUS: {
        ONLINE: 'online',
        OFFLINE: 'offline',
        CHECKING: 'checking'
    },
    
    // Roles de usuario
    USER_ROLES: {
        ADMIN: 'admin',
        VETERINARIO: 'veterinario',
        RECEPCIONISTA: 'recepcionista',
        CLIENTE: 'cliente'
    }
};

// Configuración específica para diferentes entornos
const ENVIRONMENT_CONFIG = {
    development: {
        API_BASE_URL: 'http://127.0.0.1:3000/api',
        DEBUG: true,
        LOG_LEVEL: 'debug'
    },
    production: {
        API_BASE_URL: 'https://tu-servidor.com/api', // Cambiar por tu dominio
        DEBUG: false,
        LOG_LEVEL: 'error'
    }
};

// Detectar entorno actual
const CURRENT_ENV = (function() {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168.')) {
        return 'development';
    }
    return 'production';
})();

// Aplicar configuración del entorno
Object.assign(CONFIG, ENVIRONMENT_CONFIG[CURRENT_ENV]);

// Función para obtener la configuración
window.getConfig = function(key) {
    return key ? CONFIG[key] : CONFIG;
};

// Función para actualizar la URL de la API dinámicamente
window.updateAPIUrl = function(newUrl) {
    CONFIG.API_BASE_URL = newUrl;
    // Actualizar también en el cliente API si existe
    if (window.api && window.api.baseURL) {
        window.api.baseURL = newUrl;
    }
    console.log('API URL actualizada a:', newUrl);
};

// Función para verificar si estamos en un dispositivo móvil
window.isMobile = function() {
    return window.cordova !== undefined;
};

// Función para verificar si estamos en línea
window.isOnline = function() {
    if (window.cordova && navigator.connection) {
        return navigator.connection.type !== 'none';
    }
    return navigator.onLine;
};

// Función para obtener la URL actual de la API
window.getCurrentAPIUrl = function() {
    return CONFIG.API_BASE_URL;
};

// Función para cambiar entre entornos de desarrollo
window.switchToDevelopment = function() {
    CONFIG.API_BASE_URL = 'http://127.0.0.1:3000/api';
    if (window.api && window.api.baseURL) {
        window.api.baseURL = CONFIG.API_BASE_URL;
    }
    console.log('Cambiado a entorno de desarrollo:', CONFIG.API_BASE_URL);
};

window.switchToProduction = function() {
    CONFIG.API_BASE_URL = 'https://tu-servidor.com/api';
    if (window.api && window.api.baseURL) {
        window.api.baseURL = CONFIG.API_BASE_URL;
    }
    console.log('Cambiado a entorno de producción:', CONFIG.API_BASE_URL);
};

// Función para probar la conexión a la API
window.testAPIConnection = async function() {
    try {
        const response = await fetch(CONFIG.API_BASE_URL + '/health', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ Conexión a la API exitosa');
            return true;
        } else {
            console.log('❌ Error en la conexión a la API:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Error conectando a la API:', error.message);
        return false;
    }
};

// Mostrar información de configuración al cargar
console.log('🔧 Configuración de la aplicación:');
console.log('   Entorno:', CURRENT_ENV);
console.log('   API URL:', CONFIG.API_BASE_URL);
console.log('   Debug:', CONFIG.DEBUG);
console.log('   Móvil:', window.isMobile());

// Logger para diferentes niveles
window.Logger = {
    debug: function(...args) {
        if (CONFIG.DEBUG && CONFIG.LOG_LEVEL === 'debug') {
            console.log('[DEBUG]', ...args);
        }
    },
    info: function(...args) {
        if (CONFIG.DEBUG) {
            console.info('[INFO]', ...args);
        }
    },
    warn: function(...args) {
        console.warn('[WARN]', ...args);
    },
    error: function(...args) {
        console.error('[ERROR]', ...args);
    }
};

// Configuración específica para Cordova
document.addEventListener('deviceready', function() {
    Logger.info('Dispositivo listo, configurando aplicación móvil...');
    
    // Configurar StatusBar
    if (window.StatusBar) {
        StatusBar.styleDefault();
        StatusBar.backgroundColorByHexString('#2E8B57');
    }
    
    // Configurar SplashScreen
    if (window.navigator && window.navigator.splashscreen) {
        setTimeout(function() {
            navigator.splashscreen.hide();
        }, 3000);
    }
    
    // Configurar eventos de pausa y resume
    document.addEventListener('pause', onPause, false);
    document.addEventListener('resume', onResume, false);
    document.addEventListener('backbutton', onBackButton, false);
    
    // Eventos de red
    document.addEventListener('online', onOnline, false);
    document.addEventListener('offline', onOffline, false);
    
    Logger.info('Configuración móvil completada');
}, false);

// Funciones de eventos Cordova
function onPause() {
    Logger.info('Aplicación pausada');
    // Guardar datos importantes
    if (window.saveAppState) {
        window.saveAppState();
    }
}

function onResume() {
    Logger.info('Aplicación reanudada');
    // Verificar conexión y sincronizar datos
    if (window.checkConnection) {
        window.checkConnection();
    }
}

function onBackButton(e) {
    e.preventDefault();
    
    // Manejar el botón atrás según la vista actual
    if (window.handleBackButton) {
        window.handleBackButton();
    } else {
        // Comportamiento por defecto
        if (navigator.notification) {
            navigator.notification.confirm(
                '¿Deseas salir de la aplicación?',
                function(buttonIndex) {
                    if (buttonIndex === 1) {
                        navigator.app.exitApp();
                    }
                },
                'Salir',
                ['Sí', 'No']
            );
        }
    }
}

function onOnline() {
    Logger.info('Conexión restaurada');
    if (window.handleOnline) {
        window.handleOnline();
    }
}

function onOffline() {
    Logger.info('Conexión perdida');
    if (window.handleOffline) {
        window.handleOffline();
    }
}

// Utilidades para almacenamiento local
window.Storage = {
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            Logger.error('Error guardando en localStorage:', e);
            return false;
        }
    },
    
    get: function(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            Logger.error('Error leyendo localStorage:', e);
            return null;
        }
    },
    
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            Logger.error('Error eliminando de localStorage:', e);
            return false;
        }
    },
    
    clear: function() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            Logger.error('Error limpiando localStorage:', e);
            return false;
        }
    }
};

Logger.info('Configuración cargada:', CONFIG);