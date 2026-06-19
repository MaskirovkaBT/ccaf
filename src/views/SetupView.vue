<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const serverUrl = ref('')
const error = ref('')
const checking = ref(false)

const canSubmit = computed(() => serverUrl.value.trim().length > 0 && !checking.value)

async function probeUrl(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000)
  try {
    await fetch(url, { method: 'HEAD', signal: controller.signal, mode: 'no-cors' })
    return true
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

async function resolveProtocol(base) {
  const httpsUrl = `https://${base}`
  const httpUrl = `http://${base}`

  if (await probeUrl(`${httpsUrl}/eras`)) return httpsUrl
  if (await probeUrl(`${httpUrl}/eras`)) return httpUrl
  return null
}

async function save() {
  const url = serverUrl.value.trim()
  if (!url) {
    error.value = 'Введите адрес сервера'
    return
  }

  checking.value = true
  error.value = ''

  try {
    let fixed = url

    if (!/^https?:\/\//i.test(fixed)) {
      const base = fixed.replace(/\/$/, '')
      const resolved = await resolveProtocol(base)
      if (!resolved) {
        error.value = 'Не удалось подключиться к серверу по http или https'
        return
      }
      fixed = resolved
    }

    // убираем trailing slash
    fixed = fixed.replace(/\/$/, '')

    localStorage.setItem('ccaf_api_url', fixed)
    router.replace({ name: 'search' })
  } finally {
    checking.value = false
  }
}
</script>

<template>
  <div class="setup-page">
    <div class="setup-card">
      <img src="/icon-192x192.png" alt="Логотип" class="logo" />
      <h1 class="title">ВС КК</h1>
      <p class="subtitle">Помощник для новобранца</p>

      <div class="form">
        <label class="label">Адрес сервера</label>
        <input
          v-model="serverUrl"
          type="url"
          inputmode="url"
          autocomplete="url"
          placeholder="localhost:8000"
          class="input"
          @keyup.enter="save"
        />
        <p class="hint-text">Протокол http:// или https:// добавится автоматически</p>
        <p v-if="error" class="error-text">{{ error }}</p>
        <button class="btn" :disabled="!canSubmit" @click="save">
          {{ checking ? 'Проверка...' : 'Продолжить' }}
        </button>
        <router-link to="/" class="back-link">На главную</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.setup-page {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  padding: 20px;
}

.setup-card {
  width: 100%;
  max-width: 320px;
  text-align: center;
}

.logo {
  width: 96px;
  height: auto;
  max-height: 120px;
  object-fit: contain;
  margin-bottom: 16px;
  filter: drop-shadow(0 0 12px rgba(0, 255, 65, 0.25));
}

.title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: var(--accent-green);
  letter-spacing: 4px;
  text-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
  margin-bottom: 4px;
}

.subtitle {
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 32px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
}

.label {
  font-size: 10px;
  color: var(--text-dim);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.input {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 10px 12px;
  font-family: var(--font-mono);
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s ease;
}

.input:focus {
  border-color: var(--accent-green-dim);
}

.error-text {
  font-size: 11px;
  color: var(--accent-red);
  margin: 0;
}

.hint-text {
  font-size: 10px;
  color: var(--text-dim);
  margin: 0;
}

.btn {
  margin-top: 8px;
  background: var(--accent-green);
  border: none;
  color: #000;
  padding: 12px;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    opacity 0.2s ease,
    transform 0.1s ease;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
}

.btn:active:not(:disabled) {
  transform: translateY(1px);
}

.btn:disabled {
  background: var(--border-color);
  color: var(--text-inactive);
  cursor: not-allowed;
}

.back-link {
  display: block;
  text-align: center;
  margin-top: 12px;
  font-size: 11px;
  color: var(--text-dim);
  text-decoration: none;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: var(--accent-green);
}
</style>
