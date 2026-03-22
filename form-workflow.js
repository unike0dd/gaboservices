(function () {
  function createFormWorkflow(root, options) {
    if (!root || !options) return null;

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
      for (var i = 0; i < requiredIds.length; i++) {
        var field = root.querySelector('#' + requiredIds[i]);
        if (!field || !field.value.trim()) return emptyMessage;
      }
      return '';
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
