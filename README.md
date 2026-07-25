# Audantra · Calculadora NOM-035

Calculadora interactiva de **sanciones evitadas** bajo la NOM-035-STPS-2018. Mide exposición legal (piso / probable / techo) con desglose por numeral y fundamento en Arts. 992 y 994-V LFT.

**Marca:** [audantra.com](https://audantra.com)

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Publicar en GitHub Pages (gratis)

1. Crea un repositorio público llamado `calculadora-nom035` en GitHub.
2. Sube este proyecto:

```bash
git remote add origin https://github.com/<tu-usuario>/calculadora-nom035.git
git branch -M main
git push -u origin main
```

3. En el repo: **Settings → Pages → Source → GitHub Actions**.
4. El workflow `.github/workflows/deploy.yml` construye y publica en cada push a `main`.
5. URL típica: `https://<tu-usuario>.github.io/calculadora-nom035/`

## Motor de cálculo

- Unidad: **UMA** (no salario mínimo), precargada en $117.31 (vigente 1 feb 2026).
- Rango: 250–5,000 UMA por infracción (Art. 994-V).
- Multiplicación por trabajador afectado e infracciones independientes (Art. 992).
- Numerales del apartado 5 de la NOM-035 según tamaño del centro (≤15 / 16–50 / >50).
- El número principal es el escenario **probable**; el techo legal se muestra como contexto.

## Disclaimer

Estimación informativa. No constituye asesoría legal. El monto real lo determina la autoridad conforme al Art. 992 LFT.
