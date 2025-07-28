const API_URL = 'https://portfolio-505u.onrender.com';
let adminToken = sessionStorage.getItem('admin-token');

// --- Token Modal Logic ---
const tokenModal = document.getElementById('token-modal');
const tokenInput = document.getElementById('token-input');
const tokenSubmitBtn = document.getElementById('token-submit-btn');
const tokenCancelBtn = document.getElementById('token-cancel-btn');

let resolveTokenPromise = null;

function requestAdminToken() {
  return new Promise((resolve) => {
    tokenModal.style.display = 'flex';
    tokenInput.focus();
    resolveTokenPromise = resolve;
  });
}

tokenSubmitBtn.onclick = () => {
  const token = tokenInput.value;
  if (token) {
    adminToken = token;
    sessionStorage.setItem('admin-token', token);
    tokenModal.style.display = 'none';
    if (resolveTokenPromise) resolveTokenPromise(token);
  }
  tokenInput.value = '';
};

tokenCancelBtn.onclick = () => {
  tokenModal.style.display = 'none';
  if (resolveTokenPromise) resolveTokenPromise(null);
  tokenInput.value = '';
};

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.onclick = function() {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  };
});

// Helper: create input
function createInput(type, value, placeholder, name, required=false) {
  const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
  if (type !== 'textarea') input.type = type;
  input.value = value || '';
  input.placeholder = placeholder || '';
  if (name) input.name = name;
  if (required) input.required = true;
  return input;
}

// Helper: create label+input
function labeledInput(labelText, input) {
  const div = document.createElement('div');
  div.className = 'form-group';
  const label = document.createElement('label');
  label.textContent = labelText;
  div.appendChild(label);
  div.appendChild(input);
  return div;
}

// Helper: create image upload input
function createImageUploadInput(name, currentImagePath) {
  const container = document.createElement('div');
  container.className = 'form-group';

  const label = document.createElement('label');
  label.textContent = 'Image';
  container.appendChild(label);

  const preview = document.createElement('img');
  preview.src = currentImagePath.startsWith('uploads/') ? `${API_URL}/${currentImagePath}` : `./assets/images/${currentImagePath}`;
  preview.style.width = '100px';
  preview.style.height = 'auto';
  preview.style.marginBottom = '10px';
  preview.style.display = 'block';
  container.appendChild(preview);

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!adminToken) {
      const token = await requestAdminToken();
      if (!token) {
        alert('Admin token is required to upload images.');
        return;
      }
    }

    const formData = new FormData();
    formData.append('image', file);

    fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      if (data.filePath) {
        hiddenInput.value = data.filePath;
        preview.src = `${API_URL}/${data.filePath}`;
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
        if (data.error === 'Unauthorized') sessionStorage.removeItem('admin-token');
      }
    })
    .catch(err => alert('Upload error: ' + err));
  };
  container.appendChild(fileInput);

  const hiddenInput = document.createElement('input');
  hiddenInput.type = 'hidden';
  hiddenInput.name = name;
  hiddenInput.value = currentImagePath;
  container.appendChild(hiddenInput);

  return container;
}


// Load content.json and render forms
let content = {};
fetch(`${API_URL}/content.json`)
  .then(r => r.json())
  .then(data => {
    content = data;
    renderAll();
  })
  .catch(() => {
    content = {};
    renderAll();
  });

function renderAll() {
  renderAbout();
  renderServices();
  renderProjects();
  renderTestimonials();
  renderCertificates();
  renderEducation();
  renderExperience();
  renderSkills();
}

// ABOUT
function renderAbout() {
  const tab = document.getElementById('tab-about');
  tab.innerHTML = '';
  tab.appendChild(labeledInput('Name', createInput('text', content.about?.name, 'Full Name', 'about-name', true)));
  tab.appendChild(labeledInput('Title', createInput('text', content.about?.title, 'Title', 'about-title', true)));
  const desc = createInput('textarea', (content.about?.description||[]).join('\n\n'), 'Description (one paragraph per line)', 'about-description', true);
  tab.appendChild(labeledInput('Description', desc));
}

// SERVICES
function renderServices() {
  const tab = document.getElementById('tab-services');
  tab.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'list-section';
  (content.services||[]).forEach((service, i) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.appendChild(createImageUploadInput(`service-icon-${i}`, service.icon));
    item.appendChild(labeledInput('Title', createInput('text', service.title, 'Service Title', `service-title-${i}`)));
    item.appendChild(labeledInput('Text', createInput('textarea', service.text, 'Service Description', `service-text-${i}`)));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-btn';
    remove.textContent = 'Remove';
    remove.onclick = () => { content.services.splice(i,1); renderServices(); };
    item.appendChild(remove);
    list.appendChild(item);
  });
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'add-btn';
  add.textContent = '+ Add Service';
  add.onclick = () => { (content.services = content.services||[]).push({icon:'',title:'',text:''}); renderServices(); };
  tab.appendChild(list);
  tab.appendChild(add);
}

