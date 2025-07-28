// Módulo de gestión de historiales médicos
class HistorialesManager {
    constructor() {
        this.historiales = [];
        this.mascotas = [];
    }

    async loadHistoriales() {
        try {
            showLoading();
            const historiales = await api.getHistoriales();
            this.historiales = historiales;
            this.renderHistoriales();
        } catch (error) {
            showToast(error.message || 'Error al cargar historiales', 'error');
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

    populateMascotasSelect() {
        const select = document.getElementById('historial-mascota');
        if (!select) return;

        select.innerHTML = '<option value="">Seleccionar mascota</option>' +
            this.mascotas.map(mascota => 
                `<option value="${mascota._id}">${mascota.nombre} (${mascota.especie})</option>`
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
                            <h3>${mascota ? mascota.nombre : 'Mascota no encontrada'}</h3>
                            <p>${formatDate(historial.fecha_consulta)}</p>
                        </div>
                        <div class="item-actions">
                            <button class="action-btn" onclick="editHistorial('${historial._id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" onclick="deleteHistorial('${historial._id}')" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="item-details">
                        <div class="detail-item">
                            <span class="label">Síntomas:</span>
                            <span class="value">${historial.sintomas}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Diagnóstico:</span>
                            <span class="value">${historial.diagnostico}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Tratamiento:</span>
                            <span class="value">${historial.tratamiento}</span>
                        </div>
                        ${historial.observaciones ? `
                            <div class="detail-item">
                                <span class="label">Observaciones:</span>
                                <span class="value">${historial.observaciones}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    async deleteHistorial(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar este historial médico?')) {
            return;
        }

        try {
            showLoading();
            await api.deleteHistorial(id);
            showToast('Historial eliminado exitosamente', 'success');
            await this.loadHistoriales();
        } catch (error) {
            showToast(error.message || 'Error al eliminar historial', 'error');
        } finally {
            hideLoading();
        }
    }

    async editHistorial(id) {
        const historial = this.historiales.find(h => h._id === id);
        if (!historial) return;

        // Llenar el formulario con los datos del historial
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
        document.getElementById('historial-modal').style.display = 'flex';
    }

    resetHistorialForm() {
        document.getElementById('historial-form').reset();
        document.getElementById('historial-id').value = '';
        document.getElementById('historial-modal-title').textContent = 'Nuevo Historial Médico';
        
        // Establecer fecha por defecto
        const now = new Date();
        document.getElementById('historial-fecha').value = now.toISOString().split('T')[0];
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
    historialesManager.resetHistorialForm();
    document.getElementById('historial-modal').style.display = 'flex';
};

window.editHistorial = (id) => {
    historialesManager.editHistorial(id);
};

window.deleteHistorial = (id) => {
    historialesManager.deleteHistorial(id);
};

window.closeHistorialModal = () => {
    document.getElementById('historial-modal').style.display = 'none';
    historialesManager.resetHistorialForm();
};

// Exportar para uso global
window.historialesManager = historialesManager; 