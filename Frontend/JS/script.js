document.addEventListener('DOMContentLoaded', () => {
  const actions = document.getElementById('entryActions');
  const dots = document.getElementById('loadingDots');
  window.setTimeout(() => {
    dots.hidden = true;
    actions.hidden = false;
  }, 1800);
});
