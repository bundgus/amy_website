document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      menu.classList.toggle('open');
    });
  }

  var amountButtons = document.querySelectorAll('.amount[data-amt]');
  var customAmount = document.getElementById('customAmount');
  function clearSelected() {
    amountButtons.forEach(function (btn) { btn.classList.remove('selected'); });
  }
  amountButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      clearSelected();
      btn.classList.add('selected');
      if (customAmount) { customAmount.value = this.getAttribute('data-amt'); }
    });
  });
});



