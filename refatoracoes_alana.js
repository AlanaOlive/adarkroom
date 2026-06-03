(function () {
  'use strict';
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* ============================================================
     a. EFEITOS SONOROS SIMPLES (Web Audio API — sem arquivos externos)
     ============================================================ */
  var AudioFX = (function () {
    var ctx = null;

    function getCtx() {
      if (!ctx) {
        try {
          ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
          return null;
        }
      }
      return ctx;
    }

    /**
     * Gera um som curto via oscilador.
     * @param {number} freq      - frequência em Hz
     * @param {string} type      - 'sine' | 'square' | 'triangle' | 'sawtooth'
     * @param {number} duration  - duração em segundos
     * @param {number} gain      - volume 0..1
     * @param {number} [freqEnd] - frequência final (sweep)
     */
    function play(freq, type, duration, gain, freqEnd) {
      var c = getCtx();
      if (!c) return;

      var osc = c.createOscillator();
      var vol = c.createGain();

      osc.connect(vol);
      vol.connect(c.destination);

      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, c.currentTime);
      if (freqEnd !== undefined) {
        osc.frequency.linearRampToValueAtTime(freqEnd, c.currentTime + duration);
      }

      vol.gain.setValueAtTime(gain, c.currentTime);
      vol.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);

      osc.start(c.currentTime);
      osc.stop(c.currentTime + duration);
    }

    return {
      /** Click genérico de botão */
      click: function () {
        play(440, 'square', 0.06, 0.08, 380);
      },
      /** Ação iniciada (começo de cooldown) */
      actionStart: function () {
        play(520, 'sine', 0.12, 0.12, 480);
      },
      /** Ação completada / cooldown zerado */
      actionDone: function () {
        play(660, 'sine', 0.18, 0.14, 880);
      },
      /** Notificação / novo texto */
      notify: function () {
        play(300, 'triangle', 0.1, 0.06);
      },
      /** Erro / não pode executar */
      error: function () {
        play(220, 'sawtooth', 0.14, 0.08, 180);
      },
      /** Som ambiente fraco — toque periódico de "fogo" */
      ambientFire: function () {
        play(80 + Math.random() * 20, 'triangle', 0.3, 0.03, 60);
      }
    };
  })();
   /* ============================================================
     b. INDICADOR DE PROGRESSO EM AÇÕES COM COOLDOWN
     O ADR usa um padrão: botão com classe "action-button" e
     dentro um span ".cooldown" que cresce via width%.
     Melhoramos a aparência e adicionamos som ao completar.
     ============================================================ */
  function enhanceCooldownButtons() {
    var buttons = document.querySelectorAll('button[data-cooldown], .action-button');
    buttons.forEach(function (btn) {
      if (btn.dataset.adrProgressEnhanced) return;
      btn.dataset.adrProgressEnhanced = '1';

      // Garante que existe um wrapper de progresso visível
      var bar = btn.querySelector('.cooldown');
      if (bar) {
        // Envolve em container se ainda não tiver
        var container = bar.parentElement;
        if (!container.classList.contains('progress-container') &&
            !container.classList.contains('cooldown-container')) {
          var wrapper = document.createElement('div');
          wrapper.className = 'progress-container';
          bar.parentNode.insertBefore(wrapper, bar);
          wrapper.appendChild(bar);
        }

        // Observa mudanças na largura para detectar conclusão
        var lastWidth = parseFloat(bar.style.width) || 0;
        var observer = new MutationObserver(function () {
          var w = parseFloat(bar.style.width) || 0;
          // Passou de não-zero para zero → ação concluída
          if (lastWidth > 0 && w === 0) {
            AudioFX.actionDone();
          }
          // Passou de zero para não-zero → ação iniciada
          if (lastWidth === 0 && w > 0) {
            AudioFX.actionStart();
          }
          lastWidth = w;
        });
        observer.observe(bar, { attributes: true, attributeFilter: ['style'] });
      }
    });
  }

  /* ============================================================
     OBSERVADOR DE MUTAÇÃO — aplica melhorias a botões dinâmicos
     O ADR cria/remove botões dinamicamente via jQuery.
     ============================================================ */
  var enhancementObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        // O próprio nó
        if (node.tagName === 'BUTTON' || node.classList.contains('button')) {
          attachRippleAndSound(node);
        }
        // Descendentes
        var btns = node.querySelectorAll ? node.querySelectorAll('button, .button, .tab') : [];
        btns.forEach(attachRippleAndSound);
      });
    });
  });

  /* ============================================================
     NOTIFICAÇÕES — som ao aparecer novo texto
     ============================================================ */
  function watchNotifications() {
    var notifArea = document.getElementById('notifications') ||
                    document.getElementById('log');
    if (!notifArea) return;

    var notifObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.addedNodes.length > 0) {
          AudioFX.notify();
        }
      });
    });
    notifObserver.observe(notifArea, { childList: true, subtree: true });
  };
  /* ============================================================
     SOM AMBIENTE — toque de fogo a cada ~30s se estiver na sala
     ============================================================ */
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
    // Aplica melhorias a botões já existentes
    document.querySelectorAll('button, .button, .tab').forEach(attachRippleAndSound);

    // Observa o DOM inteiro para botões adicionados dinamicamente
    enhancementObserver.observe(document.body, { childList: true, subtree: true });

    // Melhoria nos cooldown bars
    enhanceCooldownButtons();
    // Re-verifica após carregamento completo do jogo (ADR tem delay)
    setTimeout(enhanceCooldownButtons, 2000);
    setTimeout(enhanceCooldownButtons, 5000);

    // Observa notificações
    watchNotifications();
    // Re-tenta se o elemento ainda não existir
    setTimeout(watchNotifications, 2000);
  })

  // Som ambiente
    // (só inicia após interação do usuário por políticas de autoplay)
    document.addEventListener('click', function startAmbient() {
      startAmbientSound();
      document.removeEventListener('click', startAmbient);
    }, { once: true });
 })();
