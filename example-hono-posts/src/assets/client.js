function triggerLoadableBtns() {
  const loadableBtns = document.querySelectorAll('[data-loadable-btn="true"]');

  for (const btn of loadableBtns) {
    console.log(btn.id);
    if (!btn.id) {
      continue;
    }
    const loadingSpan = document.createElement('span');
    loadingSpan.classList.add('loading', 'loading-spinner');
    btn.setAttribute('disabled', true);
    btn.insertBefore(loadingSpan, btn.firstChild);
  }
}

window.onbeforeunload = function (event) {
  console.log('Test');
  triggerLoadableBtns();
};
