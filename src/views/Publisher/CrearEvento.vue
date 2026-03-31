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
        <!-- Botón "Vista Previa/Editar" comentado - ya no es necesario con la vista lado a lado -->
        <!-- <button class="btn-toggle-preview" @click="togglePreview">
          <svg v-if="showPreview" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          {{ showPreview ? 'Editar' : 'Vista Previa' }}
        </button> -->
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

    <!-- Editor layout -->
    <div class="editor-layout">

      <!-- EDITOR COLUMN -->
      <div class="editor-column" v-show="!showPreview || isWide">
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

      <!-- Categoría -->
      <div class="field-block">
        <div class="field-label">
          <span class="field-num">02</span>
          <label>Categoría <span class="req">*</span></label>
        </div>
        <div class="category-grid">
          <button
            type="button"
            v-for="cat in categories"
            :key="cat.id"
            class="cat-btn"
            :class="{ active: form.categoryId === cat.id }"
            @click="form.categoryId = cat.id"
            :style="{ '--cat-color': cat.color }"
          >
            <span class="cat-color-dot" :style="{ background: cat.color }"></span>
            <span>{{ cat.name }}</span>
          </button>
        </div>
      </div>

      <!-- Descripción -->
      <div class="field-block">
        <div class="field-label">
          <span class="field-num">03</span>
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

      <!-- Tipo de Evento -->
      <div class="field-block">
        <div class="field-label">
          <span class="field-num">04</span>
          <label>Tipo de Evento <span class="req">*</span></label>
        </div>
        <div class="select-wrap">
          <select v-model="form.eventType" class="form-select">
            <option value="">Selecciona el tipo de evento</option>
            <option v-for="type in availableEventTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
          <svg class="select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      <!-- Fecha y Hora de Inicio -->
      <div class="field-row">
        <div class="field-block">
          <div class="field-label">
            <span class="field-num">05</span>
            <label>Fecha <span class="req">*</span></label>
          </div>
          <input v-model="form.eventDate" type="date" class="form-input" :class="{ 'input-error': validationErrors.eventDate }" :min="getTodayDate()" />
          <span v-if="validationErrors.eventDate" class="field-error">{{ validationErrors.eventDate }}</span>
        </div>
        <div class="field-block">
          <div class="field-label">
            <span class="field-num">06</span>
            <label>Hora de Inicio <span class="req">*</span></label>
          </div>
          <input v-model="form.eventTime" type="time" class="form-input" :class="{ 'input-error': validationErrors.eventTime }" />
          <span v-if="validationErrors.eventTime" class="field-error">{{ validationErrors.eventTime }}</span>
        </div>
      </div>

      <!-- Fecha y Hora de Fin -->
      <div class="field-row">
        <div class="field-block">
          <div class="field-label">
            <span class="field-num">07</span>
            <label>Fecha de Fin</label>
            <span class="optional-tag">Opcional</span>
          </div>
          <input v-model="form.endDate" type="date" class="form-input" :class="{ 'input-error': validationErrors.endDate }" :min="form.eventDate || getTodayDate()" />
          <span v-if="validationErrors.endDate" class="field-error">{{ validationErrors.endDate }}</span>
        </div>
        <div class="field-block">
          <div class="field-label">
            <span class="field-num">08</span>
            <label>Hora de Fin</label>
            <span class="optional-tag">Opcional</span>
          </div>
          <input v-model="form.endTime" type="time" class="form-input" :class="{ 'input-error': validationErrors.endTime }" />
          <span v-if="validationErrors.endTime" class="field-error">{{ validationErrors.endTime }}</span>
        </div>
      </div>

      <!-- Ubicación -->
      <div class="field-block">
        <div class="field-label">
          <span class="field-num">09</span>
          <label>Ubicación <span class="req">*</span></label>
        </div>
        <select
          v-model.number="form.locationId"
          class="form-input form-select"
          required
        >
          <option :value="null">Selecciona una ubicación</option>
          <option v-for="loc in locations" :key="loc.id" :value="loc.id">
            {{ loc.name }} (Bloque {{ loc.block }})
          </option>
        </select>
      </div>

      <!-- Imagen de Portada -->
      <div class="field-block">
        <div class="field-label">
          <span class="field-num">10</span>
          <label>Imagen de Portada</label>
          <span class="optional-tag">Opcional</span>
        </div>

        <div class="upload-tabs">
          <button type="button" class="upload-tab" :class="{ active: coverMode === 'url' }" @click="switchCoverMode('url')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
            Desde URL
          </button>
          <button type="button" class="upload-tab" :class="{ active: coverMode === 'file' }" @click="switchCoverMode('file')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Subir desde dispositivo
          </button>
        </div>

        <!-- URL mode -->
        <template v-if="coverMode === 'url'">
          <div class="input-icon-wrap">
            <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <input
              v-model="form.coverUrl"
              type="url"
              class="form-input with-icon"
              placeholder="https://ejemplo.com/evento.jpg"
              @input="updateCoverPreview"
            />
            <button v-if="form.coverUrl" type="button" class="input-clear" @click="clearCover">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <Transition name="fade">
            <div class="cover-preview-url" v-if="coverPreviewUrl">
              <img :src="coverPreviewUrl" alt="Vista previa" @error="coverPreviewUrl=''" />
              <button type="button" class="cover-remove" @click="clearCover">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </Transition>
        </template>

        <!-- File mode -->
        <template v-else>
          <input ref="coverFileInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden-input" @change="onCoverFileChange" />
          <div class="file-drop-zone" :class="{ dragging: coverDragging }"
            @dragover.prevent="coverDragging = true"
            @dragleave="coverDragging = false"
            @drop.prevent="onCoverDrop"
            @click="!coverPreviewUrl && $refs.coverFileInput.click()">
            <div v-if="!coverPreviewUrl" class="drop-content">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <p>Arrastra una imagen aquí o <span class="drop-link">haz clic para seleccionar</span></p>
              <small>JPG, PNG, WEBP, GIF — máx. 5MB</small>
            </div>
            <div v-else class="drop-preview-wrap">
              <img :src="coverPreviewUrl" alt="Preview" class="drop-preview-img" />
              <div class="drop-preview-overlay">
                <span class="drop-preview-name">{{ coverFileName }}</span>
                <button type="button" class="cover-remove-btn" @click.stop="clearCover">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Quitar
                </button>
              </div>
              <div class="pending-badge">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Se subirá al publicar
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Dirigido a -->
      <div class="field-block">
        <div class="field-label">
          <span class="field-num">11</span>
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

      <!-- Capacidad Máxima -->
      <div class="field-block">
        <div class="field-label">
          <span class="field-num">12</span>
          <label>Capacidad Máxima</label>
          <span class="optional-tag">Opcional</span>
        </div>
        <div class="input-icon-wrap">
          <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          <input
            v-model.number="form.maxCapacity"
            type="number"
            class="form-input with-icon"
            placeholder="100"
            min="1"
            max="10000"
          />
        </div>
        <small class="field-help">Máximo número de asistentes permitidos</small>
      </div>

      <!-- Toggle "Publicar/Borrador" comentado - ya existen botones "Guardar Borrador" y "Publicar" -->
      <!-- <div class="field-block publish-block">
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
      </div> -->

    </form>
  </div>

  <!-- PREVIEW COLUMN -->
  <div class="preview-column" v-show="showPreview || isWide">
    <div class="preview-header">
      <span class="preview-label">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        Vista Previa
      </span>
      <span class="preview-badge">Evento</span>
    </div>

    <div class="preview-card">
      <div class="preview-cover-wrap">
        <img v-if="form.coverUrl" :src="form.coverUrl" alt="Cover" class="preview-img" @error="() => {}" />
        <div v-else class="preview-cover-empty">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <small>Sin imagen de portada</small>
        </div>
      </div>
      <div class="preview-content">
        <div class="preview-meta-row">
          <span class="meta-cat">📅 {{ form.eventType || 'Evento' }}</span>
        </div>
        <h2 class="preview-title">{{ form.title || 'Título del evento...' }}</h2>

        <div class="preview-event-details">
          <div class="event-detail-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>{{ formatEventDate(form.eventDate) }}</span>
          </div>
          <div class="event-detail-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>{{ formatEventTimeRange(form.eventTime, form.endTime) }}</span>
          </div>
          <div class="event-detail-item" v-if="form.endDate && form.endDate !== form.eventDate">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><calendar xmlns="http://www.w3.org/2000/svg"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>
            <span>Hasta {{ formatEventDate(form.endDate) }}</span>
          </div>
          <div class="event-detail-item" v-if="form.locationId && getLocationName(form.locationId)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>{{ getLocationName(form.locationId) }}</span>
          </div>
          <div class="event-detail-item" v-if="form.maxCapacity">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            <span>Máx. {{ form.maxCapacity }} asistentes</span>
          </div>
        </div>

        <div class="preview-body">
          <p v-if="!form.description" class="preview-empty">La descripción aparecerá aquí...</p>
          <p v-else>{{ form.description }}</p>
        </div>
      </div>
    </div>

    <div class="preview-status" :class="form.published ? 'status-pub' : 'status-draft'">
      <svg v-if="form.published" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/></svg>
      {{ form.published ? 'Se publicará al enviar' : 'Se guardará como borrador' }}
    </div>
  </div>
