const FormPlanta = (function () {
  let photoDataUrl = null;

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function setupPhoto() {
    const input = document.getElementById('photo');
    const preview = document.getElementById('photo-preview');
    const label = document.getElementById('photo-label');

    input.addEventListener('change', async function () {
      const file = input.files[0];
      if (!file) return;
      photoDataUrl = await readFileAsDataUrl(file);
      preview.src = photoDataUrl;
      preview.hidden = false;
      label.classList.add('has-image');
    });
  }

  function init(options) {
    setupPhoto();
    const user = Auth.currentUser();
    const errEl = document.getElementById('form-error');

    if (options.mode === 'edit' && options.id) {
      const plant = Plants.getById(options.id);
      if (!plant || plant.userId !== user.id) {
        window.location.href = 'armario.html';
        return;
      }
      document.getElementById('nome').value = plant.nome;
      document.getElementById('especie').value = plant.especie || '';
      document.getElementById('frequencia').value = String(plant.frequenciaDias);
      document.getElementById('localizacao').value = plant.localizacao;
      const preview = document.getElementById('photo-preview');
      preview.src = plant.image;
      preview.hidden = false;
      document.getElementById('photo-label').classList.add('has-image');
      photoDataUrl = plant.image;
    }

    document.getElementById('plant-form').addEventListener('submit', function (e) {
      e.preventDefault();
      errEl.hidden = true;

      const payload = {
        nome: document.getElementById('nome').value.trim(),
        especie: document.getElementById('especie').value.trim(),
        localizacao: document.getElementById('localizacao').value.trim(),
        frequenciaDias: document.getElementById('frequencia').value
      };

      if (!payload.nome || !payload.localizacao || !payload.frequenciaDias) {
        errEl.textContent = 'Preencha os campos obrigatórios.';
        errEl.hidden = false;
        return;
      }

      if (photoDataUrl) payload.image = photoDataUrl;

      if (options.mode === 'create') {
        Plants.create(user.id, payload);
      } else {
        Plants.update(options.id, {
          nome: payload.nome,
          especie: payload.especie,
          localizacao: payload.localizacao,
          frequenciaDias: parseInt(payload.frequenciaDias, 10),
          ...(payload.image ? { image: payload.image } : {})
        });
      }

      window.location.href = options.redirect || 'armario.html';
    });
  }

  return { init };
})();
