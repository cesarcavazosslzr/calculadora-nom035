import NumberFlow from '@number-flow/react'

interface Props {
  value: number
  className?: string
}

export function AnimatedAmount({ value, className }: Props) {
  return (
    <span className={className}>
      <NumberFlow
        value={value}
        format={{
          style: 'currency',
          currency: 'MXN',
          maximumFractionDigits: 0,
        }}
        locales="es-MX"
        transformTiming={{ duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
        spinTiming={{ duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
      />
    </span>
  )
}