</div>
</div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { careerService, categoryService, eventService, locationService } from '../../services/api.js'

const router = useRouter()
const saving = ref(false)
const careers = ref([])
const categories = ref([])
const locations = ref([])
const showPreview = ref(false)
const isWide = ref(window.innerWidth >= 1200)

// Cover image refs
const coverFileInput = ref(null)
const coverMode = ref('url')
const coverDragging = ref(false)
const coverPreviewUrl = ref('')
const coverFileName = ref('')
const coverFileObj = ref(null)

const form = reactive({
  title: '',
  description: '',
  categoryId: null,
  eventType: '',
  eventDate: '',
  eventTime: '',
  endDate: '',
  endTime: '',
  locationId: null,
  coverUrl: '',
  careerId: null,
  maxCapacity: null,
  published: true
})

const toast = reactive({ show: false, type: 'success', title: '', message: '' })

// Todos los tipos de eventos disponibles (valores exactos de la BD)
const allEventTypes = ['CHARLA', 'TALLER', 'CONFERENCIA', 'AUDITORIA', 'ACADEMICO', 'CULTURAL']

const availableEventTypes = computed(() => {
  // Si no hay categoría seleccionada, no mostrar tipos
  if (!form.categoryId) return []
  // Si hay categoría, mostrar todos los tipos disponibles
  return allEventTypes
})

