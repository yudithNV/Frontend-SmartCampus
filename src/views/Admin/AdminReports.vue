<template>
  <div class="reports-container">
    <div class="header-section">
      <h2>Reportes</h2>
      <div class="filter-section">
        <select v-model="selectedReportType" class="filter-select">
          <option value="all">Todos los Reportes</option>
          <option value="usuarios">Usuarios</option>
          <option value="accesos">Accesos</option>
          <option value="reclamos">Reclamos</option>
        </select>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Buscar reportes..." 
          class="search-input"
        >
      </div>
    </div>

    <div class="reports-grid">
      <div v-for="report in filteredReports" :key="report.id" class="report-card">
        <div class="report-header">
          <span class="report-icon" :class="`icon-${report.type}`">
            <svg v-if="report.type === 'usuarios'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
            <svg v-else-if="report.type === 'accesos'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="21 8 21 21 3 21 3 8"></polyline>
              <rect x="1" y="3" width="22" height="5"></rect>
              <path d="M10 12v4"></path>
              <path d="M14 12v4"></path>
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </span>
          <div class="report-title">
            <h3>{{ report.title }}</h3>
            <p class="report-date">{{ formatDate(report.date) }}</p>
          </div>
        </div>
        <div class="report-content">
          <p>{{ report.description }}</p>
        </div>
        <div class="report-stats">
          <div class="stat">
            <span class="stat-label">Registros:</span>
            <span class="stat-value">{{ report.records }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Estado:</span>
            <span class="stat-value" :class="`status-${report.status}`">{{ report.status }}</span>
          </div>
        </div>
        <div class="report-actions">
          <button class="btn-view" @click="viewReport(report.id)">Ver Detalles</button>
          <button class="btn-download" @click="downloadReport(report.id)">Descargar</button>
        </div>
      </div>
    </div>

    <!-- Modal de detalles -->
    <Transition name="modal-fade">
      <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
        <div class="modal-content">
          <button class="modal-close" @click="showDetailModal = false">×</button>
          <h3>{{ selectedReport?.title }}</h3>
          <div class="modal-body">
            <p><strong>Tipo:</strong> {{ selectedReport?.type }}</p>
            <p><strong>Fecha:</strong> {{ formatDate(selectedReport?.date) }}</p>
            <p><strong>Descripción:</strong> {{ selectedReport?.description }}</p>
            <p><strong>Total de Registros:</strong> {{ selectedReport?.records }}</p>
            <p><strong>Estado:</strong> <span :class="`status-${selectedReport?.status}`">{{ selectedReport?.status }}</span></p>
          </div>
          <div class="modal-actions">
            <button class="btn-download-modal" @click="downloadReport(selectedReport.id)">Descargar Reporte</button>
            <button class="btn-close-modal" @click="showDetailModal = false">Cerrar</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const selectedReportType = ref('all')
const searchQuery = ref('')
const showDetailModal = ref(false)
const selectedReport = ref(null)

// Datos mock de reportes
const mockReports = [
  {
    id: 1,
    type: 'usuarios',
    title: 'Reporte de Usuarios Activos',
    description: 'Resumen de usuarios activos en el sistema durante el mes actual',
    date: new Date('2026-05-15'),
    records: 1250,
    status: 'completado'
  },
  {
    id: 2,
    type: 'accesos',
    title: 'Historial de Accesos - Semana 1',
    description: 'Registro completo de accesos de usuarios durante la primera semana de mayo',
    date: new Date('2026-05-07'),
    records: 5420,
    status: 'completado'
  },
  {
    id: 3,
    type: 'reclamos',
    title: 'Reporte de Reclamos Pendientes',
    description: 'Análisis de reclamos que requieren seguimiento',
    date: new Date('2026-05-20'),
    records: 45,
    status: 'pendiente'
  },
  {
    id: 4,
    type: 'usuarios',
    title: 'Nuevos Registros de Usuarios',
    description: 'Usuarios registrados en la última semana',
    date: new Date('2026-05-25'),
    records: 87,
    status: 'completado'
  },
  {
    id: 5,
    type: 'accesos',
    title: 'Análisis de Picos de Acceso',
    description: 'Identificación de horas de mayor acceso al sistema',
    date: new Date('2026-05-18'),
    records: 8900,
    status: 'completado'
  },
  {
    id: 6,
    type: 'reclamos',
    title: 'Categorización de Reclamos',
    description: 'Reporte de reclamos por categoría y prioridad',
    date: new Date('2026-05-22'),
    records: 156,
    status: 'completado'
  }
]

// Filtro de reportes
const filteredReports = computed(() => {
  return mockReports.filter(report => {
    const matchesType = selectedReportType.value === 'all' || report.type === selectedReportType.value
    const matchesSearch = 
      report.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesType && matchesSearch
  })
})

// Formatear fecha
function formatDate(date) {
  return new Intl.DateTimeFormat('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

// Ver detalles del reporte
function viewReport(reportId) {
  selectedReport.value = mockReports.find(r => r.id === reportId)
  showDetailModal.value = true
}

// Descargar reporte (simulado)
function downloadReport(reportId) {
  const report = mockReports.find(r => r.id === reportId)
  if (report) {
    // Simular descarga
    const content = `REPORTE: ${report.title}\n\nFecha: ${formatDate(report.date)}\nTipo: ${report.type}\nRegistros: ${report.records}\n\n${report.description}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `reporte-${reportId}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }
}
</script>

<style scoped>
.reports-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 2rem;
}

.header-section h2 {
  font-size: 1.8rem;
  color: #1a3a52;
  margin: 0 0 1.5rem 0;
  font-weight: 700;
}

.filter-section {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select,
.search-input {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
}

.filter-select {
  min-width: 200px;
  background: #ffffff;
  color: #1a3a52;
  cursor: pointer;
}

.filter-select:hover,
.filter-select:focus {
  border-color: #FFD200;
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 210, 0, 0.1);
}

.search-input {
  flex: 1;
  min-width: 250px;
  color: #1a3a52;
}

.search-input:focus {
  outline: none;
  border-color: #FFD200;
  box-shadow: 0 0 0 3px rgba(255, 210, 0, 0.1);
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.report-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.report-card:hover {
  border-color: #FFD200;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.report-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: flex-start;
}

.report-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-usuarios {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.icon-accesos {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.icon-reclamos {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.report-title h3 {
  font-size: 1.1rem;
  color: #1a3a52;
  margin: 0 0 0.25rem 0;
  font-weight: 700;
}

.report-date {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0;
}

.report-content {
  margin-bottom: 1rem;
}

.report-content p {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.report-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.stat {
  flex: 1;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 500;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1.2rem;
  color: #1a3a52;
  font-weight: 700;
}

.status-completado {
  color: #22c55e;
}

.status-pendiente {
  color: #f59e0b;
}

.report-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-view,
.btn-download {
  flex: 1;
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
}

.btn-view {
  background: #FFD200;
  color: #1a3a52;
}

.btn-view:hover {
  background: #ffed4e;
  transform: scale(1.02);
}

.btn-download {
  background: #f8fafc;
  color: #1a3a52;
  border: 1px solid #e2e8f0;
}

.btn-download:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: modalPopIn 0.3s ease;
  position: relative;
}

@keyframes modalPopIn {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #94a3b8;
  transition: color 0.3s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #1a3a52;
}

.modal-content h3 {
  font-size: 1.5rem;
  color: #1a3a52;
  margin: 0 0 1.5rem 0;
  font-weight: 700;
}

.modal-body {
  margin-bottom: 1.5rem;
}

.modal-body p {
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  color: #64748b;
  line-height: 1.6;
}

.modal-body strong {
  color: #1a3a52;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-download-modal,
.btn-close-modal {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
}

.btn-download-modal {
  background: #FFD200;
  color: #1a3a52;
}

.btn-download-modal:hover {
  background: #ffed4e;
}

.btn-close-modal {
  background: #f8fafc;
  color: #1a3a52;
  border: 1px solid #e2e8f0;
}

.btn-close-modal:hover {
  background: #e2e8f0;
}

/* Transición modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
  }

  .filter-select,
  .search-input {
    width: 100%;
    min-width: unset;
  }

  .reports-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .modal-content {
    padding: 1.5rem;
  }
}
</style>
