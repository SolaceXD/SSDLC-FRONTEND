<template>
  <div>
    <h2>Panel de administración de ingresos</h2>

    <form @submit.prevent="guardarIngreso">
      <input v-model="form.descripcion" placeholder="Descripción" required />
      <input v-model.number="form.monto" type="number" placeholder="Monto" required />
      <input v-model="form.fecha" type="date" required />
      <button type="submit">{{ editando ? 'Actualizar' : 'Agregar' }}</button>
      <button v-if="editando" @click="cancelarEdicion" type="button">Cancelar</button>
    </form>

    <ul>
      <li v-for="ingreso in ingresos" :key="ingreso.id">
        {{ ingreso.descripcion }} - {{ ingreso.monto }} - {{ ingreso.fecha }}
        <button @click="editarIngreso(ingreso)">Editar</button>
        <button @click="eliminarIngreso(ingreso.id)">Eliminar</button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Ingresos',
  data() {
    return {
      ingresos: [],
      form: {
        descripcion: '',
        monto: null,
        fecha: ''
      },
      editando: false,
      editId: null
    }
  },
  mounted() {
    this.cargarIngresos()
  },
  methods: {
    cargarIngresos() {
      // Aquí debes usar fetch o axios para consumir la API backend Laravel.
      // Ejemplo con fetch (cambia URL por la correcta):
      fetch('http://localhost/api/ingresos')
        .then(res => res.json())
        .then(data => this.ingresos = data)
        .catch(console.error)
    },
    guardarIngreso() {
      if (this.editando) {
        fetch(`http://localhost/api/ingresos/${this.editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        })
          .then(() => {
            this.cargarIngresos()
            this.limpiarFormulario()
          })
          .catch(console.error)
      } else {
        fetch('http://localhost/api/ingresos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        })
          .then(() => {
            this.cargarIngresos()
            this.limpiarFormulario()
          })
          .catch(console.error)
      }
    },
    editarIngreso(ingreso) {
      this.editando = true
      this.editId = ingreso.id
      this.form = { ...ingreso }
    },
    cancelarEdicion() {
      this.limpiarFormulario()
    },
    limpiarFormulario() {
      this.form = { descripcion: '', monto: null, fecha: '' }
      this.editando = false
      this.editId = null
    },
    eliminarIngreso(id) {
      if (confirm('¿Eliminar ingreso?')) {
        fetch(`http://localhost/api/ingresos/${id}`, { method: 'DELETE' })
          .then(() => this.cargarIngresos())
          .catch(console.error)
      }
    }
  }
}
</script>
