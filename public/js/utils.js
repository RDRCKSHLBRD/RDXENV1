// public/js/utils.js

/**
 * Utility functions for the RDXENV portfolio site
 */

const API = {
  /**
   * Fetch data from API endpoints
   * @param {string} endpoint - API endpoint path
   * @returns {Promise} - Resolves to the data
   */
  fetch: async function(endpoint) {
    try {
      const response = await fetch(`/api/${endpoint}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      return null;
    }
  },

  /**
   * Get all clients
   */
  getClients: async function() {
    return await this.fetch('clients');
  },

  /**
   * Get projects for a specific client
   * @param {string} clientId - Client identifier
   */
  getClientProjects: async function(clientId) {
    return await this.fetch(`projects/${clientId}`);
  },

  /**
   * Get all projects
   */
  getAllProjects: async function() {
    return await this.fetch('projects');
  },

  /**
   * Get filmography data
   */
  getFilms: async function() {
    return await this.fetch('films');
  },

  /**
   * Get copy text
   */
  getCopy: async function() {
    return await this.fetch('copy');
  },

  /**
   * Get hero section data
   */
  getHero: async function() {
    return await this.fetch('hero');
  },

  /**
   * Get image references
   */
  getImages: async function() {
    return await this.fetch('images');
  }
};

/**
 * Generate a carousel for projects
 * @param {Array} projectData - Array of project data
 * @param {string} gridSelector - CSS selector for the project grid
 * @param {string} navSelector - CSS selector for the navigation dots
 */
function generateCarousel(projectData, gridSelector, navSelector) {
  const projectGrid = document.querySelector(gridSelector);
  const projectNav = document.querySelector(navSelector);
  
  if (!projectGrid || !projectNav || !projectData || projectData.length === 0) {
    console.error('Missing elements or data for carousel');
    return;
  }

  // Clear existing content
  projectGrid.innerHTML = '';
  projectNav.innerHTML = '';

  // Generate project items
  projectData.forEach((project, index) => {
    const projectItem = document.createElement('div');
    projectItem.classList.add('project-item');
    projectItem.innerHTML = `
      <div class="description">${project.description}</div>
      <div class="imageCont">
        <img src="${project.imageUrl}" alt="${project.altText}">
      </div>
    `;
    projectGrid.appendChild(projectItem);

    // Create navigation dot
    const dot = document.createElement('div');
    dot.classList.add('nav-dot');
    if (index === 0) dot.classList.add('active');
    
    dot.addEventListener('click', () => {
      scrollToProject(index, projectGrid, projectNav);
    });
    projectNav.appendChild(dot);
  });

  const projects = projectGrid.querySelectorAll('.project-item');
  const navDots = projectNav.querySelectorAll('.nav-dot');

  function scrollToProject(index) {
    const projectItem = projects[index];
    const centerPosition = projectItem.offsetLeft - (projectGrid.offsetWidth / 2) + (projectItem.offsetWidth / 2);
    
    projectGrid.scrollTo({
      left: centerPosition,
      behavior: 'smooth'
    });
    
    updateActiveDot(index);
  }

  function updateActiveDot(index) {
    navDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  function getCurrentIndex() {
    if (projects.length === 0) return 0;
    
    const projectItemWidth = projects[0].offsetWidth;
    const adjustedScrollLeft = projectGrid.scrollLeft + (projectGrid.offsetWidth / 2);
    const currentIndex = Math.round(adjustedScrollLeft / projectItemWidth) - 1;
    
    return Math.max(0, Math.min(currentIndex, projects.length - 1));
  }

  projectGrid.addEventListener('scroll', () => {
    const index = getCurrentIndex();
    updateActiveDot(index);
  });

  // Touch events for mobile swipe
  let touchStartX = 0;
  let touchEndX = 0;

  projectGrid.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, false);

  projectGrid.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, false);

  function handleSwipe() {
    const threshold = 50;
    const currentIndex = getCurrentIndex();

    if (touchStartX - touchEndX > threshold) {
      // Swipe left (next)
      const nextIndex = Math.min(currentIndex + 1, projects.length - 1);
      scrollToProject(nextIndex);
    } else if (touchEndX - touchStartX > threshold) {
      // Swipe right (prev)
      const prevIndex = Math.max(currentIndex - 1, 0);
      scrollToProject(prevIndex);
    }
  }

  // Click events for navigation
  projectGrid.addEventListener('click', e => {
    const rect = projectGrid.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const currentIndex = getCurrentIndex();

    if (x < rect.width * 0.1) {
      // Click on left edge (prev)
      const prevIndex = Math.max(currentIndex - 1, 0);
      scrollToProject(prevIndex);
    } else if (x > rect.width * 0.9) {
      // Click on right edge (next)
      const nextIndex = Math.min(currentIndex + 1, projects.length - 1);
      scrollToProject(nextIndex);
    }
  });

  // Initialize carousel to the first project
  function initialize() {
    if (projects.length > 0) {
      scrollToProject(0);
      updateActiveDot(0);
    }
  }

  initialize();
}

/**
 * Create a client section with project carousel
 * @param {Object} client - Client data
 * @param {Array} projects - Array of project data
 * @returns {HTMLElement} - Client section DOM element
 */
function createClientSection(client, projects) {
  const clientElement = document.createElement('div');
  clientElement.classList.add('client');
  clientElement.id = `client-${client.id}`;
  
  clientElement.innerHTML = `
    <h4 class="ProjHead">${client.name}</h4>
    <div class="${client.shortName}Cont">
  <div class="${client.shortName}-brand">
    <img src="${client.logo}" alt="${client.name} Logo">
  </div>

      <div class="ProjInfo-IP">
        <div class="projTitle">${client.tagline} | ${client.period}</div>
        <div class="projCopy">${client.description}</div>
      </div>
      <div class="ProjLinks">
        <div class="ProjLinks-title">Project Links</div>
        ${client.links.map((link, index) => `
          <div class="ProjLinks-link${index+1}-${link.type}${link.url ? `"><a href="${link.url}" target="_blank">${link.text}</a>` : `">${link.text}`}</div>
        `).join('')}
      </div>
    </div>

    <!-- ${client.name} Project Carousel -->
    <div class="project-grid ${client.id}-project-grid"></div>
    <div class="project-nav ${client.id}-project-nav"></div>
  `;
  
  return clientElement;
}

// Export utilities
window.RDXENV = {
  API,
  generateCarousel,
  createClientSection
};