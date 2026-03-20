(function () {
  var root = document.querySelector('.contact-hub');
  if (!root) return;

  function getCheckedValues(selector) {
    return Array.from(root.querySelectorAll(selector + ':checked')).map(function (el) { return el.value; });
  }

  function updateHidden(listEl, hiddenEl) {
    var values = Array.from(listEl.querySelectorAll('.pill')).map(function (item) { return item.getAttribute('data-value') || ''; });
    hiddenEl.value = JSON.stringify(values);
  }

  function createPill(listEl, hiddenEl, value) {
    if (!value) return;
    var exists = Array.from(listEl.querySelectorAll('.pill')).some(function (item) { return item.getAttribute('data-value') === value; });
    if (exists) return;
    var li = document.createElement('li');
    li.className = 'pill';
    li.setAttribute('data-value', value);
    var text = document.createElement('span');
    text.textContent = value;
    var removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.setAttribute('aria-label', 'Remove ' + value);
    removeBtn.addEventListener('click', function () {
      li.remove();
      updateHidden(listEl, hiddenEl);
    });
    li.appendChild(text);
    li.appendChild(removeBtn);
    listEl.appendChild(li);
    updateHidden(listEl, hiddenEl);
  }

  function setupSimpleList(config) {
    var input = root.querySelector('#' + config.inputId);
    var addBtn = root.querySelector('#' + config.addBtnId);
    var listEl = root.querySelector('#' + config.listId);
    var hiddenEl = root.querySelector('#' + config.hiddenId);
    if (!input || !addBtn || !listEl || !hiddenEl) return;

    function addItem() {
      var value = input.value.trim();
      if (!value) return;
      createPill(listEl, hiddenEl, value);
      input.value = '';
      input.focus();
    }

    addBtn.addEventListener('click', addItem);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        addItem();
      }
    });
  }

  function setupPairList(config) {
    var input = root.querySelector('#' + config.inputId);
    var select = root.querySelector('#' + config.selectId);
    var addBtn = root.querySelector('#' + config.addBtnId);
    var listEl = root.querySelector('#' + config.listId);
    var hiddenEl = root.querySelector('#' + config.hiddenId);
    if (!input || !select || !addBtn || !listEl || !hiddenEl) return;

    function addItem() {
      var label = input.value.trim();
      var level = select.value.trim();
      if (!label || !level) return;
      createPill(listEl, hiddenEl, label + ' — ' + level);
      input.value = '';
      select.selectedIndex = 0;
      input.focus();
    }

    addBtn.addEventListener('click', addItem);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        addItem();
      }
    });
  }

  [
    { type: 'simple', inputId: 'contactRemoteSkillInput', addBtnId: 'contactRemoteSkillAdd', listId: 'contactRemoteSkillsList', hiddenId: 'contactRemoteSkillsHidden' },
    { type: 'pair', inputId: 'contactExperienceInput', selectId: 'contactExperienceLevel', addBtnId: 'contactExperienceAdd', listId: 'contactExperienceList', hiddenId: 'contactExperienceHidden' },
    { type: 'pair', inputId: 'contactLanguageInput', selectId: 'contactLanguageLevel', addBtnId: 'contactLanguageAdd', listId: 'contactLanguagesList', hiddenId: 'contactLanguagesHidden' },
    { type: 'pair', inputId: 'contactEducationInput', selectId: 'contactEducationLevel', addBtnId: 'contactEducationAdd', listId: 'contactEducationList', hiddenId: 'contactEducationHidden' }
  ].forEach(function (config) {
    if (config.type === 'simple') setupSimpleList(config);
    else setupPairList(config);
  });

  function clearPills(listId, hiddenId) {
    var list = root.querySelector('#' + listId);
    var hidden = root.querySelector('#' + hiddenId);
    if (!list || !hidden) return;
    list.innerHTML = '';
    hidden.value = '';
  }

  function clearCheckboxGroup(selector) {
    root.querySelectorAll(selector).forEach(function (item) { item.checked = false; });
  }

  function clearContactForm() {
    var form = root.querySelector('#contactForm');
    if (!form) return;
    form.reset();
    clearPills('contactRemoteSkillsList', 'contactRemoteSkillsHidden');
    clearPills('contactExperienceList', 'contactExperienceHidden');
    clearPills('contactLanguagesList', 'contactLanguagesHidden');
    clearPills('contactEducationList', 'contactEducationHidden');
    var status = root.querySelector('#formStatus');
    if (status) {
      status.textContent = '';
      status.dataset.state = '';
    }
    clearCheckboxGroup('input[name="contact_interest[]"]');
    clearCheckboxGroup('input[name="remote_interest[]"]');
  }

  root.querySelectorAll('[data-clear-form]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.getAttribute('data-clear-form') === 'contact') clearContactForm();
    });
  });

  function validateForm(requiredIds, emptyMessage) {
    for (var i = 0; i < requiredIds.length; i++) {
      var field = root.querySelector('#' + requiredIds[i]);
      if (!field || !field.value.trim()) return emptyMessage;
    }
    return '';
  }

  var contactForm = root.querySelector('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
      var status = root.querySelector('#formStatus');
      var message = validateForm(
        ['contactFullName', 'contactEmail', 'contactCountryCode', 'contactNumber', 'contactCity', 'contactState', 'contactZip', 'bestTimeToContact', 'contactMessage'],
        'Please complete all required contact and inquiry fields.'
      );
      if (!message && !root.querySelector('#contactExperienceHidden').value.trim()) {
        message = 'Please add at least one experience item.';
      }
      if (!message && !root.querySelector('#contactEducationHidden').value.trim()) {
        message = 'Please add at least one education item.';
      }
      if (!message) {
        var interestCount = getCheckedValues('input[name="contact_interest[]"]').length + getCheckedValues('input[name="remote_interest[]"]').length;
        if (!interestCount) message = 'Please select at least one area of interest.';
      }
      if (message) {
        event.preventDefault();
        if (status) {
          status.textContent = message;
          status.dataset.state = 'blocked';
        }
        return;
      }
      if (status) {
        status.textContent = 'Contact inquiry is ready for secure submission.';
        status.dataset.state = 'review';
      }
    });
  }
})();
