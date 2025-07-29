// Configuración de desarrollo - Cambiar según tu entorno
const DEV_CONFIG = {
    // URLs de la API para diferentes entornos
    API_URLS: {
        localhost: 'http://localhost:3000/api',
        localhost_alt: 'http://127.0.0.1:3000/api',
        docker: 'http://192.168.1.100:3000/api',
        production: 'https://tu-servidor.com/api'
    },
    
    // URL actual de la API (cambiar según tu configuración)
    CURRENT_API_URL: 'http://127.0.0.1:3000/api',
    
    // Configuraciones de desarrollo
    DEBUG: true,
    LOG_LEVEL: 'debug',
    
    // Credenciales de prueba
    DEMO_CREDENTIALS: {
        admin: {
            email: 'admin@clinica.com',
            password: 'admin123456'
        },
        veterinario: {
            email: 'vet@clinica.com',
            password: 'vet123456'
        },
        recepcionista: {
            email: 'recep@clinica.com',
            password: 'recep123456'
        },
        cliente: {
            email: 'cliente@test.com',
            password: 'cliente123456'
        }
    }
};

// Función para cambiar la URL de la API
window.changeAPIUrl = function(urlKey) {
    const newUrl = DEV_CONFIG.API_URLS[urlKey];
    if (newUrl) {
        DEV_CONFIG.CURRENT_API_URL = newUrl;
        CONFIG.API_BASE_URL = newUrl;
        
        // Actualizar en el cliente API si existe
        if (window.api && window.api.baseURL) {
            window.api.baseURL = newUrl;
        }
        
        console.log('🔄 API URL cambiada a:', newUrl);
        return true;
    } else {
        console.error('❌ URL no encontrada:', urlKey);
        return false;
    }
};

// Función para obtener la URL actual
window.getCurrentAPIUrl = function() {
    return DEV_CONFIG.CURRENT_API_URL;
};

// Función para listar todas las URLs disponibles
window.listAPIUrls = function() {
    console.log('📋 URLs de API disponibles:');
    Object.entries(DEV_CONFIG.API_URLS).forEach(([key, url]) => {
        const isCurrent = url === DEV_CONFIG.CURRENT_API_URL;
        console.log(`   ${isCurrent ? '✅' : '  '} ${key}: ${url}`);
    });
};

// Función para probar todas las URLs
window.testAllAPIUrls = async function() {
    console.log('🧪 Probando todas las URLs de API...');
    
    for (const [key, url] of Object.entries(DEV_CONFIG.API_URLS)) {
        try {
            const response = await fetch(url + '/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log(`✅ ${key}: ${url} - CONECTADO`);
            } else {
                console.log(`❌ ${key}: ${url} - Error ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${key}: ${url} - ${error.message}`);
        }
    }
};

// Función para auto-detect la mejor URL
window.autoDetectAPIUrl = async function() {
    console.log('🔍 Auto-detectando la mejor URL de API...');
    
    for (const [key, url] of Object.entries(DEV_CONFIG.API_URLS)) {
        try {
            const response = await fetch(url + '/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log(`✅ Encontrada URL funcional: ${key} - ${url}`);
                window.changeAPIUrl(key);
                return true;
            }
        } catch (error) {
            // Continuar con la siguiente URL
        }
    }
    
    console.log('❌ No se encontró ninguna URL funcional');
    return false;
};

// Función para obtener credenciales de demo
window.getDemoCredentials = function(role = 'admin') {
    return DEV_CONFIG.DEMO_CREDENTIALS[role] || DEV_CONFIG.DEMO_CREDENTIALS.admin;
};

// Función para auto-login con credenciales de demo
window.autoLoginDemo = async function(role = 'admin') {
    const credentials = window.getDemoCredentials(role);
    
    if (window.auth && window.auth.handleLogin) {
        // Simular el login automático
        document.getElementById('login-email').value = credentials.email;
        document.getElementById('login-password').value = credentials.password;
        
        console.log(`🔑 Auto-login con ${role}: ${credentials.email}`);
        
        // Disparar el evento de submit
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            loginForm.dispatchEvent(submitEvent);
        }
    }
};

// Función para mostrar información de desarrollo
window.showDevInfo = function() {
    console.log('🔧 Información de desarrollo:');
    console.log('   API URL actual:', DEV_CONFIG.CURRENT_API_URL);
    console.log('   Debug:', DEV_CONFIG.DEBUG);
    console.log('   Log level:', DEV_CONFIG.LOG_LEVEL);
    console.log('   Entorno:', window.location.hostname);
    console.log('   Protocolo:', window.location.protocol);
    console.log('   Puerto:', window.location.port);
};

// Inicializar configuración de desarrollo
window.initDevConfig = function() {
    // Aplicar la URL actual a la configuración principal
    CONFIG.API_BASE_URL = DEV_CONFIG.CURRENT_API_URL;
    
    // Mostrar información inicial
    window.showDevInfo();
    window.listAPIUrls();
    
    console.log('🚀 Configuración de desarrollo inicializada');
};

// Ejecutar al cargar
window.initDevConfig();

// Exponer funciones globales para desarrollo
window.DEV_CONFIG = DEV_CONFIG; 