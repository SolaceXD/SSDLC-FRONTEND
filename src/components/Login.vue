<template>
  <div class="login-container">
    <form class="login-form" @submit.prevent="handleLogin">
      <h1 class="login-title">Iniciar Sesión</h1>
      <input
        v-model="email"
        type="email"
        placeholder="Correo Electrónico"
        class="login-input"
        required
      />
      <input
        v-model="password"
        type="password"
        placeholder="Contraseña"
        class="login-input"
        required
      />
      <button type="submit" class="login-button">Iniciar Sesión</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const email = ref('')
const password = ref('')
const router = useRouter()
const userStore = useUserStore()

const handleLogin = async () => {
  try {
    await userStore.login({ email: email.value, password: password.value })
    await userStore.fetchUser()
    router.push('/incidences')
  } catch (error) {
    console.error('Error al iniciar sesión:', error)
    alert('Login Fallido. Revisa tus credenciales.')
  }
}
</script>

<style scoped>
/* Contenedor principal */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Ocupa toda la altura de la ventana */
  width: 100vw; /* Ocupa toda la anchura de la ventana */
  background: linear-gradient(135deg, #007bff, #0056b3); /* Degradado azul */
  font-family: 'Arial', sans-serif;
  margin: 0; /* Elimina cualquier margen */
  padding: 0; /* Elimina cualquier padding */
  box-sizing: border-box; /* Asegura que el contenedor respete los bordes */
}

/* Formulario */
.login-form {
  background: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

/* Título */
.login-title {
  font-size: 1.8rem;
  color: #0056b3;
  margin-bottom: 1.5rem;
}

/* Campos de entrada */
.login-input {
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  color: #333333;
  outline: none;
  transition: border-color 0.3s;
}

.login-input:focus {
  border-color: #007bff;
}

/* Botón */
.login-button {
  width: 100%;
  padding: 0.8rem;
  background: #007bff;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover {
  background: #0056b3;
}

</style>