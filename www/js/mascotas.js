// Módulo de gestión de mascotas
class MascotasManager {
    constructor() {
        this.mascotas = [];
        this.currentUser = null;
        this.init();
    }

    init() {
        // Obtener usuario actual
        this.currentUser = Storage.get(CONFIG.STORAGE_KEYS.USER);
        
        // Configurar event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Formulario de mascota
        const mascotaForm = document.getElementById('mascota-form');
        if (mascotaForm) {
            mascotaForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Cerrar modal con escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    async loadMascotas() {
        try {
            this.setLoading(true);
            
            const response = await api.getMascotas();
            this.mascotas = response.mascotas || [];
            
            this.renderMascotas();
            Logger.info('Mascotas cargadas:', this.mascotas.length);
            
        } catch (error) {
            // Usar el nuevo manejador de errores
            const errorInfo = window.showAPIError(error, 'cargar mascotas');
            
            // Si el error no es recuperable, mostrar estado de error
            if (!window.isErrorRecoverable(error)) {
                this.renderError();
            }
        } finally {
            this.setLoading(false);
        }
    }

    renderMascotas() {
        const mascotasList = document.getElementById('mascotas-list');
        
        if (!mascotasList) return;

        if (this.mascotas.length === 0) {
            mascotasList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-paw"></i>
                    <h3>No hay mascotas registradas</h3>
                    <p>Agrega tu primera mascota para comenzar</p>
                    <button class="btn-primary" onclick="showAddMascota()">
                        <i class="fas fa-plus"></i>
                        Agregar Mascota
                    </button>
                </div>
            `;
            return;
        }

        mascotasList.innerHTML = this.mascotas.map(mascota => `
            <div class="item-card mascota-card" data-id="${mascota._id}">
                <div class="item-header">
                    <div class="item-icon">
                        <i class="fas fa-paw"></i>
                    </div>
                    <div class="item-info">
                        <h3>${this.escapeHtml(mascota.nombre)}</h3>
                        <p>${this.escapeHtml(mascota.especie)} - ${this.escapeHtml(mascota.raza)}</p>
                    </div>
                    <div class="item-actions">
                        <button class="item-btn edit" onclick="editMascota('${mascota._id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="item-btn delete" onclick="deleteMascota('${mascota._id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="item-content">
                    <div class="item-meta">
                        <div class="item-meta-item">
                            <i class="fas fa-birthday-cake"></i>
                            <span>${mascota.edad} años</span>
                        </div>
                        <div class="item-meta-item">
                            <i class="fas fa-weight"></i>
                            <span>${mascota.peso} kg</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderError() {
        const mascotasList = document.getElementById('mascotas-list');
        if (!mascotasList) return;

        mascotasList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar mascotas</h3>
                <p>No se pudieron cargar las mascotas. Verifica tu conexión.</p>
                <button class="btn-primary" onclick="loadMascotas()">
                    <i class="fas fa-refresh"></i>
                    Reintentar
                </button>
            </div>
        `;
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const mascotaData = {
            nombre: formData.get('nombre').trim(),
            especie: formData.get('especie'),
            raza: formData.get('raza').trim(),
            edad: parseFloat(formData.get('edad')),
            peso: parseFloat(formData.get('peso'))
        };

        // Validaciones
        if (!this.validateMascotaData(mascotaData)) {
            return;
        }

        const mascotaId = formData.get('id');
        const isEditing = mascotaId && mascotaId !== '';

        try {
            this.setLoading(true);
            
            let response;
            if (isEditing) {
                response = await api.updateMascota(mascotaId, mascotaData);
                this.showToast('Mascota actualizada exitosamente', 'success');
            } else {
                response = await api.createMascota(mascotaData);
                this.showToast('Mascota creada exitosamente', 'success');
            }

            // Recargar mascotas
            await this.loadMascotas();
            
            // Cerrar modal
            this.closeModal();
            
        } catch (error) {
            Logger.error('Error guardando mascota:', error);
            this.showToast(error.message || 'Error al guardar mascota', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    validateMascotaData(data) {
        if (!data.nombre || data.nombre.length < 2) {
            this.showToast('El nombre debe tener al menos 2 caracteres', 'error');
            return false;
        }

        if (!data.especie) {
            this.showToast('Debes seleccionar una especie', 'error');
            return false;
        }

        if (!data.raza || data.raza.length < 2) {
            this.showToast('La raza debe tener al menos 2 caracteres', 'error');
            return false;
        }

        if (!data.edad || data.edad < 0 || data.edad > 30) {
            this.showToast('La edad debe estar entre 0 y 30 años', 'error');
            return false;
        }

        if (!data.peso || data.peso < 0 || data.peso > 200) {
            this.showToast('El peso debe estar entre 0 y 200 kg', 'error');
            return false;
        }

        return true;
    }

    async deleteMascota(id) {
        const mascota = this.mascotas.find(m => m._id === id);
        if (!mascota) return;

        // Confirmar eliminación
        if (window.navigator && navigator.notification) {
            navigator.notification.confirm(
                `¿Estás seguro de que quieres eliminar a ${mascota.nombre}?`,
                (buttonIndex) => {
                    if (buttonIndex === 1) {
                        this.performDelete(id);
                    }
                },
                'Eliminar Mascota',
                ['Sí', 'No']
            );
        } else {
            if (confirm(`¿Estás seguro de que quieres eliminar a ${mascota.nombre}?`)) {
                await this.performDelete(id);
            }
        }
    }

    async performDelete(id) {
        try {
            this.setLoading(true);
            await api.deleteMascota(id);
            this.showToast('Mascota eliminada exitosamente', 'success');
            await this.loadMascotas();
        } catch (error) {
            Logger.error('Error eliminando mascota:', error);
            this.showToast(error.message || 'Error al eliminar mascota', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    editMascota(id) {
        const mascota = this.mascotas.find(m => m._id === id);
        if (!mascota) {
            this.showToast('Mascota no encontrada', 'error');
            return;
        }

        // Llenar el formulario con los datos de la mascota
        const form = document.getElementById('mascota-form');
        form.reset();
        
        document.getElementById('mascota-id').value = mascota._id;
        document.getElementById('mascota-nombre').value = mascota.nombre;
        document.getElementById('mascota-especie').value = mascota.especie;
        document.getElementById('mascota-raza').value = mascota.raza;
        document.getElementById('mascota-edad').value = mascota.edad;
        document.getElementById('mascota-peso').value = mascota.peso;

        // Cambiar el título del modal
        document.getElementById('mascota-modal-title').textContent = 'Editar Mascota';

        // Mostrar el modal
        this.showModal();
    }

    showAddMascota() {
        this.resetForm();
        document.getElementById('mascota-modal-title').textContent = 'Agregar Mascota';
        this.showModal();
    }

    resetForm() {
        const form = document.getElementById('mascota-form');
        if (form) {
            form.reset();
            document.getElementById('mascota-id').value = '';
        }
    }

    showModal() {
        const modal = document.getElementById('mascota-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal() {
        const modal = document.getElementById('mascota-modal');
        if (modal) {
            modal.classList.remove('active');
            this.resetForm();
        }
    }

    setLoading(loading) {
        const buttons = document.querySelectorAll('#mascota-form .btn-primary');
        buttons.forEach(btn => {
            btn.disabled = loading;
            if (loading) {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            } else {
                btn.innerHTML = '<i class="fas fa-save"></i> Guardar';
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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Crear instancia global
const mascotasManager = new MascotasManager();

// Funciones globales
window.loadMascotas = () => {
    mascotasManager.loadMascotas();
};

window.showAddMascota = () => {
    mascotasManager.showAddMascota();
};

window.editMascota = (id) => {
    mascotasManager.editMascota(id);
};

window.deleteMascota = (id) => {
    mascotasManager.deleteMascota(id);
};

window.closeMascotaModal = () => {
    mascotasManager.closeModal();
};

// Exportar para uso global
window.mascotasManager = mascotasManager;

Logger.info('Módulo de mascotas cargado correctamente'); 