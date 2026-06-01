<template>
  <div class="mod-page">

    <!-- Header -->
    <div class="mod-header">
      <div class="mod-header__left">
        <div class="mod-header__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <h1 class="mod-header__title">Mis Moderaciones</h1>
          <p class="mod-header__sub">Comentarios reportados en tus noticias</p>
        </div>
      </div>
      <span v-if="!loading" class="mod-badge"
            :class="{ 'mod-badge--empty': pendingCount === 0 }">
        {{ pendingCount }} pendiente{{ pendingCount !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Filtros SCRUM-454 -->
    <div class="mod-filters">
      <div class="filter-tabs">
        <button
          v-for="tab in STATUS_TABS"
          :key="tab.value"
          class="filter-tab"
          :class="{ active: activeStatus === tab.value }"
          @click="setStatus(tab.value)"
        >
          {{ tab.label }}
          <span v-if="tab.value === 'PENDIENTE' && pendingCount > 0"
                class="tab-count">{{ pendingCount }}</span>
        </button>
      </div>
      <div class="filter-search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="searchTitle" type="text"
               placeholder="Buscar por título de noticia..."
               class="filter-search-input" />
        <button v-if="searchTitle" @click="searchTitle = ''" class="filter-clear">×</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="mod-list">
      <div v-for="n in 3" :key="n" class="mod-card mod-card--skeleton">
        <div class="skeleton-line" style="width:60%;height:14px;"></div>
        <div class="skeleton-line" style="width:90%;height:12px;margin-top:8px;"></div>
        <div class="skeleton-line" style="width:40%;height:12px;margin-top:6px;"></div>
      </div>
    </div>

    <!-- SCRUM-457/466: Empty state -->
    <div v-else-if="filteredReports.length === 0" class="mod-empty">
      <div class="mod-empty__icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <h3>¡Todo está en orden!</h3>
      <p>No hay comentarios reportados en tus noticias.</p>
    </div>

    <!-- Lista SCRUM-454/455 -->
    <div v-else class="mod-list">
      <TransitionGroup name="mod-list-anim">
        <article
          v-for="(report, i) in filteredReports"
          :key="report.id"
          class="mod-card"
          :class="{ 'mod-card--alert': report.totalReportsForComment >= 5 }"
          :style="{ '--delay': i * 0.05 + 's' }"
        >
          <!-- Fila superior -->
          <div class="mod-card__top">
            <span class="reason-badge"
                  :style="{ background: getReasonColor(report.reason) }">
              {{ getReasonLabel(report.reason) }}
            </span>
            <span class="mod-card__news" :title="report.newsTitle">
              {{ report.newsTitle }}
            </span>
            <!-- SCRUM-461: indicador rojo cuando ≥5 reportes -->
            <span class="mod-card__count"
                  :class="{ 'mod-card__count--alert': report.totalReportsForComment >= 5 }">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                <line x1="4" y1="22" x2="4" y2="15"/>
              </svg>
              {{ report.totalReportsForComment }} reporte{{ report.totalReportsForComment !== 1 ? 's' : '' }}
              <span v-if="report.totalReportsForComment >= 5" class="auto-hidden-label">
                · Oculto automáticamente
              </span>
            </span>
          </div>

          <!-- SCRUM-462: Detalle expandible -->
          <div class="mod-card__comment">
            <div class="mod-card__comment-avatar">
              {{ getInitials(report.reporterName) }}
            </div>
            <div class="mod-card__comment-body">
              <blockquote class="mod-card__quote">{{ report.commentBody }}</blockquote>
              <div class="mod-card__meta">
                <span>Reportado por <strong>{{ report.reporterName }}</strong></span>
                <span>· {{ formatDate(report.createdAt) }}</span>
              </div>
              <!-- Motivos detallados + descripción extra -->
              <div v-if="report.description" class="mod-card__desc">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                "{{ report.description }}"
              </div>
            </div>
          </div>

          <!-- SCRUM-456/464: Acciones con modal de confirmación para eliminar -->
          <div class="mod-card__actions">
            <!-- SCRUM-463: Ignorar -->
            <button class="mod-action-btn mod-action-btn--ignore"
                    :disabled="processingId === report.id"
                    @click="processReport(report.id, 'IGNORADO')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
              Ignorar
            </button>

            <!-- Ocultar -->
            <button class="mod-action-btn mod-action-btn--hide"
                    :disabled="processingId === report.id"
                    @click="processReport(report.id, 'OCULTO')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              Ocultar
            </button>

            <!-- SCRUM-464: Eliminar con confirmación modal -->
            <button class="mod-action-btn mod-action-btn--delete"
                    :disabled="processingId === report.id"
                    @click="askDeleteComment(report)">
              <span v-if="processingId === report.id" class="mod-spinner"></span>
              <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
              Eliminar comentario
            </button>
          </div>

        </article>
      </TransitionGroup>
    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toastMsg" class="mod-toast" :class="`mod-toast--${toastType}`">
        {{ toastMsg }}
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { moderationService } from '../../services/api.js'

const reports      = ref([])
const loading      = ref(true)
const processingId = ref(null)
const toastMsg     = ref('')
const toastType    = ref('success')
const searchTitle  = ref('')
const activeStatus = ref('PENDIENTE')

const STATUS_TABS = [
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: 'IGNORADO',  label: 'Ignorados'  },
  { value: 'OCULTO',    label: 'Ocultos'    },
  { value: 'ELIMINADO', label: 'Eliminados' },
  { value: '',          label: 'Todos'      },
]

const REASON_MAP = {
  LENGUAJE_OFENSIVO: { label: 'Lenguaje ofensivo', color: '#dc2626' },
  ACOSO:             { label: 'Acoso',              color: '#9333ea' },
  SPAM:              { label: 'Spam',               color: '#0891b2' },
  DESINFORMACION:    { label: 'Desinformación',     color: '#d97706' },
  OTRO:              { label: 'Otro',               color: '#64748b' },
}

const pendingCount = computed(() =>
  reports.value.filter(r => r.status === 'PENDIENTE').length
)

const filteredReports = computed(() => {
  let list = reports.value
  if (activeStatus.value) {
    list = list.filter(r => r.status === activeStatus.value)
  }
  if (searchTitle.value.trim()) {
    const q = searchTitle.value.toLowerCase()
    list = list.filter(r => r.newsTitle?.toLowerCase().includes(q))
  }
  return list
})

function getReasonLabel(r) { return REASON_MAP[r]?.label ?? r }
function getReasonColor(r) { return REASON_MAP[r]?.color ?? '#64748b' }
function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('es-BO', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}

function setStatus(val) {
  activeStatus.value = val
}

async function fetchReports() {
  loading.value = true
  try {
    const res = await moderationService.getPublisherReports()
    reports.value = Array.isArray(res) ? res : (res?.data ?? [])
  } catch {
    showToast('error', 'No se pudieron cargar los reportes.')
  } finally {
    loading.value = false
  }
}

async function processReport(reportId, action) {
  if (processingId.value === reportId) return
  processingId.value = reportId
  try {
    // SCRUM-463: Ignorar hace que el comentario vuelva a ser visible
    await moderationService.processReport(reportId, action)
    const r = reports.value.find(x => x.id === reportId)
    if (r) r.status = action
    const msg = {
      IGNORADO: 'Reporte ignorado. El comentario vuelve a ser visible.',
      OCULTO:   'Comentario ocultado correctamente.',
    }[action] ?? 'Acción aplicada.'
    showToast('success', msg)
  } catch {
    showToast('error', 'No se pudo procesar el reporte.')
  } finally {
    processingId.value = null
  }
}

// SCRUM-456/464: Eliminar comentario permanentemente
const deleteTarget = ref(null)

function askDeleteComment(report) {
  deleteTarget.value = report
  if (confirm(`¿Eliminar permanentemente el comentario "${report.commentBody.slice(0, 60)}..."?\nEsta acción no se puede deshacer.`)) {
    confirmDeleteComment()
  } else {
    deleteTarget.value = null
  }
}

async function confirmDeleteComment() {
  const report = deleteTarget.value
  if (!report) return
  processingId.value = report.id
  try {
    await moderationService.deletePublisherComment(report.commentId)
    reports.value = reports.value.filter(r => r.commentId !== report.commentId)
    showToast('success', 'Comentario eliminado permanentemente.')
  } catch {
    showToast('error', 'No se pudo eliminar el comentario.')
  } finally {
    processingId.value = null
    deleteTarget.value = null
  }
}

function showToast(type, msg) {
  toastType.value = type
  toastMsg.value = msg
  setTimeout(() => { toastMsg.value = '' }, 4000)
}

onMounted(fetchReports)
</script>

<style scoped>
/* ... mismos estilos base del ModerationPanel.vue existente, más: */

.mod-filters {
  max-width: 760px;
  margin: 0 auto 1rem;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.filter-tabs {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.9rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 20px;
  background: #fff;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  color: #64748b;
  transition: all 0.15s;
}
.filter-tab:hover { border-color: #1a3a52; color: #1a3a52; }
.filter-tab.active { background: #1a3a52; border-color: #1a3a52; color: #FFD200; }

.tab-count {
  background: #ef4444;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
}
.filter-tab.active .tab-count { background: #FFD200; color: #1a3a52; }

.filter-search {
  position: relative;
  display: flex;
  align-items: center;
}
.filter-search svg { position: absolute; left: 0.75rem; color: #94a3b8; pointer-events: none; }
.filter-search-input {
  width: 100%;
  padding: 0.55rem 2.4rem 0.55rem 2.2rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.82rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.18s;
}
.filter-search-input:focus { border-color: #1a3a52; }
.filter-clear {
  position: absolute; right: 0.65rem;
  background: none; border: none; cursor: pointer;
  color: #94a3b8; font-size: 1rem;
}

.auto-hidden-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #dc2626;
}

.mod-card--alert { border-color: #fecdd3; }

.mod-card__desc {
  display: flex;
  align-items: flex-start;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: #64748b;
  font-style: italic;
  margin-top: 0.35rem;
}

.mod-toast { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
  padding: 0.8rem 1.3rem; border-radius: 10px; font-size: 0.85rem; font-weight: 600;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 999; white-space: nowrap; }
.mod-toast--success { background: #f0fdf4; border: 1.5px solid #bbf7d0; color: #15803d; }
.mod-toast--error   { background: #fff1f2; border: 1.5px solid #fecdd3; color: #be123c; }

.toast-enter-active { transition: all 0.3s cubic-bezier(0.34,1.5,0.64,1); }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(16px); }
</style>