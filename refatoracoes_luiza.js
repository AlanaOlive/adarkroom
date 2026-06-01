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

  /*  h. AJUSTES DE INTERFACE PARA DISPOSITIVOS MÓVEIS */

  function mobileAdjustments() {
    // Garante que o meta viewport está correto
    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';

    // Em iOS, previne bounce indesejado no body
    document.body.addEventListener('touchmove', function (e) {
      // Permite scroll apenas dentro de elementos com scroll próprio
      var target = e.target;
      var scrollable = false;
      while (target && target !== document.body) {
        var style = window.getComputedStyle(target);
        var overflow = style.overflow + style.overflowY;
        if (/auto|scroll/.test(overflow) && target.scrollHeight > target.clientHeight) {
          scrollable = true;
          break;
        }
        target = target.parentElement;
      }
      if (!scrollable) e.preventDefault();
    }, { passive: false });

    // Swipe para navegar entre abas (se existirem)
    attachSwipeNavigation();
  }

  /**
   * Adiciona suporte a swipe horizontal para trocar de aba no jogo.
   * O ADR usa abas (#room-tabs / .tab) para navegar entre locais.
   */

  function attachSwipeNavigation() {
    var startX = 0, startY = 0;
    var THRESHOLD = 60; // px mínimos para considerar swipe

    document.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;

      // Só processa se for principalmente horizontal
      if (Math.abs(dx) < THRESHOLD || Math.abs(dy) > Math.abs(dx)) return;

      var tabs = Array.prototype.slice.call(
        document.querySelectorAll('.tab, #room-tabs button')
      );
      if (tabs.length < 2) return;

      var activeTab = document.querySelector('.tab.selected, .tab.active, #room-tabs button.selected');
      if (!activeTab) return;

      var idx = tabs.indexOf(activeTab);
      var nextIdx;
      if (dx < 0) {
        // swipe left → próxima aba
        nextIdx = (idx + 1) % tabs.length;
      } else {
        // swipe right → aba anterior
        nextIdx = (idx - 1 + tabs.length) % tabs.length;
      }

      if (tabs[nextIdx] && tabs[nextIdx] !== activeTab) {
        tabs[nextIdx].click();
      }
    }, { passive: true });
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
  /* ============================================================
     INICIALIZAÇÃO
     ============================================================ */
  ready(function () {
 // Ajustes mobile
    mobileAdjustments();
});

