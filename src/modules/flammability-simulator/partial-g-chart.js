/**
 * Partial-G Flammability Bounding Curve Chart
 * 2D Canvas rendering of flame spread rate vs gravity regimes (0g to 1.0g).
 * Aerospace scientific standard with subpixel resolution & empirical confidence band.
 */

export function drawPartialGChart(o2, psi, flow, currentG) {
  const canvas = document.getElementById('partial-g-chart-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const parent = canvas.parentElement;
  if (!parent) return;

  const dpr = window.devicePixelRatio || 1;
  const displayWidth = parent.clientWidth || 500;
  const displayHeight = parent.clientHeight || 260;

  if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
  }

  ctx.save();
  ctx.scale(dpr, dpr);

  const w = displayWidth;
  const h = displayHeight;
  const padL = 46, padR = 24, padT = 24, padB = 36;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  // Clear background (Deep Void)
  ctx.fillStyle = '#06080C';
  ctx.fillRect(0, 0, w, h);

  // Grid Lines & Axis Labels
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.lineWidth = 1;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#64748B';

  for (let i = 0; i <= 4; i++) {
    const y = padT + (plotH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + plotW, y);
    ctx.stroke();
    const rateVal = ((4 - i) * 2.5).toFixed(1);
    ctx.fillText(`${rateVal}`, 12, y + 3);
  }

  // Y-axis title
  ctx.save();
  ctx.translate(14, padT + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#94A3B8';
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.fillText('SPREAD RATE (mm/s)', 0, 0);
  ctx.restore();

  // Spread Rate function across gravity continuum
  function calcSpreadAtG(gVal) {
    const gPeakBoost = 1.0 + 0.55 * Math.exp(-Math.pow((gVal - 0.16) / 0.18, 2));
    const flowEffect = flow === 0 && gVal === 0 ? 0.3 : 1.0 + Math.min(0.4, flow / 45);
    const o2Factor = Math.pow(Math.max(0.15, (o2 - 15) / 6), 1.25) * Math.pow(psi / 14.7, 0.3);
    return Math.max(0.2, 1.6 * gPeakBoost * flowEffect * o2Factor);
  }

  const maxSpread = 10.0;

  // 1. Shaded Empirical Confidence Interval Band (±14% uncertainty before direct LUCI/FM2 flight data)
  ctx.beginPath();
  for (let i = 0; i <= 50; i++) {
    const gStep = i / 50;
    const rateUpper = calcSpreadAtG(gStep) * 1.14;
    const x = padL + gStep * plotW;
    const y = Math.max(padT, padT + plotH - (rateUpper / maxSpread) * plotH);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  for (let i = 50; i >= 0; i--) {
    const gStep = i / 50;
    const rateLower = calcSpreadAtG(gStep) * 0.86;
    const x = padL + gStep * plotW;
    const y = Math.min(padT + plotH, padT + plotH - (rateLower / maxSpread) * plotH);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
  ctx.fill();

  // 2. Main Bounding Curve Path
  ctx.beginPath();
  for (let i = 0; i <= 50; i++) {
    const gStep = i / 50;
    const rate = calcSpreadAtG(gStep);
    const x = padL + gStep * plotW;
    const y = padT + plotH - (rate / maxSpread) * plotH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2.0;
  ctx.stroke();

  // 3. Subtle Area Fill under Curve
  const fillGrad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
  fillGrad.addColorStop(0, 'rgba(245, 158, 11, 0.20)');
  fillGrad.addColorStop(1, 'rgba(245, 158, 11, 0.01)');
  ctx.lineTo(padL + plotW, padT + plotH);
  ctx.lineTo(padL, padT + plotH);
  ctx.closePath();
  ctx.fillStyle = fillGrad;
  ctx.fill();

  // 4. Key Gravity Landmarks
  const landmarks = [
    { g: 0.00, label: '0g ISS', col: '#38BDF8' },
    { g: 0.16, label: '0.16g Moon', col: '#F43F5E' },
    { g: 0.38, label: '0.38g Mars', col: '#818CF8' },
    { g: 1.00, label: '1g Earth', col: '#10B981' }
  ];

  landmarks.forEach(lm => {
    const x = padL + lm.g * plotW;
    const rate = calcSpreadAtG(lm.g);
    const y = padT + plotH - (rate / maxSpread) * plotH;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x, padT);
    ctx.lineTo(x, padT + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = lm.col;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = lm.col;
    ctx.textAlign = 'center';
    ctx.fillText(lm.label, x, padT + plotH + 16);
  });

  // 5. Current Simulator Position Marker
  const curX = padL + currentG * plotW;
  const curRate = calcSpreadAtG(currentG);
  const curY = padT + plotH - (curRate / maxSpread) * plotH;

  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.arc(curX, curY, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Marker Tooltip
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  const text = `${curRate.toFixed(2)} mm/s`;
  const textX = Math.min(Math.max(curX, padL + 30), padL + plotW - 40);
  ctx.textAlign = 'center';
  ctx.fillText(text, textX, curY - 9);

  ctx.restore();
}
