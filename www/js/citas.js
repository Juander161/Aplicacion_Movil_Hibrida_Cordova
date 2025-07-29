// Módulo de gestión de citas
class CitasManager {
    constructor() {
        this.citas = [];
        this.mascotas = [];
        this.veterinarios = [];
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
        // Formulario de cita
        const citaForm = document.getElementById('cita-form');
        if (citaForm) {
            citaForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Filtro de citas
        const citasFilter = document.getElementById('citas-filter');
        if (citasFilter) {
            citasFilter.addEventListener('change', () => this.renderCitas());
        }

        // Cerrar modal con escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    async loadCitas() {
        try {
            this.setLoading(true);
            
            const response = await api.getCitas();
            this.citas = response.citas || [];
            
            this.renderCitas();
            Logger.info('Citas cargadas:', this.citas.length);
            
        } catch (error) {
            // Usar el nuevo manejador de errores
            const errorInfo = window.showAPIError(error, 'cargar citas');
            
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
            Logger.info('Mascotas cargadas para citas:', this.mascotas.length);
        } catch (error) {
            Logger.error('Error cargando mascotas para citas:', error);
        }
    }

    async loadVeterinarios() {
        try {
            const response = await api.getVeterinarios();
            this.veterinarios = response || [];
            this.populateVeterinariosSelect();
            Logger.info('Veterinarios cargados:', this.veterinarios.length);
        } catch (error) {
            Logger.error('Error cargando veterinarios:', error);
        }
    }

    populateMascotasSelect() {
        const select = document.getElementById('cita-mascota');
        if (!select) return;

        select.innerHTML = '<option value="">Seleccionar mascota</option>' +
            this.mascotas.map(mascota => 
                `<option value="${mascota._id}">${this.escapeHtml(mascota.nombre)} (${this.escapeHtml(mascota.especie)})</option>`
            ).join('');
    }

    populateVeterinariosSelect() {
        const select = document.getElementById('cita-veterinario');
        if (!select) return;

        select.innerHTML = '<option value="">Seleccionar veterinario</option>' +
            this.veterinarios.map(vet => 
                `<option value="${vet._id}">${this.escapeHtml(vet.nombre)}</option>`
            ).join('');
    }

    renderCitas() {
        const citasList = document.getElementById('citas-list');
        const filter = document.getElementById('citas-filter')?.value || 'todas';
        
        if (!citasList) return;

        let filteredCitas = this.citas;
        
        if (filter !== 'todas') {
            filteredCitas = this.citas.filter(cita => cita.estado === filter);
        }

        if (filteredCitas.length === 0) {
            citasList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar"></i>
                    <h3>No hay citas registradas</h3>
                    <p>Agrega una nueva cita para comenzar</p>
                    <button class="btn-primary" onclick="showAddCita()">
                        <i class="fas fa-plus"></i>
                        Nueva Cita
                    </button>
                </div>
            `;
            return;
        }

        citasList.innerHTML = filteredCitas.map(cita => {
            const mascota = this.mascotas.find(m => m._id === cita.id_mascota);
            const veterinario = this.veterinarios.find(v => v._id === cita.id_veterinario);
            
            return `
                <div class="item-card cita-card" data-id="${cita._id}">
                    <div class="item-header">
                        <div class="item-icon">
                            <i class="fas fa-calendar"></i>
                        </div>
                        <div class="item-info">
                            <h3>${mascota ? this.escapeHtml(mascota.nombre) : 'Mascota no encontrada'}</h3>
                            <p>${this.formatDateTime(cita.fecha_hora)}</p>
                        </div>
                        <div class="item-status">
                            <span class="status-badge ${cita.estado}">
                                ${this.getEstadoText(cita.estado)}
                            </span>
                        </div>
                        <div class="item-actions">
                            <button class="item-btn edit" onclick="editCita('${cita._id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="item-btn delete" onclick="deleteCita('${cita._id}')" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="item-content">
                        <div class="item-meta">
                            <div class="item-meta-item">
                                <i class="fas fa-user-md"></i>
                                <span>${veterinario ? this.escapeHtml(veterinario.nombre) : 'No asignado'}</span>
                            </div>
                            <div class="item-meta-item">
                                <i class="fas fa-comment"></i>
                                <span>${this.escapeHtml(cita.motivo)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderError() {
        const citasList = document.getElementById('citas-list');
        if (!citasList) return;

        citasList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar citas</h3>
                <p>No se pudieron cargar las citas. Verifica tu conexión.</p>
                <button class="btn-primary" onclick="loadCitas()">
                    <i class="fas fa-refresh"></i>
                    Reintentar
                </button>
            </div>
        `;
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const citaData = {
            id_mascota: formData.get('mascota'),
            id_veterinario: formData.get('veterinario'),
            fecha_hora: this.combineDateTime(formData.get('fecha'), formData.get('hora')),
            motivo: formData.get('motivo').trim(),
            estado: formData.get('estado') || 'pendiente'
        };

        // Validaciones
        if (!this.validateCitaData(citaData)) {
            return;
        }

        const citaId = formData.get('id');
        const isEditing = citaId && citaId !== '';

        try {
            this.setLoading(true);
            
            let response;
            if (isEditing) {
                response = await api.updateCita(citaId, citaData);
                this.showToast('Cita actualizada exitosamente', 'success');
            } else {
                response = await api.createCita(citaData);
                this.showToast('Cita creada exitosamente', 'success');
            }

            // Recargar citas
            await this.loadCitas();
            
            // Cerrar modal
            this.closeModal();
            
        } catch (error) {
            Logger.error('Error guardando cita:', error);
            this.showToast(error.message || 'Error al guardar cita', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    validateCitaData(data) {
        if (!data.id_mascota) {
            this.showToast('Debes seleccionar una mascota', 'error');
            return false;
        }

        if (!data.id_veterinario) {
            this.showToast('Debes seleccionar un veterinario', 'error');
            return false;
        }

        if (!data.fecha_hora) {
            this.showToast('Debes seleccionar fecha y hora', 'error');
            return false;
        }

        if (!data.motivo || data.motivo.length < 5) {
            this.showToast('El motivo debe tener al menos 5 caracteres', 'error');
            return false;
        }

        // Verificar que la fecha no sea en el pasado
        const fechaCita = new Date(data.fecha_hora);
        const ahora = new Date();
        if (fechaCita < ahora) {
            this.showToast('La fecha de la cita no puede ser en el pasado', 'error');
            return false;
        }

        return true;
    }

    async deleteCita(id) {
        const cita = this.citas.find(c => c._id === id);
        if (!cita) return;

        // Confirmar eliminación
        if (window.navigator && navigator.notification) {
            navigator.notification.confirm(
                '¿Estás seguro de que quieres eliminar esta cita?',
                (buttonIndex) => {
                    if (buttonIndex === 1) {
                        this.performDelete(id);
                    }
                },
                'Eliminar Cita',
                ['Sí', 'No']
            );
        } else {
            if (confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
                await this.performDelete(id);
            }
        }
    }

    async performDelete(id) {
        try {
            this.setLoading(true);
            await api.deleteCita(id);
            this.showToast('Cita eliminada exitosamente', 'success');
            await this.loadCitas();
        } catch (error) {
            Logger.error('Error eliminando cita:', error);
            this.showToast(error.message || 'Error al eliminar cita', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    editCita(id) {
        const cita = this.citas.find(c => c._id === id);
        if (!cita) {
            this.showToast('Cita no encontrada', 'error');
            return;
        }

        // Llenar el formulario con los datos de la cita
        const form = document.getElementById('cita-form');
        form.reset();
        
        document.getElementById('cita-id').value = cita._id;
        document.getElementById('cita-mascota').value = cita.id_mascota;
        document.getElementById('cita-veterinario').value = cita.id_veterinario;
        
        const fecha = new Date(cita.fecha_hora);
        document.getElementById('cita-fecha').value = fecha.toISOString().split('T')[0];
        document.getElementById('cita-hora').value = fecha.toTimeString().slice(0, 5);
        
        document.getElementById('cita-motivo').value = cita.motivo;
        document.getElementById('cita-estado').value = cita.estado;

        // Cambiar el título del modal
        document.getElementById('cita-modal-title').textContent = 'Editar Cita';

        // Mostrar el modal
        this.showModal();
    }

    showAddCita() {
        this.resetForm();
        document.getElementById('cita-modal-title').textContent = 'Nueva Cita';
        this.showModal();
    }

    resetForm() {
        const form = document.getElementById('cita-form');
        if (form) {
            form.reset();
            document.getElementById('cita-id').value = '';
            
            // Establecer fecha y hora por defecto
            const now = new Date();
            document.getElementById('cita-fecha').value = now.toISOString().split('T')[0];
            document.getElementById('cita-hora').value = now.toTimeString().slice(0, 5);
            document.getElementById('cita-estado').value = 'pendiente';
        }
    }

    showModal() {
        const modal = document.getElementById('cita-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal() {
        const modal = document.getElementById('cita-modal');
        if (modal) {
            modal.classList.remove('active');
            this.resetForm();
        }
    }

    setLoading(loading) {
        const buttons = document.querySelectorAll('#cita-form .btn-primary');
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

    formatDateTime(dateTimeString) {
        const date = new Date(dateTimeString);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    combineDateTime(date, time) {
        return `${date}T${time}:00`;
    }

    getEstadoText(estado) {
        const estados = {
            'pendiente': 'Pendiente',
            'confirmada': 'Confirmada',
            'completada': 'Completada',
            'cancelada': 'Cancelada'
        };
        return estados[estado] || estado;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Crear instancia global
const citasManager = new CitasManager();

// Funciones globales
window.loadCitas = async () => {
    await citasManager.loadMascotas();
    await citasManager.loadVeterinarios();
    await citasManager.loadCitas();
};

window.showAddCita = () => {
    citasManager.showAddCita();
};

window.editCita = (id) => {
    citasManager.editCita(id);
};

window.deleteCita = (id) => {
    citasManager.deleteCita(id);
};

window.closeCitaModal = () => {
    citasManager.closeModal();
};

// Exportar para uso global
window.citasManager = citasManager;

Logger.info('Módulo de citas cargado correctamente'); 