<template>
  <div class="incidence-list">
    <header class="header">
      <h2>Mis Incidencias</h2>
      <div class="header-buttons">
        <button class="header-button" @click="ingresos">Ingresos</button>
        <button class="header-button logout" @click="logout">Cerrar Sesión</button>
      </div>
    </header>

    <div v-if="incidences.length">
      <div v-for="i in incidences" :key="i.id" class="incidence-item">
        <h3>
          {{ i.type }}
          <span class="status" :class="i.status">{{ i.status }}</span>
        </h3>
        <p><strong>Ubicación:</strong> {{ i.location }}</p>
        <p>{{ i.description }}</p>
        <p v-if="i.attachment">
          <a :href="getFileUrl(i.attachment)" target="_blank" class="attachment-link">Ver adjunto</a>
        </p>
        <small>Registrado el: {{ formateDate(i.created_at) }}</small>
      </div>
    </div>
    <p v-else class="no-incidences">No hay incidencias registradas.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/api/axios'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const incidences = ref([])
const userStore = useUserStore()
const router = useRouter()

onMounted(async () => {
  try {
    const res = await axios.get('/api/reports')
    incidences.value = res.data
  } catch (error) {
    console.error('Error al obtener reportes:', error)
    router.push('/login')
  }
})

const logout = async () => {
  await userStore.logout()
  router.push('/login')
}

const ingresos = async () => {
  router.push('/Ingresos')
}

const getFileUrl = (path) => {
  return `http://127.0.0.1:8000/storage/${path}`
}

const formateDate = (datetime) => {
  return new Date(datetime).toLocaleDateString()
}
</script>

<style scoped>
/* Contenedor principal */
.incidence-list {
  max-width: 800px;
  margin: auto;
  padding: 1.5rem;
  font-family: 'Arial', sans-serif;
  background: #f3f4f6;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Encabezado */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header h2 {
  font-size: 1.8rem;
  color: #1d4ed8;
}

.header-buttons {
  display: flex;
  gap: 1rem;
}

.header-button {
  background-color: #1d4ed8;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.header-button:hover {
  background-color: #2563eb;
}

.header-button.logout {
  background-color: #e11d48;
}

.header-button.logout:hover {
  background-color: #be123c;
}

/* Incidencias */
.incidence-item {
  background: #ffffff;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 5px solid #1d4ed8;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.incidence-item h3 {
  font-size: 1.2rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.incidence-item p {
  font-size: 0.95rem;
  color: #4b5563;
  margin: 0.5rem 0;
}

.incidence-item small {
  font-size: 0.85rem;
  color: #6b7280;
}

/* Estado */
.status {
  font-size: 0.85rem;
  margin-left: 1rem;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: bold;
  color: white;
}

.status.pending {
  background: #f59e0b;
}

.status.in_review {
  background: #3b82f6;
}

.status.resolved {
  background: #10b981;
}

/* Enlace de adjunto */
.attachment-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: bold;
}

.attachment-link:hover {
  text-decoration: underline;
}

/* Sin incidencias */
.no-incidences {
  text-align: center;
  font-size: 1rem;
  color: #6b7280;
}
</style>