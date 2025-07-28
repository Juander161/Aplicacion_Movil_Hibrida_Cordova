// Módulo de gestión de usuarios
class UsuariosManager {
    constructor() {
        this.usuarios = [];
    }

    async loadUsuarios() {
        try {
            showLoading();
            const usuarios = await api.getUsers();
            this.usuarios = usuarios;
            this.renderUsuarios();
        } catch (error) {
            showToast(error.message || 'Error al cargar usuarios', 'error');
        } finally {
            hideLoading();
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
                </div>
            `;
            return;
        }

        usuariosList.innerHTML = filteredUsuarios.map(usuario => {
            const roleColors = {
                'admin': '#dc3545',
                'veterinario': '#17a2b8',
                'recepcionista': '#6f42c1',
                'cliente': '#28a745'
            };
            
            return `
                <div class="item-card usuario-card" data-id="${usuario._id}">
                    <div class="item-header">
                        <div class="item-icon">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="item-info">
                            <h3>${usuario.nombre}</h3>
                            <p>${usuario.email}</p>
                        </div>
                        <div class="item-status">
                            <span class="role-badge" style="background-color: ${roleColors[usuario.rol] || '#6c757d'}">
                                ${usuario.rol}
                            </span>
                        </div>
                        <div class="item-actions">
                            <button class="action-btn" onclick="editUsuario('${usuario._id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${usuario.rol !== 'admin' ? `
                                <button class="action-btn delete" onclick="deleteUsuario('${usuario._id}')" title="Eliminar">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    <div class="item-details">
                        <div class="detail-item">
                            <span class="label">Teléfono:</span>
                            <span class="value">${usuario.telefono || 'No especificado'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Dirección:</span>
                            <span class="value">${usuario.direccion || 'No especificada'}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async deleteUsuario(id) {
        const usuario = this.usuarios.find(u => u._id === id);
        if (!usuario) return;

        if (usuario.rol === 'admin') {
            showToast('No se puede eliminar un usuario administrador', 'error');
            return;
        }

        if (!confirm(`¿Estás seguro de que quieres eliminar al usuario ${usuario.nombre}?`)) {
            return;
        }

        try {
            showLoading();
            await api.deleteUser(id);
            showToast('Usuario eliminado exitosamente', 'success');
            await this.loadUsuarios();
        } catch (error) {
            showToast(error.message || 'Error al eliminar usuario', 'error');
        } finally {
            hideLoading();
        }
    }

    async editUsuario(id) {
        const usuario = this.usuarios.find(u => u._id === id);
        if (!usuario) return;

        // Por ahora, solo mostraremos un mensaje
        // En una implementación completa, aquí se abriría un modal de edición
        showToast(`Editar usuario: ${usuario.nombre}`, 'info');
    }

    getRoleStats() {
        const stats = {};
        this.usuarios.forEach(usuario => {
            stats[usuario.rol] = (stats[usuario.rol] || 0) + 1;
        });
        return stats;
    }
}

// Crear instancia global
const usuariosManager = new UsuariosManager();

// Funciones globales
window.loadUsuarios = () => {
    usuariosManager.loadUsuarios();
};

window.editUsuario = (id) => {
    usuariosManager.editUsuario(id);
};

window.deleteUsuario = (id) => {
    usuariosManager.deleteUsuario(id);
};

// Exportar para uso global
window.usuariosManager = usuariosManager; 