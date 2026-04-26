export function initHomePageBehavior() {
  initHomeHeroFlipCard();
  initCenterServicesRotation();
}

function initCenterServicesRotation() {
  const services = [
    { center: 'LOGISTICS', text: 'Dispatch coordination, shipment visibility, and status follow-up.', link: '/services/logistics-operations/' },
    { center: 'ADMIN BACKOFFICE', text: 'Documentation flow, scheduling, and organized follow-up.', link: '/services/administrative-backoffice/' },
    { center: 'IT SUPPORT', text: 'Ticket flow, issue tracking, and user support coordination.', link: '/services/it-support/' },
    { center: 'CUSTOMER OPERATIONS', text: 'Customer communication, response tracking, and continuity.', link: '/services/customer-relations/' }
  ];
  const centerTitle = document.getElementById('centerTitle');
  const centerText = document.getElementById('centerText');
  const centerLink = document.getElementById('centerLink');
  if (!centerTitle || !centerText || !centerLink) return;
  let i = 0;
  const setService = (idx) => {
    const item = services[idx];
    centerTitle.textContent = item.center;
    centerText.textContent = item.text;
    centerLink.href = item.link;
  };
  setService(i);
  setInterval(() => { i = (i + 1) % services.length; setService(i); }, 4200);
}

function initHomeHeroFlipCard() {
  const items = [
    { title: 'Clearer', text: 'Workflow follow-through and team coordination' },
    { title: 'Faster', text: 'Daily response across recurring operational needs' },
    { title: 'Stronger', text: 'Support across logistics, admin, IT, and customer relations' },
    { title: 'Better', text: 'Operational visibility without enterprise complexity' }
  ];
  const frontTitle = document.getElementById('opsHeroFrontTitle');
  const frontText = document.getElementById('opsHeroFrontText');
  if (!frontTitle || !frontText) return;
  let i = 0;
  frontTitle.textContent = items[0].title;
  frontText.textContent = items[0].text;
  setInterval(() => {
    i = (i + 1) % items.length;
    frontTitle.textContent = items[i].title;
    frontText.textContent = items[i].text;
  }, 4000);
}
