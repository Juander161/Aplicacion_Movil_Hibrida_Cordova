// Manejador de errores para la API
class APIErrorHandler {
    constructor() {
        this.errorMessages = {
            // Errores de conexión
            'Failed to fetch': 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
            'NetworkError': 'Error de red. Verifica tu conexión.',
            'TimeoutError': 'La solicitud tardó demasiado. Inténtalo nuevamente.',
            
            // Errores HTTP
            '400': 'Solicitud incorrecta. Verifica los datos enviados.',
            '401': 'Sesión expirada. Por favor, inicia sesión nuevamente.',
            '403': 'No tienes permisos para realizar esta acción.',
            '404': 'Recurso no encontrado.',
            '500': 'Error interno del servidor. Inténtalo más tarde.',
            '502': 'Servidor no disponible. Inténtalo más tarde.',
            '503': 'Servicio temporalmente no disponible.',
            
            // Errores de JSON
            'Unexpected end of JSON input': 'El servidor no respondió correctamente. Inténtalo más tarde.',
            'JSON Parse Error': 'Error al procesar la respuesta del servidor.',
            
            // Errores específicos de la aplicación
            'INVALID_CREDENTIALS': 'Email o contraseña incorrectos.',
            'USER_NOT_FOUND': 'Usuario no encontrado.',
            'EMAIL_ALREADY_EXISTS': 'Este email ya está registrado.',
            'INVALID_TOKEN': 'Token de autenticación inválido.',
            'TOKEN_EXPIRED': 'Sesión expirada. Por favor, inicia sesión nuevamente.',
            
            // Errores de validación
            'VALIDATION_ERROR': 'Datos inválidos. Verifica la información ingresada.',
            'REQUIRED_FIELD': 'Campo requerido faltante.',
            'INVALID_EMAIL': 'Formato de email inválido.',
            'INVALID_PHONE': 'Formato de teléfono inválido.',
            'PASSWORD_TOO_SHORT': 'La contraseña debe tener al menos 6 caracteres.',
            
            // Errores de negocio
            'PET_NOT_FOUND': 'Mascota no encontrada.',
            'APPOINTMENT_NOT_FOUND': 'Cita no encontrada.',
            'MEDICAL_RECORD_NOT_FOUND': 'Historial médico no encontrado.',
            'USER_NOT_FOUND': 'Usuario no encontrado.',
            'DUPLICATE_APPOINTMENT': 'Ya existe una cita para esta fecha y hora.',
            'INVALID_APPOINTMENT_TIME': 'La fecha de la cita no puede ser en el pasado.',
            
            // Errores de permisos
            'INSUFFICIENT_PERMISSIONS': 'No tienes permisos para realizar esta acción.',
            'ADMIN_ONLY': 'Esta acción solo puede ser realizada por administradores.',
            'VET_ONLY': 'Esta acción solo puede ser realizada por veterinarios.',
            'RECEPTIONIST_ONLY': 'Esta acción solo puede ser realizada por recepcionistas.'
        };
    }

    // Obtener mensaje de error amigable
    getErrorMessage(error) {
        const errorString = error.toString();
        
        // Buscar mensajes específicos
        for (const [key, message] of Object.entries(this.errorMessages)) {
            if (errorString.includes(key)) {
                return message;
            }
        }
        
        // Buscar códigos HTTP
        const httpMatch = errorString.match(/HTTP (\d+)/);
        if (httpMatch) {
            const statusCode = httpMatch[1];
            return this.errorMessages[statusCode] || `Error del servidor (${statusCode})`;
        }
        
        // Mensaje por defecto
        return 'Ha ocurrido un error inesperado. Inténtalo más tarde.';
    }

    // Determinar el tipo de error
    getErrorType(error) {
        const errorString = error.toString();
        
        if (errorString.includes('Failed to fetch') || errorString.includes('NetworkError')) {
            return 'connection';
        }
        
        if (errorString.includes('401') || errorString.includes('TOKEN_EXPIRED')) {
            return 'authentication';
        }
        
        if (errorString.includes('403') || errorString.includes('INSUFFICIENT_PERMISSIONS')) {
            return 'permission';
        }
        
        if (errorString.includes('Unexpected end of JSON') || errorString.includes('JSON Parse Error')) {
            return 'server';
        }
        
        if (errorString.includes('VALIDATION_ERROR') || errorString.includes('REQUIRED_FIELD')) {
            return 'validation';
        }
        
        return 'general';
    }

    // Obtener acción recomendada según el tipo de error
    getRecommendedAction(errorType) {
        const actions = {
            'connection': 'Verifica tu conexión a internet y vuelve a intentar.',
            'authentication': 'Inicia sesión nuevamente.',
            'permission': 'Contacta al administrador si crees que deberías tener acceso.',
            'server': 'El problema es temporal. Inténtalo más tarde.',
            'validation': 'Verifica la información ingresada y vuelve a intentar.',
            'general': 'Si el problema persiste, contacta al soporte técnico.'
        };
        
        return actions[errorType] || actions.general;
    }

    // Manejar error completo
    handleError(error, context = '') {
        const errorMessage = this.getErrorMessage(error);
        const errorType = this.getErrorType(error);
        const recommendedAction = this.getRecommendedAction(errorType);
        
        // Log del error
        Logger.error(`Error en ${context}:`, {
            message: error.message,
            type: errorType,
            userMessage: errorMessage,
            recommendedAction
        });
        
        // Retornar información del error
        return {
            message: errorMessage,
            type: errorType,
            recommendedAction,
            originalError: error
        };
    }

    // Mostrar toast con información del error
    showErrorToast(error, context = '') {
        const errorInfo = this.handleError(error, context);
        
        if (window.showToast) {
            window.showToast(errorInfo.message, 'error');
        } else {
            console.error(`[ERROR] ${context}:`, errorInfo.message);
        }
        
        return errorInfo;
    }

    // Verificar si el error es recuperable
    isRecoverable(error) {
        const errorType = this.getErrorType(error);
        const nonRecoverableTypes = ['authentication', 'permission'];
        
        return !nonRecoverableTypes.includes(errorType);
    }

    // Obtener tiempo de espera recomendado según el tipo de error
    getRetryDelay(errorType) {
        const delays = {
            'connection': 2000,
            'server': 5000,
            'validation': 1000,
            'general': 3000
        };
        
        return delays[errorType] || 3000;
    }
}

// Crear instancia global
const apiErrorHandler = new APIErrorHandler();

// Funciones globales
window.handleAPIError = (error, context) => {
    return apiErrorHandler.handleError(error, context);
};

window.showAPIError = (error, context) => {
    return apiErrorHandler.showErrorToast(error, context);
};

window.isErrorRecoverable = (error) => {
    return apiErrorHandler.isRecoverable(error);
};

window.getErrorRetryDelay = (error) => {
    const errorType = apiErrorHandler.getErrorType(error);
    return apiErrorHandler.getRetryDelay(errorType);
};

// Exportar para uso global
window.apiErrorHandler = apiErrorHandler;

Logger.info('Manejador de errores de API cargado correctamente'); 