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

// Navigation switching (matching portfolio style)
document.querySelectorAll('[data-nav-link]').forEach(link => {
  link.addEventListener('click', function() {
    const pageName = this.dataset.tab;
    
    // Remove active class from all nav links and articles
    document.querySelectorAll('[data-nav-link]').forEach(navLink => navLink.classList.remove('active'));
    document.querySelectorAll('.article').forEach(article => article.classList.remove('active'));
    
    // Add active class to clicked nav link and corresponding article
    this.classList.add('active');
    document.getElementById('tab-' + pageName).classList.add('active');
    
    // Scroll to top
    window.scrollTo(0, 0);
  });
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

// Helper: create date range input
function createDateRangeInput(yearsValue, name) {
  const container = document.createElement('div');
  container.className = 'date-range-container';
  
  // Parse existing years value (e.g., "2019 — 2023" or "March 2024 — Present")
  let startDate = '';
  let endDate = '';
  let isPresent = false;
  
  if (yearsValue) {
    const parts = yearsValue.split('—').map(s => s.trim());
    if (parts.length >= 2) {
      // Try to parse start date
      const startPart = parts[0].trim();
      if (startPart.match(/^\d{4}$/)) {
        startDate = startPart + '-01';
      } else if (startPart.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/)) {
        const [month, year] = startPart.split(' ');
        const monthNum = ['January','February','March','April','May','June','July','August','September','October','November','December'].indexOf(month) + 1;
        startDate = `${year}-${monthNum.toString().padStart(2, '0')}`;
      }
      
      // Try to parse end date
      const endPart = parts[1].trim();
      if (endPart.toLowerCase() === 'present') {
        isPresent = true;
      } else if (endPart.match(/^\d{4}$/)) {
        endDate = endPart + '-12';
      } else if (endPart.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/)) {
        const [month, year] = endPart.split(' ');
        const monthNum = ['January','February','March','April','May','June','July','August','September','October','November','December'].indexOf(month) + 1;
        endDate = `${year}-${monthNum.toString().padStart(2, '0')}`;
      }
    }
  }
  
  // Start date input
  const startLabel = document.createElement('label');
  startLabel.textContent = 'Start Date:';
  const startInput = document.createElement('input');
  startInput.type = 'month';
  startInput.value = startDate;
  startInput.className = 'date-input';
  
  // End date input
  const endLabel = document.createElement('label');
  endLabel.textContent = 'End Date:';
  const endInput = document.createElement('input');
  endInput.type = 'month';
  endInput.value = endDate;
  endInput.className = 'date-input';
  
  // Present checkbox
  const presentContainer = document.createElement('div');
  presentContainer.className = 'present-container';
  const presentCheckbox = document.createElement('input');
  presentCheckbox.type = 'checkbox';
  presentCheckbox.id = `${name}-present`;
  presentCheckbox.checked = isPresent;
  const presentLabel = document.createElement('label');
  presentLabel.htmlFor = `${name}-present`;
  presentLabel.textContent = 'Present';
  presentContainer.appendChild(presentCheckbox);
  presentContainer.appendChild(presentLabel);
  
  // Hidden input to store the formatted value
  const hiddenInput = document.createElement('input');
  hiddenInput.type = 'hidden';
  hiddenInput.name = name;
  
  // Function to update hidden input value
  function updateHiddenValue() {
    if (!startInput.value) {
      hiddenInput.value = '';
      return;
    }
    
    const startYear = startInput.value.split('-')[0];
    const startMonth = startInput.value.split('-')[1];
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const startFormatted = `${monthNames[parseInt(startMonth) - 1]} ${startYear}`;
    
    let endFormatted;
    if (presentCheckbox.checked) {
      endFormatted = 'Present';
      endInput.disabled = true;
    } else {
      endInput.disabled = false;
      if (endInput.value) {
        const endYear = endInput.value.split('-')[0];
        const endMonth = endInput.value.split('-')[1];
        endFormatted = `${monthNames[parseInt(endMonth) - 1]} ${endYear}`;
      } else {
        endFormatted = 'Present';
      }
    }
    
    hiddenInput.value = `${startFormatted} — ${endFormatted}`;
  }
  
  // Event listeners
  startInput.addEventListener('change', updateHiddenValue);
  endInput.addEventListener('change', updateHiddenValue);
  presentCheckbox.addEventListener('change', updateHiddenValue);
  
  // Initial update
  updateHiddenValue();
  
  // Assemble container
  container.appendChild(startLabel);
  container.appendChild(startInput);
  container.appendChild(endLabel);
  container.appendChild(endInput);
  container.appendChild(presentContainer);
  container.appendChild(hiddenInput);
  
  return container;
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
  preview.className = 'image-preview';
  container.appendChild(preview);

  const fileInputId = `file-input-${name}`;
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.id = fileInputId;
  fileInput.style.display = 'none'; // Hide the default input

  const fileInputLabel = document.createElement('label');
  fileInputLabel.htmlFor = fileInputId;
  fileInputLabel.className = 'file-input-label';
  fileInputLabel.textContent = 'Choose File';
  container.appendChild(fileInputLabel);

  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show selected file name
    fileInputLabel.textContent = file.name;

    if (!adminToken) {
      const token = await requestAdminToken();
      if (!token) {
        alert('Admin token is required to upload images.');
        fileInputLabel.textContent = 'Choose File';
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
  renderDashboard();
  renderAbout();
  renderServices();
  renderProjects();
  renderTestimonials();
  renderCertificates();
  renderEducation();
  renderExperience();
  renderSkills();
  renderContacts();
}

// DASHBOARD
function renderDashboard() {
  // Update stats
  document.getElementById('services-count').textContent = (content.services || []).length;
  document.getElementById('projects-count').textContent = (content.projects || []).length;
  document.getElementById('testimonials-count').textContent = (content.testimonials || []).length;
  
  // Update contacts count (unread messages)
  if (adminToken) {
    fetch(`${API_URL}/api/contacts`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })
    .then(r => r.json())
    .then(contacts => {
      const unreadCount = contacts.filter(c => !c.read).length;
      document.getElementById('contacts-count').textContent = unreadCount;
    })
    .catch(() => {
      document.getElementById('contacts-count').textContent = '0';
    });
  }
  
  // Setup quick action buttons
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.onclick = (e) => {
      const action = e.currentTarget.dataset.action;
      switch(action) {
        case 'add-project':
          switchToTab('projects');
          // Trigger add project
          setTimeout(() => {
            const addBtn = document.querySelector('#tab-projects .add-btn');
            if (addBtn) addBtn.click();
          }, 100);
          break;
        case 'add-testimonial':
          switchToTab('testimonials');
          setTimeout(() => {
            const addBtn = document.querySelector('#tab-testimonials .add-btn');
            if (addBtn) addBtn.click();
          }, 100);
          break;
        case 'view-contacts':
          switchToTab('contacts');
          break;
      }
    };
  });
}

