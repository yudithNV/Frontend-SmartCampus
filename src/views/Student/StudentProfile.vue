<template>
  <div class="profile-page">

    <!-- ── CARD PRINCIPAL ─────────────────────────────────────────────────── -->
    <div class="profile-card">

      <!-- Avatar + nombre -->
      <div class="profile-hero">
        <div class="avatar-wrapper">
          <div class="avatar" :style="avatarStyle">
            <img v-if="form.avatarUrl" :src="form.avatarUrl" alt="Avatar" class="avatar-img" @error="onAvatarError" />
            <span v-else class="avatar-initials">{{ initials }}</span>
          </div>
          <button class="avatar-edit-btn" @click="showAvatarInput = !showAvatarInput" title="Cambiar foto">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>

        <div class="profile-hero__info">
          <h2 class="profile-name">{{ profile.fullName || 'Estudiante' }}</h2>
          <p class="profile-email">{{ profile.email }}</p>
          <span class="profile-badge">{{ roleLabel }}</span>
        </div>
      </div>

      <!-- Input URL avatar (toggle) -->
      <Transition name="slide-down">
        <div v-if="showAvatarInput" class="avatar-url-row">
          <input
            v-model="form.avatarUrl"
            type="url"
            class="form-input"
            placeholder="https://... (URL de tu foto)"
          />
          <button class="btn-secondary" @click="showAvatarInput = false">Cerrar</button>
        </div>
      </Transition>

      <div class="profile-divider"></div>

      <!-- ── FORMULARIO ──────────────────────────────────────────────────── -->
      <form class="profile-form" @submit.prevent="handleSave">

        <div class="form-section">
          <h3 class="form-section__title">Datos personales</h3>

          <div class="form-grid">
            <!-- Nombre completo -->
            <div class="form-group form-group--full">
              <label class="form-label">Nombre completo</label>
              <input
                v-model="form.fullName"
                type="text"
                class="form-input"
                placeholder="Tu nombre completo"
                maxlength="120"
              />
            </div>

            <!-- Teléfono -->
            <div class="form-group">
              <label class="form-label">Teléfono de contacto</label>
              <input
                v-model="form.phone"
                type="tel"
                class="form-input"
                placeholder="Ej: +591 70000000"
                maxlength="20"
              />
            </div>

            <!-- Carrera (solo lectura — la asigna el admin) -->
            <div class="form-group">
              <label class="form-label">
                Carrera
                <span class="form-label__hint">— asignada por administración</span>
              </label>
              <input
                :value="careerName"
                type="text"
                class="form-input form-input--readonly"
                readonly
              />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3 class="form-section__title">Sobre mí</h3>
          <div class="form-group">
            <label class="form-label">Biografía / descripción corta</label>
            <textarea
              v-model="form.bio"
              class="form-input form-textarea"
              placeholder="Cuéntanos algo sobre ti..."
              rows="4"
              maxlength="300"
            ></textarea>
            <span class="char-count">{{ form.bio?.length || 0 }} / 300</span>
          </div>
        </div>

        <!-- ── FOOTER DEL FORM ────────────────────────────────────────────── -->
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="resetForm" :disabled="saving">
            Descartar cambios
          </button>
          <button type="submit" class="btn-primary" :disabled="saving || !isDirty">
            <svg v-if="saving" class="btn-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            {{ saving ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>

      </form>
    </div>

    <!-- ── CARD INFO DE CUENTA (solo lectura) ────────────────────────────── -->
    <div class="account-card">
      <h3 class="account-card__title">Información de cuenta</h3>
      <div class="account-fields">
        <div class="account-field">
          <span class="account-field__label">Correo electrónico</span>
          <span class="account-field__value">{{ profile.email || '—' }}</span>
        </div>
        <div class="account-field">
          <span class="account-field__label">Rol</span>
          <span class="account-field__value">{{ roleLabel }}</span>
        </div>
        <div class="account-field">
          <span class="account-field__label">Estado de cuenta</span>
          <span class="account-field__value account-field__value--status" :class="profile.status === 'ACTIVO' ? 'status--active' : 'status--inactive'">
            {{ profile.status || '—' }}
          </span>
        </div>
        <div class="account-field">
          <span class="account-field__label">Miembro desde</span>
          <span class="account-field__value">{{ memberSince }}</span>
        </div>
      </div>
    </div>

    <!-- ── TOAST ──────────────────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toast.show" class="toast" :class="`toast--${toast.type}`">
          <svg v-if="toast.type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ toast.message }}
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { userService, careerService } from '../../services/api.js'

