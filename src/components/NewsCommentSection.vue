<template>
  <div class="comment-section">
    <!-- Header -->
    <div class="comment-header">
      <button
        class="comment-toggle-btn"
        @click="isOpen = !isOpen"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        {{ displayCount }} comentario{{ displayCount !== 1 ? 's' : '' }}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5"
             :style="{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
    </div>

    <Transition name="comment-expand">
      <div v-if="isOpen" class="comment-body">

        <!-- Input nuevo comentario -->
        <div class="comment-input-wrap">
          <div class="comment-avatar">{{ userInitials }}</div>
          <div class="comment-input-area">
            <textarea
              v-model="newBody"
              class="comment-textarea"
              :class="{ 'comment-textarea--filled': newBody.trim() }"
              placeholder="Escribe un comentario..."
              rows="1"
              maxlength="500"
              @input="autoResize"
              @keydown.enter.exact.prevent="submitComment"
            ></textarea>
            <div class="comment-input-actions">
              <span class="comment-char" v-if="newBody.length > 400">
                {{ newBody.length }}/500
              </span>
              <!-- PA: botón deshabilitado si está en blanco (SCRUM-447) -->
              <button
                class="comment-submit-btn"
                :disabled="!newBody.trim() || submitting"
                @click="submitComment"
              >
                <svg v-if="!submitting" width="14" height="14" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                <span v-else class="spinner-xs"></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Cargando comentarios -->
        <div v-if="loading" class="comment-loading">
          <span class="spinner-xs"></span>
          Cargando comentarios...
        </div>

        <!-- Sin comentarios -->
        <div v-else-if="visibleComments.length === 0" class="comment-empty">
          Sé el primero en comentar.
        </div>

        <!-- Lista de comentarios -->
        <TransitionGroup name="comment-list" tag="div" class="comment-list">
          <div
            v-for="comment in visibleComments"
            :key="comment.id"
            class="comment-item"
            :class="{ 'comment-item--hidden': comment.hidden }"
          >
            <!-- Avatar -->
            <div class="comment-avatar comment-avatar--sm">
              <img
                v-if="comment.userAvatarUrl"
                :src="comment.userAvatarUrl"
                :alt="comment.userFullName"
                class="comment-avatar-img"
              />
              <span v-else>{{ getInitials(comment.userFullName) }}</span>
            </div>

            <!-- Burbuja -->
            <div class="comment-bubble-wrap">
              <div class="comment-bubble">
                <span class="comment-author">{{ comment.userFullName }}</span>
                <span v-if="comment.hidden" class="hidden-badge">Oculto</span>
                <p class="comment-text">{{ comment.body }}</p>
              </div>

              <!-- Meta + acciones -->
              <div class="comment-meta">
                <time class="comment-time">
                  {{ formatRelative(comment.createdAt) }}
                </time>

                <!-- Eliminar -->
                <button
                  v-if="comment.isOwn === true"
                  class="comment-action-btn comment-action-btn--delete"
                  title="Eliminar comentario"
                  @click="$emit('delete', comment.id)"
                >
                  Eliminar
                </button>

                <!-- Ocultar -->
                <button
                  v-if="comment.canHide"
                  class="comment-action-btn comment-action-btn--hide"
                  @click="$emit('hide', comment.id)"
                >
                  {{ comment.hidden ? 'Mostrar' : 'Ocultar' }}
                </button>

                <!-- Reportar -->
                <button
                  v-if="comment.isOwn === false"
                  class="comment-action-btn comment-action-btn--report"
                  :class="{ 'comment-action-btn--reported': isReported(comment.id) }"
                  :disabled="isReported(comment.id)"
                  :title="isReported(comment.id)
                    ? 'Ya reportaste este comentario'
                    : 'Reportar comentario'"
                  @click="openReport(comment)"
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  >
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                    <line x1="4" y1="22" x2="4" y2="15"/>
                  </svg>

                  {{ isReported(comment.id) ? 'Ya reportado' : 'Reportar' }}
                </button>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <!-- Error -->
        <p v-if="error" class="comment-error">{{ error }}</p>
        <ReportCommentModal
          :visible="showReportModal"
          :comment-body="reportingComment?.body || ''"
          :submitting="submittingReportId === reportingComment?.id"
          ref="reportModalRef"
          @close="closeReport"
          @submit="handleReportSubmit"
        />

        <Transition name="comment-expand">
          <div v-if="reportSuccess" class="report-success-toast">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            >
              <polyline points="20 6 9 17 4 12"/>
            </svg>

            Reporte enviado. Gracias por contribuir a la comunidad.
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ReportCommentModal from './ReportCommentModal.vue'
import { useCommentReports } from '../composables/useCommentReports.js'

const props = defineProps({
  newsId:       { type: Number,  required: true }, 
  comments:     { type: Array,   default: () => [] },
  commentCount: { type: Number,  default: 0 },
  loading:      { type: Boolean, default: false },
  error:        { type: String,  default: '' },
  userInitials: { type: String,  default: '?' },
  submitting:   { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'delete', 'hide'])

const { submittingReportId, isReported, submitReport } = useCommentReports()

const isOpen  = ref(false)
const newBody = ref('')

// Estado del modal de reporte
const showReportModal  = ref(false)
const reportingComment = ref(null)
const reportSuccess    = ref(false)
const reportModalRef   = ref(null)

const displayCount = computed(() =>
  props.comments.length > 0 ? props.comments.length : props.commentCount
)

const visibleComments = computed(() => props.comments)

function openReport(comment) {
  reportingComment.value = comment
  showReportModal.value = true
}

function closeReport() {
  showReportModal.value = false
  reportingComment.value = null
  reportModalRef.value?.reset()
}

async function handleReportSubmit(dto) {
  if (!reportingComment.value) return

  const result = await submitReport(
    props.newsId,
    reportingComment.value.id,
    dto
  )

  if (result) {
    closeReport()

    reportSuccess.value = true

    setTimeout(() => {
      reportSuccess.value = false
    }, 3500)
  }
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatRelative(dateStr) {
  if (!dateStr) return ''

  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)

  if (m < 1)  return 'Ahora'
  if (m < 60) return `Hace ${m} min`
  if (h < 24) return `Hace ${h}h`
  if (d < 7)  return `Hace ${d}d`

  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  })
}

