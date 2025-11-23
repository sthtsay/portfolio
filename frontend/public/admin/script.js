const API_URL = 'https://portfolio-505u.onrender.com';
let adminToken = sessionStorage.getItem('admin-token');

// Auto-save configuration
let autoSaveTimer = null;
let hasUnsavedChanges = false;
const AUTO_SAVE_DELAY = 3000; // 3 seconds after last change

// --- Token Modal Logic ---
const tokenModal = document.getElementById('token-modal');
const tokenInput = document.getElementById('token-input');
const tokenSubmitBtn = document.getElementById('token-submit-btn');
const tokenCancelBtn = document.getElementById('token-cancel-btn');

let resolveTokenPromise = null;
  ``
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
  link.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const pageName = this.dataset.tab;
    console.log('Navigation clicked:', pageName);
    
    switchToTab(pageName);
    
    // Scroll active tab into view on mobile
    if (window.innerWidth <= 768) {
      this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    
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
  
  // Add auto-save listener
  input.addEventListener('input', () => {
    hasUnsavedChanges = true;
    scheduleAutoSave();
  });
  
  return input;
}

// Schedule auto-save
function scheduleAutoSave() {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }
  
  // Show unsaved indicator
  updateSaveStatus('unsaved');
  
  autoSaveTimer = setTimeout(async () => {
    if (hasUnsavedChanges) {
      updateSaveStatus('saving');
      const success = await saveContent();
      if (success) {
        hasUnsavedChanges = false;
        updateSaveStatus('saved');
      } else {
        updateSaveStatus('error');
      }
    }
  }, AUTO_SAVE_DELAY);
}

// Update save status indicator
function updateSaveStatus(status) {
  const saveBtn = document.getElementById('save-btn');
  let statusEl = document.getElementById('save-status');
  
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.id = 'save-status';
    statusEl.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 10px 15px; border-radius: 8px; font-size: 14px; z-index: 10000; transition: all 0.3s;';
    document.body.appendChild(statusEl);
  }
  
  const statuses = {
    unsaved: { text: '● Unsaved changes', color: '#ff9800', bg: 'rgba(255, 152, 0, 0.1)' },
    saving: { text: '⟳ Saving...', color: '#2196F3', bg: 'rgba(33, 150, 243, 0.1)' },
    saved: { text: '✓ All changes saved', color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.1)' },
    error: { text: '✗ Save failed', color: '#f44336', bg: 'rgba(244, 67, 54, 0.1)' }
  };
  
  const s = statuses[status];
  statusEl.textContent = s.text;
  statusEl.style.color = s.color;
  statusEl.style.background = s.bg;
  statusEl.style.border = `1px solid ${s.color}`;
  
  // Update save button visual state
  if (saveBtn) {
    saveBtn.classList.remove('has-changes', 'saving');
    if (status === 'unsaved') {
      saveBtn.classList.add('has-changes');
    } else if (status === 'saving') {
      saveBtn.classList.add('saving');
    }
  }
  
  if (status === 'saved') {
    setTimeout(() => {
      statusEl.style.opacity = '0';
      setTimeout(() => statusEl.remove(), 300);
    }, 2000);
  } else {
    statusEl.style.opacity = '1';
  }
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

// Helper: create category dropdown
function createCategoryDropdown(currentValue, name) {
  const select = document.createElement('select');
  select.className = 'form-input';
  select.name = name;
  
  const categories = [
    'Web Development',
    'Mobile Development', 
    'Desktop Application',
    'Python Development',
    'Java Development',
    'JavaScript Development',
    'Database Design',
    'API Development',
    'UI/UX Design',
    'Data Analysis',
    'Machine Learning',
    'DevOps',
    'Testing & QA',
    'Other'
  ];
  
  // Add empty option
  const emptyOption = document.createElement('option');
  emptyOption.value = '';
  emptyOption.textContent = 'Select Category';
  select.appendChild(emptyOption);
  
  // Add category options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    if (currentValue === category) {
      option.selected = true;
    }
    select.appendChild(option);
  });
  
  return select;
}

// Helper: update type dropdown based on category
function updateTypeDropdown(typeSelect, category, currentValue = '') {
  // Clear existing options
  typeSelect.innerHTML = '';
  
  // Category to Type mapping
  const categoryTypeMap = {
    'Web Development': [
      { value: 'website projects', label: 'Website Projects' },
      { value: 'api projects', label: 'API Projects' }
    ],
    'Mobile Development': [
      { value: 'mobile projects', label: 'Mobile Projects' }
    ],
    'Desktop Application': [
      { value: 'desktop projects', label: 'Desktop Projects' }
    ],
    'Python Development': [
      { value: 'python projects', label: 'Python Projects' },
      { value: 'machine learning projects', label: 'Machine Learning Projects' },
      { value: 'data analysis projects', label: 'Data Analysis Projects' }
    ],
    'Java Development': [
      { value: 'java projects', label: 'Java Projects' },
      { value: 'desktop projects', label: 'Desktop Projects' },
      { value: 'api projects', label: 'API Projects' }
    ],
    'JavaScript Development': [
      { value: 'website projects', label: 'Website Projects' },
      { value: 'mobile projects', label: 'Mobile Projects' },
      { value: 'api projects', label: 'API Projects' }
    ],
    'Database Design': [
      { value: 'database projects', label: 'Database Projects' }
    ],
    'API Development': [
      { value: 'api projects', label: 'API Projects' }
    ],
    'UI/UX Design': [
      { value: 'design projects', label: 'UI/UX Design Projects' }
    ],
    'Data Analysis': [
      { value: 'data analysis projects', label: 'Data Analysis Projects' }
    ],
    'Machine Learning': [
      { value: 'machine learning projects', label: 'Machine Learning Projects' },
      { value: 'data analysis projects', label: 'Data Analysis Projects' }
    ],
    'DevOps': [
      { value: 'devops projects', label: 'DevOps Projects' }
    ],
    'Testing & QA': [
      { value: 'testing projects', label: 'Testing & QA Projects' }
    ],
    'Other': [
      { value: 'other projects', label: 'Other Projects' }
    ]
  };
  
  // Add empty option
  const emptyOption = document.createElement('option');
  emptyOption.value = '';
  emptyOption.textContent = category ? 'Select Type' : 'Select Category First';
  typeSelect.appendChild(emptyOption);
  
  // Add relevant types based on category
  if (category && categoryTypeMap[category]) {
    categoryTypeMap[category].forEach(type => {
      const option = document.createElement('option');
      option.value = type.value;
      option.textContent = type.label;
      if (currentValue === type.value) {
        option.selected = true;
      }
      typeSelect.appendChild(option);
    });
  } else if (!category) {
    // If no category selected, show all types
    const allTypes = [
      { value: 'python projects', label: 'Python Projects' },
      { value: 'website projects', label: 'Website Projects' },
      { value: 'java projects', label: 'Java Projects' },
      { value: 'mobile projects', label: 'Mobile Projects' },
      { value: 'desktop projects', label: 'Desktop Projects' },
      { value: 'api projects', label: 'API Projects' },
      { value: 'database projects', label: 'Database Projects' },
      { value: 'machine learning projects', label: 'Machine Learning Projects' },
      { value: 'data analysis projects', label: 'Data Analysis Projects' },
      { value: 'devops projects', label: 'DevOps Projects' },
      { value: 'testing projects', label: 'Testing & QA Projects' },
      { value: 'design projects', label: 'UI/UX Design Projects' },
      { value: 'other projects', label: 'Other Projects' }
    ];
    
    allTypes.forEach(type => {
      const option = document.createElement('option');
      option.value = type.value;
      option.textContent = type.label;
      if (currentValue === type.value) {
        option.selected = true;
      }
      typeSelect.appendChild(option);
    });
  }
}