// ─── Estado ───────────────────────────────────────────────────────────────────
const profile = ref({})   // datos originales del servidor
const careers = ref([])   // lista de carreras para mostrar nombre

const form = ref({
  fullName: '',
  phone: '',
  bio: '',
  avatarUrl: '',
})

const saving = ref(false)
const loading = ref(true)
const showAvatarInput = ref(false)
const avatarError = ref(false)

const toast = ref({ show: false, type: 'success', message: '' })

// ─── Computed ─────────────────────────────────────────────────────────────────
const initials = computed(() => {
  const name = form.value.fullName || profile.value.fullName || ''
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'E'
})

const avatarStyle = computed(() => ({
  background: form.value.avatarUrl ? 'transparent' : '#1a3a52',
}))

const roleLabel = computed(() => {
  const roles = { ESTUDIANTE: 'Estudiante', PUBLICADOR: 'Publicador', ADMIN: 'Administrador' }
  return roles[profile.value.role] || profile.value.role || 'Estudiante'
})

const careerName = computed(() => {
  if (!profile.value.careerId) return 'Sin carrera asignada'
  const found = careers.value.find(c => c.id === profile.value.careerId)
  return found ? found.name : `Carrera #${profile.value.careerId}`
})

const memberSince = computed(() => {
  if (!profile.value.createdAt) return '—'
  return new Date(profile.value.createdAt).toLocaleDateString('es-BO', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
})

/** Detecta si el formulario tiene cambios respecto al perfil original */
const isDirty = computed(() => {
  return (
    form.value.fullName  !== (profile.value.fullName  || '') ||
    form.value.phone     !== (profile.value.phone     || '') ||
    form.value.bio       !== (profile.value.bio       || '') ||
    form.value.avatarUrl !== (profile.value.avatarUrl || '')
  )
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fillForm(data) {
  form.value = {
    fullName:  data.fullName  || '',
    phone:     data.phone     || '',
    bio:       data.bio       || '',
    avatarUrl: data.avatarUrl || '',
  }
}

function showToast(message, type = 'success') {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 3500)
}

function onAvatarError() {
  avatarError.value = true
  form.value.avatarUrl = ''
}

function resetForm() {
  fillForm(profile.value)
  showAvatarInput.value = false
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/** Carga el perfil desde GET /api/profile */
async function loadProfile() {
  loading.value = true
  try {
    const data = await userService.getProfile()
    // El backend de ProfileController devuelve el User directamente (sin ApiResponse wrapper)
    profile.value = data
    fillForm(data)
  } catch (err) {
    showToast('No se pudo cargar el perfil', 'error')
    console.error('[StudentProfile] loadProfile:', err)
  } finally {
    loading.value = false
  }
}

/** Carga lista de carreras para mostrar el nombre */
async function loadCareers() {
  try {
    const res = await careerService.getAll()
    careers.value = res.data ?? res
  } catch {
    // No crítico si falla
  }
}

/** Guarda los cambios con PUT /api/profile */
async function handleSave() {
  if (!isDirty.value) return
  saving.value = true
  try {
    const updated = await userService.updateProfile({
      fullName:  form.value.fullName  || null,
      phone:     form.value.phone     || null,
      bio:       form.value.bio       || null,
      avatarUrl: form.value.avatarUrl || null,
    })
    // El backend devuelve el User actualizado directamente
    profile.value = updated
    fillForm(updated)
    showToast('Perfil actualizado correctamente ✓')
  } catch (err) {
    showToast(err.message || 'Error al guardar los cambios', 'error')
    console.error('[StudentProfile] handleSave:', err)
  } finally {
    saving.value = false
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([loadProfile(), loadCareers()])
})
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────────────────────────────── */
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 760px;
}

/* ── Cards base ──────────────────────────────────────────────────────────── */
.profile-card,
.account-card {
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

/* ── Hero del perfil ─────────────────────────────────────────────────────── */
.profile-hero {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.75rem 2rem;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 3px solid #e2e8f0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-size: 1.6rem;
  font-weight: 700;
  color: #FFD200;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 26px;
  height: 26px;
  background: #1a3a52;
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: background 0.15s;
}
.avatar-edit-btn:hover { background: #2e7d9f; }

.profile-hero__info {
  flex: 1;
}

.profile-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a3a52;
  margin: 0 0 0.2rem;
}

.profile-email {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 0.5rem;
}

.profile-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #eff6ff;
  color: #1d4ed8;
  padding: 3px 10px;
  border-radius: 20px;
}

/* ── Avatar URL input ────────────────────────────────────────────────────── */
.avatar-url-row {
  display: flex;
  gap: 0.75rem;
  padding: 0 2rem 1rem;
  align-items: center;
}

/* ── Divider ─────────────────────────────────────────────────────────────── */
.profile-divider {
  height: 1px;
  background: #f1f5f9;
}

/* ── Formulario ──────────────────────────────────────────────────────────── */
.profile-form {
  padding: 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.form-section__title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #94a3b8;
  margin: 0 0 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  position: relative;
}

.form-group--full {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
}

.form-label__hint {
  font-weight: 400;
  color: #94a3b8;
}

.form-input {
  padding: 0.6rem 0.875rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #1e293b;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  font-family: inherit;
  background: white;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #1a3a52;
  box-shadow: 0 0 0 3px rgba(26, 58, 82, 0.08);
}

.form-input--readonly {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}
.form-input--readonly:focus {
  border-color: #e2e8f0;
  box-shadow: none;
}

.form-textarea {
  resize: vertical;
  min-height: 90px;
}

.char-count {
  font-size: 0.75rem;
  color: #94a3b8;
  text-align: right;
  margin-top: -0.2rem;
}

/* ── Acciones del form ───────────────────────────────────────────────────── */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.4rem;
  background: #1a3a52;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
}
.btn-primary:hover:not(:disabled) { background: #2e7d9f; }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-secondary {
  padding: 0.6rem 1.2rem;
  background: white;
  color: #374151;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  font-family: inherit;
}
.btn-secondary:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; }
.btn-secondary:disabled { opacity: 0.55; cursor: not-allowed; }

