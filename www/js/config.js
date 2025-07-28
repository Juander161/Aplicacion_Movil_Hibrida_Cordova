// Configuración global de la aplicación
const CONFIG = {
    // URL base de la API - cambiar según el entorno
    API_BASE_URL: 'http://localhost:3000/api',
    
    // Configuración de la aplicación
    APP_NAME: 'Patitas Felices',
    APP_VERSION: '1.0.0',
    
    // Configuración de autenticación
    TOKEN_KEY: 'patitas_felices_token',
    USER_KEY: 'patitas_felices_user',
    
    // Configuración de timeouts
    REQUEST_TIMEOUT: 10000, // 10 segundos
    
    // Configuración de paginación
    ITEMS_PER_PAGE: 20,
    
    // Configuración de notificaciones
    TOAST_DURATION: 3000, // 3 segundos
    
    // Roles de usuario
    ROLES: {
        CLIENTE: 'cliente',
        VETERINARIO: 'veterinario',
        RECEPCIONISTA: 'recepcionista',
        ADMIN: 'admin'
    },
    
    // Estados de citas
    ESTADOS_CITA: {
        PENDIENTE: 'pendiente',
        CONFIRMADA: 'confirmada',
        CANCELADA: 'cancelada',
        COMPLETADA: 'completada'
    },
    
    // Especies de mascotas
    ESPECIES: {
        PERRO: 'Perro',
        GATO: 'Gato',
        AVE: 'Ave',
        REPTIL: 'Reptil',
        OTRO: 'Otro'
    }
};

// Función para obtener la URL de la API según el entorno
function getApiUrl() {
    // En desarrollo, usar localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }
    
    // En producción, usar la URL del servidor
    // Cambiar esta URL por la URL real de tu API en producción
    return 'https://tu-api-patitas-felices.com/api';
}

// Actualizar la URL base de la API
CONFIG.API_BASE_URL = getApiUrl();

// Función para validar si estamos en un dispositivo móvil
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Función para obtener el tamaño de pantalla
function getScreenSize() {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
}

// Función para formatear fechas
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Función para formatear fechas y horas
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Función para formatear moneda
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

// Función para obtener el icono de especie
function getEspecieIcon(especie) {
    const icons = {
        'Perro': '🐕',
        'Gato': '🐱',
        'Ave': '🦜',
        'Reptil': '🦎',
        'Otro': '🐾'
    };
    return icons[especie] || '🐾';
}

// Función para obtener el color de estado
function getEstadoColor(estado) {
    const colors = {
        'pendiente': '#ffc107',
        'confirmada': '#28a745',
        'cancelada': '#dc3545',
        'completada': '#007bff'
    };
    return colors[estado] || '#6c757d';
}

// Función para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Función para validar teléfono
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Función para generar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Función para debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Función para throttle
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Exportar configuración global
window.CONFIG = CONFIG;
window.isMobileDevice = isMobileDevice;
window.getScreenSize = getScreenSize;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.formatCurrency = formatCurrency;
window.getEspecieIcon = getEspecieIcon;
window.getEstadoColor = getEstadoColor;
window.isValidEmail = isValidEmail;
window.isValidPhone = isValidPhone;
window.generateId = generateId;
window.debounce = debounce;
window.throttle = throttle; 