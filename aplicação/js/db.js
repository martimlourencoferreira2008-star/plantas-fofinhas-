/**
 * Camada de base de dados — localStorage (persistência no browser).
 * Estrutura: utilizadores, plantas, definições, sessão.
 */
const DB = (function () {
  const KEYS = {
    users: 'verde_db_users',
    plants: 'verde_db_plants',
    settings: 'verde_db_settings',
    session: 'verde_session',
    seeded: 'verde_demo_seeded'
  };

  function read(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function getUsers() {
    return read(KEYS.users) || [];
  }

  function saveUsers(users) {
    write(KEYS.users, users);
  }

  function getPlants() {
    return read(KEYS.plants) || [];
  }

  function savePlants(plants) {
    write(KEYS.plants, plants);
  }

  function getSettings(userId) {
    const all = read(KEYS.settings) || {};
    return all[userId] || { notifications: true };
  }

  function saveSettings(userId, settings) {
    const all = read(KEYS.settings) || {};
    all[userId] = { ...getSettings(userId), ...settings };
    write(KEYS.settings, all);
  }

  function setSession(userId) {
    write(KEYS.session, { userId, at: Date.now() });
  }

  function clearSession() {
    localStorage.removeItem(KEYS.session);
  }

  function getSession() {
    return read(KEYS.session);
  }

  /** Hash simples para demonstração (não usar em produção real). */
  function hashPassword(password) {
    let h = 0;
    for (let i = 0; i < password.length; i++) {
      h = (Math.imul(31, h) + password.charCodeAt(i)) | 0;
    }
    return 'h' + Math.abs(h).toString(16);
  }

  function seedDemoIfNeeded() {
    if (localStorage.getItem(KEYS.seeded)) return;

    const demoId = uuid();
    const users = [
      {
        id: demoId,
        name: 'Utilizador Demo',
        email: 'demo@verde.pt',
        passwordHash: hashPassword('demo123')
      }
    ];
    saveUsers(users);

    const now = Date.now();
    const day = 86400000;
    const demoPlants = [
      {
        id: uuid(),
        userId: demoId,
        nome: 'Monstera',
        especie: 'Monstera deliciosa',
        localizacao: 'Sala de Estar',
        frequenciaDias: 3,
        lastWatered: now - 4 * day,
        lastFertilized: now - 20 * day,
        image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0a?w=800&q=80'
      },
      {
        id: uuid(),
        userId: demoId,
        nome: 'Ficus Lyrata',
        especie: 'Ficus lyrata',
        localizacao: 'Quarto Principal',
        frequenciaDias: 7,
        lastWatered: now - 2 * day,
        lastFertilized: now - 5 * day,
        image: 'https://images.unsplash.com/photo-1593482892228-ff407d0a8b65?w=800&q=80'
      },
      {
        id: uuid(),
        userId: demoId,
        nome: 'Pothos',
        especie: 'Epipremnum aureum',
        localizacao: 'Cozinha',
        frequenciaDias: 5,
        lastWatered: now - 1 * day,
        lastFertilized: now - 35 * day,
        image: 'https://images.unsplash.com/photo-1618886613974-7b4a86c3906c?w=800&q=80'
      },
      {
        id: uuid(),
        userId: demoId,
        nome: 'Sansevieria',
        especie: 'Sansevieria trifasciata',
        localizacao: 'Escritório',
        frequenciaDias: 14,
        lastWatered: now - 5 * day,
        lastFertilized: now - 10 * day,
        image: 'https://images.unsplash.com/photo-1593482892228-ff407d0a8b65?w=800&q=80'
      }
    ];
    savePlants(demoPlants);
    localStorage.setItem(KEYS.seeded, '1');
  }

  seedDemoIfNeeded();

  return {
    uuid,
    hashPassword,
    getUsers,
    saveUsers,
    getPlants,
    savePlants,
    getSettings,
    saveSettings,
    setSession,
    clearSession,
    getSession
  };
})();