/* ── Spinner botón ───────────────────────────────────────────────────────── */
.btn-spinner {
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Card info de cuenta ─────────────────────────────────────────────────── */
.account-card {
  padding: 1.5rem 2rem;
}

.account-card__title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #94a3b8;
  margin: 0 0 1.1rem;
}

.account-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 2rem;
}

.account-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.account-field__label {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.account-field__value {
  font-size: 0.875rem;
  color: #1e293b;
  font-weight: 500;
}

.account-field__value--status {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
.account-field__value--status::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}
.status--active  { color: #059669; }
.status--active::before  { background: #059669; }
.status--inactive { color: #dc2626; }
.status--inactive::before { background: #dc2626; }

/* ── Toast ───────────────────────────────────────────────────────────────── */
.toast {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1.2rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0,0,0,0.14);
  z-index: 9999;
  max-width: 340px;
}

.toast--success {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.toast--error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* ── Transiciones ────────────────────────────────────────────────────────── */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }

.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from { opacity: 0; transform: translateX(20px); }
.toast-leave-to   { opacity: 0; transform: translateX(20px); }

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .profile-hero { flex-direction: column; text-align: center; padding: 1.5rem; }
  .profile-form { padding: 1.25rem; }
  .form-grid { grid-template-columns: 1fr; }
  .form-group--full { grid-column: 1; }
  .account-fields { grid-template-columns: 1fr; }
  .account-card { padding: 1.25rem; }
  .form-actions { flex-direction: column; }
  .btn-primary, .btn-secondary { width: 100%; justify-content: center; }
}
</style>