// Backend URL for API and socket.io
const BACKEND_URL = 'https://portfolio-505u.onrender.com';

'use strict';

// Function to get the correct image URL
function getImageUrl(path) {
  if (!path) return ''; // Return empty string if path is not provided
  if (path.startsWith('uploads/')) {
    return `${BACKEND_URL}/${path}`;
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
    fetch(BACKEND_URL + '/content.json')
      .then(response => response.json())
      .then(content => {
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

        // PROJECTS
        const projectTypes = [
          { type: 'python projects', id: 'python-projects-list' },
          { type: 'website projects', id: 'website-projects-list' },
          { type: 'java projects', id: 'java-projects-list' }
        ];
        projectTypes.forEach(pt => {
          if (document.getElementById(pt.id)) {
            document.getElementById(pt.id).innerHTML = content.projects.filter(p => p.type === pt.type).map(project => `
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
            list.style.display = '';
          });
        }
      })
      .catch(() => {
        if (loadingDiv) loadingDiv.textContent = 'Failed to load content. Please check your content.json.';
        if (main) main.prepend(loadingDiv);
      });
  }

  // Initial fetch
  fetchAndRenderContent();

  // Real-time updates with socket.io
  const script = document.createElement('script');
  script.src = BACKEND_URL + '/socket.io/socket.io.js';
  script.onload = function() {
    const socket = io(BACKEND_URL);
    socket.on('content-updated', () => {
      fetchAndRenderContent();
    });
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

  // Testimonials modal functionality
  const testimonialsItems = document.querySelectorAll("[data-testimonials-item]");
  const modalContainer = document.querySelector("[data-modal-container]");
  const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
  const overlay = document.querySelector("[data-overlay]");

  const modalImg = document.querySelector("[data-modal-img]");
  const modalTitle = document.querySelector("[data-modal-title]");
  const modalText = document.querySelector("[data-modal-text]");

  const testimonialsModalFunc = function () {
    modalContainer.classList.toggle("active");
    overlay.classList.toggle("active");
  };

  testimonialsItems.forEach(item => {
    item.addEventListener("click", function () {
      modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
      modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
      modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
      modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

      testimonialsModalFunc();
    });
  });

  if (modalCloseBtn && overlay) {
    modalCloseBtn.addEventListener("click", testimonialsModalFunc);
    overlay.addEventListener("click", testimonialsModalFunc);
  }

  // Custom select functionality
  const select = document.querySelector("[data-select]");
  const selectItems = document.querySelectorAll("[data-select-item]");
  const selectValue = document.querySelector("[data-select-value]");
  const filterBtn = document.querySelectorAll("[data-filter-btn]");

  if (select) {
    select.addEventListener("click", function () {
      elementToggleFunc(this);
    });
  }

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

  selectItems.forEach(item => {
    item.addEventListener("click", function () {
      const selectedValue = this.innerText.toLowerCase();
      selectValue.innerText = this.innerText;
      elementToggleFunc(select);
      filterFunc(selectedValue);
    });
  });

  let lastClickedBtn = filterBtn[0];
  filterBtn.forEach(btn => {
    btn.addEventListener("click", function () {
      const selectedValue = this.innerText.toLowerCase();
      selectValue.innerText = this.innerText;
      filterFunc(selectedValue);

      if (lastClickedBtn) lastClickedBtn.classList.remove("active");
      this.classList.add("active");
      lastClickedBtn = this;
    });
  });

  // Contact form functionality
  const form = document.querySelector("[data-form]");
  const formInputs = document.querySelectorAll("[data-form-input]");
  const formBtn = document.querySelector("[data-form-btn]");

  formInputs.forEach(input => {
    input.addEventListener("input", function () {
      if (form.checkValidity()) {
        formBtn.removeAttribute("disabled");
      } else {
        formBtn.setAttribute("disabled", "");
      }
    });
  });

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
