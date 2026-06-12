const CACHE_NAME = 'ccaf-images-v1'

/**
 * Возвращает URL для отображения изображения, используя Cache API.
 * Если изображение уже закэшировано — использует кэш.
 * Если нет — загружает, кладёт в кэш и возвращает blob-URL.
 * При ошибке (CORS, offline и т.д.) возвращает исходный URL.
 */
export async function getCachedImageBlobUrl(url) {
  if (!url) return null
  if (url.startsWith('blob:') || url.startsWith('data:')) return url

  if (!('caches' in window)) {
    return url
  }

  try {
    const cache = await caches.open(CACHE_NAME)
    let response = await cache.match(url)

    if (!response) {
      response = await fetch(url, { credentials: 'same-origin' })
      if (response.ok) {
        await cache.put(url, response.clone())
      }
    }

    if (!response || !response.ok) {
      return url
    }

    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch (err) {
    console.warn('Image cache failed for', url, err)
    return url
  }
}

/**
 * Очистить весь кэш изображений.
 */
export async function clearImageCache() {
  if (!('caches' in window)) return
  try {
    await caches.delete(CACHE_NAME)
  } catch (err) {
    console.error('Failed to clear image cache', err)
  }
}
