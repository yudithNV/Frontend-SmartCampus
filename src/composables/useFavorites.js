
import { ref } from 'vue'
import { favoriteService } from '../services/api.js'


export function useFavorites() {
  const favoriteIds = ref(new Set())
  const togglingId  = ref(null)
  const error       = ref('')


  async function loadFavorites() {
    try {
      const data = await favoriteService.getMy()
      const items = Array.isArray(data) ? data : (data?.data ?? [])
      favoriteIds.value = new Set(items.map(f => f.newsId))
    } catch (err) {
      console.warn('[useFavorites] No se pudo cargar favoritos:', err)
    }
  }

 
  async function toggleFavorite(newsId) {
    if (togglingId.value === newsId) return   // evitar doble-click

    const wasAlreadyFavorite = favoriteIds.value.has(newsId)
    togglingId.value = newsId

    if (wasAlreadyFavorite) {
      favoriteIds.value.delete(newsId)
    } else {
      favoriteIds.value.add(newsId)
    }
    favoriteIds.value = new Set(favoriteIds.value)

    try {
      if (wasAlreadyFavorite) {
        await favoriteService.remove(newsId)
      } else {
        await favoriteService.add(newsId)
      }
    } catch (err) {
      if (wasAlreadyFavorite) {
        favoriteIds.value.add(newsId)
      } else {
        favoriteIds.value.delete(newsId)
      }
      favoriteIds.value = new Set(favoriteIds.value)
      error.value = 'No se pudo actualizar el favorito. Intenta nuevamente.'
      setTimeout(() => { error.value = '' }, 3500)
      console.error('[useFavorites] toggleFavorite error:', err)
    } finally {
      togglingId.value = null
    }
  }

  function isFavorite(newsId) {
    return favoriteIds.value.has(newsId)
  }

  return {
    favoriteIds,
    togglingId,
    error,
    loadFavorites,
    toggleFavorite,
    isFavorite,
  }
}