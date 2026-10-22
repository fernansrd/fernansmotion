(() => {
  const form = document.getElementById('project-form');
  if (!form) return;
  const update = () => {
    document.getElementById('project-preview-budget').textContent = form.elements.budget.value || 'Por definir';
    document.getElementById('project-preview-name').textContent = form.elements.name.value.trim().toLocaleUpperCase('es') || 'TU NOMBRE';
    document.getElementById('project-preview-company').textContent = form.elements.company.value.trim().toLocaleUpperCase('es') || 'TU MARCA';
    document.getElementById('project-preview-timing').textContent = form.elements.rush.checked ? 'URGENTE' : 'ESTÁNDAR';
    document.getElementById('project-status').hidden = true;
  };
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const message = [
      'Hola, Fernan. Me gustaría hablar sobre un proyecto.', '',
      `Nombre: ${data.get('name').trim()}`,
      `Correo: ${data.get('email').trim()}`,
      ...(data.get('contact').trim() ? [`Contacto: ${data.get('contact').trim()}`] : []),
      ...(data.get('company').trim() ? [`Empresa: ${data.get('company').trim()}`] : []),
      `Presupuesto: ${data.get('budget')}`,
      `Entrega: ${form.elements.rush.checked ? 'Menos de 10 días, según disponibilidad' : 'Fecha por acordar'}`
    ].join('\n');
    const url = `https://wa.me/18098047825?text=${encodeURIComponent(message)}`;
    document.getElementById('project-whatsapp-link').href = url;
    document.getElementById('project-status').hidden = false;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
  update();
})();