// Helper: create type dropdown
function createTypeDropdown(currentValue, name) {
  const select = document.createElement('select');
  select.className = 'form-input';
  select.name = name;
  
  // Initialize with empty state - will be populated by updateTypeDropdown
  const emptyOption = document.createElement('option');
  emptyOption.value = '';
  emptyOption.textContent = 'Select Category First';
  select.appendChild(emptyOption);
  
  return select;
}

// Helper: create image upload input
function createImageUploadInput(name, currentImagePath) {
  const container = document.createElement('div');
  container.className = 'form-group';

  const label = document.createElement('label');
  label.textContent = 'Image';
  container.appendChild(label);

  const preview = document.createElement('img');
  const placeholderSvg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23333" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial"%3ENo Image%3C/text%3E%3C/svg%3E';
  
  // Handle empty or undefined image paths
  if (!currentImagePath || currentImagePath === '') {
    preview.src = placeholderSvg;
    preview.style.opacity = '0.5';
  } else if (currentImagePath.startsWith('uploads/')) {
    preview.src = `${API_URL}/${currentImagePath}`;
  } else {
    preview.src = currentImagePath.startsWith('./') ? currentImagePath : `./assets/images/${currentImagePath}`;
  }
  preview.className = 'image-preview';
  preview.onerror = function() {
    // If image fails to load, show placeholder
    this.src = placeholderSvg;
  };
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

    // Check for admin token and prompt if needed
    if (!adminToken) {
      const token = await requestAdminToken();
      if (!token) {
        showNotification('Error', 'Admin token is required to upload images', 'error');
        fileInputLabel.textContent = 'Choose File';
        return;
      }
    }

    // Show selected file name
    fileInputLabel.textContent = file.name;

    const formData = new FormData();
    formData.append('image', file);

    // Show uploading state
    fileInputLabel.textContent = 'Uploading...';
    fileInputLabel.style.opacity = '0.6';
    
    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: formData
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || `Upload failed with status ${res.status}`);
      }
      
      if (data.filePath) {
        // Update hidden input with new file path
        hiddenInput.value = data.filePath;
        
        // Update preview
        preview.src = `${API_URL}/${data.filePath}`;
        preview.style.opacity = '1';
        
        // Show success feedback
        fileInputLabel.textContent = 'Upload Success ✓';
        fileInputLabel.style.opacity = '1';
        
        // Auto-save content after successful upload
        showNotification('Success', 'Image uploaded! Saving changes...', 'success');
        
        // Save content to update portfolio
        const saveSuccess = await saveContent();
        
        if (saveSuccess) {
          showNotification('Success', 'Image uploaded and portfolio updated!', 'success');
        } else {
          showNotification('Warning', 'Image uploaded but failed to save. Please click Save Changes.', 'warning');
        }
        
        setTimeout(() => {
          fileInputLabel.textContent = 'Choose File';
        }, 2000);
      } else {
        throw new Error('No file path returned from server');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showNotification('Error', err.message || 'An error occurred during upload.', 'error');
      fileInputLabel.textContent = 'Choose File';
      fileInputLabel.style.opacity = '1';
      
      if (err.message.includes('Unauthorized')) {
        sessionStorage.removeItem('admin-token');
        adminToken = null;
        showNotification('Error', 'Session expired. Please enter admin token again.', 'error');
      }
    }
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
    setupRealTimeUpdates();
  })
  .catch(() => {
    content = {};
    renderAll();
    setupRealTimeUpdates();
  });

// Setup real-time updates with Socket.io
function setupRealTimeUpdates() {
  // Load Socket.io script dynamically
  const script = document.createElement('script');
  script.src = API_URL + '/socket.io/socket.io.js';
  script.onload = function() {
    const socket = io(API_URL);
    
    // Listen for content updates
    socket.on('content-updated', (data) => {
      console.log('Content updated, refreshing...');
      // Refresh content
      fetch(`${API_URL}/content.json`)
        .then(r => r.json())
        .then(newData => {
          content = newData;
          renderAll();
          showNotification('Info', 'Content updated from another session', 'info');
        });
    });
    
    // Listen for new contact messages
    socket.on('new-contact', (data) => {
      console.log('New contact message received');
      // If we're on the contacts tab, refresh it
      const activeTab = document.querySelector('.navbar-link.active');
      if (activeTab && activeTab.dataset.tab === 'contacts') {
        renderContacts();
      }
      
      // Update dashboard stats
      if (activeTab && activeTab.dataset.tab === 'dashboard') {
        renderDashboard();
      }
      
      // Show notification
      showNotification('New Message!', `New contact message from ${data.name || 'visitor'}`, 'info');
    });
    
    console.log('Real-time updates connected');
  };
  script.onerror = function() {
    console.log('Socket.io not available, real-time updates disabled');
  };
  document.head.appendChild(script);
}

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
  renderSettings();
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
  
  // Render charts
  renderCharts();
  
  // Setup quick action buttons
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const action = e.currentTarget.dataset.action;
      console.log('Quick action clicked:', action);
      
      switch(action) {
        case 'add-project':
          switchToTab('projects');
          // Trigger add project after ensuring content is rendered
          setTimeout(() => {
            if (!content.projects) content.projects = [];
            content.projects.unshift({title:'',category:'',type:'',image:'',alt:'',link:''}); // Add to beginning
            renderProjects();
            showNotification('Success', 'New project form added at top', 'success');
          }, 200);
          break;
        case 'add-testimonial':
          switchToTab('testimonials');
          setTimeout(() => {
            if (!content.testimonials) content.testimonials = [];
            content.testimonials.unshift({avatar:'',name:'',text:''}); // Add to beginning
            renderTestimonials();
            showNotification('Success', 'New testimonial form added at top', 'success');
          }, 200);
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
  
  // Show/hide save button based on tab
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) {
    if (tabName === 'dashboard' || tabName === 'contacts') {
      saveBtn.style.display = 'none';
    } else {
      saveBtn.style.display = 'flex'; // Use flex to maintain layout
    }
  }
  
  // Adjust bottom padding based on save button visibility
  const main = document.querySelector('main');
  if (main && window.innerWidth <= 768) {
    if (tabName === 'dashboard' || tabName === 'contacts') {
      main.style.paddingBottom = '80px'; // Just nav height
    } else {
      main.style.paddingBottom = '150px'; // Nav + save button
    }
  }
}

