import { useMemo, useState } from 'react'
import {
  calculate,
  createDefaultCenter,
  createDefaultInput,
  getTier,
  applicableNumerals,
  remapBreachesForTier,
  type CalculatorInput,
  type CenterInput,
} from '../lib/engine'
import type { Nature, NumeralId } from '../lib/constants'

export function useCalculator() {
  const [input, setInput] = useState<CalculatorInput>(() => createDefaultInput())
  const result = useMemo(() => calculate(input), [input])

  const updateUma = (uma: number) => setInput((s) => ({ ...s, uma }))
  const updateProbableFactor = (probableFactor: number) =>
    setInput((s) => ({ ...s, probableFactor }))
  const updateReincidencia = (reincidencia: boolean) =>
    setInput((s) => ({ ...s, reincidencia }))
  const updateAudantraCost = (audantraCost: number) =>
    setInput((s) => ({ ...s, audantraCost }))

  const updateIndirect = (key: keyof CalculatorInput['indirectCosts'], value: number) =>
    setInput((s) => ({
      ...s,
      indirectCosts: { ...s.indirectCosts, [key]: value },
    }))

  const updateCenter = (id: string, patch: Partial<CenterInput>) => {
    setInput((s) => ({
      ...s,
      centers: s.centers.map((c) => {
        if (c.id !== id) return c
        const next = { ...c, ...patch }
        if (patch.workers !== undefined) {
          const fromTier = getTier(c.workers)
          const toTier = getTier(next.workers)
          next.breached = remapBreachesForTier(next.breached, fromTier, toTier)
          next.exposedWorkers = Math.min(next.exposedWorkers, next.workers)
        }
        return next
      }),
    }))
  }

  const toggleBreach = (centerId: string, numeral: NumeralId) => {
    setInput((s) => ({
      ...s,
      centers: s.centers.map((c) => {
        if (c.id !== centerId) return c
        const has = c.breached.includes(numeral)
        return {
          ...c,
          breached: has
            ? c.breached.filter((b) => b !== numeral)
            : [...c.breached, numeral],
        }
      }),
    }))
  }

  const setNatureOverride = (
    centerId: string,
    numeral: NumeralId,
    nature: Nature | null,
  ) => {
    setInput((s) => ({
      ...s,
      centers: s.centers.map((c) => {
        if (c.id !== centerId) return c
        const natureOverrides = { ...c.natureOverrides }
        if (nature === null) delete natureOverrides[numeral]
        else natureOverrides[numeral] = nature
        return { ...c, natureOverrides }
      }),
    }))
  }

  const addCenter = () => {
    setInput((s) => ({
      ...s,
      centers: [...s.centers, createDefaultCenter(s.centers.length + 1, 25)],
    }))
  }

  const removeCenter = (id: string) => {
    setInput((s) => ({
      ...s,
      centers: s.centers.length <= 1 ? s.centers : s.centers.filter((c) => c.id !== id),
    }))
  }

  const selectAllBreaches = (centerId: string) => {
    setInput((s) => ({
      ...s,
      centers: s.centers.map((c) => {
        if (c.id !== centerId) return c
        const tier = getTier(c.workers)
        return { ...c, breached: applicableNumerals(tier).map((n) => n.id) }
      }),
    }))
  }

  const clearBreaches = (centerId: string) => {
    setInput((s) => ({
      ...s,
      centers: s.centers.map((c) =>
        c.id === centerId ? { ...c, breached: [] } : c,
      ),
    }))
  }

  return {
    input,
    result,
    updateUma,
    updateProbableFactor,
    updateReincidencia,
    updateAudantraCost,
    updateIndirect,
    updateCenter,
    toggleBreach,
    setNatureOverride,
    addCenter,
    removeCenter,
    selectAllBreaches,
    clearBreaches,
  }
}
