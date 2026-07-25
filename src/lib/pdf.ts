import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { UMA_VIGENCIA } from './constants'
import type { CalculatorInput, FullResult } from './engine'
import { tierLabel } from './engine'
import { formatMxn } from './format'

export function downloadReport(input: CalculatorInput, result: FullResult) {
  const doc = new jsPDF()
  const date = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(25, 23, 35)
  doc.text('Audantra', 14, 20)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(95, 98, 115)
  doc.text('Calculadora de sanciones evitadas · NOM-035', 14, 28)
  doc.setFontSize(9)
  doc.text(`Generado: ${date}  ·  UMA: $${input.uma.toFixed(2)} (${UMA_VIGENCIA})`, 14, 34)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(106, 79, 203)
  doc.text(formatMxn(result.probable.total), 14, 50)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(60, 62, 73)
  doc.text('Exposición probable que evitas al cumplir', 14, 57)

  doc.setFontSize(9)
  doc.setTextColor(95, 98, 115)
  doc.text(
    `Rango: ${formatMxn(result.piso.total)} (piso)  →  ${formatMxn(result.techo.total)} (techo legal)`,
    14,
    64,
  )

  let y = 74
  for (const center of result.probable.centers) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(25, 23, 35)
    doc.text(
      `${center.center.name} · ${center.center.workers} trabajadores · ${tierLabel(center.tier)}`,
      14,
      y,
    )
    y += 4

    autoTable(doc, {
      startY: y,
      head: [['Numeral', 'Obligación', 'Fórmula', 'Monto']],
      body: center.lines.map((l) => [
        l.numeral,
        l.title,
        l.formula,
        formatMxn(l.amount, true),
      ]),
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [25, 23, 35] },
      margin: { left: 14, right: 14 },
    })

    const docWithTable = doc as jsPDF & { lastAutoTable?: { finalY: number } }
    y = (docWithTable.lastAutoTable?.finalY ?? y) + 6
    if (center.reincidenciaApplied) {
      doc.setFontSize(8)
      doc.setTextColor(178, 106, 18)
      doc.text('Reincidencia aplicada (×2) — Art. 992 LFT', 14, y)
      y += 8
    }
  }

  if (y > 250) {
    doc.addPage()
    y = 20
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(25, 23, 35)
  doc.text('Fundamento legal', 14, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(60, 62, 73)
  const legal = [
    '• Unidad de cuenta: UMA (Art. 992 LFT), no salario mínimo.',
    '• Rango: 250 a 5,000 UMA por infracción (Art. 994-V LFT).',
    '• Multiplicación por trabajador afectado (Art. 992 LFT).',
    '• Infracciones independientes por cada numeral incumplido (Art. 992 LFT).',
    '• Obligaciones: NOM-035-STPS-2018, numeral 5, según al tamaño del centro.',
  ]
  for (const line of legal) {
    doc.text(line, 14, y)
    y += 4.5
  }

  y += 6
  doc.setFontSize(7)
  doc.setTextColor(95, 98, 115)
  const disclaimer =
    'Disclaimer: estimación con fines informativos. No constituye asesoría legal. El monto real lo determina la autoridad conforme a los criterios del Art. 992 LFT (intencionalidad, gravedad, daños, capacidad económica y reincidencia). Cumplir reduce la contingencia a ~0; no genera un “ahorro” contable.'
  const split = doc.splitTextToSize(disclaimer, 182)
  doc.text(split, 14, y)

  doc.save(`audantra-nom035-exposicion-${Date.now()}.pdf`)
}
