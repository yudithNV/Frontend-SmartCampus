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

    <div class="section-header">
      <div class="header-info">
        <h2>Mis Reclamos</h2>
        <p>Gestiona y realiza seguimiento a tus reclamos institucionales</p>
      </div>
      <button class="btn-primary" @click="showModal = true">+ Nuevo Reclamo</button>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      <input
        v-model="search"
        type="text"
        placeholder="Buscar por título, categoría o número de seguimiento..."
        class="search-input"
      />
    </div>

    <!-- Complaints Table -->
    <div v-if="loading" class="loading">
      <p>Cargando reclamos...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadComplaints" class="btn-retry">Reintentar</button>
    </div>

    <div v-else class="table-container">
      <!-- Mensaje si no hay resultados -->
      <div v-if="reclamosFiltrados.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <p v-if="complaints.length === 0">No tienes reclamos registrados aún.</p>
        <p v-else>No se encontraron reclamos que coincidan con tu búsqueda.</p>
      </div>

      <!-- Tabla de reclamos -->
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
              <span class="status" :class="`status-${complaint.statusClass}`">
                <span class="status-icon">{{ complaint.statusIcon }}</span>
                {{ complaint.status }}
              </span>
            </td>
            <td class="actions-cell">
              <button class="action-btn" title="Ver detalles">👁️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Stats -->
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

// Sistema de notificaciones
const toast = ref({
  show: false,
  type: 'success',
  title: '',
  message: ''
})

const showToast = (type, title, message) => {
  toast.value = {
    show: true,
    type,
    title,
    message
  }
}

// Cargar reclamos desde el backend
const loadComplaints = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await complaintService.getMy()

    // Transformar datos del backend al formato de la tabla
    complaints.value = response.map(complaint => {
      const statusMap = {
        'PENDIENTE': { text: 'Pendiente', class: 'pendiente', icon: '🟡' },
        'EN_REVISION': { text: 'En Revisión', class: 'en-revision', icon: '🔵' },
        'RESUELTO': { text: 'Resuelto', class: 'resuelto', icon: '🟢' }
      }

      const categoryMap = {
        'General': 'general',
        'Académico': 'academico',
        'Infraestructura': 'infraestructura',
        'Trámites': 'tramites'
      }

      const status = statusMap[complaint.status] || statusMap['PENDIENTE']

      return {
        id: complaint.id,
        trackingNumber: complaint.trackingNumber,
        title: complaint.title,
        description: complaint.body, // El backend usa "body"
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

// Formatear fecha a dd/mm/yyyy
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Truncar texto largo
const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// Contadores por estado
const countPending = computed(() => {
  return complaints.value.filter(c => c.statusClass === 'pendiente').length
})

const countInReview = computed(() => {
  return complaints.value.filter(c => c.statusClass === 'en-revision').length
})

const countResolved = computed(() => {
  return complaints.value.filter(c => c.statusClass === 'resuelto').length
})

// Filtrar reclamos por búsqueda
const reclamosFiltrados = computed(() => {
  if (!search.value.trim()) {
    return complaints.value
  }
  const query = search.value.toLowerCase()
  return complaints.value.filter(c =>
    c.title?.toLowerCase().includes(query) ||
    c.category?.toLowerCase().includes(query) ||
    c.trackingNumber?.toLowerCase().includes(query)
  )
})

const handleCreateComplaint = async (formData) => {
  try {
    // Validación básica
    if (!formData.title || !formData.category || !formData.description) {
      showToast('error', 'Datos incompletos', 'Por favor completa todos los campos obligatorios.')
      return
    }

    // Validar longitud mínima de descripción
    if (formData.description.trim().length < 10) {
      showToast('error', 'Descripción muy corta', 'La descripción debe tener al menos 10 caracteres.')
      return
    }

    const response = await complaintService.create(formData)

    // Resetear el formulario
    if (modalRef.value && modalRef.value.resetForm) {
      modalRef.value.resetForm()
    }

    // Cerrar modal
    showModal.value = false

    // Mostrar mensaje de éxito con el tracking number
    showToast(
      'success',
      '✅ Reclamo enviado exitosamente',
      `Tu reclamo ha sido registrado. Número de seguimiento: ${response.trackingNumber}`
    )

    // Recargar la lista de reclamos
    loadComplaints()
  } catch (err) {
    console.error('Error al crear reclamo:', err)

    let errorMessage = 'Por favor intenta de nuevo más tarde.'

    if (err.message.includes('400')) {
      errorMessage = 'Datos inválidos. Verifica que todos los campos estén correctos.'
    } else if (err.message.includes('413')) {
      errorMessage = 'El archivo adjunto es demasiado grande. Máximo 5MB.'
    } else if (err.message.includes('500')) {
      errorMessage = 'Error en el servidor. Por favor contacta con soporte.'
    } else {
      errorMessage = err.message || errorMessage
    }

    showToast('error', 'Error al enviar reclamo', errorMessage)
  }
}

// Cargar reclamos al montar el componente
onMounted(() => {
  loadComplaints()
})
</script>

<style scoped>
.complaints-section {
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.header-info h2 {
  font-size: 2rem;
  color: #1a3a52;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
}

.header-info p {
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
}

.btn-primary {
  background: #FFD200;
  color: #1a3a52;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #FFC500;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 210, 0, 0.3);
}

/* Search Bar */
.search-bar {
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #ffffff;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #FFD200;
  box-shadow: 0 0 0 3px rgba(255, 210, 0, 0.1);
}

/* Table */
.loading,
.error-message {
  background: #ffffff;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.loading p,
.error-message p {
  color: #64748b;
  margin: 0 0 1rem 0;
  font-size: 1rem;
}

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

.badge-academico {
  background: #dbeafe;
  color: #0c4a6e;
}

.badge-infraestructura {
  background: #fef3c7;
  color: #92400e;
}

.badge-tramites {
  background: #f3e8ff;
  color: #6b21a8;
}

/* Status */
.status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.85rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-icon {
  font-size: 0.9rem;
}

.status-pendiente {
  background: #fef9c3;
  color: #854d0e;
}

.status-en-revision {
  background: #dbeafe;
  color: #0c4a6e;
}

.status-resuelto {
  background: #dcfce7;
  color: #166534;
}

.actions-cell {
  text-align: center;
}

.action-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #64748b;
  transition: all 0.3s ease;
  padding: 0.25rem 0.5rem;
}

.action-btn:hover {
  color: #1a3a52;
  transform: scale(1.2);
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-left: 4px solid #cbd5e1;
}

.stat-total {
  border-left-color: #1a3a52;
}

.stat-pending {
  border-left-color: #fbbf24;
}

.stat-review {
  border-left-color: #60a5fa;
}

.stat-resolved {
  border-left-color: #4ade80;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1a3a52;
}

/* Responsive */
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
