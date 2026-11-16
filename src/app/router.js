/**
 * Tab Router & View Switcher
 * Supports Left Sidebar & Top Tabs
 */

export function switchMainTab(tabId) {
  if (tabId === 'tab-copilot') tabId = 'tab-sicopilot';

  // Hide all sections
  document.querySelectorAll('.tab-section').forEach(sec => {
    sec.classList.add('hidden');
  });

  // Remove active state from all sidebar and navigation buttons
  document.querySelectorAll('.sidebar-nav-btn, .nav-tab-btn').forEach(btn => {
    btn.classList.remove('active-tab');
    if (btn.classList.contains('nav-tab-btn')) {
      btn.classList.remove('bg-purple-700', 'text-white');
      btn.classList.add('bg-slate-100', 'text-slate-600');
    }
  });

  // Show selected section
  const targetSection = document.getElementById(tabId);
  if (targetSection) {
    targetSection.classList.remove('hidden');
  }

  // Highlight active button (supports both #btn-tab-* and #sidebar-tab-*)
  const activeBtn = document.getElementById('btn-' + tabId) || document.getElementById('sidebar-' + tabId);
  if (activeBtn) {
    activeBtn.classList.add('active-tab');
  }

  // Also highlight any matching secondary tab button
  const altBtn = document.getElementById('btn-' + tabId);
  if (altBtn) {
    altBtn.classList.add('active-tab');
    if (altBtn.classList.contains('nav-tab-btn')) {
      altBtn.classList.remove('bg-slate-100', 'text-slate-600');
      altBtn.classList.add('bg-purple-700', 'text-white');
    }
  }
  const sidebarBtn = document.getElementById('sidebar-' + tabId);
  if (sidebarBtn) sidebarBtn.classList.add('active-tab');

  // Handle 3D Globe and 3D Flame canvas re-parenting between Home and Lab views
  const globeEl = document.getElementById('godeye-globe-container');
  const flameEl = document.querySelector('#home-flame-slot canvas') || document.querySelector('#lab-flame-slot canvas') || document.getElementById('flame-physics-canvas');
  if (tabId === 'tab-godeye') {
    const labGlobe = document.getElementById('lab-globe-slot');
    const labFlame = document.getElementById('lab-flame-slot');
    if (labGlobe && globeEl && !labGlobe.contains(globeEl)) labGlobe.appendChild(globeEl);
    if (labFlame && flameEl && !labFlame.contains(flameEl)) labFlame.appendChild(flameEl);
  } else if (tabId === 'tab-home') {
    const homeGlobe = document.getElementById('home-globe-slot');
    const homeFlame = document.getElementById('home-flame-slot');
    if (homeGlobe && globeEl && !homeGlobe.contains(globeEl)) homeGlobe.appendChild(globeEl);
    if (homeFlame && flameEl && !homeFlame.contains(flameEl)) homeFlame.appendChild(flameEl);
  }

  // Trigger resize event for Three.js and 2D canvas recalculation
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 50);
  window.dispatchEvent(new Event('resize'));

  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
