<template>
  <div class="mod-page">

    <!-- Modal eliminar -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="deleteModal.show" class="del-overlay" @click.self="deleteModal.show = false">
          <div class="del-modal">
            <div class="del-modal__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                   stroke="#dc2626" stroke-width="1.8" stroke-linecap="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
            </div>
            <h3>¿Eliminar comentario?</h3>
            <blockquote class="del-modal__quote">{{ deleteModal.commentBody }}</blockquote>
            <p class="del-modal__warn">Esta acción no se puede deshacer.</p>
            <div class="del-modal__actions">
              <button class="del-btn-cancel" @click="deleteModal.show = false"
                      :disabled="deleteModal.loading">Cancelar</button>
              <button class="del-btn-confirm" @click="confirmDeleteComment"
                      :disabled="deleteModal.loading">
                <span v-if="deleteModal.loading" class="spinner"></span>
                <template v-else>Eliminar definitivamente</template>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

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
    <div class="stats-grid">

      <div class="stat-card">
        <span>{{ pendingCount }}</span>
        <small>Pendientes</small>
      </div>

      <div class="stat-card">
        <span>{{ reports.filter(r => r.status === 'OCULTO').length }}</span>
        <small>Ocultados</small>
      </div>

      <div class="stat-card">
        <span>{{ reports.filter(r => r.status === 'ELIMINADO').length }}</span>
        <small>Eliminados</small>
      </div>

    </div>

    <!-- Filtros -->
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
          <span v-if="tab.value === 'PENDIENTE' && pendingCount > 0" class="tab-count">
            {{ pendingCount }}
          </span>
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

    <!-- Loading skeletons -->
    <div v-if="loading" class="mod-list">
      <div v-for="n in 3" :key="n" class="mod-card mod-card--skeleton">
        <div class="skeleton-line" style="width:55%;height:13px;"></div>
        <div class="skeleton-line" style="width:85%;height:11px;margin-top:10px;"></div>
        <div class="skeleton-line" style="width:40%;height:11px;margin-top:7px;"></div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredReports.length === 0" class="mod-empty">
      <div class="mod-empty__icon">
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <h3>¡Todo está en orden!</h3>
      <p>No hay comentarios reportados{{ activeStatus ? ' en este estado' : '' }}.</p>
    </div>

    <!-- Lista de reportes -->
    <div v-else class="mod-list">
      <TransitionGroup name="mod-list-anim">
        <article
          v-for="(report, i) in filteredReports"
          :key="report.id"
          class="mod-card"
          :class="{ 'mod-card--alert': report.totalReportsForComment >= 5 }"
          :style="{ '--delay': i * 0.05 + 's' }"
        >
          <!-- Fila superior: razón + noticia + contador -->
          <div class="mod-card__top">

            <span
              class="reason-badge"
              :style="{ background: getReasonColor(report.reason) }"
            >
              {{ getReasonLabel(report.reason) }}
            </span>

            <div class="mod-card__news-container">

              <div class="news-info">
                <span class="mod-card__news" :title="report.newsTitle">
                  {{ report.newsTitle }}
                </span>

                <span class="news-label">
                  Noticia reportada
                </span>
              </div>

              <RouterLink
                v-if="report.newsId"
                :to="`/news/${report.newsId}`"
                class="btn-view-news"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>

                Ver noticia
              </RouterLink>

            </div>

            <span
              class="mod-card__count"
              :class="{ 'mod-card__count--alert': report.totalReportsForComment >= 5 }"
            >
              {{ report.totalReportsForComment }}
              reporte{{ report.totalReportsForComment !== 1 ? 's' : '' }}
            </span>

          </div>

          <!-- Cuerpo: avatar + comentario + meta -->
          <div class="mod-card__comment">
            <div class="mod-card__avatar">
              {{ getInitials(report.reporterName) }}
            </div>
            <div class="mod-card__body">
              <div class="comment-box">

                <div class="comment-box__header">
                  Comentario reportado
                </div>

                <p class="comment-box__text">
                  {{ report.commentBody }}
                </p>

              </div>
              <div class="mod-card__meta">
                <span>Reportado por <strong>{{ report.reporterName }}</strong></span>
                <span class="mod-card__dot">·</span>
                <span>{{ formatDate(report.createdAt) }}</span>
              </div>
              <div v-if="report.description" class="mod-card__desc">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                "{{ report.description }}"
              </div>
            </div>
          </div>

          <!-- Acciones -->
          <div class="mod-card__actions">
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

            <button class="mod-action-btn mod-action-btn--delete"
                    :disabled="processingId === report.id"
                    @click="askDeleteComment(report)">
              <span v-if="processingId === report.id" class="spinner"></span>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { moderationService } from '../../services/api.js'
import { RouterLink } from 'vue-router'

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
    console.log(reports.value)
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

