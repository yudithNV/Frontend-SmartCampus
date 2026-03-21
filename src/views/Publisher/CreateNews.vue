<template>
  <div class="create-news-page">

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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a3a52" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </div>
        <div>
          <h1>Crear Noticia</h1>
          <p>Publica información relevante para la comunidad UCB</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" @click="togglePreview" :class="{ active: showPreview }">
          <svg v-if="!showPreview" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          {{ showPreview ? 'Editar' : 'Vista Previa' }}
        </button>
        <button class="btn-secondary" @click="saveDraft" :disabled="saving">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Guardar Borrador
        </button>
        <button class="btn-primary" @click="submitNews" :disabled="saving || !isValid">
          <template v-if="!saving">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Publicar
          </template>
          <template v-else>
            <span class="spinner-sm"></span>
            Publicando...
          </template>
        </button>
      </div>
    </div>

    <!-- Main layout -->
    <div class="editor-layout">

      <!-- EDITOR COLUMN -->
      <div class="editor-column" v-show="!showPreview || isWide">
        <form @submit.prevent="submitNews" novalidate>

          <!-- Title -->
          <div class="field-block title-block">
            <div class="field-label">
              <span class="field-num">01</span>
              <label>Título de la Noticia <span class="req">*</span></label>
              <span class="char-count" :class="{ warning: form.title.length > 220, danger: form.title.length > 255 }">
                {{ form.title.length }}/255
              </span>
            </div>
            <input
              v-model="form.title"
              type="text"
              class="title-input"
              placeholder="Escribe un título claro y atractivo..."
              maxlength="255"
              @input="clearFieldError('title')"
            />
            <span class="field-error" v-if="fieldErrors.title">{{ fieldErrors.title }}</span>
          </div>

          <!-- Category + Career -->
          <div class="field-row">
            <div class="field-block">
              <div class="field-label">
                <span class="field-num">02</span>
                <label>Categoría <span class="req">*</span></label>
              </div>
              <div class="category-grid">
                <button
                  type="button"
                  v-for="cat in categories"
                  :key="cat.value"
                  class="cat-btn"
                  :class="{ active: form.category === cat.value }"
                  @click="form.category = cat.value; clearFieldError('category')"
                >
                  <component :is="'svg'" v-bind="cat.svgAttrs" class="cat-icon">
                    <path v-for="(p,i) in cat.paths" :key="i" v-bind="p"/>
                  </component>
                  <span>{{ cat.label }}</span>
                </button>
              </div>
              <span class="field-error" v-if="fieldErrors.category">{{ fieldErrors.category }}</span>
            </div>

            <div class="field-block">
              <div class="field-label">
                <span class="field-num">03</span>
                <label>Dirigido a</label>
              </div>
              <div class="select-wrap">
                <select v-model="form.careerId" class="form-select">
                  <option :value="null">Toda la comunidad UCB</option>
                  <option :value="1">Ingeniería de Sistemas</option>
                  <option :value="2">Ingeniería Civil</option>
                  <option :value="3">Derecho</option>
                  <option :value="4">Administración de Empresas</option>
                  <option :value="5">Arquitectura</option>
                  <option :value="6">Medicina</option>
                  <option :value="7">Psicología</option>
                  <option :value="8">Comunicación Social</option>
                </select>
                <svg class="select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div class="field-block">
            <div class="field-label">
              <span class="field-num">04</span>
              <label>Contenido de la Noticia <span class="req">*</span></label>
              <span class="char-count">{{ form.body.length }} car.</span>
            </div>
            <div class="toolbar">
              <button type="button" class="tb-btn tb-bold" @click="insertFormat('**','**')" title="Negrita"><strong>B</strong></button>
              <button type="button" class="tb-btn tb-italic" @click="insertFormat('*','*')" title="Cursiva"><em>I</em></button>
              <button type="button" class="tb-btn" @click="insertFormat('\n## ','')" title="Subtítulo">H2</button>
              <span class="tb-sep"></span>
              <button type="button" class="tb-btn" @click="insertFormat('\n- ','')" title="Lista">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </button>
              <button type="button" class="tb-btn" @click="insertFormat('\n---\n','')" title="Separador">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <button type="button" class="tb-btn" @click="insertFormat('\n> ','')" title="Cita">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
              </button>
            </div>
            <textarea
              ref="bodyRef"
              v-model="form.body"
              class="body-textarea"
              placeholder="Redacta el contenido completo de la noticia..."
              rows="14"
              @input="clearFieldError('body')"
            ></textarea>
            <span class="field-error" v-if="fieldErrors.body">{{ fieldErrors.body }}</span>
          </div>

          <!-- Cover URL -->
          <div class="field-block">
            <div class="field-label">
              <span class="field-num">05</span>
              <label>Imagen de Portada</label>
              <span class="optional-tag">Opcional</span>
            </div>
            <div class="input-icon-wrap">
              <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <input
                v-model="form.coverUrl"
                type="url"
                class="form-input with-icon"
                placeholder="https://ejemplo.com/imagen.jpg"
                @input="updateCoverPreview"
              />
              <button v-if="form.coverUrl" type="button" class="input-clear" @click="form.coverUrl=''; coverPreviewUrl=''">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <Transition name="fade">
              <div class="cover-preview" v-if="coverPreviewUrl">
                <img :src="coverPreviewUrl" alt="Vista previa portada" @error="coverPreviewUrl=''" />
                <button type="button" class="cover-remove" @click="form.coverUrl=''; coverPreviewUrl=''">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </Transition>
          </div>

          <!-- Attachment URL -->
          <div class="field-block">
            <div class="field-label">
              <span class="field-num">06</span>
              <label>Archivo Adjunto</label>
              <span class="optional-tag">Opcional</span>
            </div>
            <div class="input-icon-wrap">
              <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
              <input
                v-model="form.attachmentUrl"
                type="url"
                class="form-input with-icon"
                placeholder="https://ejemplo.com/documento.pdf"
              />
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
                  <span class="toggle-desc">{{ form.published ? 'La noticia será visible para todos los usuarios.' : 'Solo tú podrás ver esta noticia hasta que la publiques.' }}</span>
                </div>
              </div>
              <button type="button" class="toggle-switch" :class="{ on: form.published }" @click="form.published = !form.published">
                <span class="toggle-knob"></span>
              </button>
            </div>
          </div>

        </form>
      </div>

      <!-- PREVIEW COLUMN -->
      <div class="preview-column" v-show="showPreview || isWide">
        <div class="preview-header">
          <span class="preview-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Vista Previa
          </span>
          <span class="preview-badge">{{ getCategoryLabel(form.category) }}</span>
        </div>

        <div class="preview-card">
          <div class="preview-cover-wrap">
            <img v-if="coverPreviewUrl" :src="coverPreviewUrl" alt="Cover" class="preview-img" @error="coverPreviewUrl=''" />
            <div v-else class="preview-cover-empty">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <small>Sin imagen de portada</small>
            </div>
          </div>

          <div class="preview-content">
            <div class="preview-meta-row">
              <span class="meta-cat">{{ getCategoryLabel(form.category) }}</span>
              <time class="meta-date">{{ todayFormatted }}</time>
            </div>
            <h2 class="preview-title">{{ form.title || 'Título de la noticia...' }}</h2>
            <div class="preview-career" v-if="form.careerId">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              {{ getCareerLabel(form.careerId) }}
            </div>
            <div class="preview-body">
              <p v-if="!form.body" class="preview-empty">El contenido aparecerá aquí...</p>
              <div v-else v-html="renderBody(form.body)"></div>
            </div>
            <div class="preview-attachment" v-if="form.attachmentUrl">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
              <a :href="form.attachmentUrl" target="_blank">Ver adjunto</a>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router    = useRouter()
