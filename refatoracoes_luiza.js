/* g. EFEITO RIPPLE AO CLICAR EM BOTÕES */

  function createRipple(event) {
    var btn = event.currentTarget;
    var ripple = document.createElement('span');
    ripple.classList.add('adr-ripple-effect');

    var rect = btn.getBoundingClientRect();
    var size = 40;
    var x = (event.clientX || (rect.left + rect.width / 2)) - rect.left - size / 2;
    var y = (event.clientY || (rect.top + rect.height / 2)) - rect.top - size / 2;

    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    btn.appendChild(ripple);
    ripple.addEventListener('animationend', function () {
      ripple.remove();
    });
  }

  function attachRippleAndSound(btn) {
    if (btn.dataset.adrEnhanced) return;
    btn.dataset.adrEnhanced = '1';

    btn.addEventListener('click', function (e) {
      createRipple(e);
      // som apenas se o botão não estiver desabilitado
      if (!btn.disabled && !btn.classList.contains('disabled')) {
        AudioFX.click();
      } else {
        AudioFX.error();
      }
    });
  }

  /* SOM AMBIENTE — toque de fogo a cada ~30s se estiver na sala */

  function startAmbientSound() {
    function maybeFire() {
      // Só toca se o painel da sala/quarto estiver visível
      var roomVisible = document.querySelector('#room-panel:not([style*="display: none"])') ||
                        document.querySelector('.room-module');
      if (roomVisible) {
        AudioFX.ambientFire();
      }
      // Intervalo aleatório entre 20s e 40s
      setTimeout(maybeFire, 20000 + Math.random() * 20000);
    }
    // Começa após 5s para não atrapalhar o carregamento
    setTimeout(maybeFire, 5000);
  }
