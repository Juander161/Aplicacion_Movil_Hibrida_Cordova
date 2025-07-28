// Módulo de gestión de citas
class CitasManager {
    constructor() {
        this.citas = [];
        this.mascotas = [];
        this.veterinarios = [];
    }

    async loadCitas() {
        try {
            showLoading();
            const citas = await api.getCitas();
            this.citas = citas;
            this.renderCitas();
        } catch (error) {
            showToast(error.message || 'Error al cargar citas', 'error');
        } finally {
            hideLoading();
        }
    }

    async loadMascotas() {
        try {
            const mascotas = await api.getMascotas();
            this.mascotas = mascotas;
            this.populateMascotasSelect();
        } catch (error) {
            console.error('Error loading mascotas:', error);
        }
    }

    async loadVeterinarios() {
        try {
            const usuarios = await api.getUsers();
            this.veterinarios = usuarios.filter(u => u.rol === 'veterinario');
            this.populateVeterinariosSelect();
        } catch (error) {
            console.error('Error loading veterinarios:', error);
        }
    }

    populateMascotasSelect() {
        const select = document.getElementById('cita-mascota');
        if (!select) return;

        select.innerHTML = '<option value="">Seleccionar mascota</option>' +
            this.mascotas.map(mascota => 
                `<option value="${mascota._id}">${mascota.nombre} (${mascota.especie})</option>`
            ).join('');
    }

    populateVeterinariosSelect() {
        const select = document.getElementById('cita-veterinario');
        if (!select) return;

        select.innerHTML = '<option value="">Seleccionar veterinario</option>' +
            this.veterinarios.map(vet => 
                `<option value="${vet._id}">${vet.nombre}</option>`
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
                </div>
            `;
            return;
        }

        citasList.innerHTML = filteredCitas.map(cita => {
            const mascota = this.mascotas.find(m => m._id === cita.id_mascota);
            const veterinario = this.veterinarios.find(v => v._id === cita.id_veterinario);
            const fecha = new Date(cita.fecha_hora);
            
            return `
                <div class="item-card cita-card" data-id="${cita._id}">
                    <div class="item-header">
                        <div class="item-icon">
                            <i class="fas fa-calendar"></i>
                        </div>
                        <div class="item-info">
                            <h3>${mascota ? mascota.nombre : 'Mascota no encontrada'}</h3>
                            <p>${formatDateTime(cita.fecha_hora)}</p>
                        </div>
                        <div class="item-status">
                            <span class="status-badge" style="background-color: ${getEstadoColor(cita.estado)}">
                                ${cita.estado}
                            </span>
                        </div>
                        <div class="item-actions">
                            <button class="action-btn" onclick="editCita('${cita._id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" onclick="deleteCita('${cita._id}')" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="item-details">
                        <div class="detail-item">
                            <span class="label">Veterinario:</span>
                            <span class="value">${veterinario ? veterinario.nombre : 'No asignado'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Motivo:</span>
                            <span class="value">${cita.motivo}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async deleteCita(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
            return;
        }

        try {
            showLoading();
            await api.deleteCita(id);
            showToast('Cita eliminada exitosamente', 'success');
            await this.loadCitas();
        } catch (error) {
            showToast(error.message || 'Error al eliminar cita', 'error');
        } finally {
            hideLoading();
        }
    }

    async editCita(id) {
        const cita = this.citas.find(c => c._id === id);
        if (!cita) return;

        // Llenar el formulario con los datos de la cita
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
        document.getElementById('cita-modal').style.display = 'flex';
    }

    resetCitaForm() {
        document.getElementById('cita-form').reset();
        document.getElementById('cita-id').value = '';
        document.getElementById('cita-modal-title').textContent = 'Nueva Cita';
        
        // Establecer fecha y hora por defecto
        const now = new Date();
        document.getElementById('cita-fecha').value = now.toISOString().split('T')[0];
        document.getElementById('cita-hora').value = now.toTimeString().slice(0, 5);
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
    citasManager.resetCitaForm();
    document.getElementById('cita-modal').style.display = 'flex';
};

window.editCita = (id) => {
    citasManager.editCita(id);
};

window.deleteCita = (id) => {
    citasManager.deleteCita(id);
};

window.closeCitaModal = () => {
    document.getElementById('cita-modal').style.display = 'none';
    citasManager.resetCitaForm();
};

// Exportar para uso global
window.citasManager = citasManager; 