(function () {
  var root = document.querySelector('.contact-hub');
  if (!root) return;

  var mode = 'contact';
  var modeContactBtn = root.querySelector('#modeContactBtn');
  var modeCareerBtn = root.querySelector('#modeCareerBtn');
  var contactPanel = root.querySelector('#contactModePanel');
  var careerPanel = root.querySelector('#careerModePanel');
  var currentModeBadge = root.querySelector('#currentModeBadge');
  var openModeButtons = root.querySelectorAll('[data-open-mode]');

  function getCheckedValues(selector) {
    return Array.from(root.querySelectorAll(selector + ':checked')).map(function (el) { return el.value; });
  }

  function setMode(nextMode) {
    mode = nextMode;
    var isContact = mode === 'contact';
    contactPanel.classList.toggle('hidden', !isContact);
    careerPanel.classList.toggle('hidden', isContact);
    modeContactBtn.classList.toggle('is-active', isContact);
    modeCareerBtn.classList.toggle('is-active', !isContact);
    modeContactBtn.setAttribute('aria-selected', isContact ? 'true' : 'false');
    modeCareerBtn.setAttribute('aria-selected', isContact ? 'false' : 'true');
    currentModeBadge.textContent = isContact ? 'Contact Summary' : 'Career Summary';
  }

  modeContactBtn.addEventListener('click', function () { setMode('contact'); });
  modeCareerBtn.addEventListener('click', function () { setMode('career'); });
  openModeButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var nextMode = btn.getAttribute('data-open-mode') === 'career' ? 'career' : 'contact';
      setMode(nextMode);
    });
  });

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
    removeBtn.addEventListener('click', function () { li.remove(); updateHidden(listEl, hiddenEl); });
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
      if (event.key === 'Enter') { event.preventDefault(); addItem(); }
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
      if (event.key === 'Enter') { event.preventDefault(); addItem(); }
    });
  }

  [
    { type: 'simple', inputId: 'contactRemoteSkillInput', addBtnId: 'contactRemoteSkillAdd', listId: 'contactRemoteSkillsList', hiddenId: 'contactRemoteSkillsHidden' },
    { type: 'pair', inputId: 'contactLanguageInput', selectId: 'contactLanguageLevel', addBtnId: 'contactLanguageAdd', listId: 'contactLanguagesList', hiddenId: 'contactLanguagesHidden' },
    { type: 'pair', inputId: 'careerExperienceInput', selectId: 'careerExperienceLevel', addBtnId: 'careerExperienceAdd', listId: 'careerExperienceList', hiddenId: 'careerExperienceHidden' },
    { type: 'pair', inputId: 'careerLanguageInput', selectId: 'careerLanguageLevel', addBtnId: 'careerLanguageAdd', listId: 'careerLanguagesList', hiddenId: 'careerLanguagesHidden' },
    { type: 'pair', inputId: 'careerSkillInput', selectId: 'careerSkillLevel', addBtnId: 'careerSkillAdd', listId: 'careerSkillsList', hiddenId: 'careerSkillsHidden' },
    { type: 'simple', inputId: 'careerProjectInput', addBtnId: 'careerProjectAdd', listId: 'careerProjectsList', hiddenId: 'careerProjectsHidden' },
    { type: 'pair', inputId: 'careerEducationInput', selectId: 'careerEducationLevel', addBtnId: 'careerEducationAdd', listId: 'careerEducationList', hiddenId: 'careerEducationHidden' }
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
    root.querySelector('#contactForm').reset();
    clearPills('contactRemoteSkillsList', 'contactRemoteSkillsHidden');
    clearPills('contactLanguagesList', 'contactLanguagesHidden');
    var status = root.querySelector('#formStatus');
    status.textContent = '';
    status.dataset.state = '';
    clearCheckboxGroup('input[name="contact_interest[]"]');
    clearCheckboxGroup('input[name="remote_interest[]"]');
  }

  function clearCareerForm() {
    root.querySelector('#joinForm').reset();
    clearPills('careerExperienceList', 'careerExperienceHidden');
    clearPills('careerLanguagesList', 'careerLanguagesHidden');
    clearPills('careerSkillsList', 'careerSkillsHidden');
    clearPills('careerProjectsList', 'careerProjectsHidden');
    clearPills('careerEducationList', 'careerEducationHidden');
    var status = root.querySelector('#joinFormStatus');
    status.textContent = '';
    status.dataset.state = '';
    clearCheckboxGroup('input[name="career_interest[]"]');
  }

  root.querySelectorAll('[data-clear-form]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-clear-form');
      if (target === 'contact') clearContactForm();
      if (target === 'career') clearCareerForm();
    });
  });

  function validateForm(requiredIds, emptyMessage) {
    for (var i = 0; i < requiredIds.length; i++) {
      var field = root.querySelector('#' + requiredIds[i]);
      if (!field || !field.value.trim()) return emptyMessage;
    }
    return '';
  }

  root.querySelector('#contactForm').addEventListener('submit', function (event) {
    var status = root.querySelector('#formStatus');
    var message = validateForm(['contactFullName', 'contactEmail', 'contactCountryCode', 'contactNumber', 'contactCity', 'contactState', 'contactZip', 'bestTimeToContact', 'contactExperienceLevel', 'contactEducation'], 'Please complete all required contact and inquiry fields.');
    if (!message) {
      var interestCount = getCheckedValues('input[name="contact_interest[]"]').length + getCheckedValues('input[name="remote_interest[]"]').length;
      if (!interestCount) message = 'Please select at least one area of interest.';
    }
    if (message) {
      event.preventDefault();
      status.textContent = message;
      status.dataset.state = 'blocked';
      return;
    }
    status.textContent = 'Contact inquiry is ready for secure submission.';
    status.dataset.state = 'review';
  });

  root.querySelector('#joinForm').addEventListener('submit', function (event) {
    var status = root.querySelector('#joinFormStatus');
    var message = validateForm(['careerFullName', 'careerEmail', 'careerCountryCode', 'careerNumber', 'careerCity', 'careerState', 'careerZip', 'careerAvailability'], 'Please complete all required application fields.');
    if (!message && !getCheckedValues('input[name="career_interest[]"]').length) {
      message = 'Please select at least one career area of interest.';
    }
    if (message) {
      event.preventDefault();
      status.textContent = message;
      status.dataset.state = 'blocked';
      return;
    }
    status.textContent = 'Career application is ready for secure submission.';
    status.dataset.state = 'review';
  });

  setMode(mode);
})();