// Helper function to switch tabs
function switchToTab(tabName) {
  // Remove active class from all nav links and articles
  document.querySelectorAll('[data-nav-link]').forEach(navLink => navLink.classList.remove('active'));
  document.querySelectorAll('.article').forEach(article => article.classList.remove('active'));
  
  // Add active class to target tab
  const navLink = document.querySelector(`[data-tab="${tabName}"]`);
  const article = document.getElementById(`tab-${tabName}`);
  
  if (navLink && article) {
    navLink.classList.add('active');
    article.classList.add('active');
  }
}

// Enhanced notification system
function showNotification(title, message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  const iconMap = {
    success: 'checkmark-circle-outline',
    error: 'alert-circle-outline',
    info: 'information-circle-outline'
  };
  
  notification.innerHTML = `
    <div class="notification-content">
      <ion-icon name="${iconMap[type]}" class="notification-icon"></ion-icon>
      <div class="notification-text">
        <div class="notification-title">${title}</div>
        <p class="notification-message">${message}</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Hide and remove notification
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
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
  
  // Create section header with add button
  const header = document.createElement('div');
  header.className = 'section-header';
  
  const title = document.createElement('h3');
  title.className = 'section-title';
  title.textContent = 'Services';
  
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'add-btn';
  add.innerHTML = '<ion-icon name="add-outline"></ion-icon> Add Service';
  add.onclick = () => { (content.services = content.services||[]).push({icon:'',title:'',text:''}); renderServices(); };
  
  header.appendChild(title);
  header.appendChild(add);
  tab.appendChild(header);
  
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
  tab.appendChild(list);
}

// PROJECTS
function renderProjects() {
  const tab = document.getElementById('tab-projects');
  tab.innerHTML = '';
  
  // Create section header with add button
  const header = document.createElement('div');
  header.className = 'section-header';
  
  const title = document.createElement('h3');
  title.className = 'section-title';
  title.textContent = 'Projects';
  
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'add-btn';
  add.innerHTML = '<ion-icon name="add-outline"></ion-icon> Add Project';
  add.onclick = () => { (content.projects = content.projects||[]).push({title:'',category:'',type:'',image:'',alt:''}); renderProjects(); };
  
  header.appendChild(title);
  header.appendChild(add);
  tab.appendChild(header);
  
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
  tab.appendChild(list);
}

// TESTIMONIALS
function renderTestimonials() {
  const tab = document.getElementById('tab-testimonials');
  tab.innerHTML = '';
  
  // Create section header with add button
  const header = document.createElement('div');
  header.className = 'section-header';
  
  const title = document.createElement('h3');
  title.className = 'section-title';
  title.textContent = 'Testimonials';
  
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'add-btn';
  add.innerHTML = '<ion-icon name="add-outline"></ion-icon> Add Testimonial';
  add.onclick = () => { (content.testimonials = content.testimonials||[]).push({avatar:'',name:'',text:''}); renderTestimonials(); };
  
  header.appendChild(title);
  header.appendChild(add);
  tab.appendChild(header);
  
  const list = document.createElement('div');
  list.className = 'list-section';
  (content.testimonials||[]).forEach((t, i) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    
    // Add preview button at the top
    const previewBtn = document.createElement('button');
    previewBtn.type = 'button';
    previewBtn.className = 'btn';
    previewBtn.innerHTML = '<ion-icon name="eye-outline"></ion-icon> Preview';
    previewBtn.onclick = () => showTestimonialModal(t);
    previewBtn.style.marginBottom = '15px';
    item.appendChild(previewBtn);
    
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
  tab.appendChild(list);
}

// Show testimonial modal
function showTestimonialModal(testimonial) {
  const modal = document.getElementById('testimonial-modal');
  const avatar = document.getElementById('modal-testimonial-avatar');
  const name = document.getElementById('modal-testimonial-name');
  const text = document.getElementById('modal-testimonial-text');
  
  console.log('Showing testimonial modal for:', testimonial); // Debug log
  
  // Set content
  if (testimonial.avatar) {
    avatar.src = testimonial.avatar.startsWith('uploads/') ? `${API_URL}/${testimonial.avatar}` : `./assets/images/${testimonial.avatar}`;
  } else {
    avatar.src = './assets/images/avatar-1.png'; // Default avatar
  }
  avatar.alt = testimonial.name || 'Testimonial';
  name.textContent = testimonial.name || 'Anonymous';
  text.innerHTML = `<p>${testimonial.text || 'No testimonial text available.'}</p>`;
  
  // Show modal with display block first, then add active class
  modal.style.display = 'flex';
  setTimeout(() => {
    modal.classList.add('active');
  }, 10);
}

// Close testimonial modal
function closeTestimonialModal() {
  const modal = document.getElementById('testimonial-modal');
  modal.classList.remove('active');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 250); // Wait for transition to complete
}

// Set up modal close events when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const closeBtn = document.getElementById('testimonial-close-btn');
  const modal = document.getElementById('testimonial-modal');
  
  if (closeBtn) {
    closeBtn.onclick = closeTestimonialModal;
  }
  
  if (modal) {
    modal.onclick = (e) => {
      if (e.target.id === 'testimonial-modal') {
        closeTestimonialModal();
      }
    };
  }
});

// CERTIFICATES
function renderCertificates() {
  const tab = document.getElementById('tab-certificates');
  tab.innerHTML = '';
  
  // Create section header with add button
  const header = document.createElement('div');
  header.className = 'section-header';
  
  const title = document.createElement('h3');
  title.className = 'section-title';
  title.textContent = 'Certificates';
  
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'add-btn';
  add.innerHTML = '<ion-icon name="add-outline"></ion-icon> Add Certificate';
  add.onclick = () => { (content.certificates = content.certificates||[]).push({logo:'',alt:''}); renderCertificates(); };
  
  header.appendChild(title);
  header.appendChild(add);
  tab.appendChild(header);
  
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
  tab.appendChild(list);
}

// EDUCATION
function renderEducation() {
  const tab = document.getElementById('tab-education');
  tab.innerHTML = '';
  
  // Create section header with add button
  const header = document.createElement('div');
  header.className = 'section-header';
  
  const title = document.createElement('h3');
  title.className = 'section-title';
  title.textContent = 'Education';
  
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'add-btn';
  add.innerHTML = '<ion-icon name="add-outline"></ion-icon> Add Education';
  add.onclick = () => { (content.education = content.education||[]).push({school:'',years:'',text:''}); renderEducation(); };
  
  header.appendChild(title);
  header.appendChild(add);
  tab.appendChild(header);
  
  const list = document.createElement('div');
  list.className = 'list-section';
  (content.education||[]).forEach((e, i) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.appendChild(labeledInput('School', createInput('text', e.school, 'School', `education-school-${i}`)));
    
    const dateRangeGroup = document.createElement('div');
    dateRangeGroup.className = 'form-group';
    const dateLabel = document.createElement('label');
    dateLabel.textContent = 'Duration';
    dateRangeGroup.appendChild(dateLabel);
    dateRangeGroup.appendChild(createDateRangeInput(e.years, `education-years-${i}`));
    item.appendChild(dateRangeGroup);
    
    item.appendChild(labeledInput('Text', createInput('textarea', e.text, 'Description', `education-text-${i}`)));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-btn';
    remove.textContent = 'Remove';
    remove.onclick = () => { content.education.splice(i,1); renderEducation(); };
    item.appendChild(remove);
    list.appendChild(item);
  });
  tab.appendChild(list);
}

// EXPERIENCE
function renderExperience() {
  const tab = document.getElementById('tab-experience');
  tab.innerHTML = '';
  
  // Create section header with add button
  const header = document.createElement('div');
  header.className = 'section-header';
  
  const title = document.createElement('h3');
  title.className = 'section-title';
  title.textContent = 'Experience';
  
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'add-btn';
  add.innerHTML = '<ion-icon name="add-outline"></ion-icon> Add Experience';
  add.onclick = () => { (content.experience = content.experience||[]).push({title:'',company:'',years:'',text:''}); renderExperience(); };
  
  header.appendChild(title);
  header.appendChild(add);
  tab.appendChild(header);
  
  const list = document.createElement('div');
  list.className = 'list-section';
  (content.experience||[]).forEach((e, i) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.appendChild(labeledInput('Title', createInput('text', e.title, 'Title', `experience-title-${i}`)));
    item.appendChild(labeledInput('Company', createInput('text', e.company, 'Company', `experience-company-${i}`)));
    
    const dateRangeGroup = document.createElement('div');
    dateRangeGroup.className = 'form-group';
    const dateLabel = document.createElement('label');
    dateLabel.textContent = 'Duration';
    dateRangeGroup.appendChild(dateLabel);
    dateRangeGroup.appendChild(createDateRangeInput(e.years, `experience-years-${i}`));
    item.appendChild(dateRangeGroup);
    
    item.appendChild(labeledInput('Text', createInput('textarea', e.text, 'Description', `experience-text-${i}`)));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-btn';
    remove.textContent = 'Remove';
    remove.onclick = () => { content.experience.splice(i,1); renderExperience(); };
    item.appendChild(remove);
    list.appendChild(item);
  });
  tab.appendChild(list);
}

// SKILLS
function renderSkills() {
  const tab = document.getElementById('tab-skills');
  tab.innerHTML = '';
  
  // Create section header with add button
  const header = document.createElement('div');
  header.className = 'section-header';
  
  const title = document.createElement('h3');
  title.className = 'section-title';
  title.textContent = 'Skills';
  
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'add-btn';
  add.innerHTML = '<ion-icon name="add-outline"></ion-icon> Add Skill';
  add.onclick = () => { (content.skills = content.skills||[]).push({name:'',value:0}); renderSkills(); };
  
  header.appendChild(title);
  header.appendChild(add);
  tab.appendChild(header);
  
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
  tab.appendChild(list);
}

// CONTACTS
function renderContacts() {
  const tab = document.getElementById('tab-contacts');
  tab.innerHTML = '<div class="loading">Loading contacts...</div>';
  
  if (!adminToken) {
    tab.innerHTML = '<p>Please authenticate to view contacts.</p>';
    return;
  }
  
  fetch(`${API_URL}/api/contacts`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  })
  .then(r => r.json())
  .then(contacts => {
    tab.innerHTML = '';
    
    if (contacts.length === 0) {
      tab.innerHTML = '<p class="no-contacts">No contact submissions yet.</p>';
      return;
    }
    
    const contactsList = document.createElement('div');
    contactsList.className = 'contacts-list';
    
    contacts.forEach(contact => {
      const contactItem = document.createElement('div');
      contactItem.className = `contact-item ${contact.read ? 'read' : 'unread'}`;
      
      const date = new Date(contact.timestamp).toLocaleString();
      
      contactItem.innerHTML = `
        <div class="contact-header">
          <h4>${contact.fullname}</h4>
          <span class="contact-date">${date}</span>
          ${!contact.read ? '<span class="unread-badge">New</span>' : ''}
        </div>
        <div class="contact-email">
          <a href="mailto:${contact.email}">${contact.email}</a>
        </div>
        <div class="contact-message">
          <p>${contact.message}</p>
        </div>
        <div class="contact-actions">
          ${!contact.read ? `<button class="mark-read-btn" onclick="markContactRead('${contact.id}')">Mark as Read</button>` : ''}
          <button class="delete-contact-btn" onclick="deleteContact('${contact.id}')">Delete</button>
        </div>
      `;
      
      contactsList.appendChild(contactItem);
    });
    
    tab.appendChild(contactsList);
  })
  .catch(err => {
    tab.innerHTML = '<p class="error">Failed to load contacts. Please try again.</p>';
    console.error('Failed to load contacts:', err);
  });
}

// Mark contact as read
async function markContactRead(contactId) {
  if (!adminToken) {
    const token = await requestAdminToken();
    if (!token) return;
  }
  
  fetch(`${API_URL}/api/contacts/${contactId}/read`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  })
  .then(r => r.json())
  .then(result => {
    if (result.success) {
      renderContacts(); // Refresh the contacts list
    } else {
      alert('Failed to mark contact as read');
    }
  })
  .catch(err => {
    alert('Error marking contact as read');
    console.error(err);
  });
}

// Delete contact
async function deleteContact(contactId) {
  if (!confirm('Are you sure you want to delete this contact?')) return;
  
  if (!adminToken) {
    const token = await requestAdminToken();
    if (!token) return;
  }
  
  fetch(`${API_URL}/api/contacts/${contactId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  })
  .then(r => r.json())
  .then(result => {
    if (result.success) {
      renderContacts(); // Refresh the contacts list
    } else {
      alert('Failed to delete contact');
    }
  })
  .catch(err => {
    alert('Error deleting contact');
    console.error(err);
  });
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
