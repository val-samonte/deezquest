export const imageCompression = (src: string, quality = 0.5): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    const onload = (e: Event) => {
      img.removeEventListener('load', onload)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height

      if (ctx && e.target) {
        ctx.drawImage(e.target as HTMLImageElement, 0, 0)
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(e)),
          'image/jpeg',
          quality,
        )
      } else {
        reject(e)
      }
    }

    const onerror = (e: Event) => {
      img.removeEventListener('error', onerror)
      reject(e)
    }

    img.addEventListener('load', onload)
    img.addEventListener('error', onerror)
    img.src = src
  })
}
