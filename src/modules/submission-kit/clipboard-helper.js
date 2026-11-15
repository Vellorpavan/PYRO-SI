/**
 * Modern Clipboard Helper
 * Replaces deprecated document.execCommand with navigator.clipboard.writeText
 */

export async function copySubmissionBlock(elementId, btnEl) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const text = el.innerText || el.textContent;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Safe fallback for non-HTTPS local file contexts
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    if (btnEl) {
      const origHtml = btnEl.innerHTML;
      btnEl.innerHTML = '<i class="fa-solid fa-check mr-1 text-emeraldSafe"></i>COPIED TO CLIPBOARD!';
      btnEl.classList.add('bg-emeraldSafe/20', 'text-emeraldSafe', 'border-emeraldSafe');
      setTimeout(() => {
        btnEl.innerHTML = origHtml;
        btnEl.classList.remove('bg-emeraldSafe/20', 'text-emeraldSafe', 'border-emeraldSafe');
      }, 2200);
    }
  } catch (err) {
    console.error('Failed to copy text: ', err);
    if (btnEl) {
      btnEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation mr-1 text-crimsonAlert"></i>COPY FAILED';
    }
  }
}
