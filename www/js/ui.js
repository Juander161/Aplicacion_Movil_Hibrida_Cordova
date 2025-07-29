// Módulo de utilidades de interfaz de usuario
class UIManager {
    constructor() {
        this.currentTheme = 'light';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTheme();
    }

    setupEventListeners() {
        // Event listeners para modales
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });

        // Event listeners para toasts
        this.setupToastListeners();

        // Event listeners para formularios
        this.setupFormListeners();
    }

    // === MODALES ===
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalElement) {
        if (modalElement) {
            modalElement.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            this.closeModal(modal);
        });
    }

    // === TOASTS ===
    setupToastListeners() {
        const toastContainer = document.getElementById('toast-container');
        if (toastContainer) {
            // Limpiar toasts antiguos
            setInterval(() => {
                const oldToasts = toastContainer.querySelectorAll('.toast:not(.show)');
                oldToasts.forEach(toast => {
                    if (Date.now() - toast.dataset.timestamp > 5000) {
                        toast.remove();
                    }
                });
            }, 1000);
        }
    }

    showToast(message, type = 'info', duration = CONFIG.TOAST_DURATION) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            console.log(`[${type.toUpperCase()}] ${message}`);
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.dataset.timestamp = Date.now();

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <i class="${icons[type] || icons.info}"></i>
            <span class="toast-message">${this.escapeHtml(message)}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        toastContainer.appendChild(toast);

        // Mostrar toast con animación
        setTimeout(() => toast.classList.add('show'), 100);

        // Remover toast automáticamente
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // === FORMULARIOS ===
    setupFormListeners() {
        // Validación en tiempo real
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.validateField(e.target);
            }
        });

        // Mostrar/ocultar contraseñas
        document.addEventListener('click', (e) => {
            if (e.target.matches('.toggle-password')) {
                this.togglePassword(e.target);
            }
        });
    }

    validateField(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        // Remover errores anteriores
        this.clearFieldError(formGroup);

        // Validar según el tipo de campo
        let isValid = true;
        let errorMessage = '';

        switch (field.type) {
            case 'email':
                isValid = this.isValidEmail(field.value);
                errorMessage = 'Ingresa un email válido';
                break;
            case 'tel':
                isValid = this.isValidPhone(field.value);
                errorMessage = 'Ingresa un teléfono válido';
                break;
            case 'password':
                isValid = field.value.length >= 6;
                errorMessage = 'La contraseña debe tener al menos 6 caracteres';
                break;
            default:
                if (field.required && !field.value.trim()) {
                    isValid = false;
                    errorMessage = 'Este campo es requerido';
                }
        }

        if (!isValid && field.value.trim()) {
            this.showFieldError(formGroup, errorMessage);
        }
    }

    showFieldError(formGroup, message) {
        formGroup.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        formGroup.appendChild(errorDiv);
    }

    clearFieldError(formGroup) {
        formGroup.classList.remove('error');
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    clearFormErrors(form) {
        form.querySelectorAll('.form-group').forEach(group => {
            this.clearFieldError(group);
        });
    }

    // === VALIDACIONES ===
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
    }

    // === PASSWORD TOGGLE ===
    togglePassword(button) {
        const input = button.parentElement.querySelector('input');
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    // === LOADING STATES ===
    showLoading(container = null) {
        const target = container || document.body;
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando...</p>
            </div>
        `;
        target.appendChild(loading);
    }

    hideLoading(container = null) {
        const target = container || document.body;
        const loading = target.querySelector('.loading-overlay');
        if (loading) {
            loading.remove();
        }
    }

    setButtonLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
        } else {
            button.disabled = false;
            if (button.dataset.originalText) {
                button.innerHTML = button.dataset.originalText;
                delete button.dataset.originalText;
            }
        }
    }

    // === THEMES ===
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    // === UTILIDADES ===
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatDateTime(dateTime) {
        return new Date(dateTime).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    }

    // === ANIMACIONES ===
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    fadeOut(element, duration = 300) {
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.max(1 - progress / duration, 0);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }

    // === CONFIRMACIONES ===
    async confirm(message, title = 'Confirmar') {
        return new Promise((resolve) => {
            if (window.navigator && navigator.notification) {
                navigator.notification.confirm(
                    message,
                    (buttonIndex) => {
                        resolve(buttonIndex === 1);
                    },
                    title,
                    ['Sí', 'No']
                );
            } else {
                resolve(confirm(message));
            }
        });
    }

    async alert(message, title = 'Aviso') {
        return new Promise((resolve) => {
            if (window.navigator && navigator.notification) {
                navigator.notification.alert(
                    message,
                    () => resolve(),
                    title,
                    'OK'
                );
            } else {
                alert(message);
                resolve();
            }
        });
    }

    // === VIBRACIÓN ===
    vibrate(duration = 100) {
        if (window.navigator && navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }

    // === SONIDOS ===
    playSound(type = 'notification') {
        // Implementar sonidos si es necesario
        this.vibrate(50);
    }
}

// Crear instancia global
const uiManager = new UIManager();

// Funciones globales
window.showToast = (message, type = 'info') => {
    uiManager.showToast(message, type);
};

window.closeAllModals = () => {
    uiManager.closeAllModals();
};

window.showLoading = (container) => {
    uiManager.showLoading(container);
};

window.hideLoading = (container) => {
    uiManager.hideLoading(container);
};

window.setButtonLoading = (button, loading) => {
    uiManager.setButtonLoading(button, loading);
};

window.togglePassword = (button) => {
    uiManager.togglePassword(button);
};

window.confirm = (message, title) => {
    return uiManager.confirm(message, title);
};

window.alert = (message, title) => {
    return uiManager.alert(message, title);
};

window.vibrate = (duration) => {
    uiManager.vibrate(duration);
};

// Exportar para uso global
window.uiManager = uiManager;

Logger.info('Módulo de UI cargado correctamente'); 