// Watcher para resetear eventType cuando cambia la categoría - REMOVIDO porque eventType es independiente de categoryId
// watch(() => form.categoryId, (newCategoryId, oldCategoryId) => {
//   if (newCategoryId !== oldCategoryId) {
//     form.eventType = ''
//   }
// })

const isEventInPast = computed(() => {
  if (!form.eventDate || !form.eventTime) return false
  try {
    const eventDateTime = new Date(`${form.eventDate}T${form.eventTime}`)
    return eventDateTime < new Date()
  } catch {
    return false
  }
})

const validationErrors = computed(() => {
  const errors = {}

  if (form.eventDate && form.eventDate < getTodayDate()) {
    errors.eventDate = 'La fecha no puede ser anterior a hoy'
  }

  if (form.eventTime && form.eventDate && isEventInPast.value) {
    errors.eventTime = 'La hora no puede estar en el pasado'
  }

  if (form.endDate && form.eventDate && form.endDate < form.eventDate) {
    errors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio'
  }

  if (form.endDate === form.eventDate && form.endTime && form.eventTime && form.endTime <= form.eventTime) {
    errors.endTime = 'La hora de fin debe ser posterior a la hora de inicio'
  }

  return errors
})

const isValid = computed(() => {
  if (!form.title.trim() || !form.description.trim() || !form.categoryId || !form.eventType || !form.eventDate || !form.eventTime || !form.locationId) {
    return false
  }

  if (isEventInPast.value) {
    return false
  }

  if (form.endDate && form.endDate < form.eventDate) {
    return false
  }

  if (form.endDate === form.eventDate && form.endTime && form.eventTime >= form.endTime) {
    return false
  }

  if (Object.keys(validationErrors.value).length > 0) {
    return false
  }

  return true
})

function showToastMsg(type, title, message) {
  toast.show = false
  setTimeout(() => {
    Object.assign(toast, { show: true, type, title, message })
    setTimeout(() => { toast.show = false }, 4500)
  }, 60)
}

function togglePreview() {
  showPreview.value = !showPreview.value
}