const deleteModal = reactive({
  show: false,
  reportId: null,
  commentId: null,
  commentBody: '',
  loading: false,
})

function askDeleteComment(report) {
  Object.assign(deleteModal, {
    show: true,
    reportId: report.id,
    commentId: report.commentId,
    commentBody: report.commentBody,
    loading: false,
  })
}

async function confirmDeleteComment() {
  deleteModal.loading = true
  processingId.value = deleteModal.reportId

  try {
    await moderationService.deletePublisherComment(
      deleteModal.commentId
    )

    await fetchReports()

    deleteModal.show = false

    showToast(
      'success',
      'Comentario eliminado permanentemente.'
    )
  } catch {
    showToast(
      'error',
      'No se pudo eliminar el comentario.'
    )
  } finally {
    deleteModal.loading = false
    processingId.value = null
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
/* ─── Layout base ─────────────────────────────────────────── */
.mod-page {
  padding: 1.5rem 1rem 4rem;
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ─── Header ──────────────────────────────────────────────── */
.mod-header {
  max-width: 760px;
  margin: 0 auto 1.5rem;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.mod-header__left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.mod-header__icon {
  width: 42px;
  height: 42px;
  background: #1a3a52;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFD200;
  flex-shrink: 0;
}

.mod-header__title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2px;
}

.mod-header__sub {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

.mod-badge {
  background: #fef2f2;
  border: 1.5px solid #fecdd3;
  color: #be123c;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  white-space: nowrap;
  flex-shrink: 0;
}

.mod-badge--empty {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #15803d;
}

/* ─── Filtros ─────────────────────────────────────────────── */
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
.filter-search > svg {
  position: absolute;
  left: 0.75rem;
  color: #94a3b8;
  pointer-events: none;
}
.filter-search-input {
  width: 100%;
  padding: 0.55rem 2.4rem 0.55rem 2.2rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.82rem;
  font-family: inherit;
  outline: none;
  background: #fff;
  color: #0f172a;
  transition: border-color 0.18s;
}
.filter-search-input:focus { border-color: #1a3a52; }
.filter-clear {
  position: absolute;
  right: 0.65rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  font-size: 1.1rem;
  line-height: 1;
  padding: 0;
}

/* ─── Lista ───────────────────────────────────────────────── */
.mod-list {
  max-width: 760px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* ─── Card ────────────────────────────────────────────────── */
.mod-card {
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  animation: card-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--delay, 0s);
  transition: box-shadow 0.18s, border-color 0.18s;
}
.mod-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.07);
}
.mod-card--alert {
  border-color: #fecdd3;
  background: #fffafa;
}

@keyframes card-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ─── Fila superior ───────────────────────────────────────── */
.mod-card__top {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.reason-badge {
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
  flex-shrink: 0;
  letter-spacing: 0.01em;
}

.mod-card__news {
  font-size: 0.8rem;
  font-weight: 600;
  color: #1a3a52;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mod-card__count {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.73rem;
  font-weight: 600;
  color: #64748b;
  flex-shrink: 0;
  white-space: nowrap;
}
.mod-card__count--alert {
  color: #dc2626;
}

.auto-hidden-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #dc2626;
}

/* ─── Cuerpo del comentario ───────────────────────────────── */
.mod-card__comment {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.mod-card__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a3a52, #2d5a7b);
  color: #FFD200;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}

.mod-card__body {
  flex: 1;
  min-width: 0;
}

.mod-card__quote {
  margin: 0 0 0.45rem;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  border-left: 3px solid #e2e8f0;
  border-radius: 0 8px 8px 0;
  font-size: 0.85rem;
  color: #374151;
  line-height: 1.5;
  font-style: normal;
  word-break: break-word;
}

.mod-card__meta {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  color: #64748b;
  flex-wrap: wrap;
}
.mod-card__meta strong { color: #334155; }
.mod-card__dot { color: #cbd5e1; }

.mod-card__desc {
  display: flex;
  align-items: flex-start;
  gap: 0.35rem;
  font-size: 0.76rem;
  color: #64748b;
  font-style: italic;
  margin-top: 0.4rem;
  line-height: 1.4;
}
.mod-card__desc svg { flex-shrink: 0; margin-top: 2px; }

/* ─── Acciones ────────────────────────────────────────────── */
.mod-card__actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-top: 0.1rem;
  border-top: 1px solid #f1f5f9;
}

.mod-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.42rem 0.85rem;
  border-radius: 7px;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: all 0.15s;
}
.mod-action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.mod-action-btn--ignore {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #64748b;
}
.mod-action-btn--ignore:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}

.mod-action-btn--hide {
  background: #fffbeb;
  border-color: #fde68a;
  color: #92400e;
}
.mod-action-btn--hide:hover:not(:disabled) {
  background: #fef3c7;
  border-color: #fbbf24;
}

.mod-action-btn--delete {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #be123c;
}
.mod-action-btn--delete:hover:not(:disabled) {
  background: #ffe4e6;
  border-color: #fda4af;
}

/* ─── Skeleton ────────────────────────────────────────────── */
.mod-card--skeleton {
  pointer-events: none;
}
.skeleton-line {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 4px;
}
@keyframes shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}

/* ─── Empty ───────────────────────────────────────────────── */
.mod-empty {
  max-width: 760px;
  margin: 3rem auto 0;
  padding: 0 1rem;
  text-align: center;
}
.mod-empty__icon {
  width: 72px;
  height: 72px;
  background: #f0fdf4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: #16a34a;
}
.mod-empty h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.4rem;
}
.mod-empty p {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

/* ─── Toast ───────────────────────────────────────────────── */
.mod-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.8rem 1.3rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 1500;
  white-space: nowrap;
  pointer-events: none;
}
.mod-toast--success {
  background: #f0fdf4;
  border: 1.5px solid #bbf7d0;
  color: #15803d;
}
.mod-toast--error {
  background: #fff1f2;
  border: 1.5px solid #fecdd3;
  color: #be123c;
}

.toast-enter-active { transition: all 0.3s cubic-bezier(0.34,1.5,0.64,1); }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(16px);
}

