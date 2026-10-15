Auth.requireAuth();
UI.renderBottomNav('cabinet');

const user = Auth.currentUser();
let currentFilter = 'todas';
let searchQuery = '';

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function filteredPlants() {
  let list = Plants.listForUser(user.id);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(
      p =>
        p.nome.toLowerCase().includes(q) ||
        (p.especie && p.especie.toLowerCase().includes(q)) ||
        p.localizacao.toLowerCase().includes(q)
    );
  }
  if (currentFilter === 'rega') {
    list = list.filter(p => Plants.getStatus(p) === 'rega');
  } else if (currentFilter === 'adubar') {
    list = list.filter(p => Plants.getStatus(p) === 'adubar');
  }
  return list;
}

function renderList() {
  const list = filteredPlants();
  const container = document.getElementById('plant-list');
  const empty = document.getElementById('empty-state');

  if (!list.length) {
    container.innerHTML = '';
    empty.hidden = false;
    empty.textContent =
      searchQuery || currentFilter !== 'todas'
        ? 'Nenhuma planta corresponde à pesquisa ou filtro.'
        : 'Ainda não tem plantas. Toque em + para adicionar.';
    return;
  }

  empty.hidden = true;
  container.innerHTML = list
    .map(plant => {
      const status = Plants.getStatus(plant);
      const badge = Plants.badgeForStatus(status);
      const next = Plants.nextWateringLabel(plant);
      const editUrl = 'editar-planta.html?id=' + encodeURIComponent(plant.id);
      return (
        '<article class="plant-card" data-href="' +
        editUrl +
        '">' +
        '<div class="plant-card-image-wrap">' +
        '<img src="' +
        escapeHtml(plant.image) +
        '" alt="' +
        escapeHtml(plant.nome) +
        '">' +
        '<span class="plant-badge ' +
        badge.class +
        '">' +
        '<span class="material-icons-outlined" style="font-size:14px">' +
        badge.icon +
        '</span>' +
        badge.text +
        '</span></div>' +
        '<div class="plant-card-body">' +
        '<div class="plant-card-top">' +
        '<div><h3 class="plant-name">' +
        escapeHtml(plant.nome) +
        '</h3>' +
        '<p class="plant-location">' +
        escapeHtml(plant.localizacao) +
        '</p></div>' +
        '<button type="button" class="plant-menu-btn" data-edit="' +
        plant.id +
        '" aria-label="Opções">' +
        '<span class="material-icons-outlined">more_vert</span></button>' +
        '</div>' +
        '<p class="plant-next">' +
        escapeHtml(next) +
        '</p></div></article>'
      );
    })
    .join('');

  container.querySelectorAll('.plant-menu-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      window.location.href = 'editar-planta.html?id=' + encodeURIComponent(btn.dataset.edit);
    });
  });

  container.querySelectorAll('.plant-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function () {
      window.location.href = card.dataset.href;
    });
  });
}

document.querySelectorAll('.filter-pills .pill').forEach(pill => {
  pill.addEventListener('click', function () {
    document.querySelectorAll('.filter-pills .pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    currentFilter = pill.dataset.filter;
    renderList();
  });
});

const searchBar = document.getElementById('search-bar');
const searchInput = document.getElementById('search-input');

document.getElementById('btn-search-toggle').addEventListener('click', function () {
  searchBar.hidden = !searchBar.hidden;
  if (!searchBar.hidden) searchInput.focus();
});

document.getElementById('btn-search-clear').addEventListener('click', function () {
  searchQuery = '';
  searchInput.value = '';
  searchBar.hidden = true;
  renderList();
});

searchInput.addEventListener('input', function () {
  searchQuery = searchInput.value.trim();
  renderList();
});

renderList();