const bodyRef   = ref(null)
const showPreview    = ref(false)
const saving         = ref(false)
const coverPreviewUrl = ref('')
const isWide    = ref(window.innerWidth >= 1200)

const form = reactive({
  title: '', body: '', category: '',
  careerId: null, coverUrl: '', attachmentUrl: '', published: true
})

const fieldErrors = reactive({ title: '', body: '', category: '' })
const toast = reactive({ show: false, type: 'success', title: '', message: '' })

const categories = [
  {
    value: 'ACADEMICO', label: 'Académico',
    svgAttrs: { width:'18', height:'18', viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2' },
    paths: [{ d:'M22 10v6M2 10l10-5 10 5-10 5z' }, { d:'M6 12v5c3 3 9 3 12 0v-5' }]
  },
  {
    value: 'EVENTOS', label: 'Eventos',
    svgAttrs: { width:'18', height:'18', viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2' },
    paths: [{ d:'M8 2v4M16 2v4' }, { rx:'2', d:'M3 10h18M21 10V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V10z' }]
  },
  {
    value: 'AVISOS', label: 'Avisos',
    svgAttrs: { width:'18', height:'18', viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2' },
    paths: [{ d:'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9' }, { d:'M13.73 21a2 2 0 01-3.46 0' }]
  },
  {
    value: 'DEPORTES', label: 'Deportes',
    svgAttrs: { width:'18', height:'18', viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2' },
    paths: [{ d:'M12 22a10 10 0 110-20 10 10 0 010 20z' }, { d:'M4.93 4.93l4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24M12 2v4M12 18v4M2 12h4M18 12h4' }]
  },
  {
    value: 'CULTURA', label: 'Cultura',
    svgAttrs: { width:'18', height:'18', viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2' },
    paths: [{ d:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }]
  },
  {
    value: 'OTRO', label: 'Otro',
    svgAttrs: { width:'18', height:'18', viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2' },
    paths: [{ d:'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z' }, { d:'M14 2v6h6M16 13H8M16 17H8M10 9H8' }]
  }
]

const careers = {
  1:'Ing. de Sistemas', 2:'Ing. Civil', 3:'Derecho',
  4:'Adm. de Empresas', 5:'Arquitectura', 6:'Medicina',
  7:'Psicología', 8:'Comunicación Social'
}

const todayFormatted = computed(() =>
  new Date().toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })
)

const isValid = computed(() =>
  form.title.trim().length > 0 && form.body.trim().length > 0 && form.category !== ''
)

function getCategoryLabel(val) { return categories.find(c => c.value === val)?.label || 'Sin categoría' }
function getCareerLabel(id)    { return careers[id] || 'Carrera ' + id }

function renderBody(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,     '<em>$1</em>')
    .replace(/^## (.+)$/gm,   '<h3 style="font-size:1rem;font-weight:700;margin:0.75rem 0 0.25rem">$1</h3>')
    .replace(/^> (.+)$/gm,    '<blockquote style="border-left:3px solid #FFD200;padding-left:0.75rem;color:#64748b;margin:0.5rem 0">$1</blockquote>')
    .replace(/^- (.+)$/gm,    '<li style="margin-left:1rem">$1</li>')
    .replace(/---/g,          '<hr style="border:none;border-top:1px solid #e2e8f0;margin:0.75rem 0"/>')
    .replace(/\n/g,           '<br/>')
}

function updateCoverPreview() {
  coverPreviewUrl.value = (form.coverUrl && form.coverUrl.startsWith('http')) ? form.coverUrl : ''
}

function togglePreview()         { showPreview.value = !showPreview.value }
function clearFieldError(field)  { fieldErrors[field] = '' }

function insertFormat(prefix, suffix) {
  const ta = bodyRef.value
  if (!ta) return
  const s = ta.selectionStart, e = ta.selectionEnd
  const sel = form.body.substring(s, e)
  form.body = form.body.substring(0, s) + prefix + sel + suffix + form.body.substring(e)
  setTimeout(() => { ta.focus(); ta.setSelectionRange(s + prefix.length, e + prefix.length) }, 0)
}

function validateForm() {
  let ok = true
  if (!form.title.trim())    { fieldErrors.title    = 'El título es obligatorio'; ok = false }
  if (!form.body.trim())     { fieldErrors.body     = 'El contenido es obligatorio'; ok = false }
  if (!form.category)        { fieldErrors.category = 'Selecciona una categoría'; ok = false }
  return ok
}

function showToastMsg(type, title, message) {
  toast.show = false
  setTimeout(() => {
    Object.assign(toast, { show: true, type, title, message })
    setTimeout(() => { toast.show = false }, 4500)
  }, 60)
}

function getHeaders() {
  const token = localStorage.getItem('ucb_token')
  return { 'Content-Type':'application/json', ...(token ? { Authorization:`Bearer ${token}` } : {}) }
}

async function sendToApi(published) {
  const res = await fetch('http://localhost:8081/api/news', {
    method: 'POST',
    headers: getHeaders(),
    mode: 'cors',
    body: JSON.stringify({
      title: form.title.trim(), body: form.body.trim(),
      category: form.category, published,
      coverUrl: form.coverUrl || null,
      attachmentUrl: form.attachmentUrl || null,
      careerId: form.careerId || null
    })
  })
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.error || e.message || `Error ${res.status}`) }
  return await res.json()
}

async function submitNews() {
  if (!validateForm()) return
  saving.value = true
  try {
    await sendToApi(form.published)
    showToastMsg('success', 'Noticia guardada', form.published ? 'La noticia fue publicada correctamente.' : 'El borrador fue guardado.')
    setTimeout(() => router.push('/publicador/mis-noticias'), 2000)
  } catch (err) {
    showToastMsg('error', 'Error al publicar', err.name==='TypeError' ? 'No se pudo conectar con el servidor.' : err.message)
  } finally { saving.value = false }
}

async function saveDraft() {
  if (!form.title.trim() && !form.body.trim()) {
    showToastMsg('warning', 'Sin contenido', 'Escribe algo antes de guardar.')
    return
  }
  saving.value = true
  try {
    await sendToApi(false)
    showToastMsg('success', 'Borrador guardado', 'Tu borrador fue guardado correctamente.')
  } catch (err) {
    showToastMsg('error', 'Error', err.message)
  } finally { saving.value = false }
}

onMounted(() => {
  window.addEventListener('resize', () => { isWide.value = window.innerWidth >= 1200 })
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.create-news-page {
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

.btn-secondary, .btn-primary {
  display: flex; align-items: center; gap: 0.45rem;
  padding: 0.6rem 1.1rem; border-radius: 8px;
  font-size: 0.83rem; font-weight: 600; cursor: pointer;
  border: none; transition: all 0.18s; font-family: 'Inter', sans-serif;
}
.btn-secondary { background: #f8fafc; color: #475569; border: 1.5px solid #e2e8f0; }
.btn-secondary:hover:not(:disabled), .btn-secondary.active { background: #1a3a52; color: #fff; border-color: #1a3a52; }
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

/* Layout */
.editor-layout { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 1200px) { .editor-layout { grid-template-columns: 1fr 360px; } }

/* Field blocks */
.field-block {
  background: #fff; border-radius: 12px; padding: 1.4rem;
  margin-bottom: 1rem; border: 1px solid #e2e8f0; transition: border-color 0.18s;
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
.char-count.warning { color: #f59e0b; } .char-count.danger { color: #ef4444; }
.field-error { display: block; margin-top: 0.35rem; font-size: 0.73rem; color: #ef4444; font-weight: 500; }

/* Title */
.title-input {
  width: 100%; border: none; outline: none;
  font-family: 'Syne', sans-serif; font-size: 1.35rem; font-weight: 700;
  color: #0f172a; background: transparent; letter-spacing: -0.3px;
}
.title-input::placeholder { color: #cbd5e1; font-weight: 400; }

/* Category */
.category-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.45rem; }

.cat-btn {
  display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
  padding: 0.7rem 0.3rem; border: 1.5px solid #e2e8f0; border-radius: 10px;
  background: #f8fafc; cursor: pointer; transition: all 0.18s;
  font-size: 0.71rem; font-weight: 600; color: #64748b; font-family: 'Inter', sans-serif;
}
.cat-icon { flex-shrink: 0; }
.cat-btn:hover { border-color: #FFD200; background: #fffef5; color: #1a3a52; }
.cat-btn.active { border-color: #1a3a52; background: #1a3a52; color: #FFD200; }
.cat-btn.active .cat-icon { stroke: #FFD200; }

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

/* Toolbar */
.toolbar {
  display: flex; align-items: center; gap: 0.3rem; margin-bottom: 0.6rem;
  padding: 0.45rem 0.6rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;
}
.tb-btn {
  padding: 0.3rem 0.55rem; border: 1px solid #e2e8f0; border-radius: 5px;
  background: #fff; font-size: 0.78rem; cursor: pointer; color: #475569;
  transition: all 0.15s; font-family: 'Inter', sans-serif;
  display: flex; align-items: center; justify-content: center;
}
.tb-btn:hover { background: #1a3a52; color: #FFD200; border-color: #1a3a52; }
.tb-bold { font-weight: 800; } .tb-italic { font-style: italic; }
.tb-sep { width: 1px; height: 18px; background: #e2e8f0; margin: 0 0.1rem; }

/* Textarea */
.body-textarea {
  width: 100%; min-height: 260px; padding: 0.85rem;
  border: 1.5px solid #e2e8f0; border-radius: 9px;
  font-size: 0.88rem; font-family: 'Inter', sans-serif; color: #1e293b;
  line-height: 1.7; background: #f8fafc; resize: vertical; outline: none; transition: all 0.18s;
}
.body-textarea:focus { border-color: #FFD200; background: #fffef5; box-shadow: 0 0 0 3px rgba(255,210,0,0.07); }
.body-textarea::placeholder { color: #cbd5e1; }

/* Input with icon */
.input-icon-wrap { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 0.85rem; pointer-events: none; flex-shrink: 0; }
.form-input {
  width: 100%; padding: 0.68rem 2.4rem 0.68rem 0.9rem;
  border: 1.5px solid #e2e8f0; border-radius: 9px;
  font-size: 0.86rem; font-family: 'Inter', sans-serif; color: #1e293b;
  background: #f8fafc; outline: none; transition: all 0.18s;
}
.form-input.with-icon { padding-left: 2.4rem; }
.form-input:focus { border-color: #FFD200; background: #fffef5; box-shadow: 0 0 0 3px rgba(255,210,0,0.07); }
.input-clear {
  position: absolute; right: 0.7rem; background: none; border: none;
  cursor: pointer; color: #94a3b8; display: flex; align-items: center; padding: 3px;
  border-radius: 3px;
}
.input-clear:hover { color: #ef4444; }

/* Cover preview */
.cover-preview {
  margin-top: 0.75rem; position: relative;
  border-radius: 9px; overflow: hidden; height: 170px;
}
.cover-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cover-remove {
  position: absolute; top: 0.5rem; right: 0.5rem;
  background: rgba(0,0,0,0.55); color: #fff; border: none;
  width: 26px; height: 26px; border-radius: 50%; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: background 0.18s;
}
.cover-remove:hover { background: rgba(239,68,68,0.85); }

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

/* Preview column */
.preview-column { position: sticky; top: 2rem; align-self: start; }
.preview-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.9rem;
}
.preview-label {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.72rem; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.8px;
}
.preview-badge {
  font-size: 0.68rem; font-weight: 600; padding: 3px 10px;
  border-radius: 20px; background: #f1f5f9; color: #64748b;
}
.preview-card {
  background: #fff; border-radius: 14px; overflow: hidden;
  border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.05);
}
.preview-cover-wrap { height: 170px; background: #f8fafc; display: flex; align-items: center; justify-content: center; }
.preview-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.preview-cover-empty { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.preview-cover-empty small { font-size: 0.72rem; color: #94a3b8; }
.preview-content { padding: 1.1rem; }
.preview-meta-row {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;
}
.meta-cat {
  font-size: 0.68rem; font-weight: 700; padding: 3px 9px;
  border-radius: 20px; background: #1a3a52; color: #FFD200;
}
.meta-date { font-size: 0.68rem; color: #94a3b8; }
.preview-title {
  font-family: 'Syne', sans-serif; font-size: 1.05rem; font-weight: 800;
  color: #0f172a; line-height: 1.3; margin-bottom: 0.6rem; letter-spacing: -0.2px;
}
.preview-career {
  display: flex; align-items: center; gap: 0.35rem;
  font-size: 0.72rem; color: #64748b; margin-bottom: 0.6rem;
}
.preview-body { font-size: 0.82rem; line-height: 1.7; color: #475569; }
.preview-empty { color: #cbd5e1; font-style: italic; }
.preview-attachment {
  display: flex; align-items: center; gap: 0.4rem;
  margin-top: 0.9rem; padding-top: 0.75rem; border-top: 1px solid #f1f5f9;
}
.preview-attachment a { font-size: 0.78rem; color: #1a3a52; text-decoration: none; font-weight: 600; }
.preview-status {
  margin-top: 0.7rem; padding: 0.55rem 1rem; border-radius: 8px;
  font-size: 0.76rem; font-weight: 600; text-align: center;
  display: flex; align-items: center; justify-content: center; gap: 0.4rem;
}
.status-pub  { background: #f0fdf4; color: #16a34a; }
.status-draft{ background: #fffbeb; color: #d97706; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.22s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 900px) {
  .page-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
  .header-actions { flex-wrap: wrap; }
  .category-grid { grid-template-columns: repeat(3,1fr); }
}
@media (max-width: 600px) {
  .category-grid { grid-template-columns: repeat(2,1fr); }
  .field-block { padding: 1.1rem; }
}
</style>