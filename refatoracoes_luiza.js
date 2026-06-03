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

/* BOTÕES DE TRABALHADORES — substitui setas já renderizadas no DOM por botões + e − */

function aplicarBotoesWorker() {
  $('#workers .workerRow').each(function () {
    var row = $(this);

    // Evita aplicar duas vezes
    if (row.find('.workerBtnCustom').length > 0) return;

    var val = row.find('.row_val');

    // Remove as setas originais
    val.find('.upBtn, .dnBtn, .upManyBtn, .dnManyBtn').remove();

    // Adiciona botões + e −
    $('<button>')
      .addClass('upBtn workerBtnCustom')
      .text('+')
      .click([1], Outside.increaseWorker)
      .appendTo(val);

    $('<button>')
      .addClass('dnBtn workerBtnCustom')
      .text('−')
      .click([1], Outside.decreaseWorker)
      .appendTo(val);
  });
}

// Executa quando o painel Outside já existe no DOM
var _workerInterval = setInterval(function () {
  if ($('#workers').length > 0) {
    aplicarBotoesWorker();
  }
}, 500);

// Também reaplicar quando os workers forem atualizados
var _originalUpdateWorkers = Outside.updateWorkersView;
Outside.updateWorkersView = function () {
  _originalUpdateWorkers.call(this);
  setTimeout(aplicarBotoesWorker, 50);
};