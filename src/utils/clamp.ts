// v1
export const clamp = (value: number, min?: number, max?: number) => {
  if (typeof min === 'number') {
    value = Math.max(value, min)
  }
  if (typeof max === 'number') {
    value = Math.min(value, max)
  }
  return value
}