// Helper function to create list item with new item highlighting
function createListItem(isNew = false) {
  const item = document.createElement('div');
  item.className = isNew ? 'list-item new-item' : 'list-item';
  
  if (isNew) {
    item.style.position = 'relative';
    const badge = document.createElement('span');
    badge.className = 'new-item-badge';
    badge.textContent = 'NEW';
    item.appendChild(badge);
    
    // Remove highlighting after 5 seconds
    setTimeout(() => {
      item.classList.remove('new-item');
      if (badge.parentNode) {
        badge.remove();
      }
    }, 5000);
  }
  
  return item;
}

// Helper function to check if item is new (empty required fields)
function isNewItem(item, requiredFields) {
  return requiredFields.some(field => !item[field] || item[field].trim() === '');
}

// Auto-save content function
async function saveContent() {
  if (!adminToken) {
    const token = await requestAdminToken();
    if (!token) {
      customAlert('Authentication Required', 'Admin token is required to save changes.', 'warning');
      return false;
    }
  }

  try {
    // Gather all form data (same as the main save function)
    const f = document.getElementById('admin-form');
    
    // About
    if (f['about-name'] && f['about-title'] && f['about-description']) {
      content.about = {
        name: f['about-name'].value,
        title: f['about-title'].value,
        description: f['about-description'].value.split(/\n\n+/).map(s=>s.trim()).filter(Boolean)
      };
    }
    
    // Services - filter out empty entries
    if (content.services) {
      content.services = content.services.map((s,i) => ({
        icon: f[`service-icon-${i}`] ? f[`service-icon-${i}`].value : s.icon,
        title: f[`service-title-${i}`] ? f[`service-title-${i}`].value : s.title,
        text: f[`service-text-${i}`] ? f[`service-text-${i}`].value : s.text
      })).filter(service => service.title && service.title.trim() !== '');
    }
    
    // Projects - filter out empty entries
    if (content.projects) {
      console.log('Original projects:', content.projects);
      
      const mappedProjects = content.projects.map((p,i) => {
        const titleField = f[`project-title-${i}`];
        const categoryField = f[`project-category-${i}`];
        const typeField = f[`project-type-${i}`];
        const imageField = f[`project-image-${i}`];
        const altField = f[`project-alt-${i}`];
        const linkField = f[`project-link-${i}`];
        
        console.log(`Project ${i}:`, {
          titleField: titleField ? titleField.value : 'NOT FOUND',
          categoryField: categoryField ? categoryField.value : 'NOT FOUND',
          typeField: typeField ? typeField.value : 'NOT FOUND',
          imageField: imageField ? imageField.value : 'NOT FOUND',
          altField: altField ? altField.value : 'NOT FOUND',
          linkField: linkField ? linkField.value : 'NOT FOUND'
        });
        
        return {
          title: titleField ? titleField.value : p.title,
          category: categoryField ? categoryField.value : p.category,
          type: typeField ? typeField.value : p.type,
          image: imageField ? imageField.value : p.image,
          alt: altField ? altField.value : p.alt,
          link: linkField ? linkField.value : (p.link || '')
        };
      });
      
      console.log('Mapped projects:', mappedProjects);
      
      content.projects = mappedProjects.filter(project => {
        const isValid = project.title && project.title.trim() !== '';
        console.log('Project filter:', project, 'Valid:', isValid);
        return isValid;
      });
      
      console.log('Final filtered projects:', content.projects);
    }
    
    // Testimonials - filter out empty entries
    if (content.testimonials) {
      content.testimonials = content.testimonials.map((t,i) => ({
        avatar: f[`testimonial-avatar-${i}`] ? f[`testimonial-avatar-${i}`].value : t.avatar,
        name: f[`testimonial-name-${i}`] ? f[`testimonial-name-${i}`].value : t.name,
        text: f[`testimonial-text-${i}`] ? f[`testimonial-text-${i}`].value : t.text
      })).filter(testimonial => testimonial.name && testimonial.name.trim() !== '' && testimonial.text && testimonial.text.trim() !== '');
    }
    
    // Certificates
    if (content.certificates) content.certificates = content.certificates.map((c,i) => ({
      logo: f[`certificate-logo-${i}`] ? f[`certificate-logo-${i}`].value : c.logo,
      alt: f[`certificate-alt-${i}`] ? f[`certificate-alt-${i}`].value : c.alt
    }));
    
    // Education
    if (content.education) content.education = content.education.map((e,i) => ({
      school: f[`education-school-${i}`] ? f[`education-school-${i}`].value : e.school,
      years: f[`education-years-${i}`] ? f[`education-years-${i}`].value : e.years,
      text: f[`education-text-${i}`] ? f[`education-text-${i}`].value : e.text
    }));
    
    // Experience
    if (content.experience) content.experience = content.experience.map((e,i) => ({
      title: f[`experience-title-${i}`] ? f[`experience-title-${i}`].value : e.title,
      company: f[`experience-company-${i}`] ? f[`experience-company-${i}`].value : e.company,
      years: f[`experience-years-${i}`] ? f[`experience-years-${i}`].value : e.years,
      text: f[`experience-text-${i}`] ? f[`experience-text-${i}`].value : e.text
    }));
    
    // Skills
    if (content.skills) content.skills = content.skills.map((s,i) => ({
      name: f[`skill-name-${i}`] ? f[`skill-name-${i}`].value : s.name,
      value: f[`skill-value-${i}`] ? Number(f[`skill-value-${i}`].value) : s.value
    }));
    
    // Site Settings
    if (f['site-title'] || f['site-description'] || f['site-author']) {
      content.siteSettings = {
        title: f['site-title'] ? f['site-title'].value : (content.siteSettings?.title || ''),
        description: f['site-description'] ? f['site-description'].value : (content.siteSettings?.description || ''),
        keywords: f['site-keywords'] ? f['site-keywords'].value : (content.siteSettings?.keywords || ''),
        author: f['site-author'] ? f['site-author'].value : (content.siteSettings?.author || ''),
        siteUrl: f['site-url'] ? f['site-url'].value : (content.siteSettings?.siteUrl || ''),
        avatar: f['site-avatar'] ? f['site-avatar'].value : (content.siteSettings?.avatar || ''),
        favicon: f['site-avatar'] ? f['site-avatar'].value : (content.siteSettings?.favicon || '')
      };
    }
    
    // Contact Info
    if (f['contact-email'] || f['contact-phone'] || f['contact-location']) {
      content.contactInfo = {
        email: f['contact-email'] ? f['contact-email'].value : (content.contactInfo?.email || ''),
        phone: f['contact-phone'] ? f['contact-phone'].value : (content.contactInfo?.phone || ''),
        location: f['contact-location'] ? f['contact-location'].value : (content.contactInfo?.location || '')
      };
    }
    
    // Social Media - filter out empty entries
    if (content.socialMedia) {
      content.socialMedia = content.socialMedia.map((s,i) => ({
        platform: f[`social-platform-${i}`] ? f[`social-platform-${i}`].value : s.platform,
        url: f[`social-url-${i}`] ? f[`social-url-${i}`].value : s.url,
        icon: f[`social-icon-${i}`] ? f[`social-icon-${i}`].value : s.icon
      })).filter(social => {
        // Only include entries where all fields are non-empty strings
        const isValid = social.platform && social.platform.trim() !== '' && 
                       social.url && social.url.trim() !== '' && 
                       social.icon && social.icon.trim() !== '';
        console.log('Social media entry:', social, 'Valid:', isValid);
        return isValid;
      });
      console.log('Filtered social media:', content.socialMedia);
    }

    // Send to backend
    const response = await fetch(`${API_URL}/api/update-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(content)
    });

    const result = await response.json();
    
    if (result.success) {
      return true;
    } else {
      console.error('Save failed:', result.error);
      if (result.error === 'Unauthorized') sessionStorage.removeItem('admin-token');
      return false;
    }
  } catch (error) {
    console.error('Save error:', error);
    return false;
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

// Custom Alert Modal
function customAlert(title, message, type = 'info') {
  return new Promise((resolve) => {
    const modal = document.getElementById('alert-modal');
    const titleEl = document.getElementById('alert-title');
    const messageEl = document.getElementById('alert-message');
    const iconEl = document.getElementById('alert-icon');
    const okBtn = document.getElementById('alert-ok');
    
    // Set content
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    // Set icon based on type
    const iconMap = {
      success: 'checkmark-circle-outline',
      error: 'alert-circle-outline',
      warning: 'warning-outline',
      info: 'information-circle-outline'
    };
    
    iconEl.className = `alert-icon ${type}`;
    iconEl.innerHTML = `<ion-icon name="${iconMap[type]}"></ion-icon>`;
    
    // Show modal
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
    
    // Handle OK button
    const handleOk = () => {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.style.display = 'none';
        resolve(true);
      }, 300);
      okBtn.removeEventListener('click', handleOk);
    };
    
    okBtn.addEventListener('click', handleOk);
    
    // Handle ESC key
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        handleOk();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  });
}

// Custom Confirm Modal
function customConfirm(title, message, confirmText = 'Confirm', cancelText = 'Cancel') {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirm-modal');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const confirmBtn = document.getElementById('confirm-ok');
    const cancelBtn = document.getElementById('confirm-cancel');
    
    // Set content
    titleEl.textContent = title;
    messageEl.textContent = message;
    confirmBtn.textContent = confirmText;
    cancelBtn.textContent = cancelText;
    
    // Show modal
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
    
    // Handle confirm button
    const handleConfirm = () => {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.style.display = 'none';
        resolve(true);
      }, 300);
      cleanup();
    };
    
    // Handle cancel button
    const handleCancel = () => {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.style.display = 'none';
        resolve(false);
      }, 300);
      cleanup();
    };
    
    // Handle ESC key
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };
    
    // Cleanup function
    const cleanup = () => {
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
      document.removeEventListener('keydown', handleEsc);
    };
    
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    document.addEventListener('keydown', handleEsc);
    
    // Handle click outside modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        handleCancel();
      }
    });
  });
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
  add.onclick = (e) => { 
    e.preventDefault();
    e.stopPropagation();
    console.log('Adding new service');
    (content.services = content.services||[]).unshift({icon:'',title:'',text:''}); // Add to beginning
    renderServices(); 
    showNotification('Success', 'New service form added at top', 'success');
  };
  
  header.appendChild(title);
  header.appendChild(add);
  tab.appendChild(header);
  
  const list = document.createElement('div');
  list.className = 'list-section';
  (content.services||[]).forEach((service, i) => {
    const isNew = i === 0 && isNewItem(service, ['title']);
    const item = createListItem(isNew);
    item.appendChild(createImageUploadInput(`service-icon-${i}`, service.icon));
    item.appendChild(labeledInput('Title', createInput('text', service.title, 'Service Title', `service-title-${i}`)));
    item.appendChild(labeledInput('Text', createInput('textarea', service.text, 'Service Description', `service-text-${i}`)));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-btn';
    remove.textContent = 'Remove';
    remove.onclick = async (e) => { 
      e.preventDefault();
      e.stopPropagation();
      const confirmed = await customConfirm(
        'Remove Service', 
        'Are you sure you want to remove this service? This action cannot be undone.',
        'Remove',
        'Cancel'
      );
      if (confirmed) {
        content.services.splice(i,1); 
        renderServices(); 
        showNotification('Success', 'Service removed successfully', 'success');
      }
    };
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
  add.onclick = (e) => { 
    e.preventDefault();
    e.stopPropagation();
    console.log('Adding new project');
    (content.projects = content.projects||[]).unshift({title:'',category:'',type:'',image:'',alt:'',link:''}); // Add to beginning
    renderProjects(); 
    showNotification('Success', 'New project form added at top', 'success');
  };
  
  header.appendChild(title);
  header.appendChild(add);
  tab.appendChild(header);
  
  const list = document.createElement('div');
  list.className = 'list-section';
  (content.projects||[]).forEach((project, i) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.appendChild(labeledInput('Title', createInput('text', project.title, 'Project Title', `project-title-${i}`)));
    
    // Create connected category and type dropdowns
    const categoryGroup = labeledInput('Category', createCategoryDropdown(project.category, `project-category-${i}`));
    const typeGroup = labeledInput('Type', createTypeDropdown(project.type, `project-type-${i}`));
    
    // Connect category to type dropdown
    const categorySelect = categoryGroup.querySelector('select');
    const typeSelect = typeGroup.querySelector('select');
    
    categorySelect.addEventListener('change', function() {
      updateTypeDropdown(typeSelect, this.value, project.type);
    });
    
    // Initialize type dropdown based on current category
    if (project.category) {
      updateTypeDropdown(typeSelect, project.category, project.type);
    }
    
    item.appendChild(categoryGroup);
    item.appendChild(typeGroup);
    item.appendChild(createImageUploadInput(`project-image-${i}`, project.image));
    item.appendChild(labeledInput('Alt text', createInput('text', project.alt, 'Project Image', `project-alt-${i}`)));
    item.appendChild(labeledInput('Project Link', createInput('url', project.link || '', 'https://github.com/username/project', `project-link-${i}`)));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-btn';
    remove.textContent = 'Remove';
    remove.onclick = async (e) => { 
      e.preventDefault();
      e.stopPropagation();
      const confirmed = await customConfirm(
        'Remove Project', 
        'Are you sure you want to remove this project? This action cannot be undone.',
        'Remove',
        'Cancel'
      );
      if (confirmed) {
        content.projects.splice(i,1); 
        renderProjects();
        await saveContent(); // Auto-save after deletion
        showNotification('Success', 'Project removed successfully', 'success');
      }
    };
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
  add.onclick = (e) => { 
    e.preventDefault();
    e.stopPropagation();
    console.log('Adding new testimonial');
    (content.testimonials = content.testimonials||[]).unshift({avatar:'',name:'',text:''}); // Add to beginning
    renderTestimonials(); 
    showNotification('Success', 'New testimonial form added at top', 'success');
  };
  
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
    remove.onclick = async (e) => { 
      e.preventDefault();
      e.stopPropagation();
      const confirmed = await customConfirm(
        'Remove Testimonial', 
        'Are you sure you want to remove this testimonial? This action cannot be undone.',
        'Remove',
        'Cancel'
      );
      if (confirmed) {
        content.testimonials.splice(i,1); 
        renderTestimonials();
        await saveContent(); // Auto-save after deletion
        showNotification('Success', 'Testimonial removed successfully', 'success');
      }
    };
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
  
  // Hide save button on dashboard by default
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) {
    saveBtn.style.display = 'none';
  }
  
  // Adjust padding for dashboard
  const main = document.querySelector('main');
  if (main && window.innerWidth <= 768) {
    main.style.paddingBottom = '80px';
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
  add.onclick = (e) => { 
    e.preventDefault();
    e.stopPropagation();
    console.log('Adding new certificate');
    (content.certificates = content.certificates||[]).unshift({logo:'',alt:''}); // Add to beginning
    renderCertificates(); 
    showNotification('Success', 'New certificate form added at top', 'success');
  };
  
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
    remove.onclick = async (e) => { 
      e.preventDefault();
      e.stopPropagation();
      const confirmed = await customConfirm(
        'Remove Certificate', 
        'Are you sure you want to remove this certificate? This action cannot be undone.',
        'Remove',
        'Cancel'
      );
      if (confirmed) {
        content.certificates.splice(i,1); 
        renderCertificates();
        await saveContent(); // Auto-save after deletion
        showNotification('Success', 'Certificate removed successfully', 'success');
      }
    };
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
  add.onclick = (e) => { 
    e.preventDefault();
    e.stopPropagation();
    console.log('Adding new education');
    (content.education = content.education||[]).unshift({school:'',years:'',text:''}); // Add to beginning
    renderEducation(); 
    showNotification('Success', 'New education form added at top', 'success');
  };
  
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
    remove.onclick = async (e) => { 
      e.preventDefault();
      e.stopPropagation();
      const confirmed = await customConfirm(
        'Remove Education', 
        'Are you sure you want to remove this education entry? This action cannot be undone.',
        'Remove',
        'Cancel'
      );
      if (confirmed) {
        content.education.splice(i,1); 
        renderEducation();
        await saveContent(); // Auto-save after deletion
        showNotification('Success', 'Education entry removed successfully', 'success');
      }
    };
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
  add.onclick = (e) => { 
    e.preventDefault();
    e.stopPropagation();
    console.log('Adding new experience');
    (content.experience = content.experience||[]).unshift({title:'',company:'',years:'',text:''}); // Add to beginning
    renderExperience(); 
    showNotification('Success', 'New experience form added at top', 'success');
  };
  
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
    remove.onclick = async (e) => { 
      e.preventDefault();
      e.stopPropagation();
      const confirmed = await customConfirm(
        'Remove Experience', 
        'Are you sure you want to remove this experience entry? This action cannot be undone.',
        'Remove',
        'Cancel'
      );
      if (confirmed) {
        content.experience.splice(i,1); 
        renderExperience();
        await saveContent(); // Auto-save after deletion
        showNotification('Success', 'Experience entry removed successfully', 'success');
      }
    };
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
  add.onclick = (e) => { 
    e.preventDefault();
    e.stopPropagation();
    console.log('Adding new skill');
    (content.skills = content.skills||[]).unshift({name:'',value:0}); // Add to beginning
    renderSkills(); 
    showNotification('Success', 'New skill form added at top', 'success');
  };
  
  header.appendChild(title);
  header.appendChild(add);
  tab.appendChild(header);
  
  const list = document.createElement('div');
  list.className = 'list-section';
  (content.skills||[]).forEach((s, i) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.appendChild(labeledInput('Name', createInput('text', s.name, 'Skill', `skill-name-${i}`)));
    
    // Create skill slider
    const sliderGroup = document.createElement('div');
    sliderGroup.className = 'form-group';
    const sliderLabel = document.createElement('label');
    sliderLabel.textContent = 'Skill Level (%)';
    
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'skill-slider-container';
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '100';
    slider.value = s.value || 0;
    slider.className = 'skill-slider';
    slider.name = `skill-value-${i}`;
    slider.style.setProperty('--fill-percent', `${s.value || 0}%`);
    
    const valueDisplay = document.createElement('div');
    valueDisplay.className = 'skill-value-display';
    valueDisplay.textContent = `${s.value || 0}%`;
    
    // Update display and track fill on slider change
    slider.oninput = function() {
      valueDisplay.textContent = `${this.value}%`;
      this.style.setProperty('--fill-percent', `${this.value}%`);
    };
    
    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(valueDisplay);
    sliderGroup.appendChild(sliderLabel);
    sliderGroup.appendChild(sliderContainer);
    
    item.appendChild(sliderGroup);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-btn';
    remove.textContent = 'Remove';
    remove.onclick = async (e) => { 
      e.preventDefault();
      e.stopPropagation();
      const confirmed = await customConfirm(
        'Remove Skill', 
        'Are you sure you want to remove this skill? This action cannot be undone.',
        'Remove',
        'Cancel'
      );
      if (confirmed) {
        content.skills.splice(i,1); 
        renderSkills();
        await saveContent(); // Auto-save after deletion
        showNotification('Success', 'Skill removed successfully', 'success');
      }
    };
    item.appendChild(remove);
    list.appendChild(item);
  });
  tab.appendChild(list);
}

// CONTACTS
async function renderContacts() {
  const tab = document.getElementById('tab-contacts');
  tab.innerHTML = '<div class="loading">Loading contacts...</div>';
  
  if (!adminToken) {
    tab.innerHTML = `
      <div class="auth-required">
        <div class="auth-icon">
          <ion-icon name="lock-closed-outline"></ion-icon>
        </div>
        <h3>Authentication Required</h3>
        <p>Please enter your admin token to view contact messages.</p>
        <button class="btn-primary auth-btn" onclick="requestTokenForContacts()">
          <ion-icon name="key-outline"></ion-icon>
          Enter Admin Token
        </button>
      </div>
    `;
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
          ${!contact.read ? `<button type="button" class="mark-read-btn" data-contact-id="${contact.id}" data-action="mark-read">Mark as Read</button>` : ''}
          <button type="button" class="delete-contact-btn" data-contact-id="${contact.id}" data-action="delete">Delete</button>
        </div>
      `;
      
      contactsList.appendChild(contactItem);
    });
    
    tab.appendChild(contactsList);
    
    // Add event listeners to contact action buttons
    setupContactEventListeners();
  })
  .catch(err => {
    tab.innerHTML = '<p class="error">Failed to load contacts. Please try again.</p>';
    console.error('Failed to load contacts:', err);
  });
}

