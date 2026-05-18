<template>
  <div class="admin-dashboard">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando métricas...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>{{ error }}</p>
      <button @click="loadDashboard" class="btn-retry">Reintentar</button>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- KPIs -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon" style="background: #dbeafe;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e40af" stroke-width="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <div class="kpi-content">
            <p class="kpi-label">Total Usuarios</p>
            <p class="kpi-value">{{ dashboard.users.total }}</p>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon" style="background: #dcfce7;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <div class="kpi-content">
            <p class="kpi-label">Total Reclamos</p>
            <p class="kpi-value">{{ dashboard.complaints.total }}</p>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon" style="background: #fef3c7;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#92400e" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="kpi-content">
            <p class="kpi-label">Intentos Fallidos</p>
            <p class="kpi-value">{{ dashboard.accessLogs.failedAttempts }}</p>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="charts-grid">
        <!-- Usuarios por Rol (Donut) -->
        <div class="chart-card">
          <h3>Usuarios por Rol</h3>
          <apexchart
            type="donut"
            :options="chartOptions.usersByRole.options"
            :series="chartOptions.usersByRole.series"
          />
        </div>

        <!-- Reclamos por Estado (Pie) -->
        <div class="chart-card">
          <h3>Reclamos por Estado</h3>
          <apexchart
            type="pie"
            :options="chartOptions.complaintsByStatus.options"
            :series="chartOptions.complaintsByStatus.series"
          />
        </div>
      </div>

      <!-- Usuarios por Carrera (Horizontal Bar) -->
      <div class="chart-card full-width">
        <h3>Usuarios por Carrera</h3>
        <apexchart
          type="bar"
          :options="chartOptions.usersByCareer.options"
          :series="chartOptions.usersByCareer.series"
        />
      </div>

      <!-- Correos Sospechosos Table -->
      <div class="suspicious-table-card">
        <h3>Correos Sospechosos (3+ intentos fallidos)</h3>
        <div v-if="dashboard.accessLogs.suspiciousEmails.length === 0" class="empty-table">
          <p>No hay correos sospechosos</p>
        </div>
        <table v-else class="suspicious-table">
          <thead>
            <tr>
              <th>Correo</th>
              <th>Intentos Fallidos</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="email in dashboard.accessLogs.suspiciousEmails" :key="email.email">
              <td class="email-cell">{{ email.email }}</td>
              <td class="attempts-cell">
                <span class="attempts-badge">{{ email.failedAttempts }}</span>
              </td>
              <td class="action-cell">
                <button class="btn-small">Ver accesos</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ApexChart from 'vue3-apexcharts'
import { dashboardAdminService } from '../../services/api'

const loading = ref(false)
const error = ref('')
const dashboard = ref({
  users: { total: 0, byRole: {}, byCareer: [] },
  complaints: { total: 0, byStatus: {} },
  accessLogs: { successfulAttempts: 0, failedAttempts: 0, suspiciousEmails: [] }
})

const chartOptions = computed(() => ({
  usersByRole: {
    series: dashboard.value.users.byRole.ESTUDIANTE && dashboard.value.users.byRole.PUBLICADOR && dashboard.value.users.byRole.ADMINISTRADOR
      ? [
          dashboard.value.users.byRole.ESTUDIANTE,
          dashboard.value.users.byRole.PUBLICADOR,
          dashboard.value.users.byRole.ADMINISTRADOR
        ]
      : [0],
    options: {
      chart: { type: 'donut' },
      labels: ['Estudiante', 'Publicador', 'Administrador'],
      colors: ['#0c4a6e', '#10b981', '#FFD200'],
      plotOptions: { pie: { donut: { size: '65%' } } },
      legend: { position: 'bottom' }
    }
  },
  complaintsByStatus: {
    series: dashboard.value.complaints.byStatus.PENDIENTE !== undefined && dashboard.value.complaints.byStatus.EN_REVISION !== undefined && dashboard.value.complaints.byStatus.RESUELTO !== undefined
      ? [
          dashboard.value.complaints.byStatus.PENDIENTE,
          dashboard.value.complaints.byStatus.EN_REVISION,
          dashboard.value.complaints.byStatus.RESUELTO
        ]
      : [0],
    options: {
      chart: { type: 'pie' },
      labels: ['Pendiente', 'En Revisión', 'Resuelto'],
      colors: ['#fbbf24', '#60a5fa', '#4ade80'],
      legend: { position: 'bottom' }
    }
  },
  usersByCareer: {
    series: [
      {
        name: 'Usuarios',
        data: dashboard.value.users.byCareer.map(c => c.total)
      }
    ],
    options: {
      chart: { type: 'bar' },
      plotOptions: { bar: { horizontal: true, dataLabels: { position: 'right' } } },
      xaxis: { categories: dashboard.value.users.byCareer.map(c => c.careerName) },
      colors: ['#1a3a52'],
      legend: { show: false }
    }
  }
}))

async function loadDashboard() {
  loading.value = true
  error.value = ''
  try {
    const data = await dashboardAdminService.getMetrics()
    dashboard.value = data
  } catch (err) {
    console.error('Error cargando dashboard:', err)
    error.value = 'No se pudieron cargar las métricas. Intenta nuevamente.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboard()
})
</script>

<style scoped>
.admin-dashboard {
  width: 100%;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #1a3a52;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #64748b;
  font-size: 1rem;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.error-state svg {
  width: 40px;
  height: 40px;
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-state p {
  color: #64748b;
  margin: 0 0 1rem 0;
  max-width: 400px;
}

.btn-retry {
  padding: 0.6rem 1.5rem;
  background: #1a3a52;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  background: #FFD200;
  color: #1a3a52;
}

/* Dashboard Content */
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.kpi-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.kpi-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.kpi-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-content {
  flex: 1;
}

.kpi-label {
  margin: 0;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpi-value {
  margin: 0.5rem 0 0 0;
  color: #1a3a52;
  font-size: 2rem;
  font-weight: 700;
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.chart-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-card h3 {
  margin: 0 0 1.5rem 0;
  color: #1a3a52;
  font-size: 1.1rem;
  font-weight: 600;
}

/* Suspicious Table */
.suspicious-table-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.suspicious-table-card h3 {
  margin: 0 0 1.5rem 0;
  color: #1a3a52;
  font-size: 1.1rem;
  font-weight: 600;
}

.empty-table {
  padding: 2rem;
  text-align: center;
  color: #94a3b8;
}

.suspicious-table {
  width: 100%;
  border-collapse: collapse;
}

.suspicious-table thead {
  background: #f8fafc;
}

.suspicious-table th {
  padding: 1rem;
  text-align: left;
  color: #64748b;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e2e8f0;
}

.suspicious-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #1a3a52;
}

.suspicious-table tbody tr:hover {
  background: #f8fafc;
}

.email-cell {
  font-weight: 500;
}

.attempts-cell {
  text-align: center;
}

.attempts-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  background: #fef3c7;
  color: #92400e;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
}

.action-cell {
  text-align: center;
}

.btn-small {
  padding: 0.5rem 1rem;
  background: #1a3a52;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-small:hover {
  background: #FFD200;
  color: #1a3a52;
}

/* Responsive */
@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .chart-card h3 {
    font-size: 1rem;
  }

  .suspicious-table {
    font-size: 0.9rem;
  }

  .suspicious-table th,
  .suspicious-table td {
    padding: 0.75rem;
  }
}
</style>