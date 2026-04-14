(function () {
  function createFormWorkflow(root, options) {
    if (!root || !options) return null;

    function getFieldLabel(field) {
      if (!field || !field.id) return 'This field';
      var label = root.querySelector('label[for="' + field.id + '"]');
      if (!label) return field.name || field.id;
      return (label.textContent || '').trim() || field.name || field.id;
    }

    function clearFieldErrors() {
      root.querySelectorAll('[aria-invalid="true"]').forEach(function (field) {
        field.removeAttribute('aria-invalid');
      });
    }

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
        if (!value) {
          var statusEmpty = root.querySelector('#' + options.statusId);
          if (statusEmpty) {
            statusEmpty.textContent = 'Please complete the "' + getFieldLabel(input) + '" entry before adding.';
            statusEmpty.dataset.state = 'blocked';
          }
          input.focus();
          return;
        }
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
        if (!label || !level) {
          var statusMissing = root.querySelector('#' + options.statusId);
          if (statusMissing) {
            var missingParts = [];
            if (!label) missingParts.push(getFieldLabel(input) + ' entry');
            if (!level) missingParts.push(getFieldLabel(select) + ' selection');
            statusMissing.textContent = 'Please complete: ' + missingParts.join(' and ') + '.';
            statusMissing.dataset.state = 'blocked';
          }
          if (!label) input.focus();
          else select.focus();
          return;
        }
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

    function validateRequiredFields(requiredIds, emptyMessage) {
      clearFieldErrors();
      var missingLabels = [];
      var firstInvalid = null;
      for (var i = 0; i < requiredIds.length; i++) {
        var field = root.querySelector('#' + requiredIds[i]);
        if (!field) continue;
        var value = typeof field.value === 'string' ? field.value.trim() : '';
        var invalid = !value || (typeof field.checkValidity === 'function' && !field.checkValidity());
        if (invalid) {
          field.setAttribute('aria-invalid', 'true');
          missingLabels.push(getFieldLabel(field));
          if (!firstInvalid) firstInvalid = field;
        }
      }
      if (!missingLabels.length) return '';
      if (firstInvalid && typeof firstInvalid.focus === 'function') firstInvalid.focus();
      return (emptyMessage || 'Please complete all required fields.') + ': ' + missingLabels.join(', ') + '.';
    }

    (options.listConfigs || []).forEach(function (config) {
      if (config.type === 'simple') setupSimpleList(config);
      else setupPairList(config);
    });

    root.querySelectorAll('[data-clear-form]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('data-clear-form') !== options.clearKey) return;
        var form = root.querySelector('#' + options.formId);
        if (form) form.reset();
        (options.clearPillGroups || []).forEach(function (group) {
          clearPills(group.listId, group.hiddenId);
        });
        (options.clearCheckboxSelectors || []).forEach(clearCheckboxGroup);
        var status = root.querySelector('#' + options.statusId);
        if (status) {
          status.textContent = '';
          status.dataset.state = '';
        }
      });
    });

    var form = root.querySelector('#' + options.formId);
    if (form) {
      form.addEventListener('submit', function (event) {
        var status = root.querySelector('#' + options.statusId);
        var message = validateRequiredFields(options.requiredIds || [], options.emptyMessage || 'Please complete all required fields.');

        if (!message && typeof options.extraValidation === 'function') {
          message = options.extraValidation({
            root: root,
            getCheckedValues: getCheckedValues
          }) || '';
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
          status.textContent = options.readyMessage || 'Ready for secure submission.';
          status.dataset.state = 'review';
        }
      });
    }

    return {
      getCheckedValues: getCheckedValues,
      clearPills: clearPills
    };
  }

  window.GaboFormWorkflow = {
    create: createFormWorkflow
  };
})();
