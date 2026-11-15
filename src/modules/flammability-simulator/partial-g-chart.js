/**
 * Partial-G Flammability Bounding Curve Chart
 * 2D Canvas rendering of flame spread rate vs gravity regimes (0g to 1.0g).
 */

export function drawPartialGChart(o2, psi, flow, currentG) {
  const canvas = document.getElementById('partial-g-chart-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const parent = canvas.parentElement;
  if (!parent) return;

  canvas.width = parent.clientWidth || 500;
  canvas.height = parent.clientHeight || 260;

  const w = canvas.width;
  const h = canvas.height;
  const padL = 42, padR = 18, padT = 22, padB = 34;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  // Clear background
  ctx.fillStyle = '#06080e';
  ctx.fillRect(0, 0, w, h);

  // Grid Lines & Axis Labels
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#64748b';

  for (let i = 0; i <= 4; i++) {
    const y = padT + (plotH / 4) * i;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
    const rateVal = ((4 - i) * 2.5).toFixed(1);
    ctx.fillText(`${rateVal}`, 8, y + 3);
  }

  // Spread Rate function across gravity continuum
  function calcSpreadAtG(gVal) {
    const gPeakBoost = 1.0 + 0.55 * Math.exp(-Math.pow((gVal - 0.16) / 0.18, 2));
    const flowEffect = flow === 0 && gVal === 0 ? 0.3 : 1.0 + Math.min(0.4, flow / 45);
    const o2Factor = Math.pow(Math.max(0.15, (o2 - 15) / 6), 1.25) * Math.pow(psi / 14.7, 0.3);
    return Math.max(0.2, 1.6 * gPeakBoost * flowEffect * o2Factor);
  }

  const maxSpread = 10.0;

  // Draw Curve Path
  ctx.beginPath();
  for (let i = 0; i <= 50; i++) {
    const gStep = i / 50;
    const rate = calcSpreadAtG(gStep);
    const x = padL + gStep * plotW;
    const y = padT + plotH - (rate / maxSpread) * plotH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = '#ff6b00';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Area Fill under Curve
  const fillGrad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
  fillGrad.addColorStop(0, 'rgba(255, 107, 0, 0.35)');
  fillGrad.addColorStop(1, 'rgba(255, 107, 0, 0.0)');
  ctx.lineTo(padL + plotW, padT + plotH);
  ctx.lineTo(padL, padT + plotH);
  ctx.closePath();
  ctx.fillStyle = fillGrad;
  ctx.fill();

  // Key Gravity Landmarks
  const landmarks = [
    { g: 0.00, label: '0g (ISS)', col: '#00f0ff' },
    { g: 0.16, label: '0.16g (Moon)', col: '#ff2a54' },
    { g: 0.38, label: '0.38g (Mars)', col: '#a855f7' },
    { g: 1.00, label: '1g (Earth)', col: '#00e676' }
  ];

  landmarks.forEach(lm => {
    const x = padL + lm.g * plotW;
    const rate = calcSpreadAtG(lm.g);
    const y = padT + plotH - (rate / maxSpread) * plotH;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = lm.col;
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = lm.col;
    ctx.fillText(lm.label, x - 18, padT + plotH + 16);
  });

  // Current Simulator Position Marker
  const curX = padL + currentG * plotW;
  const curRate = calcSpreadAtG(currentG);
  const curY = padT + plotH - (curRate / maxSpread) * plotH;

  ctx.fillStyle = '#00f0ff';
  ctx.beginPath(); ctx.arc(curX, curY, 6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillText(`CURRENT: ${curRate.toFixed(2)} mm/s`, Math.min(curX + 8, w - 120), curY - 8);
}
