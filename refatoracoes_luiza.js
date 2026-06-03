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

/* BOTÕES DE TRABALHADORES — substitui setas pequenas por botões − e + */

(function melhorarBotoesVillage() {

  // Aguarda o módulo Outside estar pronto
  var _intervalo = setInterval(function () {
    if (typeof Outside === 'undefined') return;
    clearInterval(_intervalo);

    // Sobrescreve a função que renderiza cada linha de trabalhador
    var _originalMakeWorkerRow = Outside.makeWorkerRow;

    Outside.makeWorkerRow = function (name, num) {
      var row = $('<div>').addClass('workerRow');

      $('<div>').addClass('workerLabel').text(name).appendTo(row);

      var contador = $('<div>').addClass('workerCount').text(num);

      var btnMenos = $('<button>')
        .addClass('workerBtn workerBtn-menos')
        .text('−')
        .click(function () {
          Outside.removeWorker(name);
        });

      var btnMais = $('<button>')
        .addClass('workerBtn workerBtn-mais')
        .text('+')
        .click(function () {
          Outside.addWorker(name);
        });

      row.append(btnMenos).append(contador).append(btnMais);
      return row;
    };

  }, 200);

})();