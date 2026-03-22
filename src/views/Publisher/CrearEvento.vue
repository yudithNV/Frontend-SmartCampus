<template>
  <div class="crear-evento-page">

    <!-- Toast -->
    <Transition name="toast-slide">
      <div v-if="toast.show" class="toast" :class="`toast-${toast.type}`">
        <span class="toast-icon-wrap">
          <svg v-if="toast.type==='success'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else-if="toast.type==='error'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </span>
        <div class="toast-body">
          <strong>{{ toast.title }}</strong>
          <span>{{ toast.message }}</span>
        </div>
        <button class="toast-close" @click="toast.show = false">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </Transition>

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a3a52" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div>
          <h1>Crear Evento</h1>
          <p>Organiza y publica eventos para la comunidad UCB</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" @click="saveDraft" :disabled="saving">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Guardar Borrador
        </button>
        <button class="btn-primary" @click="submitEvent" :disabled="saving || !isValid">
          <template v-if="!saving">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Publicar Evento
          </template>
          <template v-else>
            <span class="spinner-sm"></span>
            Publicando...
          </template>
        </button>
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="submitEvent" class="event-form">

      <!-- Título -->
      <div class="field-block">
        <div class="field-label">
          <span class="field-num">01</span>
          <label>Título del Evento <span class="req">*</span></label>
          <span class="char-count">{{ form.title.length }}/255</span>
        </div>
        <input
          v-model="form.title"
          type="text"
          class="title-input"
          placeholder="Ej: Feria de Ciencias UCB 2026"
          maxlength="255"
        />
      </div>

      <!-- Descripción -->
      <div class="field-block">
        <div class="field-label">
          <span class="field-num">02</span>
          <label>Descripción <span class="req">*</span></label>
          <span class="char-count">{{ form.description.length }} car.</span>
        </div>
        <textarea
          v-model="form.description"
          class="description-textarea"
          placeholder="Describe los detalles del evento..."
          rows="8"
        ></textarea>
      </div>

      <!-- Fecha y Hora -->
      <div class="field-row">
        <div class="field-block">
          <div class="field-label">
            <span class="field-num">03</span>
            <label>Fecha <span class="req">*</span></label>
          </div>
          <input v-model="form.eventDate" type="date" class="form-input" />
        </div>
        <div class="field-block">
          <div class="field-label">
            <span class="field-num">04</span>
            <label>Hora <span class="req">*</span></label>
          </div>
          <input v-model="form.eventTime" type="time" class="form-input" />
        </div>
      </div>

      <!-- Ubicación -->
      <div class="field-block">
        <div class="field-label">
          <span class="field-num">05</span>
          <label>Ubicación <span class="req">*</span></label>
        </div>
        <input
          v-model="form.location"
          type="text"
          class="form-input"
          placeholder="Ej: Auditorio Principal, Campus Obrajes"
        />
      </div>

      <!-- Imagen de Portada -->
      <div class="field-block">
        <div class="field-label">
          <span class="field-num">06</span>
          <label>Imagen de Portada</label>
          <span class="optional-tag">Opcional</span>
        </div>
        <div class="input-icon-wrap">
          <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <input
            v-model="form.coverUrl"
            type="url"
            class="form-input with-icon"
            placeholder="https://ejemplo.com/evento.jpg"
          />
        </div>
      </div>

      <!-- Dirigido a -->
      <div class="field-block">
        <div class="field-label">
          <span class="field-num">07</span>
          <label>Dirigido a</label>
        </div>
        <div class="select-wrap">
          <select v-model="form.careerId" class="form-select">
            <option :value="null">Toda la comunidad UCB</option>
            <option v-for="career in careers" :key="career.id" :value="career.id">
              {{ career.name }}
            </option>
          </select>
          <svg class="select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      <!-- Published toggle -->
      <div class="field-block publish-block">
        <div class="toggle-row">
          <div class="toggle-left">
            <div class="toggle-icon" :class="form.published ? 'icon-pub' : 'icon-draft'">
              <svg v-if="form.published" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            </div>
            <div>
              <span class="toggle-title">{{ form.published ? 'Publicar inmediatamente' : 'Guardar como borrador' }}</span>
              <span class="toggle-desc">{{ form.published ? 'El evento será visible para todos los usuarios.' : 'Solo tú podrás ver este evento hasta que lo publiques.' }}</span>
            </div>
          </div>
          <button type="button" class="toggle-switch" :class="{ on: form.published }" @click="form.published = !form.published">
            <span class="toggle-knob"></span>
          </button>
        </div>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { careerService } from '../../services/api.js'

const router = useRouter()
const saving = ref(false)
const careers = ref([])

