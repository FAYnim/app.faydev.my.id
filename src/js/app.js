(function () {
  'use strict';

  const appGrid = document.getElementById('appGrid');
  const searchInput = document.getElementById('searchInput');
  const filterCategory = document.getElementById('filterCategory');
  const filterTech = document.getElementById('filterTech');
  const appCountNumber = document.getElementById('appCountNumber');
  const resultsInfo = document.getElementById('resultsInfo');
  const emptyState = document.getElementById('emptyState');

  let apps = [];
  let categories = [];
  let techStacks = [];

  async function init() {
    try {
      const response = await fetch('data.json');
      if (!response.ok) throw new Error('Failed to load data');
      apps = await response.json();
    } catch (err) {
      console.error('Error loading app data:', err);
      appGrid.innerHTML = '<p style="color:var(--text-tertiary);grid-column:1/-1;text-align:center;padding:40px;">Failed to load applications.</p>';
      return;
    }

    // Set total count
    appCountNumber.textContent = apps.length;

    // Extract unique categories and tech stacks
    categories = [...new Set(apps.map(a => a.category))].sort();
    techStacks = [...new Set(apps.flatMap(a => a.techStack))].sort();

    populateFilters();
    renderCards(apps);
    bindEvents();
  }

	// Filter
  function populateFilters() {
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      filterCategory.appendChild(opt);
    });

    techStacks.forEach(tech => {
      const opt = document.createElement('option');
      opt.value = tech;
      opt.textContent = tech;
      filterTech.appendChild(opt);
    });
  }

  function renderCards(data) {
    if (data.length === 0) {
      appGrid.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    appGrid.innerHTML = data.map(app => {
      const statusClass = app.status.toLowerCase();
      const initial = app.name.charAt(0);
      const techChips = app.techStack
        .map(t => `<span class="card-chip">${escapeHtml(t)}</span>`)
        .join('');

      return `
        <article class="card">
          <div class="card-top">
            <div class="card-logo">
              <img
                src="${escapeHtml(app.logo)}"
                alt="${escapeHtml(app.name)} logo"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
              >
              <span class="card-logo-fallback" style="display:none;">${escapeHtml(initial)}</span>
            </div>
            <span class="card-status card-status--${statusClass}">${escapeHtml(app.status)}</span>
          </div>
          <h3 class="card-name">${escapeHtml(app.name)}</h3>
          <p class="card-desc">${escapeHtml(app.description)}</p>
          <div class="card-tech">${techChips}</div>
          <div class="card-action">
            <a href="${escapeHtml(app.url)}" target="_blank" rel="noopener noreferrer" class="card-btn">
              Open App <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
          </div>
        </article>
      `;
    }).join('');
  }

  // ─── Filter & Search Logic ────────────────────────────────────────────────
  function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const selectedCategory = filterCategory.value;
    const selectedTech = filterTech.value;

    let filtered = apps;

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    // Tech filter
    if (selectedTech) {
      filtered = filtered.filter(a => a.techStack.includes(selectedTech));
    }

    // Search
    if (query) {
      filtered = filtered.filter(a => {
        const nameMatch = a.name.toLowerCase().includes(query);
        const descMatch = a.description.toLowerCase().includes(query);
        const techMatch = a.techStack.some(t => t.toLowerCase().includes(query));
        return nameMatch || descMatch || techMatch;
      });
    }

    // Results info
    const isFiltered = query || selectedCategory || selectedTech;
    if (isFiltered) {
      resultsInfo.textContent = `Showing ${filtered.length} of ${apps.length} applications`;
    } else {
      resultsInfo.textContent = '';
    }

    renderCards(filtered);
  }

  // ─── Event Bindings ───────────────────────────────────────────────────────
  function bindEvents() {
    searchInput.addEventListener('input', debounce(applyFilters, 200));
    filterCategory.addEventListener('change', applyFilters);
    filterTech.addEventListener('change', applyFilters);
  }

  // ─── Utilities ────────────────────────────────────────────────────────────
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // ─── Boot ─────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);
})();
