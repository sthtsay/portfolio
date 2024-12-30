(function () {
  'use strict';

  // Helper function to toggle the "active" class
  const elementToggleFunc = (elem) => elem.classList.toggle("active");

  // Sidebar toggle functionality for mobile
  const sidebar = document.querySelector("[data-sidebar]");
  const sidebarBtn = document.querySelector("[data-sidebar-btn]");
  sidebarBtn.addEventListener("click", () => elementToggleFunc(sidebar));

  // Testimonials modal functionality
  const modalContainer = document.querySelector("[data-modal-container]");
  const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
  const overlay = document.querySelector("[data-overlay]");

  const modalImg = document.querySelector("[data-modal-img]");
  const modalTitle = document.querySelector("[data-modal-title]");
  const modalText = document.querySelector("[data-modal-text]");

  const testimonialsContainer = document.querySelector("[data-testimonials-container]");

  const toggleModal = () => {
    const isActive = modalContainer.classList.toggle("active");
    overlay.classList.toggle("active");
    modalContainer.setAttribute("aria-hidden", !isActive);
    overlay.setAttribute("aria-hidden", !isActive);
  };

  testimonialsContainer.addEventListener("click", (event) => {
    const item = event.target.closest("[data-testimonials-item]");
    if (item) {
      modalImg.src = item.querySelector("[data-testimonials-avatar]").src;
      modalImg.alt = item.querySelector("[data-testimonials-avatar]").alt;
      modalTitle.innerHTML = item.querySelector("[data-testimonials-title]").innerHTML;
      modalText.innerHTML = item.querySelector("[data-testimonials-text]").innerHTML;
      toggleModal();
    }
  });

  modalCloseBtn.addEventListener("click", toggleModal);
  overlay.addEventListener("click", toggleModal);

  // Custom select functionality
  const select = document.querySelector("[data-select]");
  const selectItems = document.querySelectorAll("[data-select-item]");
  const selectValue = document.querySelector("[data-selecct-value]");
  const filterBtn = document.querySelectorAll("[data-filter-btn]");
  const filterItems = document.querySelectorAll("[data-filter-item]");

  const filterFunc = (selectedValue) => {
    filterItems.forEach((item) => {
      if (selectedValue === "all" || selectedValue === item.dataset.category) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  };

  select.addEventListener("click", () => elementToggleFunc(select));

  selectItems.forEach((item) => {
    item.addEventListener("click", () => {
      const selectedValue = item.innerText.toLowerCase();
      selectValue.innerText = item.innerText;
      elementToggleFunc(select);
      filterFunc(selectedValue);
    });
  });

  let lastClickedBtn = filterBtn[0];

  filterBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selectedValue = btn.innerText.toLowerCase();
      selectValue.innerText = btn.innerText;
      filterFunc(selectedValue);

      lastClickedBtn.classList.remove("active");
      btn.classList.add("active");
      lastClickedBtn = btn;
    });
  });

  // Contact form validation
  const form = document.querySelector("[data-form]");
  const formInputs = document.querySelectorAll("[data-form-input]");
  const formBtn = document.querySelector("[data-form-btn]");

  const debounce = (callback, delay = 300) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => callback(...args), delay);
    };
  };

  formInputs.forEach((input) => {
    input.addEventListener("input", debounce(() => {
      formBtn.disabled = !form.checkValidity();
    }));
  });

  // Page navigation functionality
  const navigationLinks = document.querySelectorAll("[data-nav-link]");
  const pages = document.querySelectorAll("[data-page]");

  navigationLinks.forEach((link, index) => {
    link.addEventListener("click", () => {
      pages.forEach((page, i) => {
        if (index === i) {
          page.classList.add("active");
          navigationLinks[i].classList.add("active");
        } else {
          page.classList.remove("active");
          navigationLinks[i].classList.remove("active");
        }
      });
      window.scrollTo(0, 0);
    });
  });
})();
