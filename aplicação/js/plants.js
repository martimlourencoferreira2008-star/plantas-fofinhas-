const Plants = (function () {
  const FERT_INTERVAL_DAYS = 30;
  const DAY_MS = 86400000;

  function listForUser(userId) {
    return DB.getPlants().filter(p => p.userId === userId);
  }

  function getById(id) {
    return DB.getPlants().find(p => p.id === id) || null;
  }

  function getStatus(plant) {
    const nextWater = plant.lastWatered + plant.frequenciaDias * DAY_MS;
    const now = Date.now();
    if (now >= nextWater) return 'rega';
    const nextFert = plant.lastFertilized + FERT_INTERVAL_DAYS * DAY_MS;
    if (now >= nextFert) return 'adubar';
    return 'saudavel';
  }

  function badgeForStatus(status) {
    if (status === 'rega') {
      return { class: 'badge-rega', icon: 'water_drop', text: 'Precisa de Água' };
    }
    if (status === 'adubar') {
      return { class: 'badge-adubar', icon: 'science', text: 'Adubar' };
    }
    return { class: 'badge-saudavel', icon: 'eco', text: 'Saudável' };
  }

  function nextWateringLabel(plant) {
    const next = plant.lastWatered + plant.frequenciaDias * DAY_MS;
    const diffDays = Math.ceil((next - Date.now()) / DAY_MS);
    if (diffDays <= 0) return 'Próxima Rega: Hoje';
    if (diffDays === 1) return 'Próxima Rega: amanhã';
    return 'Próxima Rega: em ' + diffDays + ' dias';
  }

  function create(userId, data) {
    const plants = DB.getPlants();
    const plant = {
      id: DB.uuid(),
      userId,
      nome: data.nome,
      especie: data.especie || '',
      localizacao: data.localizacao,
      frequenciaDias: parseInt(data.frequenciaDias, 10),
      lastWatered: Date.now(),
      lastFertilized: Date.now(),
      image: data.image || defaultImage(data.nome)
    };
    plants.push(plant);
    DB.savePlants(plants);
    return plant;
  }

  function update(id, data) {
    const plants = DB.getPlants();
    const idx = plants.findIndex(p => p.id === id);
    if (idx === -1) return null;
    plants[idx] = { ...plants[idx], ...data };
    DB.savePlants(plants);
    return plants[idx];
  }

  function remove(id) {
    const plants = DB.getPlants().filter(p => p.id !== id);
    DB.savePlants(plants);
  }

  function markWatered(id) {
    const plant = getById(id);
    if (!plant) return;
    update(id, { lastWatered: Date.now() });
  }

  function defaultImage(name) {
    const q = encodeURIComponent(name + ' houseplant');
    return 'https://images.unsplash.com/photo-1466781176434-7687441b1459?w=800&q=80&fit=crop';
  }

  function getUpcoming(userId, limit) {
    const list = listForUser(userId).map(plant => {
      const status = getStatus(plant);
      let label = nextWateringLabel(plant);
      if (status === 'adubar') label = 'Adubar em breve';
      return { plant, status, label, priority: status === 'rega' ? 0 : status === 'adubar' ? 1 : 2 };
    });
    list.sort((a, b) => a.priority - b.priority);
    return list.slice(0, limit);
  }

  return {
    listForUser,
    getById,
    getStatus,
    badgeForStatus,
    nextWateringLabel,
    create,
    update,
    remove,
    markWatered,
    getUpcoming
  };
})();