const form = reactive({
  title: '',
  description: '',
  eventDate: '',
  eventTime: '',
  location: '',
  coverUrl: '',
  careerId: null,
  published: true
})

const toast = reactive({ show: false, type: 'success', title: '', message: '' })

const isValid = computed(() =>
  form.title.trim().length > 0 &&
  form.description.trim().length > 0 &&
  form.eventDate !== '' &&
  form.eventTime !== '' &&
  form.location.trim().length > 0
)

function showToastMsg(type, title, message) {
  toast.show = false
  setTimeout(() => {
    Object.assign(toast, { show: true, type, title, message })
    setTimeout(() => { toast.show = false }, 4500)
  }, 60)
}

async function loadCareers() {
  try {
    careers.value = await careerService.getAll()
  } catch (error) {
    console.error('Error al cargar carreras:', error)
  }
}

async function submitEvent() {
  if (!isValid.value) {
    showToastMsg('warning', 'Campos incompletos', 'Por favor completa todos los campos obligatorios.')
    return
  }

  saving.value = true
  try {
    // TODO: Conectar con el API de eventos cuando esté listo
    showToastMsg('success', 'Evento guardado', form.published ? 'El evento fue publicado correctamente.' : 'El borrador fue guardado.')
    setTimeout(() => router.push('/publicador/mis-eventos'), 2000)
  } catch (err) {
    showToastMsg('error', 'Error al publicar', 'No se pudo guardar el evento.')
  } finally {
    saving.value = false
  }
}

