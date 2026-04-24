<template>
  <div class="complaints-section">
    <!-- Toast Notification -->
    <Toast
      :show="toast.show"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      @close="toast.show = false"
    />

    <!-- Modal -->
    <CreateComplaintModal
      ref="modalRef"
      :is-open="showModal"
      @close="showModal = false"
      @submit="handleCreateComplaint"
    />

    <!-- Modal de detalle -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="selectedComplaint" class="detail-overlay" @click.self="selectedComplaint = null">
          <div class="detail-box">
            <div class="detail-header">
              <h3>Detalle del Reclamo</h3>
              <button class="detail-close" @click="selectedComplaint = null">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="detail-body">
              <div class="detail-row">
                <span class="detail-label">Nro. Seguimiento</span>
                <span class="tracking-number">{{ selectedComplaint.trackingNumber }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Título</span>
                <span class="detail-value">{{ selectedComplaint.title }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Categoría</span>
                <span class="badge" :class="`badge-${selectedComplaint.categoryClass}`">
                  {{ selectedComplaint.category }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Estado</span>
                <span class="status" :class="`status-${selectedComplaint.statusClass}`">
                  <!-- Pendiente: reloj -->
                  <svg v-if="selectedComplaint.statusIcon === 'clock'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <!-- En revisión: ojo -->
                  <svg v-else-if="selectedComplaint.statusIcon === 'eye'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <!-- Resuelto: check -->
                  <svg v-else-if="selectedComplaint.statusIcon === 'check'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {{ selectedComplaint.status }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Fecha</span>
                <span class="detail-value">{{ selectedComplaint.date }}</span>
              </div>
              <div class="detail-row detail-row--col">
                <span class="detail-label">Descripción</span>
                <p class="detail-description">{{ selectedComplaint.description || 'Sin descripción.' }}</p>
              </div>

              <!-- Adjuntos con previsualización -->
              <div class="detail-row detail-row--col">
                <span class="detail-label">Adjuntos</span>

                <div v-if="selectedComplaint.evidenceUrl" class="attachment-grid">
                  <div
                    v-for="(url, i) in selectedComplaint.evidenceUrl.split(',')"
                    :key="i"
                    class="attachment-card"
                  >
                    <!-- Previsualización si es imagen -->
                    <div class="attachment-preview">
                      <img
                        v-if="isImage(url.trim())"
                        :src="url.trim()"
                        :alt="`Adjunto ${i + 1}`"
                        class="preview-img"
                        @error="e => e.target.style.display='none'"
                      />
                      <!-- Ícono para PDF -->
                      <div v-else-if="isPdf(url.trim())" class="preview-icon preview-icon--pdf">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <text x="6" y="18" font-size="5" fill="currentColor" stroke="none" font-weight="bold">PDF</text>
                        </svg>
                      </div>
                      <!-- Ícono para DOCX u otro -->
                      <div v-else class="preview-icon preview-icon--doc">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="8" y1="13" x2="16" y2="13"/>
                          <line x1="8" y1="17" x2="16" y2="17"/>
                        </svg>
                      </div>
                    </div>

                    <!-- Nombre y botón descargar -->
                    <div class="attachment-info">
                      <span class="attachment-name">{{ getFileName(url.trim(), i) }}</span>
                      <a
                        :href="url.trim()"
                        target="_blank"
                        rel="noopener"
                        download
                        class="btn-download"
                        title="Descargar"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Descargar
                      </a>
                    </div>
                  </div>
                </div>

                <p v-else class="detail-value detail-value--muted">Sin adjuntos</p>
              </div>
            </div>

            <div class="detail-footer">
              <button class="btn-close-detail" @click="selectedComplaint = null">Cerrar</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <div class="section-header">
      <div class="header-info">
        <h2>Mis Reclamos</h2>
        <p>Gestiona y realiza seguimiento a tus reclamos institucionales</p>
      </div>
      <button class="btn-primary" @click="showModal = true">+ Nuevo Reclamo</button>
    </div>

    <div class="search-bar">
      <input
        v-model="search"
        type="text"
        placeholder="Buscar por título, categoría o número de seguimiento..."
        class="search-input"
      />
    </div>

    <div v-if="loading" class="loading">
      <p>Cargando reclamos...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadComplaints" class="btn-retry">Reintentar</button>
    </div>

    <div v-else class="table-container">
      <div v-if="reclamosFiltrados.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <p v-if="complaints.length === 0">No tienes reclamos registrados aún.</p>
        <p v-else>No se encontraron reclamos que coincidan con tu búsqueda.</p>
      </div>

      <table v-else class="complaints-table">
        <thead>
          <tr>
            <th>Nro. Seguimiento</th>
            <th>Título</th>
            <th>Categoría</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="complaint in reclamosFiltrados" :key="complaint.id" class="table-row">
            <td class="tracking-cell">
              <span class="tracking-number">{{ complaint.trackingNumber }}</span>
            </td>
            <td class="title-cell">
              <strong>{{ complaint.title }}</strong>
              <small v-if="complaint.description">{{ truncateText(complaint.description, 50) }}</small>
            </td>
            <td>
              <span class="badge" :class="`badge-${complaint.categoryClass}`">
                {{ complaint.category }}
              </span>
            </td>
            <td>{{ complaint.date }}</td>
            <td>
              <!-- En la tabla -->
            <span class="status" :class="`status-${complaint.statusClass}`">
              <svg v-if="complaint.statusIcon === 'clock'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <svg v-else-if="complaint.statusIcon === 'eye'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else-if="complaint.statusIcon === 'check'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {{ complaint.status }}
            </span>
            </td>
            <td class="actions-cell">
              <!-- Ver detalle del reclamo -->
              <button
                class="action-btn"
                title="Ver detalle"
                @click="selectedComplaint = complaint"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="stats-grid">
      <div class="stat-card stat-total">
        <span class="stat-label">Total Reclamos</span>
        <span class="stat-number">{{ complaints.length }}</span>
      </div>
      <div class="stat-card stat-pending">
        <span class="stat-label">Pendientes</span>
        <span class="stat-number">{{ countPending }}</span>
      </div>
      <div class="stat-card stat-review">
        <span class="stat-label">En Revisión</span>
        <span class="stat-number">{{ countInReview }}</span>
      </div>
      <div class="stat-card stat-resolved">
        <span class="stat-label">Resueltos</span>
        <span class="stat-number">{{ countResolved }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CreateComplaintModal from '../../components/Student/CreateComplaintModal.vue'
import Toast from '../../components/Toast.vue'
import { complaintService } from '../../services/api'

const showModal = ref(false)
const complaints = ref([])
const loading = ref(false)
const error = ref('')
const modalRef = ref(null)
const search = ref('')
const selectedComplaint = ref(null)

const toast = ref({ show: false, type: 'success', title: '', message: '' })
const showToast = (type, title, message) => {
  toast.value = { show: true, type, title, message }
}

// ── helpers de adjuntos ────────────────────────────────────────────────────
const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif']
const getExt = (url) => url.split('?')[0].split('.').pop().toLowerCase()
const isImage = (url) => IMAGE_EXTS.includes(getExt(url))
const isPdf   = (url) => getExt(url) === 'pdf'

const getFileName = (url, index) => {
  try {
    const decoded = decodeURIComponent(url.split('?')[0])
    const parts = decoded.split('/')
    const raw = parts[parts.length - 1]
    // quitar UUID del nombre si el backend lo genera así: uuid.ext
    // si tiene guiones y parece UUID, mostrar "Adjunto N.ext"
    const uuidPattern = /^[0-9a-f-]{36}\./i
    if (uuidPattern.test(raw)) {
      const ext = raw.split('.').pop()
      return `Adjunto ${index + 1}.${ext}`
    }
    return raw
  } catch {
    return `Adjunto ${index + 1}`
  }
}
// ──────────────────────────────────────────────────────────────────────────

const loadComplaints = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await complaintService.getMy()
    complaints.value = response.map(complaint => {
      const statusMap = {
        'PENDIENTE':   { text: 'Pendiente',   class: 'pendiente',   icon: 'clock' },
        'EN_REVISION': { text: 'En Revisión', class: 'en-revision', icon: 'eye' },
        'RESUELTO':    { text: 'Resuelto',    class: 'resuelto',    icon: 'check' }
      }
      const categoryMap = {
        'General': 'general', 'Académico': 'academico',
        'Infraestructura': 'infraestructura', 'Trámites': 'tramites'
      }
      const status = statusMap[complaint.status] || statusMap['PENDIENTE']
      return {
        id: complaint.id,
        trackingNumber: complaint.trackingNumber,
        title: complaint.title,
        description: complaint.body,
        category: complaint.category,
        categoryClass: categoryMap[complaint.category] || 'general',
        date: formatDate(complaint.createdAt),
        status: status.text,
        statusClass: status.class,
        statusIcon: status.icon,
        evidenceUrl: complaint.evidenceUrl || null
      }
    })
  } catch (err) {
    console.error('Error al cargar reclamos:', err)
    error.value = 'Error al cargar reclamos del servidor'
    showToast('error', 'Error', 'No se pudieron cargar los reclamos. Verifica la conexión.')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`
}
const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const countPending  = computed(() => complaints.value.filter(c => c.statusClass === 'pendiente').length)
const countInReview = computed(() => complaints.value.filter(c => c.statusClass === 'en-revision').length)
const countResolved = computed(() => complaints.value.filter(c => c.statusClass === 'resuelto').length)

const reclamosFiltrados = computed(() => {
  if (!search.value.trim()) return complaints.value
  const query = search.value.toLowerCase()
  return complaints.value.filter(c =>
    c.title?.toLowerCase().includes(query) ||
    c.category?.toLowerCase().includes(query) ||
    c.trackingNumber?.toLowerCase().includes(query)
  )
})

const handleCreateComplaint = async ({ dto, files }) => {
  try {
    const created = await complaintService.create(dto)
    if (files && files.length > 0) {
      await complaintService.addAttachments(created.id, files)
    }
    modalRef.value?.resetForm()
    showModal.value = false
    showToast('success', 'Reclamo enviado exitosamente', `Número de seguimiento: ${created.trackingNumber}`)
    loadComplaints()
  } catch (err) {
    console.error('Error al crear reclamo:', err)
    let msg = 'Por favor intenta de nuevo más tarde.'
    if (err.message?.includes('400')) msg = 'Datos inválidos. Verifica los campos.'
    else if (err.message?.includes('413')) msg = 'Archivo demasiado grande. Máximo 10MB.'
    else if (err.message?.includes('500')) msg = 'Error en el servidor. Contacta soporte.'
    else msg = err.message || msg
    showToast('error', 'Error al enviar reclamo', msg)
  }
}

onMounted(() => { loadComplaints() })
</script>

<style scoped>
.complaints-section { width: 100%; }

.section-header {
  display: flex; justify-content: space-between;
  align-items: flex-start; margin-bottom: 2rem;
}
.header-info h2 { font-size: 2rem; color: #1a3a52; margin: 0 0 0.5rem 0; font-weight: 700; }
.header-info p  { color: #64748b; margin: 0; font-size: 0.95rem; }

.btn-primary {
  background: #FFD200; color: #1a3a52; border: none;
  padding: 0.75rem 1.5rem; border-radius: 8px;
  cursor: pointer; font-weight: 600; transition: all 0.3s ease;
}
.btn-primary:hover {
  background: #FFC500; transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255,210,0,0.3);
}

.search-bar { margin-bottom: 2rem; }
.search-input {
  width: 100%; padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0; border-radius: 8px;
  font-size: 0.95rem; background: #ffffff; transition: border-color 0.3s ease;
}
.search-input:focus {
  outline: none; border-color: #FFD200;
  box-shadow: 0 0 0 3px rgba(255,210,0,0.1);
}

.loading, .error-state {
  background: #ffffff; border-radius: 12px; padding: 3rem;
  text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 2rem;
}
.loading p, .error-state p { color: #64748b; margin: 0 0 1rem 0; font-size: 1rem; }

.btn-retry {
  background: #FFD200;
  color: #1a3a52;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  background: #FFC500;
  transform: translateY(-2px);
}
.btn-retry:hover { background: #FFC500; transform: translateY(-2px); }

.table-container {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.empty-state {
  padding: 3rem 2rem;
  text-align: center;
  color: #64748b;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state p {
  font-size: 0.95rem;
  margin: 0;
}

.complaints-table {
  width: 100%;
  border-collapse: collapse;
}

.complaints-table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}
.empty-state { padding: 3rem 2rem; text-align: center; color: #64748b; }
.empty-icon  { font-size: 3rem; margin-bottom: 1rem; }
.empty-state p { font-size: 0.95rem; margin: 0; }

.complaints-table { width: 100%; border-collapse: collapse; }
.complaints-table thead { background: #f8fafc; border-bottom: 2px solid #e2e8f0; }
.complaints-table th {
  padding: 1.2rem;
  text-align: left;
  font-weight: 600;
  color: #475569;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-row {
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.3s ease;
}

.table-row:hover {
  background: #f8fafc;
}

.complaints-table td {
  padding: 1.2rem;
  font-size: 0.95rem;
}

.tracking-cell {
  font-weight: 700;
}
.table-row { border-bottom: 1px solid #e2e8f0; transition: background-color 0.3s ease; }
.table-row:hover { background: #f8fafc; }
.complaints-table td { padding: 1.2rem; font-size: 0.95rem; }

.tracking-cell  { font-weight: 700; }
.tracking-number {
  color: #1a3a52;
  background: #e0f2fe;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-family: 'Courier New', monospace;
}

.title-cell strong {
  display: block;
  color: #1a3a52;
  margin-bottom: 0.25rem;
}

.title-cell small {
  color: #64748b;
  font-size: 0.8rem;
  display: block;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.4rem 0.85rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-general {
  background: #f1f5f9;
  color: #475569;
}
.title-cell strong { display: block; color: #1a3a52; margin-bottom: 0.25rem; }
.title-cell small  { color: #64748b; font-size: 0.8rem; display: block; }

.badge-academico {
  background: #dbeafe;
  color: #0c4a6e;
}

.status {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.4rem 0.85rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600;
}
.status svg { flex-shrink: 0; }
.status-pendiente  { background: #fef9c3; color: #854d0e; }
.status-en-revision{ background: #dbeafe; color: #0c4a6e; }
.status-resuelto   { background: #dcfce7; color: #166534; }

.actions-cell { text-align: center; }
.action-btn {
  background: none; border: 1px solid #e2e8f0;
  border-radius: 6px; padding: 0.4rem 0.6rem;
  cursor: pointer; color: #64748b;
  display: inline-flex; align-items: center; justify-content: center;
  transition: all 0.2s ease;
}
.action-btn:hover { background: #e0f2fe; border-color: #1a3a52; color: #1a3a52; }

/* Stats */
.stats-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;
}
.stat-card {
  background: #ffffff; padding: 1.5rem; border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex; flex-direction: column; gap: 0.5rem; border-left: 4px solid #cbd5e1;
}
.stat-total   { border-left-color: #1a3a52; }
.stat-pending { border-left-color: #fbbf24; }
.stat-review  { border-left-color: #60a5fa; }
.stat-resolved{ border-left-color: #4ade80; }
.stat-label   { color: #64748b; font-size: 0.9rem; }
.stat-number  { font-size: 2rem; font-weight: 700; color: #1a3a52; }

/* Detail Modal */
.detail-overlay {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(15,23,42,0.5); backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.detail-box {
  background: #fff; border-radius: 16px;
  width: 100%; max-width: 520px; max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: popIn 0.25s ease;
}
@keyframes popIn {
  from { opacity: 0; transform: scale(0.94); }
  to   { opacity: 1; transform: scale(1); }
}
.detail-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0;
  position: sticky; top: 0; background: #fff; z-index: 1;
}
.detail-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #1a3a52; }
.detail-close {
  background: none; border: none; cursor: pointer; color: #64748b;
  display: flex; align-items: center; justify-content: center;
  padding: 0.25rem; border-radius: 50%; transition: all 0.2s ease;
}
.detail-close:hover { background: #f1f5f9; color: #1a3a52; }

.detail-body { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }

.detail-row {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
}
.detail-row--col { flex-direction: column; align-items: flex-start; }

.detail-label {
  font-size: 0.78rem; font-weight: 600; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; flex-shrink: 0;
}
.detail-value { font-size: 0.95rem; color: #1a3a52; }
.detail-value--muted { color: #94a3b8; font-style: italic; font-size: 0.9rem; margin-top: 0.25rem; }
.detail-description {
  margin: 0.4rem 0 0 0; font-size: 0.95rem; color: #334155;
  line-height: 1.6; background: #f8fafc; border-radius: 8px;
  padding: 0.75rem 1rem; width: 100%; box-sizing: border-box;
}

/* ── Adjuntos grid ─────────────────────────────────────────────────────────── */
.attachment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
  width: 100%;
  margin-top: 0.4rem;
}
.attachment-card {
  border: 1px solid #e2e8f0; border-radius: 10px;
  overflow: hidden; background: #f8fafc;
  display: flex; flex-direction: column;
  transition: box-shadow 0.2s ease;
}
.attachment-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

.attachment-preview {
  width: 100%; height: 100px;
  display: flex; align-items: center; justify-content: center;
  background: #f1f5f9; overflow: hidden;
}
.preview-img {
  width: 100%; height: 100%; object-fit: cover;
}
.preview-icon {
  justify-content: center; gap: 0.25rem; width: 100%; height: 100%;
}
.preview-icon--pdf  { color: #dc2626; }
.preview-icon--doc  { color: #2563eb; }

.attachment-info {
  padding: 0.5rem 0.6rem;
  display: flex; flex-direction: column; gap: 0.35rem;
  border-top: 1px solid #e2e8f0;
}
.attachment-name {
  font-size: 0.75rem; color: #475569; font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.btn-download {
  display: inline-flex; align-items: center; gap: 0.3rem;
  font-size: 0.75rem; font-weight: 600; color: #1a3a52;
  background: #e0f2fe; border-radius: 5px; padding: 0.3rem 0.5rem;
  text-decoration: none; transition: background 0.2s ease; width: fit-content;
}
.btn-download:hover { background: #bae6fd; }

/* Detail footer */
.detail-footer {
  padding: 1rem 1.5rem; border-top: 1px solid #e2e8f0;
  display: flex; justify-content: flex-end;
}
.btn-close-detail {
  padding: 0.6rem 1.5rem; background: #1a3a52; color: #fff;
  border: none; border-radius: 8px; cursor: pointer;
  font-weight: 600; font-size: 0.9rem; transition: background 0.2s ease;
}
.btn-close-detail:hover { background: #0f2438; }

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 1rem;
  }

  .btn-primary {
    width: 100%;
  }

  .complaints-table {
    font-size: 0.85rem;
  }

  .complaints-table th,
  .complaints-table td {
    padding: 0.75rem 0.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>