// PROJECTS
function renderProjects() {
  const tab = document.getElementById('tab-projects');
  tab.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'list-section';
  (content.projects||[]).forEach((project, i) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.appendChild(labeledInput('Title', createInput('text', project.title, 'Project Title', `project-title-${i}`)));
    item.appendChild(labeledInput('Category', createInput('text', project.category, 'Web Development', `project-category-${i}`)));
    item.appendChild(labeledInput('Type', createInput('text', project.type, 'python projects', `project-type-${i}`)));
    item.appendChild(createImageUploadInput(`project-image-${i}`, project.image));
    item.appendChild(labeledInput('Alt text', createInput('text', project.alt, 'Project Image', `project-alt-${i}`)));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-btn';
    remove.textContent = 'Remove';
    remove.onclick = () => { content.projects.splice(i,1); renderProjects(); };
    item.appendChild(remove);
    list.appendChild(item);
  });
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'add-btn';
  add.textContent = '+ Add Project';
  add.onclick = () => { (content.projects = content.projects||[]).push({title:'',category:'',type:'',image:'',alt:''}); renderProjects(); };
  tab.appendChild(list);
  tab.appendChild(add);
}

// TESTIMONIALS
function renderTestimonials() {
  const tab = document.getElementById('tab-testimonials');
  tab.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'list-section';
  (content.testimonials||[]).forEach((t, i) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.appendChild(createImageUploadInput(`testimonial-avatar-${i}`, t.avatar));
    item.appendChild(labeledInput('Name', createInput('text', t.name, 'Name', `testimonial-name-${i}`)));
    item.appendChild(labeledInput('Text', createInput('textarea', t.text, 'Testimonial', `testimonial-text-${i}`)));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-btn';
    remove.textContent = 'Remove';
    remove.onclick = () => { content.testimonials.splice(i,1); renderTestimonials(); };
    item.appendChild(remove);
    list.appendChild(item);
  });
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'add-btn';
  add.textContent = '+ Add Testimonial';
  add.onclick = () => { (content.testimonials = content.testimonials||[]).push({avatar:'',name:'',text:''}); renderTestimonials(); };
  tab.appendChild(list);
  tab.appendChild(add);
}

// CERTIFICATES
function renderCertificates() {
  const tab = document.getElementById('tab-certificates');
  tab.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'list-section';
  (content.certificates||[]).forEach((c, i) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.appendChild(createImageUploadInput(`certificate-logo-${i}`, c.logo));
    item.appendChild(labeledInput('Alt text', createInput('text', c.alt, 'Logo alt', `certificate-alt-${i}`)));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-btn';
    remove.textContent = 'Remove';
    remove.onclick = () => { content.certificates.splice(i,1); renderCertificates(); };
    item.appendChild(remove);
    list.appendChild(item);
  });
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'add-btn';
  add.textContent = '+ Add Certificate';
  add.onclick = () => { (content.certificates = content.certificates||[]).push({logo:'',alt:''}); renderCertificates(); };
  tab.appendChild(list);
  tab.appendChild(add);
}

// EDUCATION
function renderEducation() {
  const tab = document.getElementById('tab-education');
  tab.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'list-section';
  (content.education||[]).forEach((e, i) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.appendChild(labeledInput('School', createInput('text', e.school, 'School', `education-school-${i}`)));
    item.appendChild(labeledInput('Years', createInput('text', e.years, '2019 — 2023', `education-years-${i}`)));
    item.appendChild(labeledInput('Text', createInput('textarea', e.text, 'Description', `education-text-${i}`)));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-btn';
    remove.textContent = 'Remove';
    remove.onclick = () => { content.education.splice(i,1); renderEducation(); };
    item.appendChild(remove);
    list.appendChild(item);
  });
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'add-btn';
  add.textContent = '+ Add Education';
  add.onclick = () => { (content.education = content.education||[]).push({school:'',years:'',text:''}); renderEducation(); };
  tab.appendChild(list);
  tab.appendChild(add);
}

