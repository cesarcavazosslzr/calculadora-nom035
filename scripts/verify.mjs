/**
 * Verifies the worked example from the concept doc (60 trabajadores, 5.1/5.3/5.4).
 * Run: npm run verify
 */
const U = 117.31
const got = {
  piso: 3 * 250 * U * 1,
  probable: 1000 * U * 1 + 1000 * U * 60 + 1000 * U * 1,
  techo: 3 * 5000 * U * 60 * 2,
}
const expected = { piso: 87982.5, probable: 7273220, techo: 211158000 }

let failed = false
for (const key of Object.keys(expected)) {
  const ok = Math.abs(got[key] - expected[key]) < 0.01
  console.log(
    `${ok ? '✓' : '✗'} ${key}: $${got[key].toLocaleString('es-MX')} (esperado $${expected[key].toLocaleString('es-MX')})`,
  )
  if (!ok) failed = true
}

if (failed) process.exit(1)
console.log('Ejemplo trabajado del concepto: OK')
