import { ref, reactive } from 'vue'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081'

function getAuthHeaders() {
  const token = localStorage.getItem('ucb_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

export function useNewsInteractions() {
  // ── Reacciones ──────────────────────────────────────────────────────────
  const reactions = reactive({})       // { [newsId]: { counts, myReaction, total } }
  const reactionLoading = ref(null)    // newsId que está procesando

  async function loadReactions(newsId) {
    try {
      const res = await fetch(`${API_BASE}/api/news/${newsId}/reactions`, {
        headers: getAuthHeaders(), mode: 'cors'
      })
      const data = await res.json()
      reactions[newsId] = data.data || data
    } catch (err) {
      console.error('[useNewsInteractions] loadReactions:', err)
    }
  }

  async function toggleReaction(newsId, reactionType) {
    if (reactionLoading.value === newsId) return
    reactionLoading.value = newsId

    // Optimistic update
    const prev = reactions[newsId] ? { ...reactions[newsId] } : null
    if (reactions[newsId]) {
      const cur = reactions[newsId].myReaction
      if (cur === reactionType) {
        // Toggle off
        reactions[newsId].counts[reactionType] = Math.max(0, (reactions[newsId].counts[reactionType] || 1) - 1)
        reactions[newsId].total = Math.max(0, (reactions[newsId].total || 1) - 1)
        reactions[newsId].myReaction = null
      } else {
        // Cambiar reacción
        if (cur) {
          reactions[newsId].counts[cur] = Math.max(0, (reactions[newsId].counts[cur] || 1) - 1)
        } else {
          reactions[newsId].total = (reactions[newsId].total || 0) + 1
        }
        reactions[newsId].counts[reactionType] = (reactions[newsId].counts[reactionType] || 0) + 1
        reactions[newsId].myReaction = reactionType
      }
    }

    try {
      const res = await fetch(`${API_BASE}/api/news/${newsId}/reactions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        mode: 'cors',
        body: JSON.stringify({ reactionType })
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      reactions[newsId] = data.data || data
    } catch {
      if (prev) reactions[newsId] = prev  // revertir
    } finally {
      reactionLoading.value = null
    }
  }

  // ── Comentarios ─────────────────────────────────────────────────────────
  const comments = reactive({})        // { [newsId]: CommentResponseDTO[] }
  const commentLoading = ref(null)
  const commentError = ref('')

  async function loadComments(newsId) {
    commentLoading.value = newsId
    try {
      const res = await fetch(`${API_BASE}/api/news/${newsId}/comments`, {
        headers: getAuthHeaders(), mode: 'cors'
      })
      const data = await res.json()
      comments[newsId] = data.data || data
    } catch (err) {
      console.error('[useNewsInteractions] loadComments:', err)
    } finally {
      commentLoading.value = null
    }
  }

  async function postComment(newsId, body) {
    const trimmed = body.trim()
    if (!trimmed) return null

    try {
      const res = await fetch(`${API_BASE}/api/news/${newsId}/comments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        mode: 'cors',
        body: JSON.stringify({ body: trimmed })
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const newComment = data.data || data
      if (!comments[newsId]) comments[newsId] = []
      comments[newsId].unshift(newComment)  // más reciente arriba
      return newComment
    } catch (err) {
      commentError.value = 'No se pudo publicar el comentario.'
      setTimeout(() => { commentError.value = '' }, 3500)
      return null
    }
  }

  async function deleteComment(newsId, commentId) {
    try {
      const res = await fetch(
        `${API_BASE}/api/news/${newsId}/comments/${commentId}`,
        { method: 'DELETE', headers: getAuthHeaders(), mode: 'cors' }
      )
      if (!res.ok) throw new Error()
      if (comments[newsId]) {
        comments[newsId] = comments[newsId].filter(c => c.id !== commentId)
      }
    } catch {
      commentError.value = 'No se pudo eliminar el comentario.'
      setTimeout(() => { commentError.value = '' }, 3500)
    }
  }

  async function toggleHideComment(newsId, commentId) {
    try {
      const res = await fetch(
        `${API_BASE}/api/news/${newsId}/comments/${commentId}/hide`,
        { method: 'PATCH', headers: getAuthHeaders(), mode: 'cors' }
      )
      if (!res.ok) throw new Error()
      const data = await res.json()
      const updated = data.data || data
      if (comments[newsId]) {
        const idx = comments[newsId].findIndex(c => c.id === commentId)
        if (idx !== -1) comments[newsId][idx] = updated
      }
    } catch {
      commentError.value = 'No se pudo cambiar la visibilidad.'
      setTimeout(() => { commentError.value = '' }, 3500)
    }
  }

  return {
    reactions,
    reactionLoading,
    loadReactions,
    toggleReaction,
    comments,
    commentLoading,
    commentError,
    loadComments,
    postComment,
    deleteComment,
    toggleHideComment
  }
}