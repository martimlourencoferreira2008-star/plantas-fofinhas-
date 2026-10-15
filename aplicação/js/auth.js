const Auth = (function () {
  function isLoggedIn() {
    const s = DB.getSession();
    if (!s?.userId) return false;
    const user = DB.getUsers().find(u => u.id === s.userId);
    return !!user;
  }

  function currentUser() {
    const s = DB.getSession();
    if (!s) return null;
    const user = DB.getUsers().find(u => u.id === s.userId);
    if (!user) return null;
    const { passwordHash, ...safe } = user;
    return safe;
  }

  function requireAuth() {
    if (!isLoggedIn()) {
      window.location.href = 'login.html';
    }
  }

  function login(email, password) {
    const users = DB.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { ok: false, message: 'Email ou palavra-passe incorretos.' };
    }
    if (user.passwordHash !== DB.hashPassword(password)) {
      return { ok: false, message: 'Email ou palavra-passe incorretos.' };
    }
    DB.setSession(user.id);
    return { ok: true };
  }

  function register(name, email, password) {
    if (password.length < 6) {
      return { ok: false, message: 'A palavra-passe deve ter pelo menos 6 caracteres.' };
    }
    const users = DB.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, message: 'Já existe uma conta com este email.' };
    }
    const user = {
      id: DB.uuid(),
      name,
      email,
      passwordHash: DB.hashPassword(password)
    };
    users.push(user);
    DB.saveUsers(users);
    DB.setSession(user.id);
    return { ok: true };
  }

  function logout() {
    DB.clearSession();
  }

  function updateProfile(userId, data) {
    const users = DB.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return;
    users[idx] = { ...users[idx], ...data };
    DB.saveUsers(users);
  }

  return {
    isLoggedIn,
    currentUser,
    requireAuth,
    login,
    register,
    logout,
    updateProfile
  };
})();
