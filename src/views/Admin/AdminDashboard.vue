<template>
  <div class="admin-dashboard">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando métricas...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>{{ error }}</p>
      <button @click="loadDashboard" class="btn-retry">Reintentar</button>
    </div>

    <div v-else class="dashboard-content">
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

        <div class="kpi-card">
          <div class="kpi-icon" style="background: #fecaca;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <div class="kpi-content">
            <p class="kpi-label">Sugerencias Recibidas</p>
            <p class="kpi-value">{{ dashboard.totalSuggestions ?? 0 }}</p>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon" style="background: #a7f3d0;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
          <div class="kpi-content">
            <p class="kpi-label">Eventos Publicados</p>
            <p class="kpi-value">{{ dashboard.publishedEvents ?? 0 }}</p>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon" style="background: #bfdbfe;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e40af" stroke-width="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <div class="kpi-content">
            <p class="kpi-label">Inscritos a Eventos</p>
            <p class="kpi-value">{{ dashboard.totalEventRegistrations ?? 0 }}</p>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon" style="background: #fde68a;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h10z"/>
            </svg>
          </div>
          <div class="kpi-content">
            <p class="kpi-label">Noticias Publicadas</p>
            <p class="kpi-value">{{ dashboard.publishedNews ?? 0 }}</p>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════
           SECCIÓN: GRÁFICOS TEMPORALES (Series por mes)
      ══════════════════════════════════════════════════════════ -->
      <div class="section-header">
        <h2 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          Evolución Temporal (por mes)
        </h2>
      </div>

      <!-- Gráfico 1: Eventos creados por mes -->
      <div class="chart-card temporal-card">
        <div class="temporal-header">
          <h3>📅 Eventos Creados por Mes</h3>
          <div class="range-controls">
            <div class="range-group">
              <label>Desde</label>
              <input type="month" v-model="eventRange.from" @change="loadTemporalChart('events')" class="month-input" />
            </div>
            <div class="range-group">
              <label>Hasta</label>
              <input type="month" v-model="eventRange.to" @change="loadTemporalChart('events')" class="month-input" />
            </div>
          </div>
        </div>
        <div v-if="temporalLoading.events" class="chart-loading">
          <div class="spinner-sm"></div><span>Cargando...</span>
        </div>
        <apexchart
          v-else
          ref="eventsChartRef"
          type="area"
          height="300"
          :options="temporalChartOptions('Eventos creados', '#059669', 'dashboard-eventos-por-mes')"
          :series="temporalSeries.events"
        />
      </div>

      <!-- Gráfico 2: Noticias publicadas por mes -->
      <div class="chart-card temporal-card">
        <div class="temporal-header">
          <h3>📰 Noticias Publicadas por Mes</h3>
          <div class="range-controls">
            <div class="range-group">
              <label>Desde</label>
              <input type="month" v-model="newsRange.from" @change="loadTemporalChart('news')" class="month-input" />
            </div>
            <div class="range-group">
              <label>Hasta</label>
              <input type="month" v-model="newsRange.to" @change="loadTemporalChart('news')" class="month-input" />
            </div>
          </div>
        </div>
        <div v-if="temporalLoading.news" class="chart-loading">
          <div class="spinner-sm"></div><span>Cargando...</span>
        </div>
        <apexchart
          v-else
          ref="newsChartRef"
          type="area"
          height="300"
          :options="temporalChartOptions('Noticias publicadas', '#d97706', 'dashboard-noticias-por-mes')"
          :series="temporalSeries.news"
        />
      </div>

      <!-- Gráfico 3: Usuarios registrados por mes -->
      <div class="chart-card temporal-card">
        <div class="temporal-header">
          <h3>👥 Usuarios Registrados por Mes</h3>
          <div class="range-controls">
            <div class="range-group">
              <label>Desde</label>
              <input type="month" v-model="usersRange.from" @change="loadTemporalChart('users')" class="month-input" />
            </div>
            <div class="range-group">
              <label>Hasta</label>
              <input type="month" v-model="usersRange.to" @change="loadTemporalChart('users')" class="month-input" />
            </div>
          </div>
        </div>
        <div v-if="temporalLoading.users" class="chart-loading">
          <div class="spinner-sm"></div><span>Cargando...</span>
        </div>
        <apexchart
          v-else
          ref="usersChartRef"
          type="area"
          height="300"
          :options="temporalChartOptions('Usuarios registrados', '#1e40af', 'dashboard-usuarios-por-mes')"
          :series="temporalSeries.users"
        />
      </div>

      <!-- ══════════════════════════════════════════════════════════
           SECCIÓN: GRÁFICOS DE DISTRIBUCIÓN (los originales)
      ══════════════════════════════════════════════════════════ -->
      <div class="section-header">
        <h2 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
          </svg>
          Distribución por Categorías y Roles
        </h2>
      </div>

      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-filter-header">
            <h3>Usuarios por Rol</h3>
            <div class="checkbox-filters">
              <label><input type="checkbox" v-model="filters.usersByRole" value="ESTUDIANTE" /> Estudiante</label>
              <label><input type="checkbox" v-model="filters.usersByRole" value="PUBLICADOR" /> Publicador</label>
              <label><input type="checkbox" v-model="filters.usersByRole" value="ADMINISTRADOR" /> Administrador</label>
            </div>
          </div>
          <apexchart
            type="donut"
            height="320"
            :options="chartOptions.usersByRole.options"
            :series="chartOptions.usersByRole.series"
          />
        </div>

        <div class="chart-card">
          <div class="chart-filter-header">
            <h3>Reclamos por Estado</h3>
            <div class="checkbox-filters">
              <label><input type="checkbox" v-model="filters.complaintsByStatus" value="PENDIENTE" /> Pendiente</label>
              <label><input type="checkbox" v-model="filters.complaintsByStatus" value="EN_REVISION" /> En Revisión</label>
              <label><input type="checkbox" v-model="filters.complaintsByStatus" value="RESUELTO" /> Resuelto</label>
            </div>
          </div>
          <apexchart
            type="pie"
            height="320"
            :options="chartOptions.complaintsByStatus.options"
            :series="chartOptions.complaintsByStatus.series"
          />
        </div>

        <div class="chart-card">
          <div class="chart-filter-header">
            <h3>Reclamos por Categoría</h3>
            <div class="checkbox-filters">
              <label v-for="cat in dashboard.complaints.byCategory" :key="cat.category">
                <input type="checkbox" v-model="filters.complaintsByCategory" :value="cat.category" />
                {{ cat.category }}
              </label>
            </div>
          </div>
          <apexchart
            type="donut"
            height="320"
            :options="chartOptions.complaintsByCategory.options"
            :series="chartOptions.complaintsByCategory.series"
          />
        </div>
      </div>

      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-filter-header">
            <h3>Inscripciones a Eventos por Categoría</h3>
            <div class="checkbox-filters">
              <label v-for="cat in dashboard.eventRegistrations?.byCategory" :key="cat.categoryName">
                <input type="checkbox" v-model="filters.eventRegistrationsByCategory" :value="cat.categoryName" />
                {{ cat.categoryName }}
              </label>
            </div>
          </div>
          <apexchart type="bar" height="320"
            :options="chartOptions.eventsByCategory.options"
            :series="chartOptions.eventsByCategory.series"
          />
        </div>

        <div class="chart-card">
          <div class="chart-filter-header">
            <h3>Sugerencias por Categoría</h3>
            <div class="checkbox-filters">
              <label v-for="cat in dashboard.suggestions?.byCategory" :key="cat.category">
                <input type="checkbox" v-model="filters.suggestionsByCategory" :value="cat.category" />
                {{ cat.category }}
              </label>
            </div>
          </div>
          <apexchart type="bar" height="320"
            :options="chartOptions.suggestionsByCategory.options"
            :series="chartOptions.suggestionsByCategory.series"
          />
        </div>

        <div class="chart-card">
          <div class="chart-filter-header">
            <h3>Eventos Creados por Categoría</h3>
            <div class="checkbox-filters">
              <label v-for="cat in dashboard.events?.byCategory" :key="cat.categoryName">
                <input type="checkbox" v-model="filters.eventsByCategory" :value="cat.categoryName" />
                {{ cat.categoryName }}
              </label>
            </div>
          </div>
          <apexchart type="donut" height="320"
            :options="chartOptions.eventsByCategoryReal.options"
            :series="chartOptions.eventsByCategoryReal.series"
          />
        </div>

        <div class="chart-card">
          <div class="chart-filter-header">
            <h3>Noticias por Categoría</h3>
            <div class="checkbox-filters">
              <label v-for="cat in dashboard.news?.byCategory" :key="cat.category">
                <input type="checkbox" v-model="filters.newsByCategory" :value="cat.category" />
                {{ cat.category }}
              </label>
            </div>
          </div>
          <apexchart type="donut" height="320"
            :options="chartOptions.newsByCategory.options"
            :series="chartOptions.newsByCategory.series"
          />
        </div>

      </div>

      <div class="chart-card full-width">
        <div class="chart-filter-header">
          <h3>Usuarios por Carrera</h3>
          <div class="checkbox-filters">
            <label v-for="c in dashboard.users?.byCareer" :key="c.careerName">
              <input type="checkbox" v-model="filters.usersByCareer" :value="c.careerName" />
              {{ c.careerName }}
            </label>
          </div>
        </div>
        <apexchart type="bar" height="320"
          :options="chartOptions.usersByCareer.options"
          :series="chartOptions.usersByCareer.series"
        />
      </div>

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
            </tr>
          </thead>
          <tbody>
            <tr v-for="email in dashboard.accessLogs.suspiciousEmails" :key="email.email">
              <td class="email-cell">{{ email.email }}</td>
              <td class="attempts-cell">
                <span class="attempts-badge">{{ email.failedAttempts }}</span>
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
  complaints: { total: 0, byStatus: {}, byCategory: [] },
  accessLogs: { successfulAttempts: 0, failedAttempts: 0, suspiciousEmails: [] },
  totalSuggestions: 0,
  suggestions: { total: 0, byCategory: [] },
  publishedEvents: 0,
  totalEventRegistrations: 0,
  eventRegistrations: { total: 0, byCategory: [] },
  publishedNews: 0,
  events: { total: 0, byCategory: [] },
  news: { total: 0, byCategory: [] }
})