async function saveDraft() {
  if (!form.title.trim() && !form.description.trim()) {
    showToastMsg('warning', 'Sin contenido', 'Escribe algo antes de guardar.')
    return
  }
  saving.value = true
  try {
    // TODO: Conectar con el API de eventos cuando esté listo
    showToastMsg('success', 'Borrador guardado', 'Tu borrador fue guardado correctamente.')
  } catch (err) {
    showToastMsg('error', 'Error', 'No se pudo guardar el borrador.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadCareers()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.crear-evento-page {
  font-family: 'Inter', sans-serif;
  color: #1e293b;
  padding-bottom: 3rem;
  max-width: 900px;
}

/* Toast */
.toast {
  position: fixed; top: 1.5rem; right: 1.5rem; z-index: 9999;
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.9rem 1.1rem; background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
  border-left: 3px solid; min-width: 300px; max-width: 400px;
}
.toast-success { border-left-color: #22c55e; }
.toast-error   { border-left-color: #ef4444; }
.toast-warning { border-left-color: #f59e0b; }
.toast-icon-wrap {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.toast-success .toast-icon-wrap { background: #dcfce7; color: #16a34a; }
.toast-error   .toast-icon-wrap { background: #fee2e2; color: #dc2626; }
.toast-warning .toast-icon-wrap { background: #fef3c7; color: #d97706; }
.toast-body { flex: 1; }
.toast-body strong { display: block; font-size: 0.83rem; font-weight: 600; color: #1e293b; margin-bottom: 1px; }
.toast-body span   { font-size: 0.77rem; color: #64748b; }
.toast-close {
  background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px;
  border-radius: 4px; display: flex; align-items: center;
}
.toast-close:hover { background: #f1f5f9; color: #475569; }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.28s ease; }
.toast-slide-enter-from, .toast-slide-leave-to { opacity: 0; transform: translateX(28px); }

/* Header */
.page-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 2rem; padding-bottom: 1.4rem; border-bottom: 1px solid #f1f5f9;
}
.header-left { display: flex; align-items: center; gap: 1rem; }
.header-icon {
  width: 46px; height: 46px; background: #FFD200;
  border-radius: 12px; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; box-shadow: 0 2px 8px rgba(255,210,0,0.3);
}
.page-header h1 {
  font-family: 'Syne', sans-serif; font-size: 1.55rem; font-weight: 800;
  color: #0f172a; letter-spacing: -0.5px; margin-bottom: 0.1rem;
}
.page-header p { font-size: 0.81rem; color: #64748b; }

.header-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }

.btn-secondary, .btn-primary {
  display: flex; align-items: center; gap: 0.45rem;
  padding: 0.6rem 1.1rem; border-radius: 8px;
  font-size: 0.83rem; font-weight: 600; cursor: pointer;
  border: none; transition: all 0.18s; font-family: 'Inter', sans-serif;
}
.btn-secondary { background: #f8fafc; color: #475569; border: 1.5px solid #e2e8f0; }
.btn-secondary:hover:not(:disabled) { background: #1a3a52; color: #fff; border-color: #1a3a52; }
.btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-primary { background: #1a3a52; color: #FFD200; }
.btn-primary:hover:not(:disabled) { background: #0f2438; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(26,58,82,0.25); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.spinner-sm {
  width: 13px; height: 13px;
  border: 2px solid rgba(255,210,0,0.3); border-top-color: #FFD200;
  border-radius: 50%; animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Form */
.event-form { display: flex; flex-direction: column; gap: 1rem; }

.field-block {
  background: #fff; border-radius: 12px; padding: 1.4rem;
  border: 1px solid #e2e8f0; transition: border-color 0.18s;
}
.field-block:focus-within { border-color: #FFD200; box-shadow: 0 0 0 3px rgba(255,210,0,0.07); }

.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 720px) { .field-row { grid-template-columns: 1fr; } }

.field-label {
  display: flex; align-items: center; gap: 0.55rem; margin-bottom: 0.9rem;
}
.field-num {
  font-family: 'Syne', sans-serif; font-size: 0.68rem; font-weight: 800;
  color: #FFD200; background: #1a3a52; padding: 2px 7px;
  border-radius: 20px; letter-spacing: 0.4px; flex-shrink: 0;
}
.field-label label {
  font-size: 0.78rem; font-weight: 600; color: #475569;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.req { color: #ef4444; }
.optional-tag {
  margin-left: auto; font-size: 0.68rem; background: #f1f5f9;
  color: #94a3b8; padding: 2px 8px; border-radius: 20px; font-weight: 500;
}
.char-count { margin-left: auto; font-size: 0.71rem; color: #94a3b8; }

/* Inputs */
.title-input {
  width: 100%; border: none; outline: none;
  font-family: 'Syne', sans-serif; font-size: 1.35rem; font-weight: 700;
  color: #0f172a; background: transparent; letter-spacing: -0.3px;
}
.title-input::placeholder { color: #cbd5e1; font-weight: 400; }

.form-input {
  width: 100%; padding: 0.68rem 0.9rem;
  border: 1.5px solid #e2e8f0; border-radius: 9px;
  font-size: 0.86rem; font-family: 'Inter', sans-serif; color: #1e293b;
  background: #f8fafc; outline: none; transition: all 0.18s;
}
.form-input:focus { border-color: #FFD200; background: #fffef5; box-shadow: 0 0 0 3px rgba(255,210,0,0.07); }

.input-icon-wrap { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 0.85rem; pointer-events: none; flex-shrink: 0; }
.form-input.with-icon { padding-left: 2.4rem; }

.description-textarea {
  width: 100%; min-height: 160px; padding: 0.85rem;
  border: 1.5px solid #e2e8f0; border-radius: 9px;
  font-size: 0.88rem; font-family: 'Inter', sans-serif; color: #1e293b;
  line-height: 1.7; background: #f8fafc; resize: vertical; outline: none; transition: all 0.18s;
}
.description-textarea:focus { border-color: #FFD200; background: #fffef5; box-shadow: 0 0 0 3px rgba(255,210,0,0.07); }
.description-textarea::placeholder { color: #cbd5e1; }

/* Select */
.select-wrap { position: relative; }
.form-select {
  width: 100%; padding: 0.68rem 2.2rem 0.68rem 0.9rem;
  border: 1.5px solid #e2e8f0; border-radius: 9px;
  font-size: 0.86rem; font-family: 'Inter', sans-serif; color: #1e293b;
  background: #f8fafc; outline: none; cursor: pointer; appearance: none;
  transition: all 0.18s;
}
.form-select:focus { border-color: #FFD200; box-shadow: 0 0 0 3px rgba(255,210,0,0.08); }
.select-arrow { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); pointer-events: none; }

/* Publish toggle */
.publish-block { border-color: #f1f5f9; }
.toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.toggle-left { display: flex; align-items: center; gap: 0.75rem; flex: 1; }
.toggle-icon {
  width: 36px; height: 36px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.icon-pub   { background: #dcfce7; color: #16a34a; }
.icon-draft { background: #fef3c7; color: #d97706; }
.toggle-title { display: block; font-size: 0.85rem; font-weight: 600; color: #1e293b; margin-bottom: 0.18rem; }
.toggle-desc  { font-size: 0.76rem; color: #64748b; }

.toggle-switch {
  width: 46px; height: 25px; background: #e2e8f0; border: none;
  border-radius: 13px; cursor: pointer; position: relative;
  transition: background 0.22s; flex-shrink: 0;
}
.toggle-switch.on { background: #1a3a52; }
.toggle-knob {
  position: absolute; top: 3px; left: 3px;
  width: 19px; height: 19px; background: #fff; border-radius: 50%;
  transition: transform 0.22s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); display: block;
}
.toggle-switch.on .toggle-knob { transform: translateX(21px); background: #FFD200; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
  .header-actions { width: 100%; flex-direction: column; }
  .btn-secondary, .btn-primary { width: 100%; justify-content: center; }
}
</style>
