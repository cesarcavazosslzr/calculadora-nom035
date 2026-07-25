const mxn = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

const mxnExact = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const compact = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  notation: 'compact',
  maximumFractionDigits: 2,
})

export function formatMxn(value: number, exact = false): string {
  return exact ? mxnExact.format(value) : mxn.format(value)
}

export function formatCompact(value: number): string {
  return compact.format(value)
}

export function formatUma(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}