// ─────────────────────────────────────────────────────────────
// TEMPORAL CHARTS STATE
// ─────────────────────────────────────────────────────────────
const now = new Date()
const defaultFrom = `${now.getFullYear() - 1}-${String(now.getMonth() + 1).padStart(2, '0')}`
const defaultTo   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

const eventRange = ref({ from: defaultFrom, to: defaultTo })
const newsRange  = ref({ from: defaultFrom, to: defaultTo })
const usersRange = ref({ from: defaultFrom, to: defaultTo })

const temporalLoading = ref({ events: false, news: false, users: false })

const temporalSeries = ref({
  events: [{ name: 'Eventos creados',     data: [] }],
  news:   [{ name: 'Noticias publicadas', data: [] }],
  users:  [{ name: 'Usuarios registrados', data: [] }]
})

const filters = ref({
  usersByRole: ['ESTUDIANTE', 'PUBLICADOR', 'ADMINISTRADOR'],
  complaintsByStatus: ['PENDIENTE', 'EN_REVISION', 'RESUELTO'],
  complaintsByCategory: [],
  eventsByCategory: [],
  newsByCategory: [],
  usersByCareer: [],
  eventRegistrationsByCategory: [],   // ← agrega esto
  suggestionsByCategory: []           // ← agrega esto
})

