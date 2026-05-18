<template>
  <div class="complaint-detail-container">
    <router-link to="/admin/reclamos" class="back-link">← Volver a reclamos</router-link>

    <div v-if="loading" class="loading">
      <p>Cargando detalle del reclamo...</p>
    </div>

    <div v-else-if="complaint" class="complaint-detail">
      <div class="card">
        <!-- Encabezado -->
        <div class="card-header">
          <div class="header-content">
            <h2>{{ complaint.title }}</h2>
            <p class="complaint-category">{{ complaint.category }}</p>
          </div>
          <div class="complaint-status" :class="getStatusClass(complaint.status)">
            {{ formatStatus(complaint.status) }}
          </div>
        </div>

        <!-- Detalles del reclamo -->
        <div class="card-body">
          <div class="detail-section">
            <h3>Detalle del Reclamo</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Estudiante</label>
                <p>{{ complaint.studentName || 'N/A' }}</p>
              </div>
              <div class="info-item">
                <label>Fecha de Creación</label>
                <p>{{ formatDate(complaint.createdAt) }}</p>
              </div>
              <div class="info-item" v-if="complaint.updatedAt">
                <label>Última Actualización</label>
                <p>{{ formatDate(complaint.updatedAt) }}</p>
              </div>
            </div>

            <div class="full-width">
              <label>Descripción</label>
              <p class="description-text">{{ complaint.body }}</p>
            </div>

            <div v-if="complaint.attachments && complaint.attachments.length > 0" class="attachments">
              <label>Adjuntos</label>
              <div class="attachments-list">
                <div v-for="(file, idx) in complaint.attachments" :key="idx" class="attachment-item">
                  <div class="attachment-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div class="attachment-info">
                    <a :href="file.url" target="_blank" class="attachment-name">{{ file.name }}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Acciones -->
          <div class="actions-section">
          <!-- Acción: Tomar en revisión (solo si PENDIENTE) -->
          <button 
            v-if="complaint.status === 'PENDIENTE'"
            @click="markAsReview"
            class="btn btn-primary"
            :disabled="actionLoading"
          >
            {{ actionLoading ? 'Procesando...' : 'Tomar en revisión' }}
          </button>
          </div>
        </div>
      </div>

      <!-- Respuestas -->
      <div class="card responses-card">
        <div class="card-header">
          <h3>Respuestas ({{ responses.length }})</h3>
        </div>

        <div v-if="responses.length === 0" class="empty-responses">
          <p>Sin respuestas aún</p>
        </div>

        <div v-else class="responses-list">
          <div v-for="response in responses" :key="response.id" class="response-item">
            <div class="response-header">
              <span class="admin-badge">
                {{ response.adminName || 'Admin' }}
              </span>

              <small>{{ formatDate(response.createdAt) }}</small>
            </div>
            <p class="response-body">{{ response.body }}</p>
            <span v-if="response.isClosing" class="closing-badge">Respuesta de cierre</span>
          </div>
        </div>
      </div>

      <!-- Formulario de respuesta (solo si EN_REVISION) -->
      <div v-if="complaint.status === 'EN_REVISION'" class="card">
        <div class="card-header">
          <h3>Responder y Resolver</h3>
        </div>

        <div class="card-body">
          <form @submit.prevent="submitResponse">
            <div class="form-group">
              <label for="response-text">Tu Respuesta</label>
              <textarea
                id="response-text"
                v-model="responseText"
                placeholder="Escribe tu respuesta aquí..."
                rows="5"
                class="form-control"
                required
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-success" :disabled="responseLoading || !responseText.trim()">
                {{ responseLoading ? 'Enviando...' : 'Responder y resolver' }}
              </button>
              <button type="button" @click="responseText = ''" class="btn btn-secondary">
                Limpiar
              </button>
            </div>
          </form>
        </div>
      </div>

      <div v-else class="resolved-message">
        <p>✓ Este reclamo ha sido resuelto. No se pueden realizar más acciones.</p>
      </div>
    </div>

    <div v-else class="not-found">
      <p>Reclamo no encontrado</p>
    </div>

    <!-- Toast de notificaciones -->
    <Toast
      :show="showToast"
      :type="toastType"
      title="Acción completada"
      :message="toastMessage"
      @close="showToast = false"
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { adminComplaintService } from '../../services/api'
import Toast from '../../components/Toast.vue'

const route = useRoute()
const complaintId = route.params.id

const complaint = ref(null)
const responses = ref([])
const loading = ref(false)
const actionLoading = ref(false)
const responseLoading = ref(false)
const responseText = ref('')

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

async function loadComplaintDetail() {
  loading.value = true
  try {
    const data = await adminComplaintService.getById(complaintId)
    complaint.value = data
    await loadResponses()
  } catch (error) {
    console.error('Error cargando detalle:', error)
    showNotification('Error al cargar el reclamo', 'error')
  } finally {
    loading.value = false
  }
}