/* ─── Transición lista ────────────────────────────────────── */
.mod-list-anim-enter-active { transition: all 0.3s cubic-bezier(0.22,1,0.36,1); }
.mod-list-anim-leave-active { transition: all 0.2s ease; }
.mod-list-anim-enter-from, .mod-list-anim-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* ─── Modal eliminar ──────────────────────────────────────── */
.del-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(15,23,42,0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.del-modal {
  background: #fff;
  border-radius: 16px;
  padding: 2rem 1.75rem;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: 0 24px 64px rgba(0,0,0,0.2);
}

.del-modal__icon {
  width: 60px;
  height: 60px;
  background: #fff1f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.del-modal h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.75rem;
}

.del-modal__quote {
  background: #f8fafc;
  border-left: 3px solid #e2e8f0;
  border-radius: 0 8px 8px 0;
  padding: 0.55rem 0.85rem;
  font-size: 0.83rem;
  color: #374151;
  margin: 0 0 0.75rem;
  text-align: left;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.del-modal__warn {
  font-size: 0.78rem;
  color: #dc2626;
  font-weight: 600;
  margin: 0 0 1.5rem;
}

.del-modal__actions {
  display: flex;
  gap: 0.65rem;
}

.del-btn-cancel {
  flex: 1;
  padding: 0.65rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.del-btn-cancel:hover:not(:disabled) { background: #f1f5f9; }

.del-btn-confirm {
  flex: 1.5;
  padding: 0.65rem;
  border: none;
  border-radius: 8px;
  background: #dc2626;
  color: #fff;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.del-btn-confirm:hover:not(:disabled) { background: #b91c1c; }

.del-btn-confirm:disabled,
.del-btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.22s; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }

/* ─── Spinner ─────────────────────────────────────────────── */
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
  display: inline-block;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ---------- Noticias ---------- */

.mod-card__news-container{
  flex:1;
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:1rem;
}

.news-info{
  display:flex;
  flex-direction:column;
}

.news-label{
  font-size:.72rem;
  color:#64748b;
}

/* ---------- Botón ver noticia ---------- */

.btn-view-news{
  text-decoration:none;
  display:flex;
  align-items:center;
  gap:.4rem;
  padding:.55rem .9rem;
  border-radius:8px;
  background:#eff6ff;
  color:#2563eb;
  font-size:.78rem;
  font-weight:600;
  transition:.2s;
}

.btn-view-news:hover{
  background:#dbeafe;
  transform:translateY(-1px);
}

/* ---------- Comentario ---------- */

.comment-box{
  background:#f8fafc;
  border:1px solid #e2e8f0;
  border-radius:12px;
  padding:1rem;
}

.comment-box__header{
  font-size:.72rem;
  font-weight:700;
  text-transform:uppercase;
  color:#64748b;
  margin-bottom:.6rem;
}

.comment-box__text{
  margin:0;
  color:#0f172a;
  line-height:1.6;
}

/* ---------- Estadísticas ---------- */

.stats-grid{
  max-width:760px;
  margin:0 auto 1rem;
  padding:0 1rem;

  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:.75rem;
}

.stat-card{
  background:white;
  border:1px solid #e2e8f0;
  border-radius:12px;
  padding:1rem;
  text-align:center;
}

.stat-card span{
  display:block;
  font-size:1.6rem;
  font-weight:700;
  color:#1a3a52;
}

.stat-card small{
  color:#64748b;
}

/* ---------- Cards ---------- */

.mod-card{
  border:none;
  box-shadow:
    0 2px 8px rgba(0,0,0,.04),
    0 12px 24px rgba(0,0,0,.04);
}

.mod-card:hover{
  transform:translateY(-2px);
}
</style>