// Chart refs (needed for programmatic export)
const eventsChartRef = ref(null)
const newsChartRef   = ref(null)
const usersChartRef  = ref(null)

// ─────────────────────────────────────────────────────────────
// Helper: genera el bloque toolbar estándar para cada gráfico.
// ─────────────────────────────────────────────────────────────
function makeToolbar(filename) {
  return {
    show: true,
    tools: {
      download: true,
      zoom: false,
      zoomin: false,
      zoomout: false,
      pan: false,
      reset: false,
      selection: false
    },
    export: {
      png: { filename },
      svg: { filename },
      csv: { show: false } 
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Opciones compartidas para los gráficos de área temporal
// ─────────────────────────────────────────────────────────────
function temporalChartOptions(seriesName, color, filename) {
  return {
    chart: {
      type: 'area',
      toolbar: makeToolbar(filename),
      zoom: { enabled: false },
      animations: { enabled: true, speed: 400 }
    },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    colors: [color],
    dataLabels: { enabled: false },
    xaxis: {
      type: 'category',
      labels: {
        rotate: -30,
        style: { fontSize: '11px', colors: '#64748b' }
      }
    },
    yaxis: {
      labels: {
        formatter: (v) => Math.round(v),
        style: { colors: '#64748b' }
      },
      min: 0
    },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    tooltip: {
      x: { show: true },
      y: { formatter: (v) => `${v} ${seriesName.toLowerCase()}` }
    },
    markers: { size: 5, hover: { size: 7 } },
    legend: { show: false }
  }
}

// ─────────────────────────────────────────────────────────────
// Carga de datos temporales para UN gráfico específico
// ─────────────────────────────────────────────────────────────
async function loadTemporalChart(type) {
  const range = type === 'events' ? eventRange.value
              : type === 'news'   ? newsRange.value
              :                     usersRange.value

  if (!range.from || !range.to || range.from > range.to) return

  const [fromYear, fromMonth] = range.from.split('-').map(Number)
  const [toYear, toMonth]     = range.to.split('-').map(Number)

  temporalLoading.value[type] = true
  try {
    const data = await dashboardAdminService.getTemporalMetrics(fromYear, fromMonth, toYear, toMonth)
    const series = (data[type] || []).map(item => ({
      x: item.month,
      y: item.count
    }))
    temporalSeries.value[type] = [{ name: seriesNameFor(type), data: series }]
  } catch (err) {
    console.error(`Error cargando serie temporal (${type}):`, err)
  } finally {
    temporalLoading.value[type] = false
  }
}

function seriesNameFor(type) {
  return type === 'events' ? 'Eventos creados'
       : type === 'news'   ? 'Noticias publicadas'
       :                     'Usuarios registrados'
}

// Carga inicial de los 3 gráficos temporales en paralelo
async function loadAllTemporalCharts() {
  await Promise.all([
    loadTemporalChart('events'),
    loadTemporalChart('news'),
    loadTemporalChart('users')
  ])
}

// ─────────────────────────────────────────────────────────────
// Gráficos de distribución (originales)
// ─────────────────────────────────────────────────────────────
const chartOptions = computed(() => ({
  // ── 1. Usuarios por Rol ──────────────────────────────────
  usersByRole: (() => {
  const roleMap = {
    ESTUDIANTE: { label: 'Estudiante', color: '#0c4a6e' },
    PUBLICADOR: { label: 'Publicador', color: '#10b981' },
    ADMINISTRADOR: { label: 'Administrador', color: '#FFD200' }
  }
  const active = filters.value.usersByRole
  const series = active.map(r => dashboard.value.users.byRole[r] ?? 0)
  const labels = active.map(r => roleMap[r].label)
  const colors = active.map(r => roleMap[r].color)
  return {
    series,
    options: {
      chart: { type: 'donut', toolbar: makeToolbar('dashboard-usuarios-por-rol') },
      labels,
      colors,
      plotOptions: { pie: { donut: { size: '65%' } } },
      legend: { position: 'bottom' }
    }
  }
})(),

  // ── 2. Reclamos por Estado ───────────────────────────────
  complaintsByStatus: (() => {
    const statusMap = {
      PENDIENTE:   { label: 'Pendiente',   color: '#fbbf24' },
      EN_REVISION: { label: 'En Revisión', color: '#60a5fa' },
      RESUELTO:    { label: 'Resuelto',    color: '#4ade80' }
    }
    const active = filters.value.complaintsByStatus
    return {
      series: active.map(s => dashboard.value.complaints.byStatus[s] ?? 0),
      options: {
        chart: { type: 'pie', toolbar: makeToolbar('dashboard-reclamos-por-estado') },
        labels: active.map(s => statusMap[s].label),
        colors: active.map(s => statusMap[s].color),
        legend: { position: 'bottom' }
      }
    }
  })(),

  // ── 3. Reclamos por Categoría ────────────────────────────
  complaintsByCategory: (() => {
    const all = dashboard.value.complaints.byCategory ?? []
    const active = all.filter(c => filters.value.complaintsByCategory.includes(c.category))
    return {
      series: active.length ? active.map(c => c.total) : [0],
      options: {
        chart: { type: 'donut', toolbar: makeToolbar('dashboard-reclamos-por-categoria') },
        labels: active.length ? active.map(c => c.category) : ['Sin Datos'],
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
        plotOptions: { pie: { donut: { size: '65%' } } },
        legend: { position: 'bottom' }
      }
    }
  })(),

  // ── 4. Inscripciones a Eventos por Categoría (barras) ────
  eventsByCategory: (() => {
    const all = dashboard.value.eventRegistrations?.byCategory ?? []
    const active = all.filter(e => filters.value.eventRegistrationsByCategory.includes(e.categoryName))
    return {
      series: [{ name: 'Inscripciones', data: active.map(e => e.totalRegistrations) }],
      options: {
        chart: { type: 'bar', toolbar: makeToolbar('dashboard-inscripciones-por-categoria') },
        plotOptions: { bar: { horizontal: true, dataLabels: { position: 'right' } } },
        xaxis: { categories: active.map(e => e.categoryName) },
        colors: ['#0284c7'],
        legend: { show: false }
      }
    }
  })(),

  // ── 5. Sugerencias por Categoría (barras) ───────────────
  suggestionsByCategory: (() => {
    const all = dashboard.value.suggestions?.byCategory ?? []
    const active = all.filter(s => filters.value.suggestionsByCategory.includes(s.category))
    return {
      series: [{ name: 'Sugerencias', data: active.map(s => s.total) }],
      options: {
        chart: { type: 'bar', toolbar: makeToolbar('dashboard-sugerencias-por-categoria') },
        plotOptions: { bar: { horizontal: true, dataLabels: { position: 'right' } } },
        xaxis: { categories: active.map(s => s.category) },
        colors: ['#f43f5e'],
        legend: { show: false }
      }
    }
  })(),

  // ── 6. Usuarios por Carrera (barras) ─────────────────────
  usersByCareer: (() => {
    const all = dashboard.value.users?.byCareer ?? []
    const active = all.filter(c => filters.value.usersByCareer.includes(c.careerName))
    return {
      series: [{ name: 'Usuarios', data: active.map(c => c.total) }],
      options: {
        chart: { type: 'bar', toolbar: makeToolbar('dashboard-usuarios-por-carrera') },
        plotOptions: { bar: { horizontal: true, dataLabels: { position: 'right' } } },
        xaxis: { categories: active.map(c => c.careerName) },
        colors: ['#1a3a52'],
        legend: { show: false }
      }
    }
  })(),

  // ── 7. Eventos Creados por Categoría (donut) ─────────────
  eventsByCategoryReal: (() => {
    const all = dashboard.value.events?.byCategory ?? []
    const active = all.filter(e => filters.value.eventsByCategory.includes(e.categoryName))
    return {
      series: active.length ? active.map(e => e.totalEvents) : [0],
      options: {
        chart: { type: 'donut', toolbar: makeToolbar('dashboard-eventos-por-categoria') },
        labels: active.length ? active.map(e => e.categoryName) : ['Sin Datos'],
        colors: ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'],
        plotOptions: { pie: { donut: { size: '65%' } } },
        legend: { position: 'bottom' }
      }
    }
  })(),

  // ── 8. Noticias por Categoría (donut) ────────────────────
  newsByCategory: (() => {
    const all = dashboard.value.news?.byCategory ?? []
    const active = all.filter(n => filters.value.newsByCategory.includes(n.category))
    return {
      series: active.length ? active.map(n => n.totalNews) : [0],
      options: {
        chart: { type: 'donut', toolbar: makeToolbar('dashboard-noticias-por-categoria') },
        labels: active.length ? active.map(n => n.category) : ['Sin Datos'],
        colors: ['#06b6d4', '#f43f5e', '#eab308', '#10b981', '#64748b', '#a855f7'],
        plotOptions: { pie: { donut: { size: '65%' } } },
        legend: { position: 'bottom' }
      }
    }
  })(),

}))

async function loadDashboard() {
  loading.value = true
  error.value = ''
  try {
    const data = await dashboardAdminService.getMetrics()
    dashboard.value = data
    filters.value.complaintsByCategory = data.complaints.byCategory?.map(c => c.category) ?? []
    filters.value.eventsByCategory = data.events?.byCategory?.map(e => e.categoryName) ?? []      // ← nuevo
    filters.value.newsByCategory = data.news?.byCategory?.map(n => n.category) ?? []              // ← nuevo
    filters.value.usersByCareer = data.users?.byCareer?.map(c => c.careerName) ?? []
    filters.value.eventRegistrationsByCategory = data.eventRegistrations?.byCategory?.map(e => e.categoryName) ?? []
    filters.value.suggestionsByCategory = data.suggestions?.byCategory?.map(s => s.category) ?? []              // ← nuevo
  } catch (err) {
    console.error('Error cargando dashboard:', err)
    error.value = 'No se pudieron cargar las métricas. Intenta nuevamente.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadDashboard()
  loadAllTemporalCharts()
})
</script>

<style scoped>
.admin-dashboard { width: 100%; }
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
.spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #1a3a52; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state p { color: #64748b; font-size: 1rem; }
.error-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 2rem; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); text-align: center; }
.error-state svg { width: 40px; height: 40px; color: #ef4444; margin-bottom: 1rem; }
.error-state p { color: #64748b; margin: 0 0 1rem 0; max-width: 400px; }
.btn-retry { padding: 0.6rem 1.5rem; background: #1a3a52; color: #ffffff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; }
.btn-retry:hover { background: #FFD200; color: #1a3a52; }
.dashboard-content { display: flex; flex-direction: column; gap: 2rem; }


.chart-filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.chart-filter-header h3 { margin: 0; color: #1a3a52; font-size: 1.1rem; font-weight: 600; }
.checkbox-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.85rem;
  color: #64748b;
}
.checkbox-filters label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
}



/* ── KPI Grid ── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}
.kpi-card { background: #ffffff; border-radius: 12px; padding: 1.5rem; display: flex; align-items: center; gap: 1.5rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); transition: all 0.3s ease; }
.kpi-card:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); transform: translateY(-2px); }
.kpi-icon { width: 60px; height: 60px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-content { flex: 1; }
.kpi-label { margin: 0; color: #64748b; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.kpi-value { margin: 0.5rem 0 0 0; color: #1a3a52; font-size: 2rem; font-weight: 700; }

/* ── Section Headers ── */
.section-header { display: flex; align-items: center; }
.section-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0;
  color: #1a3a52;
  font-size: 1.25rem;
  font-weight: 700;
  border-left: 4px solid #FFD200;
  padding-left: 0.75rem;
}

/* ── Temporal cards ── */
.temporal-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.temporal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}
.temporal-header h3 { margin: 0; color: #1a3a52; font-size: 1.05rem; font-weight: 600; }
.range-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.range-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}
.month-input {
  padding: 0.35rem 0.6rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 7px;
  font-size: 0.85rem;
  color: #1a3a52;
  background: #f8fafc;
  cursor: pointer;
  transition: border-color 0.2s;
}
.month-input:hover,
.month-input:focus { border-color: #1a3a52; outline: none; background: #fff; }

/* Chart mini-loader */
.chart-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  height: 300px;
  color: #94a3b8;
  font-size: 0.9rem;
}
.spinner-sm {
  width: 22px;
  height: 22px;
  border: 2px solid #e2e8f0;
  border-top-color: #1a3a52;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ── Distribution charts grid ── */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}
.chart-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-height: 380px;
}
.chart-card.full-width { grid-column: 1 / -1; }
.chart-card h3 { margin: 0 0 1.5rem 0; color: #1a3a52; font-size: 1.1rem; font-weight: 600; }

/* ── Suspicious emails table ── */
.suspicious-table-card { background: #ffffff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
.suspicious-table-card h3 { margin: 0 0 1.5rem 0; color: #1a3a52; font-size: 1.1rem; font-weight: 600; }
.empty-table { padding: 2rem; text-align: center; color: #94a3b8; }
.suspicious-table { width: 100%; border-collapse: collapse; }
.suspicious-table thead { background: #f8fafc; }
.suspicious-table th { padding: 1rem; text-align: left; color: #64748b; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; }
.suspicious-table td { padding: 1rem; border-bottom: 1px solid #e2e8f0; color: #1a3a52; }
.suspicious-table tbody tr:hover { background: #f8fafc; }
.email-cell { font-weight: 500; }
.attempts-cell { text-align: center; }
.attempts-badge { display: inline-block; padding: 0.35rem 0.75rem; background: #fef3c7; color: #92400e; border-radius: 6px; font-weight: 600; font-size: 0.85rem; }

/* ── Responsive ── */
@media (max-width: 1200px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .charts-grid { grid-template-columns: 1fr; }
  .temporal-header { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 768px) {
  .kpi-grid { grid-template-columns: 1fr; }
  .range-controls { flex-direction: column; align-items: flex-start; }
}
</style>