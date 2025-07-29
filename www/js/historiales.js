// Módulo de gestión de historiales médicos
class HistorialesManager {
    constructor() {
        this.historiales = [];
        this.mascotas = [];
        this.currentUser = null;
        this.init();
    }

    init() {
        // Obtener usuario actual
        this.currentUser = Storage.get(CONFIG.STORAGE_KEYS.USER);
        
        // Verificar permisos
        if (!this.hasPermission()) {
            Logger.warn('Usuario sin permisos para historiales médicos');
            return;
        }
        
        // Configurar event listeners
        this.setupEventListeners();
    }

    hasPermission() {
        if (!this.currentUser) return false;
        
        const role = this.currentUser.rol;
        return role === 'veterinario' || role === 'admin';
    }

    setupEventListeners() {
        // Formulario de historial
        const historialForm = document.getElementById('historial-form');
        if (historialForm) {
            historialForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Cerrar modal con escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    async loadHistoriales() {
        try {
            this.setLoading(true);
            
            const response = await api.getHistoriales();
            this.historiales = response.historiales || [];
            
            this.renderHistoriales();
            Logger.info('Historiales cargados:', this.historiales.length);
            
        } catch (error) {
            // Usar el nuevo manejador de errores
            const errorInfo = window.showAPIError(error, 'cargar historiales');
            
            // Si el error no es recuperable, mostrar estado de error
            if (!window.isErrorRecoverable(error)) {
                this.renderError();
            }
        } finally {
            this.setLoading(false);
        }
    }

    async loadMascotas() {
        try {
            const response = await api.getMascotas();
            this.mascotas = response.mascotas || [];
            this.populateMascotasSelect();
            Logger.info('Mascotas cargadas para historiales:', this.mascotas.length);
        } catch (error) {
            Logger.error('Error cargando mascotas para historiales:', error);
        }
    }

    populateMascotasSelect() {
        const select = document.getElementById('historial-mascota');
        if (!select) return;

        select.innerHTML = '<option value="">Seleccionar mascota</option>' +
            this.mascotas.map(mascota => 
                `<option value="${mascota._id}">${this.escapeHtml(mascota.nombre)} (${this.escapeHtml(mascota.especie)})</option>`
            ).join('');
    }

    renderHistoriales() {
        const historialesList = document.getElementById('historiales-list');
        
        if (!historialesList) return;

        if (this.historiales.length === 0) {
            historialesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-medical"></i>
                    <h3>No hay historiales médicos</h3>
                    <p>Agrega un nuevo historial para comenzar</p>
                    <button class="btn-primary" onclick="showAddHistorial()">
                        <i class="fas fa-plus"></i>
                        Nuevo Historial
                    </button>
                </div>
            `;
            return;
        }

        historialesList.innerHTML = this.historiales.map(historial => {
            const mascota = this.mascotas.find(m => m._id === historial.id_mascota);
            
            return `
                <div class="item-card historial-card" data-id="${historial._id}">
                    <div class="item-header">
                        <div class="item-icon">
                            <i class="fas fa-file-medical"></i>
                        </div>
                        <div class="item-info">
                            <h3>${mascota ? this.escapeHtml(mascota.nombre) : 'Mascota no encontrada'}</h3>
                            <p>${this.formatDate(historial.fecha_consulta)}</p>
                        </div>
                        <div class="item-actions">
                            <button class="item-btn edit" onclick="editHistorial('${historial._id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="item-btn delete" onclick="deleteHistorial('${historial._id}')" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="item-content">
                        <div class="item-meta">
                            <div class="item-meta-item">
                                <i class="fas fa-stethoscope"></i>
                                <span><strong>Síntomas:</strong> ${this.escapeHtml(historial.sintomas)}</span>
                            </div>
                            <div class="item-meta-item">
                                <i class="fas fa-notes-medical"></i>
                                <span><strong>Diagnóstico:</strong> ${this.escapeHtml(historial.diagnostico)}</span>
                            </div>
                            <div class="item-meta-item">
                                <i class="fas fa-pills"></i>
                                <span><strong>Tratamiento:</strong> ${this.escapeHtml(historial.tratamiento)}</span>
                            </div>
                            ${historial.observaciones ? `
                            <div class="item-meta-item">
                                <i class="fas fa-clipboard"></i>
                                <span><strong>Observaciones:</strong> ${this.escapeHtml(historial.observaciones)}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderError() {
        const historialesList = document.getElementById('historiales-list');
        if (!historialesList) return;

        historialesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar historiales</h3>
                <p>No se pudieron cargar los historiales. Verifica tu conexión.</p>
                <button class="btn-primary" onclick="loadHistoriales()">
                    <i class="fas fa-refresh"></i>
                    Reintentar
                </button>
            </div>
        `;
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const historialData = {
            id_mascota: formData.get('mascota'),
            fecha_consulta: formData.get('fecha'),
            sintomas: formData.get('sintomas').trim(),
            diagnostico: formData.get('diagnostico').trim(),
            tratamiento: formData.get('tratamiento').trim(),
            observaciones: formData.get('observaciones').trim()
        };

        // Validaciones
        if (!this.validateHistorialData(historialData)) {
            return;
        }

        const historialId = formData.get('id');
        const isEditing = historialId && historialId !== '';

        try {
            this.setLoading(true);
            
            let response;
            if (isEditing) {
                response = await api.updateHistorial(historialId, historialData);
                this.showToast('Historial actualizado exitosamente', 'success');
            } else {
                response = await api.createHistorial(historialData);
                this.showToast('Historial creado exitosamente', 'success');
            }

            // Recargar historiales
            await this.loadHistoriales();
            
            // Cerrar modal
            this.closeModal();
            
        } catch (error) {
            Logger.error('Error guardando historial:', error);
            this.showToast(error.message || 'Error al guardar historial', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    validateHistorialData(data) {
        if (!data.id_mascota) {
            this.showToast('Debes seleccionar una mascota', 'error');
            return false;
        }

        if (!data.fecha_consulta) {
            this.showToast('Debes seleccionar una fecha de consulta', 'error');
            return false;
        }

        if (!data.sintomas || data.sintomas.length < 5) {
            this.showToast('Los síntomas deben tener al menos 5 caracteres', 'error');
            return false;
        }

        if (!data.diagnostico || data.diagnostico.length < 5) {
            this.showToast('El diagnóstico debe tener al menos 5 caracteres', 'error');
            return false;
        }

        if (!data.tratamiento || data.tratamiento.length < 5) {
            this.showToast('El tratamiento debe tener al menos 5 caracteres', 'error');
            return false;
        }

        return true;
    }

    async deleteHistorial(id) {
        const historial = this.historiales.find(h => h._id === id);
        if (!historial) return;

        // Confirmar eliminación
        if (window.navigator && navigator.notification) {
            navigator.notification.confirm(
                '¿Estás seguro de que quieres eliminar este historial médico?',
                (buttonIndex) => {
                    if (buttonIndex === 1) {
                        this.performDelete(id);
                    }
                },
                'Eliminar Historial',
                ['Sí', 'No']
            );
        } else {
            if (confirm('¿Estás seguro de que quieres eliminar este historial médico?')) {
                await this.performDelete(id);
            }
        }
    }

    async performDelete(id) {
        try {
            this.setLoading(true);
            await api.deleteHistorial(id);
            this.showToast('Historial eliminado exitosamente', 'success');
            await this.loadHistoriales();
        } catch (error) {
            Logger.error('Error eliminando historial:', error);
            this.showToast(error.message || 'Error al eliminar historial', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    editHistorial(id) {
        const historial = this.historiales.find(h => h._id === id);
        if (!historial) {
            this.showToast('Historial no encontrado', 'error');
            return;
        }

        // Llenar el formulario con los datos del historial
        const form = document.getElementById('historial-form');
        form.reset();
        
        document.getElementById('historial-id').value = historial._id;
        document.getElementById('historial-mascota').value = historial.id_mascota;
        document.getElementById('historial-fecha').value = historial.fecha_consulta;
        document.getElementById('historial-sintomas').value = historial.sintomas;
        document.getElementById('historial-diagnostico').value = historial.diagnostico;
        document.getElementById('historial-tratamiento').value = historial.tratamiento;
        document.getElementById('historial-observaciones').value = historial.observaciones || '';

        // Cambiar el título del modal
        document.getElementById('historial-modal-title').textContent = 'Editar Historial Médico';

        // Mostrar el modal
        this.showModal();
    }

    showAddHistorial() {
        this.resetForm();
        document.getElementById('historial-modal-title').textContent = 'Nuevo Historial Médico';
        this.showModal();
    }

    resetForm() {
        const form = document.getElementById('historial-form');
        if (form) {
            form.reset();
            document.getElementById('historial-id').value = '';
            
            // Establecer fecha por defecto
            const now = new Date();
            document.getElementById('historial-fecha').value = now.toISOString().split('T')[0];
        }
    }

    showModal() {
        const modal = document.getElementById('historial-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal() {
        const modal = document.getElementById('historial-modal');
        if (modal) {
            modal.classList.remove('active');
            this.resetForm();
        }
    }

    setLoading(loading) {
        const buttons = document.querySelectorAll('#historial-form .btn-primary');
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

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Crear instancia global
const historialesManager = new HistorialesManager();

// Funciones globales
window.loadHistoriales = async () => {
    await historialesManager.loadMascotas();
    await historialesManager.loadHistoriales();
};

window.showAddHistorial = () => {
    historialesManager.showAddHistorial();
};

window.editHistorial = (id) => {
    historialesManager.editHistorial(id);
};

window.deleteHistorial = (id) => {
    historialesManager.deleteHistorial(id);
};

window.closeHistorialModal = () => {
    historialesManager.closeModal();
};

// Exportar para uso global
window.historialesManager = historialesManager;

Logger.info('Módulo de historiales cargado correctamente'); 