function formatEventDate(dateStr) {
  if (!dateStr) return 'Fecha por definir'
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function formatEventTime(timeStr) {
  if (!timeStr) return 'Hora por definir'
  return timeStr
}

function formatEventTimeRange(startTime, endTime) {
  if (!startTime) return 'Hora por definir'
  if (!endTime) return startTime
  return `${startTime} - ${endTime}`
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

// Cover image functions
function switchCoverMode(mode) {
  coverMode.value = mode
  clearCover()
}

function updateCoverPreview() {
  coverPreviewUrl.value = (form.coverUrl && form.coverUrl.startsWith('http')) ? form.coverUrl : ''
}

function clearCover() {
  form.coverUrl = ''
  coverPreviewUrl.value = ''
  coverFileName.value = ''
  coverFileObj.value = null
  if (coverFileInput.value) coverFileInput.value.value = ''
}

// Helper function to format data for backend
function formatEventDataForBackend() {
  return {
    name: form.title.trim(),
    description: form.description.trim(),
    eventType: form.eventType,
    locationId: form.locationId,
    startDate: form.eventDate,
    startTime: form.eventTime,
    endDate: form.endDate || form.eventDate,
    endTime: form.endTime || form.eventTime,
    maxCapacity: form.maxCapacity || null,
    posterUrl: form.coverUrl || null,
    careerId: form.careerId,
    categoryId: form.categoryId,
    publish: form.published
  }
}

function onCoverFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    showToastMsg('warning', 'Formato no válido', 'Solo se aceptan imágenes (JPG, PNG, WEBP, GIF).')
    if (coverFileInput.value) coverFileInput.value.value = ''
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    showToastMsg('error', 'Archivo demasiado grande', 'La imagen no debe superar 5MB.')
    if (coverFileInput.value) coverFileInput.value.value = ''
    return
  }
  coverFileObj.value = file
  coverFileName.value = file.name

  // Usar FileReader en lugar de URL.createObjectURL
  const reader = new FileReader()
  reader.onload = (event) => {
    coverPreviewUrl.value = event.target.result
    form.coverUrl = event.target.result  // Guardar como data URL
  }
  reader.readAsDataURL(file)
}

function onCoverDrop(e) {
  coverDragging.value = false
  const file = e.dataTransfer.files[0]
  if (!file || !file.type.startsWith('image/')) {
    showToastMsg('warning', 'Formato no válido', 'Solo se aceptan imágenes.')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    showToastMsg('error', 'Archivo demasiado grande', 'La imagen no debe superar 5MB.')
    return
  }
  coverFileObj.value = file
  coverFileName.value = file.name

  // Usar FileReader en lugar de URL.createObjectURL
  const reader = new FileReader()
  reader.onload = (event) => {
    coverPreviewUrl.value = event.target.result
    form.coverUrl = event.target.result  // Guardar como data URL
  }
  reader.readAsDataURL(file)
}

async function loadCareers() {
  try {
    careers.value = await careerService.getAll()
  } catch (error) {
    console.error('Error al cargar carreras:', error)
  }
}

async function loadCategories() {
  try {
    categories.value = await categoryService.getAll()
  } catch (error) {
    console.error('Error al cargar categorías:', error)
    // Si falla el API, usar categorías por defecto
    categories.value = [
      { id: 1, name: 'Académico', color: '#007bff' },
      { id: 2, name: 'Cultural', color: '#6f42c1' },
      { id: 3, name: 'Deportivo', color: '#28a745' },
      { id: 4, name: 'Becas', color: '#ffc107' },
      { id: 5, name: 'Trámites', color: '#dc3545' }
    ]
  }
}

async function loadLocations() {
  try {
    const response = await locationService.getAll()
    locations.value = response.data || response
  } catch (error) {
    console.error('Error al cargar ubicaciones:', error)
    showToastMsg('error', 'Error', 'No se pudieron cargar las ubicaciones.')
  }
}

function getLocationName(locationId) {
  const location = locations.value.find(loc => loc.id === locationId)
  return location ? `${location.name} (Bloque ${location.block})` : ''
}

async function submitEvent() {
  if (!form.title.trim() || !form.description.trim() || !form.categoryId || !form.eventType || !form.eventDate || !form.eventTime || !form.locationId) {
    showToastMsg('warning', 'Campos incompletos', 'Por favor completa todos los campos obligatorios.')
    return
  }

  if (isEventInPast.value) {
    showToastMsg('error', 'Fecha inválida', 'No puedes crear un evento en el pasado. Por favor selecciona una fecha y hora futuras.')
    return
  }

  if (form.endDate && form.endDate < form.eventDate) {
    showToastMsg('error', 'Fecha de fin inválida', 'La fecha de fin debe ser igual o posterior a la fecha de inicio.')
    return
  }

  if (form.endDate === form.eventDate && form.endTime && form.eventTime >= form.endTime) {
    showToastMsg('error', 'Hora inválida', 'La hora de fin debe ser posterior a la hora de inicio.')
    return
  }

  saving.value = true
  try {
    const eventData = formatEventDataForBackend()
    console.log('Datos del evento para enviar:', eventData)

    const response = await eventService.create(eventData)
    console.log('Respuesta del servidor:', response)

    showToastMsg('success', 'Evento registrado', form.published ? 'El evento fue publicado con éxito.' : 'El borrador fue guardado.')
    setTimeout(() => router.push('/publicador/mis-eventos'), 2000)
  } catch (err) {
    console.error('Error al crear evento:', err)

    // Manejar error de conflicto de horarios
    if (err.message && err.message.includes('ubicación') && err.message.includes('horario')) {
      showToastMsg('error', 'Conflicto de horarios', 'Ya existe un evento en esta ubicación en el horario seleccionado. Selecciona otra ubicación u horario.')
    } else {
      showToastMsg('error', 'Error al publicar', err.message || 'No se pudo guardar el evento.')
    }
  } finally {
    saving.value = false
  }
}

