// Backend URL for API and socket.io
const BACKEND_URL = 'https://portfolio-505u.onrender.com';

'use strict';

// Function to get the correct image URL
function getImageUrl(path) {
  if (!path) return ''; // Return empty string if path is not provided
  if (path.startsWith('uploads/')) {
    return `${BACKEND_URL}/${path}`;
  }
  // If path already starts with assets/ or ./, return as is
  if (path.startsWith('assets/') || path.startsWith('./')) {
    return path;
  }
  return `./assets/images/${path}`;
}


document.addEventListener("DOMContentLoaded", function () {
  // Utility function to toggle element's active class
  const elementToggleFunc = function (elem) {
    elem.classList.toggle("active");
  };

  // Show loading indicator
  const main = document.querySelector('main');
  let loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading-indicator';
  loadingDiv.style.cssText = 'text-align:center;padding:40px;font-size:1.2em;color:#ffc857;';
  loadingDiv.textContent = 'Loading content...';
  if (main) main.prepend(loadingDiv);

  // Ensure skeleton is visible and real projects are hidden at start
  let skeletonList = document.getElementById('skeleton-list');
  let realProjects = document.querySelectorAll('.real-projects');
  if (skeletonList) skeletonList.style.display = 'block';
  if (realProjects.length > 0) {
    realProjects.forEach(list => {
      list.style.display = 'none';
    });
  }

  // Function to fetch and render content
  function fetchAndRenderContent() {
    console.log('🔄 Fetching content from:', BACKEND_URL + '/content.json');
    
    fetch(BACKEND_URL + '/content.json')
      .then(response => {
        console.log('📡 Content fetch response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(content => {
        console.log('✅ Content loaded successfully. Projects count:', content.projects?.length || 0);
        if (content.projects) {
          console.log('📋 Projects:', content.projects.map(p => p.title));
        }
        if (loadingDiv) loadingDiv.remove();
        // ABOUT
        if (document.getElementById('about-name')) {
          document.getElementById('about-name').textContent = content.about.name;
        }
        if (document.getElementById('about-title')) {
          document.getElementById('about-title').textContent = content.about.title;
        }
        if (document.getElementById('about-description')) {
          document.getElementById('about-description').innerHTML = content.about.description.map(p => `<p>${p}</p>`).join('');
        }

        // SERVICES
        if (document.getElementById('service-list')) {
          document.getElementById('service-list').innerHTML = content.services.map(service => `
            <li class="service-item">
              <div class="service-icon-box">
                <img src="${getImageUrl(service.icon)}" alt="${service.title} icon" width="70" />
              </div>
              <div class="service-content-box">
                <h4 class="h4 service-item-title">${service.title}</h4>
                <p class="service-item-text">${service.text}</p>
              </div>
            </li>
          `).join('');
        }

        // TESTIMONIALS
        if (document.getElementById('testimonials-list')) {
          document.getElementById('testimonials-list').innerHTML = content.testimonials.map(testimonial => `
            <li class="testimonials-item">
              <div class="content-card" data-testimonials-item>
                <figure class="testimonials-avatar-box">
                  <img src="${getImageUrl(testimonial.avatar)}" alt="${testimonial.name}" width="60" data-testimonials-avatar />
                </figure>
                <h4 class="h4 testimonials-item-title" data-testimonials-title>${testimonial.name}</h4>
                <div class="testimonials-text" data-testimonials-text>
                  <p>${testimonial.text}</p>
                </div>
              </div>
            </li>
          `).join('');
          
          // Re-initialize testimonial modal functionality after content is loaded
          initTestimonialModal();
        }

        // CERTIFICATES
        if (document.getElementById('certificates-list')) {
          document.getElementById('certificates-list').innerHTML = content.certificates.map(cert => `
            <li class="clients-item">
              <a href="#">
                <img src="${getImageUrl(cert.logo)}" alt="${cert.alt}" />
              </a>
            </li>
          `).join('');
        }

        // EDUCATION
        if (document.getElementById('education-list')) {
          document.getElementById('education-list').innerHTML = content.education.map(edu => `
            <li class="timeline-item">
              <h4 class="h4 timeline-item-title">${edu.school}</h4>
              <span>${edu.years}</span>
              <p class="timeline-text">${edu.text}</p>
            </li>
          `).join('');
        }

        // EXPERIENCE
        if (document.getElementById('experience-list')) {
          document.getElementById('experience-list').innerHTML = content.experience.map(exp => `
            <li class="timeline-item">
              <h4 class="h4 timeline-item-title">${exp.title}</h4>
              <p class="company-name">${exp.company}</p>
              <span>${exp.years}</span>
              <p class="timeline-text">${exp.text}</p>
            </li>
          `).join('');
        }

        // SKILLS
        if (document.getElementById('skills-list')) {
          document.getElementById('skills-list').innerHTML = content.skills.map(skill => `
            <li class="skills-item">
              <div class="title-wrapper">
                <h5 class="h5">${skill.name}</h5>
                <data value="${skill.value}">${skill.value}%</data>
              </div>
              <div class="skill-progress-bg">
                <div class="skill-progress-fill" style="width: ${skill.value}%"></div>
              </div>
            </li>
          `).join('');
        }

        // UPDATE SITE METADATA
        if (content.siteSettings) {
          // Update page title
          document.title = content.siteSettings.title || document.title;
          document.getElementById('page-title').textContent = content.siteSettings.title || document.title;
          
          // Update meta tags
          const metaTitle = document.getElementById('meta-title');
          if (metaTitle) metaTitle.content = content.siteSettings.title || '';
          
          const metaDescription = document.getElementById('meta-description');
          if (metaDescription) metaDescription.content = content.siteSettings.description || '';
          
          const metaKeywords = document.getElementById('meta-keywords');
          if (metaKeywords) metaKeywords.content = content.siteSettings.keywords || '';
          
          const metaAuthor = document.getElementById('meta-author');
          if (metaAuthor) metaAuthor.content = content.siteSettings.author || '';
          
          // Update Open Graph tags
          const ogUrl = document.getElementById('og-url');
          if (ogUrl) ogUrl.content = content.siteSettings.siteUrl || '';
          
          const ogTitle = document.getElementById('og-title');
          if (ogTitle) ogTitle.content = content.siteSettings.title || '';
          
          const ogDescription = document.getElementById('og-description');
          if (ogDescription) ogDescription.content = content.siteSettings.description || '';
          
          const ogImage = document.getElementById('og-image');
          if (ogImage) ogImage.content = getImageUrl(content.siteSettings.avatar) || '';
          
          // Update Twitter tags
          const twitterUrl = document.getElementById('twitter-url');
          if (twitterUrl) twitterUrl.content = content.siteSettings.siteUrl || '';
          
          const twitterTitle = document.getElementById('twitter-title');
          if (twitterTitle) twitterTitle.content = content.siteSettings.title || '';
          
          const twitterDescription = document.getElementById('twitter-description');
          if (twitterDescription) twitterDescription.content = content.siteSettings.description || '';
          
          const twitterImage = document.getElementById('twitter-image');
          if (twitterImage) twitterImage.content = getImageUrl(content.siteSettings.avatar) || '';
          
          // Update avatar images
          if (content.siteSettings.avatar) {
            const mainAvatar = document.getElementById('main-avatar');
            if (mainAvatar) {
              mainAvatar.src = getImageUrl(content.siteSettings.avatar);
              mainAvatar.alt = content.siteSettings.author || 'Profile Picture';
            }
            
            // Update about name title attribute
            const aboutName = document.getElementById('about-name');
            if (aboutName && content.siteSettings.author) {
              aboutName.title = content.siteSettings.author;
            }
          }
          
          // Update favicon and icons
          if (content.siteSettings.favicon) {
            const favicon = document.getElementById('favicon');
            if (favicon) favicon.href = getImageUrl(content.siteSettings.favicon);
            
            const shortcutIcon = document.getElementById('shortcut-icon');
            if (shortcutIcon) shortcutIcon.href = getImageUrl(content.siteSettings.favicon);
            
            const appleTouchIcon = document.getElementById('apple-touch-icon');
            if (appleTouchIcon) appleTouchIcon.href = getImageUrl(content.siteSettings.favicon);
            
            const preloadAvatar = document.getElementById('preload-avatar');
            if (preloadAvatar && content.siteSettings.avatar) {
              preloadAvatar.href = getImageUrl(content.siteSettings.avatar);
            }
          }
        }

        // UPDATE CONTACT INFORMATION
        if (content.contactInfo) {
          const contactsList = document.getElementById('contacts-list');
          if (contactsList) {
            contactsList.innerHTML = `
              <li class="contact-item">
                <div class="icon-box">
                  <ion-icon name="mail-outline"></ion-icon>
                </div>
                <div class="contact-info">
                  <p class="contact-title">Email</p>
                  <a href="mailto:${content.contactInfo.email}" class="contact-link">${content.contactInfo.email}</a>
                </div>
              </li>
              <li class="contact-item">
                <div class="icon-box">
                  <ion-icon name="phone-portrait-outline"></ion-icon>
                </div>
                <div class="contact-info">
                  <p class="contact-title">Phone</p>
                  <a href="tel:${content.contactInfo.phone.replace(/\s/g, '')}" class="contact-link">${content.contactInfo.phone}</a>
                </div>
              </li>
              <li class="contact-item">
                <div class="icon-box">
                  <ion-icon name="location-outline"></ion-icon>
                </div>
                <div class="contact-info">
                  <p class="contact-title">Location</p>
                  <address>${content.contactInfo.location}</address>
                </div>
              </li>
            `;
          }
        }

        // UPDATE SOCIAL MEDIA LINKS
        if (content.socialMedia && content.socialMedia.length > 0) {
          const socialList = document.getElementById('social-list');
          if (socialList) {
            socialList.innerHTML = content.socialMedia.map(social => `
              <li class="social-item">
                <a href="${social.url}" class="social-link" target="_blank" rel="noopener" title="${social.platform}">
                  <ion-icon name="${social.icon}"></ion-icon>
                </a>
              </li>
            `).join('');
          }
        }

        // PROJECTS
        const projectTypes = [
          { type: 'python projects', id: 'python-projects-list' },
          { type: 'website projects', id: 'website-projects-list' },
          { type: 'java projects', id: 'java-projects-list' }
        ];
        
        console.log('🎯 Rendering projects by type:');
        content.projects.forEach((project, index) => {
          console.log(`Project ${index}:`, {
            title: project.title,
            type: `"${project.type}"`,
            category: project.category,
            image: project.image
          });
        });
        
        projectTypes.forEach(pt => {
          const filteredProjects = content.projects.filter(p => p.type === pt.type);
          console.log(`📂 ${pt.type}:`, filteredProjects.length, 'projects');
          filteredProjects.forEach(p => console.log(`  - ${p.title}`));
          
          if (document.getElementById(pt.id)) {
            const html = filteredProjects.map(project => `
              <li class="project-item active" data-filter-item data-category="${pt.type}">
                <a href="#">
                  <figure class="project-img">
                    <div class="project-item-icon-box">
                      <ion-icon name="eye-outline"></ion-icon>
                    </div>
                    <img src="${getImageUrl(project.image)}" alt="${project.alt}" loading="lazy" />
                  </figure>
                  <h3 class="project-title">${project.title}</h3>
                  <p class="project-category">${project.category}</p>
                </a>
              </li>
            `).join('');
            
            document.getElementById(pt.id).innerHTML = html;
            console.log(`📝 Rendered ${filteredProjects.length} projects to ${pt.id}`);
          }
        });

        // --- FILTER LOGIC: re-initialize after rendering projects ---
        const filterItems = document.querySelectorAll("[data-filter-item]");
        const filterFunc = function (selectedValue) {
          const normalizedValue = selectedValue.trim().toLowerCase();
          filterItems.forEach(item => {
            const itemCategory = (item.dataset.category || '').trim().toLowerCase();
            if (normalizedValue === "all") {
              item.classList.add("active");
            } else if (normalizedValue === itemCategory) {
              item.classList.add("active");
            } else {
              item.classList.remove("active");
            }
          });
        };
        // Attach filter button listeners again (in case they were lost)
        const filterBtn = document.querySelectorAll("[data-filter-btn]");
        const select = document.querySelector("[data-select]");
        const selectItems = document.querySelectorAll("[data-select-item]");
        const selectValue = document.querySelector("[data-select-value]");
        let lastClickedBtn = filterBtn[0];
        filterBtn.forEach(btn => {
          btn.onclick = function () {
            const selectedValue = this.innerText.toLowerCase();
            if (selectValue) selectValue.innerText = this.innerText;
            filterFunc(selectedValue);
            if (lastClickedBtn) lastClickedBtn.classList.remove("active");
            this.classList.add("active");
            lastClickedBtn = this;
          };
        });
        selectItems.forEach(item => {
          item.onclick = function () {
            const selectedValue = this.innerText.toLowerCase();
            if (selectValue) selectValue.innerText = this.innerText;
            if (select) elementToggleFunc(select);
            filterFunc(selectedValue);
          };
        });

        // --- SKELETON LOADER: hide after real projects are rendered ---
        // (no redeclaration, just use the variables)
        if (skeletonList && realProjects.length > 0) {
          skeletonList.style.display = 'none';
          realProjects.forEach(list => {
            list.style.display = 'block'; // Explicitly set to block instead of empty string
          });
        }
        
        // Trigger "All" filter to show all projects
        filterFunc('all');
      })
      .catch((error) => {
        console.error('❌ Failed to load content:', error);
        if (loadingDiv) {
          loadingDiv.textContent = 'Failed to load content: ' + error.message;
          loadingDiv.style.color = '#f44336';
        }
        if (main) main.prepend(loadingDiv);
      });
  }
  
  // Manual refresh button removed - real-time updates work automatically

  // Initial fetch
  fetchAndRenderContent();

  // Initialize testimonial modal after DOM is ready
  setTimeout(() => {
    initTestimonialModal();
  }, 100);

  // Real-time updates with socket.io
  const script = document.createElement('script');
  script.src = BACKEND_URL + '/socket.io/socket.io.js';
  script.onload = function() {
    console.log('Socket.io script loaded, attempting connection to:', BACKEND_URL);
    
    try {
      const socket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      });
      
      socket.on('connect', () => {
        console.log('✅ Socket.io connected successfully to backend');
        
        // Show connection success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #2196F3;
          color: white;
          padding: 10px 15px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 10000;
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
        `;
        notification.textContent = 'Real-time updates connected ✓';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.remove();
        }, 2000);
      });
      
      socket.on('connect_error', (error) => {
        console.error('❌ Socket.io connection error:', error);
      });
      
      socket.on('content-updated', (data) => {
        console.log('📢 Content updated event received:', data);
        
        // Show notification to user
        const notification = document.createElement('div');
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #4CAF50;
          color: white;
          padding: 15px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 10000;
          font-family: 'Poppins', sans-serif;
        `;
        notification.textContent = 'Content updated! Refreshing...';
        document.body.appendChild(notification);
        
        // Refresh content
        console.log('🔄 Refreshing content...');
        fetchAndRenderContent();
        
        // Remove notification after 3 seconds
        setTimeout(() => {
          notification.remove();
        }, 3000);
      });
      
      socket.on('disconnect', (reason) => {
        console.log('🔌 Socket.io disconnected from backend. Reason:', reason);
      });
      
      socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket.io reconnected after', attemptNumber, 'attempts');
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize Socket.io:', error);
    }
  };
  
  script.onerror = function() {
    console.error('❌ Failed to load Socket.io script from:', BACKEND_URL + '/socket.io/socket.io.js');
  };
  
  document.head.appendChild(script);

  // Sidebar toggle functionality
  const sidebar = document.querySelector("[data-sidebar]");
  const sidebarBtn = document.querySelector("[data-sidebar-btn]");
  if (sidebarBtn) {
    sidebarBtn.addEventListener("click", function () {
      elementToggleFunc(sidebar);
    });
  }

  // Initialize testimonial modal functionality
  function initTestimonialModal() {
    const testimonialsItems = document.querySelectorAll("[data-testimonials-item]");
    const modalContainer = document.querySelector("[data-modal-container]");
    const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
    const overlay = document.querySelector("[data-overlay]");

    const modalImg = document.querySelector("[data-modal-img]");
    const modalTitle = document.querySelector("[data-modal-title]");
    const modalText = document.querySelector("[data-modal-text]");

    if (!modalContainer || !modalCloseBtn || !overlay) {
      console.log('Modal elements not found');
      return;
    }

    const testimonialsModalFunc = function () {
      modalContainer.classList.toggle("active");
      overlay.classList.toggle("active");
    };

    // Add event listeners to testimonial items
    const newTestimonialsItems = document.querySelectorAll("[data-testimonials-item]");
    console.log('Found testimonial items:', newTestimonialsItems.length);
    
    newTestimonialsItems.forEach((item, index) => {
      item.addEventListener("click", function () {
        console.log('Testimonial clicked:', index);
        
        const avatar = this.querySelector("[data-testimonials-avatar]");
        const title = this.querySelector("[data-testimonials-title]");
        const text = this.querySelector("[data-testimonials-text]");
        
        console.log('Modal elements found:', {
          avatar: !!avatar,
          title: !!title,
          text: !!text,
          modalImg: !!modalImg,
          modalTitle: !!modalTitle,
          modalText: !!modalText
        });
        
        if (avatar && title && text && modalImg && modalTitle && modalText) {
          modalImg.src = avatar.src;
          modalImg.alt = avatar.alt;
          modalTitle.innerHTML = title.innerHTML;
          modalText.innerHTML = text.innerHTML;

          console.log('Opening modal with:', {
            name: title.innerHTML,
            text: text.innerHTML.substring(0, 50) + '...'
          });

          testimonialsModalFunc();
        } else {
          console.error('Missing modal elements');
        }
      });
    });

    // Set up close button listeners (only once)
    modalCloseBtn.onclick = testimonialsModalFunc;
    overlay.onclick = testimonialsModalFunc;
  }

  // Initial testimonial modal setup
  initTestimonialModal();

  // Custom alert function for portfolio
  function showCustomAlert(title, message, type = 'info') {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      backdrop-filter: blur(10px);
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'custom-alert-modal';
    
    const iconMap = {
      success: 'checkmark-circle',
      error: 'alert-circle',
      info: 'information-circle'
    };
    
    const colorMap = {
      success: '#4CAF50',
      error: '#f44336',
      info: '#ffc857'
    };

    modal.style.cssText = `
      background: hsl(240, 2%, 12%);
      border: 1px solid hsl(0, 0%, 22%);
      border-radius: 20px;
      padding: 30px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      box-shadow: 0 24px 80px hsla(0, 0%, 0%, 0.25);
      transform: translateY(-20px) scale(0.9);
      transition: all 0.3s ease;
    `;

    modal.innerHTML = `
      <div style="
        width: 80px;
        height: 80px;
        margin: 0 auto 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 40px;
        background: ${colorMap[type]}20;
        color: ${colorMap[type]};
      ">
        <ion-icon name="${iconMap[type]}"></ion-icon>
      </div>
      <h3 style="
        color: hsl(0, 0%, 100%);
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 15px;
        font-family: 'Poppins', sans-serif;
      ">${title}</h3>
      <p style="
        color: hsl(0, 0%, 84%);
        font-size: 16px;
        line-height: 1.6;
        margin-bottom: 25px;
        font-family: 'Poppins', sans-serif;
      ">${message}</p>
      <button style="
        background: linear-gradient(to bottom right, hsl(45, 100%, 71%) 0%, hsla(36, 100%, 69%, 0) 50%);
        color: hsl(0, 0%, 100%);
        border: none;
        padding: 12px 24px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: 'Poppins', sans-serif;
        min-width: 100px;
      " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 16px 40px hsla(0, 0%, 0%, 0.25)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
        OK
      </button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Show modal with animation
    setTimeout(() => {
      overlay.style.opacity = '1';
      modal.style.transform = 'translateY(0) scale(1)';
    }, 10);

    // Handle close
    const closeModal = () => {
      overlay.style.opacity = '0';
      modal.style.transform = 'translateY(-20px) scale(0.9)';
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 300);
    };

    // Event listeners
    modal.querySelector('button').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    });
  }

  // Make function globally available
  window.showCustomAlert = showCustomAlert;

  // Custom select functionality (moved to after content loading to avoid conflicts)

  // Contact form functionality
  const form = document.querySelector("[data-form]");
  const formInputs = document.querySelectorAll("[data-form-input]");
  const formBtn = document.querySelector("[data-form-btn]");

  // Enhanced form validation with real-time feedback
  function validateForm() {
    const fullname = form.querySelector('input[name="fullname"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const message = form.querySelector('textarea[name="message"]').value.trim();
    
    // Validation rules (matching backend)
    const isFullnameValid = fullname.length >= 2 && fullname.length <= 100;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isMessageValid = message.length >= 10 && message.length <= 2000;
    
    // Update input styles and show feedback
    updateInputValidation('fullname', isFullnameValid, fullname.length < 2 ? 'Name must be at least 2 characters' : '');
    updateInputValidation('email', isEmailValid, !isEmailValid && email.length > 0 ? 'Please enter a valid email address' : '');
    updateInputValidation('message', isMessageValid, 
      message.length < 10 ? `Message must be at least 10 characters (${message.length}/10)` : 
      message.length > 2000 ? `Message is too long (${message.length}/2000)` : '');
    
    // Enable/disable submit button
    const isFormValid = isFullnameValid && isEmailValid && isMessageValid;
    
    if (isFormValid) {
      formBtn.removeAttribute("disabled");
      formBtn.style.opacity = '1';
      formBtn.style.cursor = 'pointer';
    } else {
      formBtn.setAttribute("disabled", "");
      formBtn.style.opacity = '0.6';
      formBtn.style.cursor = 'not-allowed';
    }
    
    return isFormValid;
  }
  
  // Update input validation styling and feedback
  function updateInputValidation(inputName, isValid, errorMessage) {
    const input = form.querySelector(`[name="${inputName}"]`);
    const existingError = input.parentNode.querySelector('.validation-error');
    const existingCounter = input.parentNode.querySelector('.char-counter');
    
    // Remove existing error message and counter
    if (existingError) {
      existingError.remove();
    }
    if (existingCounter) {
      existingCounter.remove();
    }
    
    // Update input styling
    if (input.value.trim().length > 0) {
      if (isValid) {
        input.style.borderColor = '#4CAF50';
        input.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
      } else {
        input.style.borderColor = '#f44336';
        input.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.2)';
        
        // Add error message
        if (errorMessage) {
          const errorDiv = document.createElement('div');
          errorDiv.className = 'validation-error';
          errorDiv.style.cssText = `
            color: #f44336;
            font-size: 12px;
            margin-top: 5px;
            font-family: 'Poppins', sans-serif;
          `;
          errorDiv.textContent = errorMessage;
          input.parentNode.appendChild(errorDiv);
        }
      }
    } else {
      // Reset styling for empty inputs
      input.style.borderColor = '';
      input.style.boxShadow = '';
    }
    
    // Add character counter for message field
    if (inputName === 'message') {
      const charCount = input.value.length;
      const counterDiv = document.createElement('div');
      counterDiv.className = 'char-counter';
      counterDiv.style.cssText = `
        color: ${charCount < 10 ? '#f44336' : charCount > 2000 ? '#f44336' : '#999'};
        font-size: 11px;
        text-align: right;
        margin-top: 5px;
        font-family: 'Poppins', sans-serif;
      `;
      counterDiv.textContent = `${charCount}/2000 characters ${charCount < 10 ? '(minimum 10)' : ''}`;
      input.parentNode.appendChild(counterDiv);
    }
  }
  
  // Add real-time validation to all form inputs
  formInputs.forEach(input => {
    input.addEventListener("input", validateForm);
    input.addEventListener("blur", validateForm);
  });
  
  // Initial validation check
  validateForm();

  // Form submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const contactData = {
        fullname: formData.get('fullname'),
        email: formData.get('email'),
        message: formData.get('message')
      };

      // Disable form during submission
      formBtn.disabled = true;
      const originalText = formBtn.querySelector('span').textContent;
      formBtn.querySelector('span').textContent = 'Sending...';

      try {
        const response = await fetch(`${BACKEND_URL}/api/contact`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(contactData)
        });

        const result = await response.json();

        if (response.ok) {
          // Success
          form.reset();
          formBtn.disabled = true;
          formBtn.querySelector('span').textContent = 'Message Sent!';
          formBtn.style.background = '#4CAF50';
          
          // Show success message with custom styling
          showCustomAlert('Message Sent!', result.message || 'Thank you for your message! I\'ll get back to you soon.', 'success');
          
          // Reset button after 3 seconds
          setTimeout(() => {
            formBtn.querySelector('span').textContent = originalText;
            formBtn.style.background = '';
          }, 3000);
        } else {
          // Handle validation errors from backend
          if (response.status === 400) {
            showCustomAlert('Validation Error', result.error || 'Please check your input and try again.', 'error');
          } else {
            showCustomAlert('Error', result.error || 'Failed to send message. Please try again.', 'error');
          }
          
          // Reset button
          formBtn.disabled = false;
          formBtn.querySelector('span').textContent = originalText;
        }
      } catch (error) {
        console.error('Contact form error:', error);
        
        // Check if it's a network error or validation error
        if (error.message.includes('Failed to fetch')) {
          showCustomAlert('Network Error', 'Unable to connect to server. Please check your internet connection and try again.', 'error');
        } else {
          showCustomAlert('Error', 'Sorry, there was an error sending your message. Please try again.', 'error');
        }
        
        // Reset button
        formBtn.disabled = false;
        formBtn.querySelector('span').textContent = originalText;
      }
    });
  }

  // Page navigation functionality
  const navigationLinks = document.querySelectorAll("[data-nav-link]");
  const pages = document.querySelectorAll("[data-page]");

  navigationLinks.forEach(link => {
    link.addEventListener("click", function () {
      const pageName = this.innerHTML.toLowerCase();
      pages.forEach((page, index) => {
        if (page.dataset.page === pageName) {
          page.classList.add("active");
          navigationLinks[index].classList.add("active");
          window.scrollTo(0, 0);
        } else {
          page.classList.remove("active");
          navigationLinks[index].classList.remove("active");
        }
      });
    });
  });

  // Skeleton Loader for Portfolio Section
  // (no redeclaration, just use the variables)
  if (skeletonList && realProjects.length > 0) {
    setTimeout(() => {
      skeletonList.style.display = 'none';
      realProjects.forEach(list => {
        list.style.display = '';
      });
    }, 2500); // 2.5 seconds loading simulation (increased for visibility)
  }
});
