(function () {
  var root = document.querySelector('.contact-hub');
  if (!root) return;

  var mode = 'contact';
  var modeContactBtn = root.querySelector('#modeContactBtn');
  var modeCareerBtn = root.querySelector('#modeCareerBtn');
  var contactPanel = root.querySelector('#contactModePanel');
  var careerPanel = root.querySelector('#careerModePanel');
  var currentModeBadge = root.querySelector('#currentModeBadge');
  var summaryMode = root.querySelector('#summaryMode');
  var summaryName = root.querySelector('#summaryName');
  var summaryEmail = root.querySelector('#summaryEmail');
  var summaryLocation = root.querySelector('#summaryLocation');
  var summaryInterest = root.querySelector('#summaryInterest');
  var summaryItems = root.querySelector('#summaryItems');
  var summaryTime = root.querySelector('#summaryTime');

  function safeValue(value, fallback) { return value && value.trim() ? value.trim() : fallback; }
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
    var label = isContact ? 'Contact / Inquiry' : 'Career / Job Application';
    currentModeBadge.textContent = label;
    summaryMode.textContent = label;
    updateSummary();
  }

  modeContactBtn.addEventListener('click', function () { setMode('contact'); });
  modeCareerBtn.addEventListener('click', function () { setMode('career'); });

  function updateHidden(listEl, hiddenEl) {
    var values = Array.from(listEl.querySelectorAll('.pill')).map(function (item) { return item.getAttribute('data-value') || ''; });
    hiddenEl.value = JSON.stringify(values);
    updateSummary();
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

  function getListItemsText(listSelector) {
    var items = Array.from(root.querySelectorAll(listSelector + ' .pill')).map(function (item) { return item.getAttribute('data-value'); });
    return items.length ? items.join(', ') : '';
  }

  function updateSummary() {
    if (mode === 'contact') {
      var contactName = root.querySelector('#contactFullName').value;
      var contactEmail = root.querySelector('#contactEmail').value;
      var contactCity = root.querySelector('#contactCity').value;
      var contactState = root.querySelector('#contactState').value;
      var contactZip = root.querySelector('#contactZip').value;
      var contactTime = root.querySelector('#bestTimeToContact').value;
      var contactInterest = getCheckedValues('input[name="contact_interest[]"]');
      var remoteInterest = getCheckedValues('input[name="remote_interest[]"]');
      var contactSkills = getListItemsText('#contactRemoteSkillsList');
      var contactLanguages = getListItemsText('#contactLanguagesList');
      var contactExp = root.querySelector('#contactExperienceLevel').value;
      var contactEdu = root.querySelector('#contactEducation').value;
      summaryName.textContent = safeValue(contactName, 'Not provided yet');
      summaryEmail.textContent = safeValue(contactEmail, 'Not provided yet');
      summaryLocation.textContent = safeValue([contactCity, contactState, contactZip].filter(Boolean).join(', '), 'Not provided yet');
      var allContactInterest = contactInterest.concat(remoteInterest.filter(function (item) { return contactInterest.indexOf(item) === -1; }));
      summaryInterest.textContent = allContactInterest.length ? allContactInterest.join(', ') : 'None selected';
      var contactItemParts = [];
      if (contactSkills) contactItemParts.push('Skills: ' + contactSkills);
      if (contactLanguages) contactItemParts.push('Languages: ' + contactLanguages);
      if (contactExp) contactItemParts.push('Experience: ' + contactExp);
      if (contactEdu) contactItemParts.push('Education: ' + contactEdu);
      summaryItems.textContent = contactItemParts.length ? contactItemParts.join(' | ') : 'No items added yet';
      summaryTime.textContent = safeValue(contactTime, 'Not provided yet');
    } else {
      var careerName = root.querySelector('#careerFullName').value;
      var careerEmail = root.querySelector('#careerEmail').value;
      var careerCity = root.querySelector('#careerCity').value;
      var careerState = root.querySelector('#careerState').value;
      var careerZip = root.querySelector('#careerZip').value;
      var careerTime = root.querySelector('#careerAvailability').value;
      var careerInterest = getCheckedValues('input[name="career_interest[]"]');
      var expItems = getListItemsText('#careerExperienceList');
      var langItems = getListItemsText('#careerLanguagesList');
      var skillItems = getListItemsText('#careerSkillsList');
      var projectItems = getListItemsText('#careerProjectsList');
      var eduItems = getListItemsText('#careerEducationList');
      summaryName.textContent = safeValue(careerName, 'Not provided yet');
      summaryEmail.textContent = safeValue(careerEmail, 'Not provided yet');
      summaryLocation.textContent = safeValue([careerCity, careerState, careerZip].filter(Boolean).join(', '), 'Not provided yet');
      summaryInterest.textContent = careerInterest.length ? careerInterest.join(', ') : 'None selected';
      var careerItemParts = [];
      if (expItems) careerItemParts.push('Experience: ' + expItems);
      if (langItems) careerItemParts.push('Languages: ' + langItems);
      if (skillItems) careerItemParts.push('Skills: ' + skillItems);
      if (projectItems) careerItemParts.push('Projects: ' + projectItems);
      if (eduItems) careerItemParts.push('Education: ' + eduItems);
      summaryItems.textContent = careerItemParts.length ? careerItemParts.join(' | ') : 'No items added yet';
      summaryTime.textContent = safeValue(careerTime, 'Not provided yet');
    }
  }

  root.addEventListener('input', updateSummary);
  root.addEventListener('change', updateSummary);

  function clearPills(listId, hiddenId) {
    var list = root.querySelector('#' + listId);
    var hidden = root.querySelector('#' + hiddenId);
    if (!list || !hidden) return;
    list.innerHTML = '';
    hidden.value = '';
  }
  function clearCheckboxGroup(selector) { root.querySelectorAll(selector).forEach(function (item) { item.checked = false; }); }
  function clearContactForm() {
    root.querySelector('#contactForm').reset();
    clearPills('contactRemoteSkillsList', 'contactRemoteSkillsHidden');
    clearPills('contactLanguagesList', 'contactLanguagesHidden');
    var status = root.querySelector('#formStatus');
    status.textContent = '';
    status.dataset.state = '';
    clearCheckboxGroup('input[name="contact_interest[]"]');
    clearCheckboxGroup('input[name="remote_interest[]"]');
    updateSummary();
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
    updateSummary();
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

  updateSummary();
})();
