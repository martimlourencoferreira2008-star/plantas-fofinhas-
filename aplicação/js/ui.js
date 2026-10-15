const UI = (function () {
  const navItems = [
    { id: 'home', href: 'home.html', icon: 'home', label: 'Home' },
    { id: 'cabinet', href: 'armario.html', icon: 'local_florist', label: 'Armário' },
    { id: 'alerts', href: 'alertas.html', icon: 'notifications_none', label: 'Alertas' },
    { id: 'profile', href: 'perfil.html', icon: 'person_outline', label: 'Perfil' }
  ];

  function renderBottomNav(activeId) {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;
    nav.innerHTML = navItems
      .map(item => {
        const active = item.id === activeId ? ' active' : '';
        return (
          '<a href="' +
          item.href +
          '" class="' +
          active.trim() +
          '">' +
          '<span class="nav-dot-wrap"><span class="material-icons-outlined">' +
          item.icon +
          '</span></span>' +
          '<span>' +
          item.label +
          '</span></a>'
        );
      })
      .join('');
  }

  return { renderBottomNav };
})();
