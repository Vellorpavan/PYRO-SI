/**
 * Tab Router & View Switcher
 */

export function switchMainTab(tabId) {
  // Hide all sections
  document.querySelectorAll('.tab-section').forEach(sec => {
    sec.classList.add('hidden');
  });

  // Remove active class from all tabs
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.classList.remove('active-tab', 'bg-cyanHud/15', 'text-cyanHud', 'border-cyanHud/60', 'shadow-[0_0_12px_rgba(0,240,255,0.2)]');
    btn.classList.add('bg-panelLight/60', 'text-slate-300', 'border-slate-700');
  });

  // Show selected section
  const targetSection = document.getElementById(tabId);
  if (targetSection) {
    targetSection.classList.remove('hidden');
  }

  // Highlight active button
  const activeBtn = document.getElementById('btn-' + tabId);
  if (activeBtn) {
    activeBtn.classList.add('active-tab', 'bg-cyanHud/15', 'text-cyanHud', 'border-cyanHud/60', 'shadow-[0_0_12px_rgba(0,240,255,0.2)]');
    activeBtn.classList.remove('bg-panelLight/60', 'text-slate-300', 'border-slate-700');
  }

  // Scroll to top of main workspace
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