async function saveDraft() {
  if (!form.title.trim() && !form.description.trim()) {
    showToastMsg('warning', 'Sin contenido', 'Escribe algo antes de guardar.')
    return
  }

  if (form.eventDate && form.eventTime && isEventInPast.value) {
    showToastMsg('error', 'Fecha inválida', 'No puedes crear un evento en el pasado. Por favor selecciona una fecha y hora futuras.')
    return
  }

  if (form.endDate && form.eventDate && form.endDate < form.eventDate) {
    showToastMsg('error', 'Fecha de fin inválida', 'La fecha de fin debe ser igual o posterior a la fecha de inicio.')
    return
  }

  if (form.endDate === form.eventDate && form.endTime && form.eventTime && form.eventTime >= form.endTime) {
    showToastMsg('error', 'Hora inválida', 'La hora de fin debe ser posterior a la hora de inicio.')
    return
  }

  saving.value = true
  try {
    // Guardar el estado original de published
    const wasPublished = form.published

    // Forzar a false para guardar como borrador
    form.published = false

    const eventData = formatEventDataForBackend()
    const response = await eventService.create(eventData)
    console.log('Borrador guardado:', response)

    showToastMsg('success', 'Borrador guardado', 'Tu borrador fue guardado con éxito.')

    // Redirigir a mis eventos después de 2 segundos
    setTimeout(() => router.push('/publicador/mis-eventos'), 2000)

    // Restaurar el estado original
    form.published = wasPublished
  } catch (err) {
    console.error('Error al guardar borrador:', err)
    showToastMsg('error', 'Error', err.message || 'No se pudo guardar el borrador.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadCareers()
  loadCategories()
  loadLocations()

  // Detectar cambios de tamaño de ventana
  const handleResize = () => {
    isWide.value = window.innerWidth >= 1200
  }
  window.addEventListener('resize', handleResize)

  // Cleanup on unmount
  return () => window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.crear-evento-page {
  font-family: 'Inter', sans-serif;
  color: #1e293b;
  padding-bottom: 3rem;
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

/* CSS del botón toggle preview comentado - botón eliminado */
/* .btn-toggle-preview {
  display: flex; align-items: center; gap: 0.45rem;
  padding: 0.6rem 1.1rem; border-radius: 8px;
  font-size: 0.83rem; font-weight: 600; cursor: pointer;
  border: 1.5px solid #e2e8f0; background: #fff; color: #475569;
  transition: all 0.18s; font-family: 'Inter', sans-serif;
}
.btn-toggle-preview:hover { background: #f8fafc; border-color: #cbd5e1; }
@media (max-width: 1199px) {
  .btn-toggle-preview svg:last-child { display: none; }
} */

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

/* Category Grid */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
}
.cat-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
}
.cat-btn:hover {
  border-color: var(--cat-color, #FFD200);
  background: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.cat-btn.active {
  border-color: var(--cat-color, #FFD200);
  background: rgba(255, 210, 0, 0.08);
  color: #0f172a;
  font-weight: 700;
}
.cat-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Upload Tabs */
.upload-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.upload-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}
.upload-tab:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}
.upload-tab.active {
  background: #FFD200;
  border-color: #FFD200;
  color: #1a3a52;
}

/* File Upload */
.hidden-input {
  display: none;
}

.file-drop-zone {
  border: 2px dashed #e2e8f0;
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8fafc;
}
.file-drop-zone.dragging {
  border-color: #FFD200;
  background: rgba(255, 210, 0, 0.05);
}
.file-drop-zone:hover:not(.dragging) {
  border-color: #cbd5e1;
  background: #f1f5f9;
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.drop-content p {
  font-size: 0.88rem;
  color: #64748b;
  margin: 0;
}
.drop-link {
  color: #1a3a52;
  font-weight: 600;
  text-decoration: underline;
}
.drop-content small {
  font-size: 0.75rem;
  color: #94a3b8;
}

.drop-preview-wrap {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}
.drop-preview-img {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;
}
.drop-preview-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.drop-preview-name {
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cover-remove-btn {
  padding: 0.4rem 0.8rem;
  background: rgba(239, 68, 68, 0.9);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.2s;
}
.cover-remove-btn:hover {
  background: #dc2626;
}

.pending-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.4rem 0.8rem;
  background: rgba(245, 158, 11, 0.95);
  color: #fff;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.cover-preview-url {
  margin-top: 0.75rem;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}
.cover-preview-url img {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.cover-remove {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 28px;
  height: 28px;
  background: rgba(239, 68, 68, 0.95);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.cover-remove:hover {
  background: #dc2626;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

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
.form-input.input-error { border-color: #ef4444; background: #fef2f2; }
.form-input.input-error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.07); }

.field-error {
  display: block; margin-top: 0.35rem; font-size: 0.75rem; color: #ef4444; font-weight: 500;
}

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

/* CSS del toggle de publicar comentado - toggle eliminado */
/* .publish-block { border-color: #f1f5f9; }
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
.toggle-switch.on .toggle-knob { transform: translateX(21px); background: #FFD200; } */

@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
  .header-actions { width: 100%; flex-direction: column; }
  .btn-secondary, .btn-primary { width: 100%; justify-content: center; }
}

/* ═══ EDITOR LAYOUT ═══ */
.editor-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: flex-start;
}
@media (min-width: 1200px) {
  .editor-layout { grid-template-columns: 1fr 360px; }
}

.editor-column { max-width: 900px; }
.preview-column { position: sticky; top: 2rem; }

/* ═══ PREVIEW COLUMN ═══ */
.preview-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1rem; padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}
.preview-label {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.78rem; font-weight: 600; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.preview-badge {
  font-size: 0.7rem; background: #FFD200; color: #1a3a52;
  padding: 3px 9px; border-radius: 20px; font-weight: 700;
  letter-spacing: 0.3px;
}

.preview-card {
  background: #fff; border-radius: 14px; overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
}

.preview-cover-wrap { aspect-ratio: 16/9; overflow: hidden; background: #f8fafc; }
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.preview-cover-empty {
  width: 100%; height: 100%; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 0.5rem;
}
.preview-cover-empty small { font-size: 0.75rem; color: #94a3b8; }

.preview-content { padding: 1.5rem; }
.preview-meta-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 0.75rem;
}
.meta-cat {
  font-size: 0.72rem; font-weight: 700; color: #1a3a52;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.meta-date { font-size: 0.72rem; color: #94a3b8; }

.preview-title {
  font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 800;
  color: #0f172a; margin-bottom: 1rem; line-height: 1.3; letter-spacing: -0.4px;
}

.preview-event-details {
  display: flex; flex-direction: column; gap: 0.5rem;
  margin-bottom: 1rem; padding: 1rem; background: #f8fafc;
  border-radius: 8px; border-left: 3px solid #FFD200;
}
.event-detail-item {
  display: flex; align-items: center; gap: 0.6rem;
  font-size: 0.85rem; color: #475569;
}
.event-detail-item svg { flex-shrink: 0; color: #1a3a52; }

.preview-body {
  font-size: 0.88rem; color: #475569; line-height: 1.7;
}
.preview-empty { color: #cbd5e1; font-style: italic; }

.preview-status {
  margin-top: 1rem; padding: 0.85rem 1rem; background: #f1f5f9;
  border-radius: 10px; font-size: 0.78rem; font-weight: 600;
  display: flex; align-items: center; gap: 0.5rem;
}
.status-pub { background: linear-gradient(135deg, #dcfce7, #bbf7d0); color: #166534; }
.status-draft { background: linear-gradient(135deg, #fef3c7, #fde68a); color: #92400e; }

/* Field help text */
.field-help {
  display: block; margin-top: 0.5rem; font-size: 0.75rem;
  color: #94a3b8; font-style: italic;
}

/* Disabled select styling */
.form-select:disabled {
  background: #f1f5f9; color: #94a3b8; cursor: not-allowed;
}

</style>
