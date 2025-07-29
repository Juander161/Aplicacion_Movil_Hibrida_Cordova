// Módulo de gestión de usuarios
class UsuariosManager {
    constructor() {
        this.usuarios = [];
        this.currentUser = null;
        this.init();
    }

    init() {
        // Obtener usuario actual
        this.currentUser = Storage.get(CONFIG.STORAGE_KEYS.USER);
        
        // Verificar permisos
        if (!this.hasPermission()) {
            Logger.warn('Usuario sin permisos para gestionar usuarios');
            return;
        }
        
        // Configurar event listeners
        this.setupEventListeners();
    }

    hasPermission() {
        if (!this.currentUser) return false;
        
        const role = this.currentUser.rol;
        return role === 'admin' || role === 'recepcionista';
    }

    setupEventListeners() {
        // Filtro de usuarios
        const usuariosFilter = document.getElementById('usuarios-filter');
        if (usuariosFilter) {
            usuariosFilter.addEventListener('change', () => this.renderUsuarios());
        }
    }

    async loadUsuarios() {
        try {
            this.setLoading(true);
            
            const response = await api.getUsuarios();
            this.usuarios = response.usuarios || [];
            
            this.renderUsuarios();
            Logger.info('Usuarios cargados:', this.usuarios.length);
            
        } catch (error) {
            Logger.error('Error cargando usuarios:', error);
            this.showToast(error.message || 'Error al cargar usuarios', 'error');
            this.renderError();
        } finally {
            this.setLoading(false);
        }
    }

    renderUsuarios() {
        const usuariosList = document.getElementById('usuarios-list');
        const filter = document.getElementById('usuarios-filter')?.value || 'todos';
        
        if (!usuariosList) return;

        let filteredUsuarios = this.usuarios;
        
        if (filter !== 'todos') {
            filteredUsuarios = this.usuarios.filter(usuario => usuario.rol === filter);
        }

        if (filteredUsuarios.length === 0) {
            usuariosList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No hay usuarios registrados</h3>
                    <p>No se encontraron usuarios con el filtro seleccionado</p>
                    <button class="btn-primary" onclick="loadUsuarios()">
                        <i class="fas fa-refresh"></i>
                        Recargar
                    </button>
                </div>
            `;
            return;
        }

        usuariosList.innerHTML = filteredUsuarios.map(usuario => {
            const initials = this.getInitials(usuario.nombre);
            const roleName = this.getRoleName(usuario.rol);
            
            return `
                <div class="item-card usuario-card" data-id="${usuario._id}">
                    <div class="item-header">
                        <div class="item-icon">
                            <div class="user-avatar">
                                ${initials}
                            </div>
                        </div>
                        <div class="item-info">
                            <h3>${this.escapeHtml(usuario.nombre)}</h3>
                            <p>${this.escapeHtml(usuario.email)}</p>
                        </div>
                        <div class="item-status">
                            <span class="role-badge ${usuario.rol}">
                                ${roleName}
                            </span>
                        </div>
                        <div class="item-actions">
                            ${this.currentUser.rol === 'admin' ? `
                            <button class="item-btn delete" onclick="deleteUsuario('${usuario._id}')" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                            ` : ''}
                        </div>
                    </div>
                    <div class="item-content">
                        <div class="item-meta">
                            <div class="item-meta-item">
                                <i class="fas fa-phone"></i>
                                <span>${usuario.telefono || 'No especificado'}</span>
                            </div>
                            <div class="item-meta-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${usuario.direccion || 'No especificada'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderError() {
        const usuariosList = document.getElementById('usuarios-list');
        if (!usuariosList) return;

        usuariosList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar usuarios</h3>
                <p>No se pudieron cargar los usuarios. Verifica tu conexión.</p>
                <button class="btn-primary" onclick="loadUsuarios()">
                    <i class="fas fa-refresh"></i>
                    Reintentar
                </button>
            </div>
        `;
    }

    async deleteUsuario(id) {
        const usuario = this.usuarios.find(u => u._id === id);
        if (!usuario) return;

        // No permitir eliminar al usuario actual
        if (usuario._id === this.currentUser._id) {
            this.showToast('No puedes eliminar tu propia cuenta', 'error');
            return;
        }

        // Confirmar eliminación
        if (window.navigator && navigator.notification) {
            navigator.notification.confirm(
                `¿Estás seguro de que quieres eliminar a ${usuario.nombre}?`,
                (buttonIndex) => {
                    if (buttonIndex === 1) {
                        this.performDelete(id);
                    }
                },
                'Eliminar Usuario',
                ['Sí', 'No']
            );
        } else {
            if (confirm(`¿Estás seguro de que quieres eliminar a ${usuario.nombre}?`)) {
                await this.performDelete(id);
            }
        }
    }

    async performDelete(id) {
        try {
            this.setLoading(true);
            await api.deleteUsuario(id);
            this.showToast('Usuario eliminado exitosamente', 'success');
            await this.loadUsuarios();
        } catch (error) {
            Logger.error('Error eliminando usuario:', error);
            this.showToast(error.message || 'Error al eliminar usuario', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        // Implementar loading si es necesario
    }

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    getInitials(name) {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    getRoleName(rol) {
        const roleNames = {
            'admin': 'Administrador',
            'veterinario': 'Veterinario',
            'recepcionista': 'Recepcionista',
            'cliente': 'Cliente'
        };
        return roleNames[rol] || rol;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Crear instancia global
const usuariosManager = new UsuariosManager();

// Funciones globales
window.loadUsuarios = () => {
    usuariosManager.loadUsuarios();
};

window.deleteUsuario = (id) => {
    usuariosManager.deleteUsuario(id);
};

// Exportar para uso global
window.usuariosManager = usuariosManager;

Logger.info('Módulo de usuarios cargado correctamente'); 