async function loadResponses() {
  try {
    const data = await adminComplaintService.listResponses(complaintId)
    responses.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error cargando respuestas:', error)
    responses.value = []
  }
}

async function markAsReview() {
  actionLoading.value = true
  try {
    const updated = await adminComplaintService.patchStatus(complaintId)
    complaint.value = updated
    showNotification('Reclamo marcado como en revisión correctamente', 'success')
  } catch (error) {
    console.error('Error:', error)
    showNotification('Error al actualizar estado', 'error')
  } finally {
    actionLoading.value = false
  }
}

async function submitResponse() {
  if (!responseText.value.trim()) return

  responseLoading.value = true
  try {
    await adminComplaintService.postResponse(complaintId, responseText.value)
    responseText.value = ''
    await loadComplaintDetail()
    showNotification('Respuesta enviada correctamente. El reclamo fue marcado como resuelto.', 'success')
  } catch (error) {
    console.error('Error:', error)
    showNotification('Error al enviar respuesta', 'error')
  } finally {
    responseLoading.value = false
  }
}

function showNotification(message, type = 'success') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}

function getStatusClass(status) {
  const classes = {
    PENDIENTE: 'status-pending',
    EN_REVISION: 'status-review',
    RESUELTO: 'status-resolved'
  }
  return classes[status] || 'status-pending'
}

function formatStatus(status) {
  const labels = {
    PENDIENTE: 'Pendiente',
    EN_REVISION: 'En Revisión',
    RESUELTO: 'Resuelto'
  }
  return labels[status] || status
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadComplaintDetail()
})
</script>

<style scoped>
.complaint-detail-container {
  width: 100%;
}

.back-link {
  display: inline-block;
  margin-bottom: 1.5rem;
  color: #1a3a52;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-link:hover {
  color: #FFD200;
}

.loading,
.not-found {
  padding: 3rem 1.5rem;
  text-align: center;
  color: #64748b;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.card-header h2 {
  margin: 0 0 0.5rem 0;
  color: #1a3a52;
  font-size: 1.5rem;
}

.card-header h3 {
  margin: 0;
  color: #1a3a52;
  font-size: 1.2rem;
}

.header-content {
  flex: 1;
}

.complaint-category {
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
}

.complaint-status {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-review {
  background: #dbeafe;
  color: #1e40af;
}

.status-resolved {
  background: #dcfce7;
  color: #15803d;
}

.card-body {
  padding: 1.5rem;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h3 {
  margin: 0 0 1rem 0;
  color: #1a3a52;
  font-size: 1.1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.info-item label {
  display: block;
  margin-bottom: 0.25rem;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item p {
  margin: 0;
  color: #1a3a52;
  font-weight: 500;
}

.full-width {
  margin-bottom: 1.5rem;
}

.full-width label {
  display: block;
  margin-bottom: 0.5rem;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.description-text {
  margin: 0;
  color: #1a3a52;
  line-height: 1.6;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #FFD200;
}

.attachments {
  margin-top: 1.5rem;
}

.attachments label {
  display: block;
  margin-bottom: 0.75rem;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.attachment-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.attachment-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #dbeafe;
  border-radius: 6px;
  color: #1e40af;
  flex-shrink: 0;
}

.attachment-info {
  flex: 1;
  min-width: 0;
}

.attachment-name {
  color: #1a3a52;
  text-decoration: none;
  font-weight: 500;
  word-break: break-word;
  transition: color 0.3s ease;
}

.attachment-name:hover {
  color: #FFD200;
  text-decoration: underline;
}

.actions-section {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.status-badge {
  display: inline-block;
  padding: 0.6rem 1.2rem;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
}

.responses-card {
  margin-bottom: 1.5rem;
}

.empty-responses {
  padding: 2rem;
  text-align: center;
  color: #94a3b8;
}

.responses-list {
  padding: 0;
}

.response-item {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.response-item:last-child {
  border-bottom: none;
}

.response-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.admin-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #1a3a52;
  color: #ffffff;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.response-header small {
  color: #94a3b8;
}

.response-body {
  margin: 0;
  color: #1a3a52;
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.closing-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #dcfce7;
  color: #15803d;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #1a3a52;
  font-weight: 600;
  font-size: 0.95rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #FFD200;
  box-shadow: 0 0 0 3px rgba(255, 210, 0, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #1a3a52;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background: #FFD200;
  color: #1a3a52;
}

.btn-success {
  background: #10b981;
  color: #ffffff;
  flex: 1;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}

.btn-secondary {
  background: #e2e8f0;
  color: #475569;
}

.btn-secondary:hover:not(:disabled) {
  background: #cbd5e1;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.resolved-message {
  padding: 2rem;
  text-align: center;
  background: #dcfce7;
  border-radius: 12px;
  color: #15803d;
  font-weight: 600;
  font-size: 1.05rem;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn {
    flex: 1;
  }
}
</style>
