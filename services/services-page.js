(function () {
  const industryText = {
    logistics: `<h3>Logistics Operations</h3><div class="it-support-levels"><div class="it-support-level"><p>Coordinating, tracking, managing, improving operational visibility.</p><p>We help keep your logistics organized, visible, and moving.</p><div class="industry-inline-cta"><a class="cta-button" href="/contact/">Get a Custom Optimization Plan</a></div></div><div class="it-support-level"><ul><li>Dispatch coordination</li><li>Run Quotes</li><li>Customer communication</li><li>Shipment tracking and follow ups (ocean, air, and ground)</li><li>Invoicing and billing</li><li>Documentation coordination</li></ul></div></div>`,
    customer: `<h3>Customer Relations</h3><div class="it-support-levels"><div class="it-support-level"><p>Managing customer communication, service consistency, ticketing resolution, follow Ups.</p><p>We help maintain customer satisfaction and resolution flow.</p><div class="industry-inline-cta"><a class="cta-button" href="/contact/">Get a Custom Optimization Plan</a></div></div><div class="it-support-level"><ul><li>Customer satisfaction follow-ups (CSAT support)</li><li>Billing concerns</li><li>First contact resolution</li><li>Customer communication management</li></ul></div></div>`,
    backoffice: `<h3>Administrative Back Office</h3><div class="it-support-levels"><div class="it-support-level"><p>Handling administrative workflows, documentation, scheduling, reporting, day-to-day BackOffice execution.</p><p>We support leadership and daily business operations.</p><div class="industry-inline-cta"><a class="cta-button" href="/contact/">Get a Custom Optimization Plan</a></div></div><div class="it-support-level"><ul><li>Executive administrative support</li><li>Calendar and scheduling coordination</li><li>Email and communication management</li><li>Document organization and preparation</li><li>Vendor coordination</li><li>Internal operational support</li><li>Travel planning and coordination</li></ul></div></div>`,
    itsupport: `<h3>IT Support</h3><div class="it-support-levels"><div class="it-support-level"><h4>Level I Support</h4><ul><li>Help desk intake and ticket creation</li><li>Basic troubleshooting</li><li>End-user support</li><li>Account access assistance</li><li>Escalation coordination</li></ul></div><div class="it-support-level"><h4>Level II Support</h4><ul><li>Advanced troubleshooting</li><li>Incident investigation</li><li>System and workflow support</li><li>Root cause analysis</li><li>Resolution ownership after escalation</li></ul></div><div class="industry-inline-cta center"><a class="cta-button" href="/contact/">Get a Custom Optimization Plan</a></div></div>`
  };

  const buttons = document.querySelectorAll('.switch button');
  const industryTextNode = document.getElementById('industryText');
  if (!buttons.length || !industryTextNode) return;

  const render = (key) => {
    if (!industryText[key]) return;
    industryTextNode.innerHTML = industryText[key];
  };

  render('logistics');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      render(button.dataset.industry);
      buttons.forEach((btn) => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');
    });
  });
})();