// Setup event listeners for contact buttons
function setupContactEventListeners() {
  // Mark as read buttons
  document.querySelectorAll('.mark-read-btn[data-action="mark-read"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const contactId = btn.dataset.contactId;
      await markContactRead(contactId);
    });
  });
  
  // Delete buttons
  document.querySelectorAll('.delete-contact-btn[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const contactId = btn.dataset.contactId;
      await deleteContact(contactId);
    });
  });
}

// Mark contact as read
async function markContactRead(contactId) {
  if (!adminToken) {
    const token = await requestAdminToken();
    if (!token) return;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/contacts/${contactId}/read`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    const result = await response.json();
    
    if (result.success) {
      renderContacts(); // Refresh the contacts list
      showNotification('Success', 'Contact marked as read', 'success');
    } else {
      customAlert('Operation Failed', 'Failed to mark contact as read. Please try again.', 'error');
    }
  } catch (err) {
    customAlert('Network Error', 'Error marking contact as read. Please check your connection.', 'error');
    console.error(err);
  }
}

// Request token for contacts
async function requestTokenForContacts() {
  const token = await requestAdminToken();
  if (token) {
    adminToken = token;
    renderContacts(); // Re-render contacts with token
    showNotification('Success', 'Authentication successful! Loading contacts...', 'success');
  }
}

// Delete contact
async function deleteContact(contactId) {
  const confirmed = await customConfirm(
    'Delete Contact', 
    'Are you sure you want to delete this contact? This action cannot be undone.',
    'Delete',
    'Cancel'
  );
  if (!confirmed) return;
  
  if (!adminToken) {
    const token = await requestAdminToken();
    if (!token) return;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/contacts/${contactId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    const result = await response.json();
    
    if (result.success) {
      renderContacts(); // Refresh the contacts list
      showNotification('Success', 'Contact deleted successfully', 'success');
    } else {
      customAlert('Delete Failed', 'Failed to delete contact. Please try again.', 'error');
    }
  } catch (err) {
    customAlert('Network Error', 'Error deleting contact. Please check your connection.', 'error');
    console.error(err);
  }
}

// Save to backend
document.getElementById('save-btn').onclick = async function() {
  const saveBtn = this;
  const originalText = saveBtn.innerHTML;
  
  // Disable button and show loading state
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<ion-icon name="hourglass-outline"></ion-icon><span>Saving...</span>';
  
  // Use the saveContent function which handles all fields including settings
  const success = await saveContent();
  
  if (success) {
    showNotification('Success', 'All changes saved successfully!', 'success');
    saveBtn.innerHTML = '<ion-icon name="checkmark-circle-outline"></ion-icon><span>Saved!</span>';
    setTimeout(() => {
      saveBtn.innerHTML = originalText;
      saveBtn.disabled = false;
    }, 2000);
  } else {
    showNotification('Error', 'Failed to save changes. Please try again.', 'error');
    saveBtn.innerHTML = originalText;
    saveBtn.disabled = false;
  }
};

// Render dashboard charts
function renderCharts() {
  renderSkillsChart();
  renderContentChart();
}

// Skills distribution chart with interactivity
function renderSkillsChart() {
  const canvas = document.getElementById('skills-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const skills = content.skills || [];
  
  if (skills.length === 0) {
    // Show "No data" message with call to action
    ctx.fillStyle = '#666';
    ctx.font = '16px Poppins';
    ctx.textAlign = 'center';
    ctx.fillText('No skills data', canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillStyle = '#ffc857';
    ctx.font = '12px Poppins';
    ctx.fillText('Click "Skills" to add your skills', canvas.width / 2, canvas.height / 2 + 10);
    
    // Make canvas clickable to go to skills
    canvas.onclick = () => switchToTab('skills');
    canvas.style.cursor = 'pointer';
    return;
  }
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Chart settings
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 40;
  
  // Colors with better contrast
  const colors = ['#ffc857', '#ff8c42', '#ff6b35', '#c44536', '#8b2635', '#6a994e', '#386641'];
  
  // Calculate angles and store slice data for interactivity
  const total = skills.reduce((sum, skill) => sum + skill.value, 0);
  let currentAngle = -Math.PI / 2;
  const slices = [];
  
  // Draw pie slices and store data
  skills.forEach((skill, index) => {
    const sliceAngle = (skill.value / total) * 2 * Math.PI;
    
    // Store slice data for hover detection
    slices.push({
      skill: skill,
      startAngle: currentAngle,
      endAngle: currentAngle + sliceAngle,
      color: colors[index % colors.length],
      index: index
    });
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();
    
    // Add subtle border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw percentage in center of slice
    if (sliceAngle > 0.3) { // Only show percentage if slice is big enough
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Poppins';
      ctx.textAlign = 'center';
      ctx.fillText(`${skill.value}%`, labelX, labelY);
    }
    
    currentAngle += sliceAngle;
  });
  
  // Interactive legend
  const legendX = 10;
  let legendY = 20;
  const legendItems = [];
  
  skills.forEach((skill, index) => {
    const legendItem = {
      x: legendX,
      y: legendY,
      width: 150,
      height: 18,
      skill: skill,
      color: colors[index % colors.length]
    };
    legendItems.push(legendItem);
    
    // Draw legend item
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(legendX, legendY, 12, 12);
    
    ctx.fillStyle = '#fff';
    ctx.font = '12px Poppins';
    ctx.textAlign = 'left';
    ctx.fillText(`${skill.name} (${skill.value}%)`, legendX + 18, legendY + 10);
    
    legendY += 20;
  });
  
  // Add interactivity
  let hoveredSlice = null;
  
  canvas.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if mouse is over a slice
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= radius) {
      const angle = Math.atan2(dy, dx);
      const normalizedAngle = angle < -Math.PI / 2 ? angle + 2 * Math.PI : angle;
      
      hoveredSlice = null;
      slices.forEach(slice => {
        let startAngle = slice.startAngle;
        let endAngle = slice.endAngle;
        
        // Normalize angles
        if (startAngle < -Math.PI / 2) startAngle += 2 * Math.PI;
        if (endAngle < -Math.PI / 2) endAngle += 2 * Math.PI;
        
        if (normalizedAngle >= startAngle && normalizedAngle <= endAngle) {
          hoveredSlice = slice;
        }
      });
      
      canvas.style.cursor = hoveredSlice ? 'pointer' : 'default';
      
      // Show tooltip
      if (hoveredSlice) {
        canvas.title = `${hoveredSlice.skill.name}: ${hoveredSlice.skill.value}%`;
      }
    } else {
      canvas.style.cursor = 'default';
      hoveredSlice = null;
    }
  };
  
  canvas.onclick = (e) => {
    if (hoveredSlice) {
      // Navigate to skills and highlight the clicked skill
      switchToTab('skills');
      showNotification('Info', `Clicked on ${hoveredSlice.skill.name} (${hoveredSlice.skill.value}%)`, 'info');
    }
  };
}

// Portfolio completion chart with meaningful data
function renderContentChart() {
  const canvas = document.getElementById('content-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Calculate meaningful completion data
  const portfolioData = [
    { 
      label: 'About', 
      current: content.about && content.about.name && content.about.description ? 1 : 0,
      target: 1,
      color: '#ffc857',
      tab: 'about'
    },
    { 
      label: 'Services', 
      current: (content.services || []).length,
      target: 4, // Recommended number of services
      color: '#ff8c42',
      tab: 'services'
    },
    { 
      label: 'Projects', 
      current: (content.projects || []).length,
      target: 6, // Recommended number of projects
      color: '#ff6b35',
      tab: 'projects'
    },
    { 
      label: 'Testimonials', 
      current: (content.testimonials || []).length,
      target: 5, // Recommended number of testimonials
      color: '#c44536',
      tab: 'testimonials'
    },
    { 
      label: 'Skills', 
      current: (content.skills || []).length,
      target: 5, // Recommended number of skills
      color: '#8b2635',
      tab: 'skills'
    }
  ];
  
  // Chart settings
  const barWidth = 45;
  const barSpacing = 15;
  const chartHeight = canvas.height - 80;
  const startX = 40;
  const maxTarget = Math.max(...portfolioData.map(d => d.target));
  
  // Store bar positions for interactivity
  const bars = [];
  
  // Draw completion bars
  portfolioData.forEach((item, index) => {
    const x = startX + index * (barWidth + barSpacing);
    const completionPercentage = Math.min(item.current / item.target, 1);
    
    // Background bar (target)
    const targetBarHeight = (item.target / maxTarget) * chartHeight;
    const targetY = canvas.height - 60 - targetBarHeight;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(x, targetY, barWidth, targetBarHeight);
    
    // Completion bar (current)
    const currentBarHeight = (item.current / maxTarget) * chartHeight;
    const currentY = canvas.height - 60 - currentBarHeight;
    
    // Gradient for completion bar
    const gradient = ctx.createLinearGradient(0, currentY, 0, currentY + currentBarHeight);
    gradient.addColorStop(0, item.color);
    gradient.addColorStop(1, item.color + '80');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, currentY, barWidth, currentBarHeight);
    
    // Store bar data for interactivity
    bars.push({
      x: x,
      y: targetY,
      width: barWidth,
      height: targetBarHeight,
      item: item,
      completionPercentage: completionPercentage
    });
    
    // Draw completion percentage
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Poppins';
    ctx.textAlign = 'center';
    const percentage = Math.round(completionPercentage * 100);
    ctx.fillText(`${percentage}%`, x + barWidth / 2, currentY - 8);
    
    // Draw current/target values
    ctx.fillStyle = '#ccc';
    ctx.font = '10px Poppins';
    ctx.fillText(`${item.current}/${item.target}`, x + barWidth / 2, currentY - 20);
    
    // Draw label
    ctx.save();
    ctx.translate(x + barWidth / 2, canvas.height - 15);
    ctx.fillStyle = '#fff';
    ctx.font = '11px Poppins';
    ctx.textAlign = 'center';
    ctx.fillText(item.label, 0, 0);
    ctx.restore();
  });
  
  // Draw title
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Poppins';
  ctx.textAlign = 'center';
  ctx.fillText('Portfolio Completion Status', canvas.width / 2, 20);
  
  // Draw legend
  ctx.fillStyle = '#999';
  ctx.font = '10px Poppins';
  ctx.textAlign = 'left';
  ctx.fillText('■ Target', 10, canvas.height - 45);
  ctx.fillStyle = '#ffc857';
  ctx.fillText('■ Current', 10, canvas.height - 30);
  
  // Add interactivity
  let hoveredBar = null;
  
  canvas.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    hoveredBar = null;
    bars.forEach(bar => {
      if (x >= bar.x && x <= bar.x + bar.width && 
          y >= bar.y && y <= bar.y + bar.height) {
        hoveredBar = bar;
      }
    });
    
    canvas.style.cursor = hoveredBar ? 'pointer' : 'default';
    
    if (hoveredBar) {
      const item = hoveredBar.item;
      const percentage = Math.round(hoveredBar.completionPercentage * 100);
      canvas.title = `${item.label}: ${item.current}/${item.target} (${percentage}% complete)`;
    }
  };
  
  canvas.onclick = (e) => {
    if (hoveredBar) {
      const item = hoveredBar.item;
      switchToTab(item.tab);
      
      if (hoveredBar.completionPercentage < 1) {
        showNotification('Suggestion', `Your ${item.label} section needs ${item.target - item.current} more items to be complete`, 'info');
      } else {
        showNotification('Great!', `Your ${item.label} section is complete!`, 'success');
      }
    }
  };
}

// SETTINGS
function renderSettings() {
  const tab = document.getElementById('tab-settings');
  tab.innerHTML = '';
  
  // Site Settings Section
  const siteSettingsSection = document.createElement('div');
  siteSettingsSection.className = 'settings-section';
  
  const siteHeader = document.createElement('div');
  siteHeader.className = 'section-header';
  const siteTitle = document.createElement('h3');
  siteTitle.className = 'section-title';
  siteTitle.textContent = 'Site Information';
  siteHeader.appendChild(siteTitle);
  siteSettingsSection.appendChild(siteHeader);
  
  const siteSettings = content.siteSettings || {};
  
  siteSettingsSection.appendChild(labeledInput('Site Title', createInput('text', siteSettings.title, 'Your Name | Your Title', 'site-title')));
  siteSettingsSection.appendChild(labeledInput('Meta Description', createInput('textarea', siteSettings.description, 'Professional portfolio description...', 'site-description')));
  siteSettingsSection.appendChild(labeledInput('Keywords', createInput('text', siteSettings.keywords, 'keyword1, keyword2, keyword3', 'site-keywords')));
  siteSettingsSection.appendChild(labeledInput('Author Name', createInput('text', siteSettings.author, 'Your Full Name', 'site-author')));
  siteSettingsSection.appendChild(labeledInput('Site URL', createInput('url', siteSettings.siteUrl, 'https://yoursite.com', 'site-url')));
  siteSettingsSection.appendChild(createImageUploadInput('site-avatar', siteSettings.avatar || 'assets/images/my-avatar.png'));
  
  tab.appendChild(siteSettingsSection);
  
  // Contact Information Section
  const contactSection = document.createElement('div');
  contactSection.className = 'settings-section';
  
  const contactHeader = document.createElement('div');
  contactHeader.className = 'section-header';
  const contactTitle = document.createElement('h3');
  contactTitle.className = 'section-title';
  contactTitle.textContent = 'Contact Information';
  contactHeader.appendChild(contactTitle);
  contactSection.appendChild(contactHeader);
  
  const contactInfo = content.contactInfo || {};
  
  contactSection.appendChild(labeledInput('Email Address', createInput('email', contactInfo.email, 'your@email.com', 'contact-email')));
  contactSection.appendChild(labeledInput('Phone Number', createInput('tel', contactInfo.phone, '+1 (555) 123-4567', 'contact-phone')));
  contactSection.appendChild(labeledInput('Location', createInput('text', contactInfo.location, 'City, Country', 'contact-location')));
  
  tab.appendChild(contactSection);
  
  // Social Media Section
  const socialSection = document.createElement('div');
  socialSection.className = 'settings-section';
  
  const socialHeader = document.createElement('div');
  socialHeader.className = 'section-header';
  const socialTitle = document.createElement('h3');
  socialTitle.className = 'section-title';
  socialTitle.textContent = 'Social Media Links';
  
  const addSocial = document.createElement('button');
  addSocial.type = 'button';
  addSocial.className = 'add-btn';
  addSocial.innerHTML = '<ion-icon name="add-outline"></ion-icon> Add Social Link';
  addSocial.onclick = (e) => { 
    e.preventDefault();
    e.stopPropagation();
    (content.socialMedia = content.socialMedia||[]).unshift({platform:'',url:'',icon:''}); 
    renderSettings(); 
    showNotification('Success', 'New social media form added at top', 'success');
  };
  
  socialHeader.appendChild(socialTitle);
  socialHeader.appendChild(addSocial);
  socialSection.appendChild(socialHeader);
  
  const socialList = document.createElement('div');
  socialList.className = 'list-section';
  
  (content.socialMedia||[]).forEach((social, i) => {
    const isNew = i === 0 && isNewItem(social, ['platform', 'url']);
    const item = createListItem(isNew);
    
    // Platform dropdown
    const platformGroup = document.createElement('div');
    platformGroup.className = 'form-group';
    const platformLabel = document.createElement('label');
    platformLabel.textContent = 'Platform';
    const platformSelect = document.createElement('select');
    platformSelect.className = 'form-input';
    platformSelect.name = `social-platform-${i}`;
    
    const platforms = [
      {name: 'Facebook', icon: 'logo-facebook'},
      {name: 'Instagram', icon: 'logo-instagram'},
      {name: 'Twitter', icon: 'logo-twitter'},
      {name: 'LinkedIn', icon: 'logo-linkedin'},
      {name: 'GitHub', icon: 'logo-github'},
      {name: 'YouTube', icon: 'logo-youtube'},
      {name: 'TikTok', icon: 'logo-tiktok'},
      {name: 'WhatsApp', icon: 'logo-whatsapp'},
      {name: 'Telegram', icon: 'paper-plane-outline'},
      {name: 'Discord', icon: 'logo-discord'},
      {name: 'Behance', icon: 'logo-behance'},
      {name: 'Dribbble', icon: 'logo-dribbble'}
    ];
    
    platformSelect.innerHTML = '<option value="">Select Platform</option>' + 
      platforms.map(p => `<option value="${p.name}" data-icon="${p.icon}" ${social.platform === p.name ? 'selected' : ''}>${p.name}</option>`).join('');
    
    platformSelect.onchange = function() {
      const selectedOption = this.options[this.selectedIndex];
      const iconInput = item.querySelector(`[name="social-icon-${i}"]`);
      if (iconInput && selectedOption.dataset.icon) {
        iconInput.value = selectedOption.dataset.icon;
      }
    };
    
    platformGroup.appendChild(platformLabel);
    platformGroup.appendChild(platformSelect);
    item.appendChild(platformGroup);
    
    item.appendChild(labeledInput('URL', createInput('url', social.url, 'https://platform.com/username', `social-url-${i}`)));
    
    // Hidden icon input (auto-filled by platform selection)
    const iconInput = createInput('hidden', social.icon, '', `social-icon-${i}`);
    item.appendChild(iconInput);
    
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-btn';
    remove.textContent = 'Remove';
    remove.onclick = async (e) => { 
      e.preventDefault();
      e.stopPropagation();
      const confirmed = await customConfirm(
        'Remove Social Link', 
        'Are you sure you want to remove this social media link?',
        'Remove',
        'Cancel'
      );
      if (confirmed) {
        content.socialMedia.splice(i,1); 
        renderSettings();
        await saveContent();
        showNotification('Success', 'Social media link removed successfully', 'success');
      }
    };
    item.appendChild(remove);
    
    socialList.appendChild(item);
  });
  
  socialSection.appendChild(socialList);
  tab.appendChild(socialSection);
}

// Handle window resize for responsive save button positioning
window.addEventListener('resize', function() {
  const saveBtn = document.getElementById('save-btn');
  const main = document.querySelector('main');
  const activeTab = document.querySelector('[data-nav-link].active');
  
  if (saveBtn && main && activeTab) {
    const tabName = activeTab.dataset.tab;
    const isSaveBtnVisible = saveBtn.style.display !== 'none';
    
    if (window.innerWidth <= 768) {
      // Mobile: adjust padding based on save button visibility
      if (isSaveBtnVisible) {
        main.style.paddingBottom = '150px';
      } else {
        main.style.paddingBottom = '80px';
      }
    } else {
      // Desktop: reset padding
      main.style.paddingBottom = '';
    }
  }
});