function autoResize(e) {
  const ta = e.target
  ta.style.height = 'auto'
  ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
}

async function submitComment() {
  const body = newBody.value.trim()

  if (!body) return

  emit('submit', body)

  newBody.value = ''
}
</script>

<style scoped>
.comment-section {
  border-top: 1px solid #f1f5f9;
  padding-top: 0.65rem;
}

/* Toggle */
.comment-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748b;
  font-family: inherit;
  padding: 0.3rem 0.1rem;
  transition: color 0.15s;
}
.comment-toggle-btn:hover { color: #1a3a52; }

/* Body expandible */
.comment-body { padding-top: 0.85rem; display: flex; flex-direction: column; gap: 0.85rem; }

/* Input area */
.comment-input-wrap {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
}

.comment-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, #1a3a52, #2e6a8a);
  color: #FFD200; font-size: 0.72rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; letter-spacing: 0.3px; overflow: hidden;
}
.comment-avatar-img { width: 100%; height: 100%; object-fit: cover; }
.comment-avatar--sm { width: 32px; height: 32px; font-size: 0.65rem; }

.comment-input-area { flex: 1; }

.comment-textarea {
  width: 100%;
  min-height: 38px;
  max-height: 120px;
  padding: 0.55rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 20px;
  font-size: 0.875rem;
  font-family: inherit;
  color: #1e293b;
  background: #f8fafc;
  resize: none;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s, border-radius 0.18s;
  line-height: 1.5;
  overflow-y: hidden;
}
.comment-textarea:focus,
.comment-textarea--filled {
  border-color: #1a3a52;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(26,58,82,0.07);
}
.comment-textarea::placeholder { color: #94a3b8; }

.comment-input-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.4rem;
}

.comment-char { font-size: 0.7rem; color: #f59e0b; font-weight: 600; }

.comment-submit-btn {
  width: 32px; height: 32px;
  background: #1a3a52;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #FFD200;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, transform 0.15s;
  flex-shrink: 0;
}
.comment-submit-btn:hover:not(:disabled) {
  background: #2e6a8a;
  transform: scale(1.08);
}
.comment-submit-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

/* Estados */
.comment-loading,
.comment-empty {
  font-size: 0.82rem;
  color: #94a3b8;
  text-align: center;
  padding: 0.75rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.comment-error {
  font-size: 0.78rem;
  color: #dc2626;
  text-align: center;
  margin: 0;
}

/* Lista */
.comment-list { display: flex; flex-direction: column; gap: 0.65rem; }

.comment-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}
.comment-item--hidden { opacity: 0.55; }

.comment-bubble-wrap { flex: 1; min-width: 0; }

.comment-bubble {
  background: #f8fafc;
  border-radius: 0 12px 12px 12px;
  padding: 0.6rem 0.875rem;
  border: 1px solid #e2e8f0;
}

.comment-author {
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
  color: #1a3a52;
  margin-bottom: 0.18rem;
}

.hidden-badge {
  display: inline-block;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  background: #fef3c7;
  color: #92400e;
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 0.4rem;
  vertical-align: middle;
}

.comment-text {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.55;
  margin: 0;
  word-break: break-word;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
  padding-left: 0.25rem;
}


.comment-action-btn--report {
  color: #94a3b8;
}

.comment-action-btn--report:hover:not(:disabled) {
  color: #d97706;
}

.comment-action-btn--reported {
  color: #d97706 !important;
  cursor: default;
  opacity: 0.75;
}

.report-success-toast {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-left: 3px solid #16a34a;

  color: #15803d;
  font-size: 0.78rem;
  font-weight: 600;

  padding: 0.55rem 0.9rem;
  border-radius: 8px;
  margin-top: 0.5rem;
}


.comment-time {
  font-size: 0.72rem;
  color: #94a3b8;
}

.comment-action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 600;
  font-family: inherit;
  padding: 0;
  transition: color 0.15s;
}
.comment-action-btn--delete { color: #ef4444; }
.comment-action-btn--delete:hover { color: #b91c1c; }
.comment-action-btn--hide { color: #64748b; }
.comment-action-btn--hide:hover { color: #1a3a52; }

/* Spinner */
.spinner-xs {
  display: inline-block; width: 11px; height: 11px;
  border: 2px solid rgba(255,210,0,0.3); border-top-color: #FFD200;
  border-radius: 50%; animation: spin 0.55s linear infinite; flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Transiciones */
.comment-expand-enter-active,
.comment-expand-leave-active { transition: all 0.25s ease; overflow: hidden; }
.comment-expand-enter-from,
.comment-expand-leave-to { opacity: 0; max-height: 0; transform: translateY(-6px); }
.comment-expand-enter-to,
.comment-expand-leave-from { max-height: 1000px; }

.comment-list-enter-active { transition: all 0.22s ease; }
.comment-list-leave-active  { transition: all 0.18s ease; }
.comment-list-enter-from    { opacity: 0; transform: translateY(-8px); }
.comment-list-leave-to      { opacity: 0; transform: translateX(-10px); }
.comment-list-move          { transition: transform 0.2s ease; }
</style>