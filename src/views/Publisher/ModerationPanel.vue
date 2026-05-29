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
          <h1 class="mod-header__title">Panel de Moderación</h1>
          <p class="mod-header__sub">Gestiona los comentarios reportados por la comunidad</p>
        </div>
      </div>
      <span v-if="!loading" class="mod-badge" :class="{ 'mod-badge--empty': reports.length === 0 }">
        {{ reports.length }} pendiente{{ reports.length !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Loading skeletons -->
    <div v-if="loading" class="mod-list">
      <div v-for="n in 3" :key="n" class="mod-card mod-card--skeleton">
        <div class="skeleton-line" style="width:60%;height:14px;"></div>
        <div class="skeleton-line" style="width:90%;height:12px;margin-top:8px;"></div>
        <div class="skeleton-line" style="width:40%;height:12px;margin-top:6px;"></div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="reports.length === 0" class="mod-empty">
      <div class="mod-empty__icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <h3>Todo en orden</h3>
      <p>No hay reportes pendientes de revisión.</p>
    </div>

    <!-- Lista de reportes -->
    <div v-else class="mod-list">
      <TransitionGroup name="mod-list-anim">
        <article
          v-for="(report, i) in reports"
          :key="report.id"
          class="mod-card"
          :style="{ '--delay': i * 0.06 + 's' }"
        >
          <!-- Top row: reason badge + news title -->
          <div class="mod-card__top">
            <span class="reason-badge" :style="{ background: getReasonColor(report.reason) }">
              {{ getReasonLabel(report.reason) }}
            </span>
            <span class="mod-card__news">{{ report.newsTitle }}</span>
            <span class="mod-card__count" :class="{ 'mod-card__count--alert': report.totalReportsForComment >= 3 }">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                <line x1="4" y1="22" x2="4" y2="15"/>
              </svg>
              {{ report.totalReportsForComment }} reporte{{ report.totalReportsForComment !== 1 ? 's' : '' }}
            </span>
          </div>

          <!-- Comentario reportado -->
          <div class="mod-card__comment">
            <div class="mod-card__comment-avatar">
              {{ getInitials(report.reporterName) }}
            </div>
            <div class="mod-card__comment-body">
              <blockquote class="mod-card__quote">{{ report.commentBody }}</blockquote>
              <div class="mod-card__meta">
                <span>Reportado por <strong>{{ report.reporterName }}</strong></span>
                <span>· {{ formatDate(report.createdAt) }}</span>
                <span v-if="report.description" class="mod-card__desc">
                  "{{ report.description }}"
                </span>
              </div>
            </div>
          </div>

          <!-- Acciones SCRUM-435/467 -->
          <div class="mod-card__actions">
            <button
              class="mod-action-btn mod-action-btn--ignore"
              :disabled="processingId === report.id"
              @click="processReport(report.id, 'IGNORADO')"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
              Ignorar
            </button>
            <button
              class="mod-action-btn mod-action-btn--hide"
              :disabled="processingId === report.id"
              @click="processReport(report.id, 'OCULTO')"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              Ocultar
            </button>
            <button
              class="mod-action-btn mod-action-btn--delete"
              :disabled="processingId === report.id"
              @click="processReport(report.id, 'ELIMINADO')"
            >
              <span v-if="processingId === report.id" class="mod-spinner"></span>
              <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
              Eliminar
            </button>
          </div>

        </article>
      </TransitionGroup>
    </div>

    <!-- Toast error -->
    <Transition name="toast">
      <div v-if="errorMsg" class="mod-toast">{{ errorMsg }}</div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { moderationService } from '../../services/api.js'

const reports     = ref([])
const loading     = ref(true)
const processingId = ref(null)
const errorMsg    = ref('')

const REASON_MAP = {
  LENGUAJE_OFENSIVO: { label: 'Lenguaje ofensivo', color: '#dc2626' },
  ACOSO:             { label: 'Acoso',              color: '#9333ea' },
  SPAM:              { label: 'Spam',               color: '#0891b2' },
  DESINFORMACION:    { label: 'Desinformación',     color: '#d97706' },
  OTRO:              { label: 'Otro',               color: '#64748b' },
}

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

async function fetchReports() {
  loading.value = true
  try {
    const res = await moderationService.getPendingReports()
    reports.value = Array.isArray(res) ? res : (res?.data ?? [])
  } catch (err) {
    errorMsg.value = 'No se pudieron cargar los reportes.'
    setTimeout(() => { errorMsg.value = '' }, 4000)
  } finally {
    loading.value = false
  }
}

async function processReport(reportId, action) {
  if (processingId.value === reportId) return
  processingId.value = reportId
  try {
    await moderationService.processReport(reportId, action)
    reports.value = reports.value.filter(r => r.id !== reportId)
  } catch (err) {
    errorMsg.value = 'No se pudo procesar el reporte.'
    setTimeout(() => { errorMsg.value = '' }, 3500)
  } finally {
    processingId.value = null
  }
}

onMounted(fetchReports)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700&family=DM+Sans:wght@400;500;600&display=swap');

.mod-page {
  --navy: #1a3a52; --gold: #FFD200; --ink: #0f1f2e;
  --slate: #64748b; --muted: #94a3b8; --surface: #fff;
  --bg: #f0f2f5; --border: #e2e8f0; --radius: 12px;
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  min-height: 100vh;
  padding: 0 0 4rem;
}

/* Header */
.mod-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 1.5rem 1.25rem;
  margin-bottom: 1.25rem;
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  position: sticky; top: 0; z-index: 10;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
}
.mod-header__left { display: flex; align-items: center; gap: 0.875rem; }
.mod-header__icon {
  width: 44px; height: 44px;
  background: linear-gradient(135deg, var(--navy), #2e6a8a);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: var(--gold); flex-shrink: 0;
}
.mod-header__title {
  font-family: 'Fraunces', serif; font-size: 1.4rem; font-weight: 700;
  color: var(--ink); margin: 0 0 0.1rem; line-height: 1.2;
}
.mod-header__sub { font-size: 0.78rem; color: var(--slate); margin: 0; }
.mod-badge {
  font-size: 0.78rem; font-weight: 700; color: #dc2626;
  background: #fff1f2; border: 1.5px solid #fecdd3;
  padding: 0.3rem 0.75rem; border-radius: 20px; white-space: nowrap;
}
.mod-badge--empty { color: #16a34a; background: #f0fdf4; border-color: #bbf7d0; }

/* List */
.mod-list {
  max-width: 760px; margin: 0 auto; padding: 0 1rem;
  display: flex; flex-direction: column; gap: 1rem;
}

/* Card */
.mod-card {
  background: var(--surface); border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  padding: 1.1rem;
  animation: cardIn 0.4s ease both;
  animation-delay: var(--delay, 0s);
  transition: box-shadow 0.2s;
}
.mod-card:hover { box-shadow: 0 4px 20px rgba(26,58,82,0.09); }

@keyframes cardIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Card top row */
.mod-card__top {
  display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;
  margin-bottom: 0.85rem;
}
.reason-badge {
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.4px; color: #fff;
  padding: 0.2rem 0.6rem; border-radius: 50px;
}
.mod-card__news {
  font-size: 0.8rem; font-weight: 600; color: var(--navy);
  flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.mod-card__count {
  display: flex; align-items: center; gap: 0.3rem;
  font-size: 0.72rem; font-weight: 700; color: var(--muted);
}
.mod-card__count--alert { color: #dc2626; }

/* Comment block */
.mod-card__comment {
  display: flex; gap: 0.75rem; margin-bottom: 0.9rem;
}
.mod-card__comment-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, var(--navy), #2e6a8a);
  color: var(--gold); font-size: 0.7rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.mod-card__comment-body { flex: 1; min-width: 0; }
.mod-card__quote {
  background: #f8fafc; border-left: 3px solid #e2e8f0;
  border-radius: 0 8px 8px 0; padding: 0.55rem 0.85rem;
  margin: 0 0 0.45rem;
  font-size: 0.875rem; color: #374151; line-height: 1.55;
  font-style: normal;
}
.mod-card__meta {
  font-size: 0.72rem; color: var(--muted);
  display: flex; flex-wrap: wrap; gap: 0.3rem;
}
.mod-card__meta strong { color: var(--ink); }
.mod-card__desc { font-style: italic; color: var(--slate); }

/* Actions */
.mod-card__actions {
  display: flex; gap: 0.5rem; flex-wrap: wrap;
  padding-top: 0.75rem; border-top: 1px solid var(--border);
}
.mod-action-btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.45rem 0.9rem; border-radius: 8px;
  font-size: 0.78rem; font-weight: 700; font-family: inherit;
  cursor: pointer; transition: all 0.15s; border: 1.5px solid;
}
.mod-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.mod-action-btn--ignore {
  background: #f8fafc; color: var(--slate); border-color: var(--border);
}
.mod-action-btn--ignore:hover:not(:disabled) {
  background: #f1f5f9; border-color: var(--slate);
}
.mod-action-btn--hide {
  background: #fefce8; color: #854d0e; border-color: #fde68a;
}
.mod-action-btn--hide:hover:not(:disabled) {
  background: #fef9c3; border-color: #eab308;
}
.mod-action-btn--delete {
  background: #fff1f2; color: #be123c; border-color: #fecdd3;
}
.mod-action-btn--delete:hover:not(:disabled) {
  background: #ffe4e6; border-color: #ef4444;
}

/* Skeleton */
.mod-card--skeleton { pointer-events: none; }
.skeleton-line {
  border-radius: 6px; display: block;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Spinner */
.mod-spinner {
  display: inline-block; width: 12px; height: 12px;
  border: 2px solid rgba(190,18,60,0.3); border-top-color: #be123c;
  border-radius: 50%; animation: spin 0.5s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Empty */
.mod-empty {
  text-align: center; margin: 4rem auto; max-width: 320px; padding: 0 1.5rem;
}
.mod-empty__icon {
  width: 80px; height: 80px; background: #f0fdf4; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1.25rem; color: #86efac;
}
.mod-empty h3 {
  font-family: 'Fraunces', serif; font-size: 1.1rem; font-weight: 700;
  color: var(--ink); margin: 0 0 0.5rem;
}
.mod-empty p { font-size: 0.875rem; color: var(--slate); margin: 0; }

/* TransitionGroup */
.mod-list-anim-leave-active { transition: all 0.3s ease; position: absolute; }
.mod-list-anim-leave-to { opacity: 0; transform: scale(0.95) translateX(-10px); }
.mod-list-anim-move { transition: transform 0.3s ease; }

/* Toast */
.mod-toast {
  position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
  background: #fff1f2; border: 1.5px solid #fecdd3; border-left: 4px solid #ef4444;
  color: #9f1239; padding: 0.8rem 1.3rem; border-radius: 10px;
  font-size: 0.85rem; font-weight: 600;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 999;
}
.toast-enter-active { transition: all 0.3s cubic-bezier(0.34,1.5,0.64,1); }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from { opacity: 0; transform: translateX(-50%) translateY(16px); }
.toast-leave-to   { opacity: 0; transform: translateX(-50%) translateY(12px); }

@media (max-width: 600px) { .mod-list { padding: 0 0.5rem; } }
</style>