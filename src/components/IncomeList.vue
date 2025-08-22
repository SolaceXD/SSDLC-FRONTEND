<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" href="#">Panel de Administración de Ingresos</a>
      </div>
    </nav>

    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>Gestión de Ingresos</h2>
        <button class="btn btn-primary" @click="showModal">Agregar Ingreso</button>
      </div>

      <!-- Resumen -->
      <div class="row mb-4">
        <div class="col-md-4">
          <div class="card bg-success text-white">
            <div class="card-body">
              <h5 class="card-title">Total Ingresos</h5>
              <p class="card-text h4">${{ summary.total.toFixed(2) }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-8">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Ingresos Mensuales</h5>
              <div v-if="summary.monthly && summary.monthly.length">
                <div v-for="month in summary.monthly.slice(0, 3)" :key="`${month.year}-${month.month}`" class="d-flex justify-content-between">
                  <span>{{ getMonthName(month.month) }} {{ month.year }}</span>
                  <span>${{ month.total.toFixed(2) }}</span>
                </div>
              </div>
              <p v-else class="text-muted">No hay datos mensuales</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de ingresos -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead class="thead-dark">
            <tr>
              <th>Descripción</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Categoría</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="income in incomes" :key="income.id">
              <td>{{ income.description }}</td>
              <td>${{ parseFloat(income.amount).toFixed(2) }}</td>
              <td>{{ formatDate(income.date) }}</td>
              <td>
                <span class="badge bg-secondary">{{ income.category }}</span>
              </td>
              <td>
                <button class="btn btn-sm btn-info mr-2" @click="editIncome(income)">Editar</button>
                <button class="btn btn-sm btn-danger" @click="deleteIncome(income.id)">Eliminar</button>
              </td>
            </tr>
            <tr v-if="incomes.length === 0">
              <td colspan="5" class="text-center text-muted py-4">
                No hay ingresos registrados. ¡Agrega tu primer ingreso!
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal para agregar/editar -->
      <div v-if="modalVisible" class="modal-backdrop fade show" @click="hideModal"></div>
      
      <div class="modal fade" :class="{show: modalVisible}" tabindex="-1" role="dialog" 
           :style="{display: modalVisible ? 'block' : 'none'}">
        <div class="modal-dialog modal-dialog-centered" role="document">
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
                  <input type="number" step="0.01" min="0" class="form-control" 
                         v-model="currentIncome.amount" required>
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
                  <button type="submit" class="btn btn-primary">
                    {{ editing ? 'Actualizar' : 'Guardar' }}
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
import axios from 'axios';

export default {
  name: 'IncomeManager',
  data() {
    return {
      incomes: [],
      summary: {
        total: 0,
        monthly: []
      },
      modalVisible: false,
      editing: false,
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
    async loadIncomes() {
      try {
        // Ajusta esta URL según tu endpoint de Laravel
        const response = await axios.get('http://localhost:8000/api/incomes');
        this.incomes = response.data;
      } catch (error) {
        console.error('Error loading incomes:', error);
        this.showError('Error al cargar los ingresos');
      }
    },
    
    async loadSummary() {
      try {
        // Ajusta esta URL según tu endpoint de Laravel
        const response = await axios.get('http://localhost:8000/api/incomes-summary');
        this.summary = response.data;
      } catch (error) {
        console.error('Error loading summary:', error);
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
      this.currentIncome = {...income};
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
      try {
        if (this.editing) {
          await axios.put(`http://localhost:8000/api/incomes/${this.currentIncome.id}`, this.currentIncome);
        } else {
          await axios.post('http://localhost:8000/api/incomes', this.currentIncome);
        }
        
        this.hideModal();
        this.loadIncomes();
        this.loadSummary();
        this.showSuccess('Ingreso guardado correctamente');
      } catch (error) {
        console.error('Error saving income:', error);
        this.showError('Error al guardar el ingreso');
      }
    },
    
    async deleteIncome(id) {
      if (confirm('¿Estás seguro de que quieres eliminar este ingreso?')) {
        try {
          await axios.delete(`http://localhost:8000/api/incomes/${id}`);
          this.loadIncomes();
          this.loadSummary();
          this.showSuccess('Ingreso eliminado correctamente');
        } catch (error) {
          console.error('Error deleting income:', error);
          this.showError('Error al eliminar el ingreso');
        }
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES');
    },
    
    getMonthName(monthNumber) {
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return months[monthNumber - 1] || '';
    },
    
    showSuccess(message) {
      alert(message); // Puedes reemplazar con un sistema de notificaciones más elegante
    },
    
    showError(message) {
      alert(message); // Puedes reemplazar con un sistema de notificaciones más elegante
    }
  }
};
</script>

<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.navbar {
  margin-bottom: 0;
}

.container {
  padding-top: 20px;
  padding-bottom: 40px;
}

.table th {
  border-top: none;
}

.badge {
  font-size: 0.85em;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal.show {
  display: block;
}

.btn {
  margin-right: 5px;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.card-body {
  padding: 1.25rem;
}
</style>