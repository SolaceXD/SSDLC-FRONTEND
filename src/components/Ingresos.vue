<template>
  <div>
    <div class="navigation-buttons mb-4">
      <button class="btn btn-secondary me-2" @click="goToIncidences">Incidencias</button>
      <button class="btn btn-outline-danger" @click="logout">Cerrar Sesión</button>
    </div>

    <div class="ingresos-container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="page-title">Panel de administración para gestionar ingresos</h1>
        <button class="btn btn-primary" @click="showModal">
          <i class="fas fa-plus"></i> Agregar Ingreso
        </button>
      </div>

      <!-- Resumen -->
      <div class="row mb-4">
        <div class="col-md-4">
          <div class="card bg-success text-white">
            <div class="card-body text-center">
              <h5 class="card-title">Total Ingresos</h5>
              <p class="card-text display-6">${{ summary.total ? summary.total.toFixed(2) : '0.00' }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-8">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Ingresos Mensuales</h5>
              <div v-if="summary.monthly && summary.monthly.length" class="monthly-summary">
                <div v-for="month in summary.monthly.slice(0, 4)" :key="`${month.year}-${month.month}`"
                  class="d-flex justify-content-between monthly-item">
                  <span>{{ getMonthName(month.month) }} {{ month.year }}</span>
                  <span class="fw-bold">${{ month.total ? month.total.toFixed(2) : '0.00' }}</span>
                </div>
              </div>
              <p v-else class="text-muted">No hay datos mensuales disponibles</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de ingresos -->
      <div class="card">
        <div class="card-header bg-light">
          <h5 class="mb-0">Lista de Ingresos</h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                  <th>Categoría</th>
                  <th class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="income in incomes" :key="income.id">
                  <td>{{ income.description || 'Sin descripción' }}</td>
                  <td class="fw-bold">${{ income.amount ? parseFloat(income.amount).toFixed(2) : '0.00' }}</td>
                  <td>{{ income.date ? formatDate(income.date) : 'Fecha inválida' }}</td>
                  <td>
                    <span class="badge bg-secondary">{{ income.category || 'Sin categoría' }}</span>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-info me-2" @click="editIncome(income)">
                      <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(income)">
                      <i class="fas fa-trash"></i> Eliminar
                    </button>
                  </td>
                </tr>
                <tr v-if="incomes.length === 0 && !loading">
                  <td colspan="5" class="text-center text-muted py-5">
                    <i class="fas fa-receipt fa-3x mb-3"></i>
                    <p>No hay ingresos registrados.</p>
                    <button class="btn btn-primary mt-2" @click="showModal">
                      Agregar primer ingreso
                    </button>
                  </td>
                </tr>
                <tr v-if="loading">
                  <td colspan="5" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-2">Cargando ingresos...</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal para agregar/editar -->
      <div v-if="modalVisible" class="modal-backdrop fade show" @click="hideModal"></div>

      <div class="modal fade" :class="{ show: modalVisible }" tabindex="-1"
        :style="{ display: modalVisible ? 'block' : 'none' }">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ editing ? 'Editar Ingreso' : 'Nuevo Ingreso' }}</h5>
              <button type="button" class="btn-close" @click="hideModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveIncome">
                <div class="mb-3">
                  <label class="form-label">Descripción *</label>
                  <input type="text" class="form-control" v-model="currentIncome.description" required>
                </div>

                <div class="mb-3">
                  <label class="form-label">Monto *</label>
                  <input type="number" step="0.01" min="0" class="form-control" v-model="currentIncome.amount" required>
                </div>

                <div class="mb-3">
                  <label class="form-label">Fecha *</label>
                  <input type="date" class="form-control" v-model="currentIncome.date" required>
                </div>

                <div class="mb-3">
                  <label class="form-label">Categoría *</label>
                  <select class="form-select" v-model="currentIncome.category" required>
                    <option value="">Seleccione una categoría</option>
                    <option value="Salario">Salario</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Inversiones">Inversiones</option>
                    <option value="Ventas">Ventas</option>
                    <option value="Bonos">Bonos</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label">Notas</label>
                  <textarea class="form-control" v-model="currentIncome.notes" rows="3"></textarea>
                </div>

                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="hideModal">Cancelar</button>
                  <button type="submit" class="btn btn-primary" :disabled="saving">
                    {{ saving ? 'Guardando...' : (editing ? 'Actualizar' : 'Guardar') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/api/axios';
import Swal from 'sweetalert2';

export default {
  name: 'Ingresos',
  data() {
    return {
      incomes: [],
      summary: {
        total: 0,
        monthly: []
      },
      modalVisible: false,
      editing: false,
      loading: false,
      saving: false,
      currentIncome: {
        id: null,
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        category: '',
        notes: ''
      }
    };
  },
  mounted() {
    this.loadIncomes();
    this.loadSummary();
  },
  methods: {
    async logout() {
      try {
        console.log("Cerrando sesión...");
        this.$router.push('/login');
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    },
    
    goToIncidences() {
      this.$router.push('/incidences');
    },
    
    async loadIncomes() {
      this.loading = true;
      try {
        // Usando axios directamente importado
        const response = await axios.get('/api/incomes');
        this.incomes = response.data;
      } catch (error) {
        console.error('Error loading incomes:', error);
        this.showError('Error al cargar los ingresos', 'No se pudieron cargar los ingresos. Verifica la conexión con el servidor.');
        
        // Datos de ejemplo para desarrollo
        if (process.env.NODE_ENV === 'development') {
          this.incomes = [
            { id: 1, description: "Salario mensual", amount: 2500.00, date: "2023-10-15", category: "Salario", notes: "" },
            { id: 2, description: "Venta online", amount: 450.50, date: "2023-10-10", category: "Ventas", notes: "Venta de productos" },
            { id: 3, description: "Trabajo freelance", amount: 800.00, date: "2023-10-05", category: "Freelance", notes: "Diseño web" }
          ];
        }
      } finally {
        this.loading = false;
      }
    },

    async loadSummary() {
      try {
        // Usando axios directamente importado
        const response = await axios.get('/api/incomes-summary');
        this.summary = response.data;
      } catch (error) {
        console.error('Error loading summary:', error);
        
        // Datos de ejemplo para desarrollo
        if (process.env.NODE_ENV === 'development') {
          this.summary = {
            total: 3750.50,
            monthly: [
              { year: 2023, month: 10, total: 3750.50 },
              { year: 2023, month: 9, total: 4200.00 },
              { year: 2023, month: 8, total: 3800.75 }
            ]
          };
        }
      }
    },

    showModal() {
      this.editing = false;
      this.resetCurrentIncome();
      this.modalVisible = true;
    },

    hideModal() {
      this.modalVisible = false;
    },

    editIncome(income) {
      this.editing = true;
      this.currentIncome = { ...income };
      this.modalVisible = true;
    },

    resetCurrentIncome() {
      this.currentIncome = {
        id: null,
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        category: '',
        notes: ''
      };
    },

    async saveIncome() {
      this.saving = true;
      try {
        // Validar campos obligatorios
        if (!this.currentIncome.description || !this.currentIncome.amount || !this.currentIncome.date || !this.currentIncome.category) {
          this.showWarning('Por favor, complete todos los campos obligatorios');
          this.saving = false;
          return;
        }

        if (this.editing) {
          await axios.put(`/api/incomes/${this.currentIncome.id}`, this.currentIncome);
          this.showSuccess('¡Ingreso actualizado correctamente!', 'El ingreso ha sido actualizado con éxito');
        } else {
          await axios.post('/api/incomes', this.currentIncome);
          this.showSuccess('¡Ingreso agregado correctamente!', 'El nuevo ingreso ha sido registrado con éxito');
        }

        this.hideModal();
        this.loadIncomes();
        this.loadSummary();
      } catch (error) {
        console.error('Error saving income:', error);
        let errorMessage = 'Ocurrió un error al intentar guardar el ingreso';
        
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response && error.response.data && error.response.data.errors) {
          // Mostrar el primer error de validación
          const firstError = Object.values(error.response.data.errors)[0][0];
          errorMessage = firstError;
        }
        
        this.showError('Error al guardar el ingreso', errorMessage);
      } finally {
        this.saving = false;
      }
    },

    confirmDelete(income) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: `Vas a eliminar el ingreso "${income.description}" por $${income.amount}. Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteIncome(income.id);
        }
      });
    },

    async deleteIncome(id) {
      try {
        await axios.delete(`/api/incomes/${id}`);
        this.showSuccess('¡Ingreso eliminado!', 'El ingreso ha sido eliminado correctamente');
        this.loadIncomes();
        this.loadSummary();
      } catch (error) {
        console.error('Error deleting income:', error);
        this.showError('Error al eliminar el ingreso', 'Ocurrió un error al intentar eliminar el ingreso');
      }
    },

    formatDate(dateString) {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
      } catch (e) {
        return 'Fecha inválida';
      }
    },

    getMonthName(monthNumber) {
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return months[monthNumber - 1] || '';
    },

    showSuccess(title, text) {
      Swal.fire({
        title: title,
        text: text,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      });
    },

    showError(title, text) {
      Swal.fire({
        title: title,
        text: text,
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      });
    },

    showWarning(text) {
      Swal.fire({
        title: 'Advertencia',
        text: text,
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });
    }
  }
};
</script>

<style scoped>
.navigation-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  background: #277bcf;
  border-bottom: 1px solid #0a0038;
}

.ingresos-container {
  padding: 32px 16px 24px 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  color: #cdd4e2;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 0;
}

.card {
  border: none;
  border-radius: 14px;
  box-shadow: 0 4px 18px rgba(67, 95, 122, 0.07);
  margin-bottom: 24px;
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: 0 8px 24px rgba(89, 98, 107, 0.13);
}

.card-header {
  border-radius: 14px 14px 0 0 !important;
  background: #003fdf;
  font-weight: 600;
  font-size: 1.1rem;
}

.table {
  margin-bottom: 0;
}

.table th, .table td {
  vertical-align: middle;
  padding: 14px 12px;
}

.table th {
  background: #031d6131;
  border-top: none;
  font-weight: 700;
  color: #0080ff;
}

.table-hover tbody tr:hover {
  background: #006b6b;
}

.badge {
  font-size: 0.92em;
  padding: 0.45em 0.9em;
  border-radius: 8px;
  background: linear-gradient(90deg, #02315a 60%, #adb5bd 100%);
}

.btn {
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
}

.btn-primary {
  background: linear-gradient(90deg, #2563eb 60%, rgb(0, 48, 119) 100%);
  border: none;
}

.btn-primary:hover, .btn-outline-info:hover {
  background: #1e40af;
  color: #fff;
}

.btn-outline-info {
  color: #192235;
  border-color: #2563eb;
}

.btn-outline-info:focus, .btn-outline-info:active {
  background: #2563eb;
  color: #fff;
}

.btn-outline-danger {
  color: #e11d48;
  border-color: #e11d48;
}

.btn-outline-danger:hover {
  background: #e11d48;
  color: #fff;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.3rem;
  opacity: 0.7;
}

.btn-close:hover {
  opacity: 1;
}

.monthly-summary {
  max-height: 180px;
  overflow-y: auto;
}

.monthly-item {
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
  font-size: 1.05em;
}

.monthly-item:last-child {
  border-bottom: none;
}

.modal-backdrop {
  opacity: 0.45 !important;
  background: #862d2d63 !important;
  z-index: 1040;
}

.modal.fade {
  background: rgba(97, 127, 209, 0.295);
  transition: background 0.2s;
}

.modal-content {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 123, 255, 0.205);
  border: none;
}

.modal-header {
  border-bottom: 1px solid #221b81;
  background: #6b95ff52;
  border-radius: 16px 16px 0 0;
}

.modal-title {
  font-weight: 600;
  color: #ffffff;
}

.modal-footer {
  border-top: none;
  padding-top: 0;
}

.form-label {
  font-weight: 500;
  color: #ccd6d8;
}

.form-control, .form-select, textarea.form-control {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  transition: border-color 0.2s;
}

.form-control:focus, .form-select:focus, textarea.form-control:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37,99,235,0.08);
}

@media (max-width: 768px) {
  .ingresos-container {
    padding: 12px 2vw;
  }
  .page-title {
    font-size: 1.3rem;
  }
  .card, .card-header {
    font-size: 0.98rem;
  }
  .modal-dialog {
    max-width: 98vw;
    margin: 1.5rem auto;
  }
}
</style>