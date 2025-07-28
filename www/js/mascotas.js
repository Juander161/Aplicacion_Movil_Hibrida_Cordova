// Módulo de gestión de mascotas
class MascotasManager {
    constructor() {
        this.mascotas = [];
    }

    async loadMascotas() {
        try {
            showLoading();
            const mascotas = await api.getMascotas();
            this.mascotas = mascotas;
            this.renderMascotas();
        } catch (error) {
            showToast(error.message || 'Error al cargar mascotas', 'error');
        } finally {
            hideLoading();
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
                        <h3>${mascota.nombre}</h3>
                        <p>${mascota.especie} - ${mascota.raza}</p>
                    </div>
                    <div class="item-actions">
                        <button class="action-btn" onclick="editMascota('${mascota._id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteMascota('${mascota._id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="item-details">
                    <div class="detail-item">
                        <span class="label">Edad:</span>
                        <span class="value">${mascota.edad} años</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Peso:</span>
                        <span class="value">${mascota.peso} kg</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async deleteMascota(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta mascota?')) {
            return;
        }

        try {
            showLoading();
            await api.deleteMascota(id);
            showToast('Mascota eliminada exitosamente', 'success');
            await this.loadMascotas();
        } catch (error) {
            showToast(error.message || 'Error al eliminar mascota', 'error');
        } finally {
            hideLoading();
        }
    }

    async editMascota(id) {
        const mascota = this.mascotas.find(m => m._id === id);
        if (!mascota) return;

        // Llenar el formulario con los datos de la mascota
        document.getElementById('mascota-id').value = mascota._id;
        document.getElementById('mascota-nombre').value = mascota.nombre;
        document.getElementById('mascota-especie').value = mascota.especie;
        document.getElementById('mascota-raza').value = mascota.raza;
        document.getElementById('mascota-edad').value = mascota.edad;
        document.getElementById('mascota-peso').value = mascota.peso;

        // Cambiar el título del modal
        document.getElementById('mascota-modal-title').textContent = 'Editar Mascota';

        // Mostrar el modal
        document.getElementById('mascota-modal').style.display = 'flex';
    }

    resetMascotaForm() {
        document.getElementById('mascota-form').reset();
        document.getElementById('mascota-id').value = '';
        document.getElementById('mascota-modal-title').textContent = 'Agregar Mascota';
    }
}

// Crear instancia global
const mascotasManager = new MascotasManager();

// Funciones globales
window.loadMascotas = () => {
    mascotasManager.loadMascotas();
};

window.showAddMascota = () => {
    mascotasManager.resetMascotaForm();
    document.getElementById('mascota-modal').style.display = 'flex';
};

window.editMascota = (id) => {
    mascotasManager.editMascota(id);
};

window.deleteMascota = (id) => {
    mascotasManager.deleteMascota(id);
};

window.closeMascotaModal = () => {
    document.getElementById('mascota-modal').style.display = 'none';
    mascotasManager.resetMascotaForm();
};

// Exportar para uso global
window.mascotasManager = mascotasManager; 