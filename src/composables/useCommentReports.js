import { ref, reactive } from 'vue'
import { commentReportService } from '../services/api.js'

const reportedCommentIds = reactive(new Set())

export function useCommentReports() {
  const submittingReportId = ref(null)
  const error = ref('')

  function markAsReported(commentId) {
    reportedCommentIds.add(commentId)
  }

  function isReported(commentId) {
    return reportedCommentIds.has(commentId)
  }

  async function submitReport(newsId, commentId, dto) {
    if (submittingReportId.value === commentId) return false
    submittingReportId.value = commentId

    try {
      const res = await commentReportService.report(newsId, commentId, dto)
      const data = res?.data ?? res
      reportedCommentIds.add(commentId)
      return data
    } catch (err) {
      error.value = 'No se pudo enviar el reporte. Intenta nuevamente.'
      setTimeout(() => { error.value = '' }, 3500)
      return null
    } finally {
      submittingReportId.value = null
    }
  }

  return {
    submittingReportId,
    error,
    isReported,
    markAsReported,
    submitReport,
  }
}