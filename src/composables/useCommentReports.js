import { ref, reactive } from 'vue'
import { commentReportService } from '../services/api.js'

export function useCommentReports() {

  const reportedCommentIds = reactive(new Set())
  const submittingReportId = ref(null)
  const error = ref('')

  // Usuario actual para detectar cambios de sesión
  let currentUserId = null

  function getCurrentUserId() {
    return (
      localStorage.getItem('ucb_user_id') ||
      localStorage.getItem('ucb_email') ||
      null
    )
  }

  function resetIfUserChanged() {
    const userId = getCurrentUserId()

    if (userId !== currentUserId) {
      currentUserId = userId

      // Limpiar todos los reportes guardados
      reportedCommentIds.clear()
    }
  }

  function initFromComments(comments) {
    resetIfUserChanged()

    comments.forEach(comment => {
      if (comment.reportedByCurrentUser) {
        reportedCommentIds.add(comment.id)
      }
    })
  }

  function isReported(commentId) {
    resetIfUserChanged()
    return reportedCommentIds.has(commentId)
  }

  async function submitReport(newsId, commentId, dto) {
    resetIfUserChanged()

    if (submittingReportId.value === commentId) {
      return false
    }

    submittingReportId.value = commentId

    try {
      const res = await commentReportService.report(
        newsId,
        commentId,
        dto
      )

      const data = res?.data ?? res

      reportedCommentIds.add(commentId)

      return data
    } catch (err) {
      console.error('[useCommentReports] submitReport:', err)

      error.value = 'No se pudo enviar el reporte. Intenta nuevamente.'

      setTimeout(() => {
        error.value = ''
      }, 3500)

      return null
    } finally {
      submittingReportId.value = null
    }
  }

  return {
    submittingReportId,
    error,
    isReported,
    initFromComments,
    submitReport
  }
}