// EXPERIENCE
function renderExperience() {
  const tab = document.getElementById('tab-experience');
  tab.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'list-section';
  (content.experience||[]).forEach((e, i) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.appendChild(labeledInput('Title', createInput('text', e.title, 'Title', `experience-title-${i}`)));
    item.appendChild(labeledInput('Company', createInput('text', e.company, 'Company', `experience-company-${i}`)));
    item.appendChild(labeledInput('Years', createInput('text', e.years, '2020 — 2022', `experience-years-${i}`)));
    item.appendChild(labeledInput('Text', createInput('textarea', e.text, 'Description', `experience-text-${i}`)));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-btn';
    remove.textContent = 'Remove';
    remove.onclick = () => { content.experience.splice(i,1); renderExperience(); };
    item.appendChild(remove);
    list.appendChild(item);
  });
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'add-btn';
  add.textContent = '+ Add Experience';
  add.onclick = () => { (content.experience = content.experience||[]).push({title:'',company:'',years:'',text:''}); renderExperience(); };
  tab.appendChild(list);
  tab.appendChild(add);
}

// SKILLS
function renderSkills() {
  const tab = document.getElementById('tab-skills');
  tab.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'list-section';
  (content.skills||[]).forEach((s, i) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.appendChild(labeledInput('Name', createInput('text', s.name, 'Skill', `skill-name-${i}`)));
    item.appendChild(labeledInput('Value (%)', createInput('number', s.value, '90', `skill-value-${i}`)));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-btn';
    remove.textContent = 'Remove';
    remove.onclick = () => { content.skills.splice(i,1); renderSkills(); };
    item.appendChild(remove);
    list.appendChild(item);
  });
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'add-btn';
  add.textContent = '+ Add Skill';
  add.onclick = () => { (content.skills = content.skills||[]).push({name:'',value:0}); renderSkills(); };
  tab.appendChild(list);
  tab.appendChild(add);
}

// Save to backend
document.getElementById('save-btn').onclick = async function() {
  if (!adminToken) {
    const token = await requestAdminToken();
    if (!token) {
      alert('Admin token is required to save changes.');
      return;
    }
  }

  // Gather all form data
  const f = document.getElementById('admin-form');
  // About
  content.about = {
    name: f['about-name'].value,
    title: f['about-title'].value,
    description: f['about-description'].value.split(/\n\n+/).map(s=>s.trim()).filter(Boolean)
  };
  // Services
  if (content.services) content.services = content.services.map((s,i) => ({
    icon: f[`service-icon-${i}`].value,
    title: f[`service-title-${i}`].value,
    text: f[`service-text-${i}`].value
  }));
  // Projects
  if (content.projects) content.projects = content.projects.map((p,i) => ({
    title: f[`project-title-${i}`].value,
    category: f[`project-category-${i}`].value,
    type: f[`project-type-${i}`].value,
    image: f[`project-image-${i}`].value,
    alt: f[`project-alt-${i}`].value
  }));
  // Testimonials
  if (content.testimonials) content.testimonials = content.testimonials.map((t,i) => ({
    avatar: f[`testimonial-avatar-${i}`].value,
    name: f[`testimonial-name-${i}`].value,
    text: f[`testimonial-text-${i}`].value
  }));
  // Certificates
  if (content.certificates) content.certificates = content.certificates.map((c,i) => ({
    logo: f[`certificate-logo-${i}`].value,
    alt: f[`certificate-alt-${i}`].value
  }));
  // Education
  if (content.education) content.education = content.education.map((e,i) => ({
    school: f[`education-school-${i}`].value,
    years: f[`education-years-${i}`].value,
    text: f[`education-text-${i}`].value
  }));
  // Experience
  if (content.experience) content.experience = content.experience.map((e,i) => ({
    title: f[`experience-title-${i}`].value,
    company: f[`experience-company-${i}`].value,
    years: f[`experience-years-${i}`].value,
    text: f[`experience-text-${i}`].value
  }));
  // Skills
  if (content.skills) content.skills = content.skills.map((s,i) => ({
    name: f[`skill-name-${i}`].value,
    value: Number(f[`skill-value-${i}`].value)
  }));

  // Send to backend
  fetch(`${API_URL}/api/update-content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(content)
  })
  .then(r => r.json())
  .then(res => {
    if (res.success) {
      document.getElementById('msg').textContent = 'Content updated successfully!';
      document.getElementById('msg').className = 'msg success';
    } else {
      document.getElementById('msg').textContent = 'Error: ' + (res.error || 'Unknown error');
      document.getElementById('msg').className = 'msg error';
      if (res.error === 'Unauthorized') sessionStorage.removeItem('admin-token');
    }
  })
  .catch(() => {
    document.getElementById('msg').textContent = 'Error: Could not connect to backend.';
    document.getElementById('msg').className = 'msg error';
  });
};
