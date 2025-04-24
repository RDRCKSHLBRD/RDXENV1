// public/js/main.js
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize the application
  await initApp();
});

/**
 * Initialize the application
 */
async function initApp() {
  try {
    // Load all necessary data
    const copyData = await RDXENV.API.getCopy();
    const clientsData = await RDXENV.API.getClients();
    const projectsData = await RDXENV.API.getAllProjects();
    const heroData = await RDXENV.API.getHero();
    
    if (!copyData || !clientsData || !projectsData) {
      console.error('Failed to load required data');
      return;
    }
    
    // Render hero section if we're on the homepage
    if (document.getElementById('hero-section')) {
      renderHeroSection(heroData, copyData);
    }
    
    // Render about section
    renderAboutSection(copyData.about);
    
    // Render client projects
    renderClientProjects(clientsData.clients, projectsData.projects);
    
    // Render contact section
    renderContactSection(copyData.contact);
    
    // Initialize client navigation
    initClientNavigation(clientsData.clients);
    
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

/**
 * Render the hero/splash section
 * @param {Object} heroData - Hero section data
 * @param {Object} copyData - Copy text data
 */
function renderHeroSection(heroData, copyData) {
  const heroSection = document.getElementById('hero-section');
  if (!heroSection) return;
  
  const hero = heroData.hero;
  
  heroSection.innerHTML = `
    <div class="hero-content ${hero.animation.enabled ? hero.animation.type : ''}">
      <h1 class="hero-title">${hero.title}</h1>
      <div class="hero-subtitle">${hero.subtitle}</div>
      <div class="hero-tagline">${hero.tagline}</div>
      <a href="${hero.ctaLink}" class="hero-cta">${hero.ctaText}</a>
    </div>
    <div class="hero-introduction">
      <h2>${heroData.introduction.heading}</h2>
      <p>${heroData.introduction.text}</p>
      <a href="${heroData.introduction.ctaLink}" class="intro-cta">${heroData.introduction.ctaText}</a>
    </div>
    <div class="featured-clients">
      ${heroData.featuredClients.map(client => `
        <div class="featured-client">
          <img src="${client.logo}" alt="${client.name} Logo">
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Render the about section
 * @param {Object} aboutData - About section data
 */
function renderAboutSection(aboutData) {
  const aboutSection = document.getElementById('about');
  if (!aboutSection) return;
  
  aboutSection.innerHTML = `
    <h2>${aboutData.title}</h2>
    ${aboutData.paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('')}
  `;
}

/**
 * Render client project sections
 * @param {Array} clients - Array of client data
 * @param {Object} projects - Object containing projects by client ID
 */
function renderClientProjects(clients, projects) {
  const clientContainer = document.getElementById('client-container');
  if (!clientContainer) return;
  
  // Clear container
  clientContainer.innerHTML = '';
  
  // Sort clients by order property
  const sortedClients = [...clients].sort((a, b) => a.order - b.order);
  
  // Add each client and their projects
  sortedClients.forEach((client, index) => {
    // Create client section
    const clientSection = RDXENV.createClientSection(client, projects[client.id]);
    clientContainer.appendChild(clientSection);
    
    // Add divider between clients (except after the last one)
    if (index < sortedClients.length - 1) {
      const divider = document.createElement('span');
      divider.className = 'divider';
      clientContainer.appendChild(divider);
    }
    
    // Initialize carousel for this client
    if (projects[client.id] && projects[client.id].length > 0) {
      RDXENV.generateCarousel(
        projects[client.id], 
        `.${client.id}-project-grid`, 
        `.${client.id}-project-nav`
      );
    }
  });
}

/**
 * Render the contact section
 * @param {Object} contactData - Contact section data
 */
function renderContactSection(contactData) {
  const contactSection = document.getElementById('contact');
  if (!contactSection) return;
  
  contactSection.innerHTML = `
    <h2>${contactData.title}</h2>
    <div class="contact-container">
      <div class="contact-info">
        <div class="contact-email">
          <strong>Email:</strong> <a href="mailto:${contactData.email}">${contactData.email}</a>
        </div>
        <div class="contact-phone">
          <strong>Phone:</strong> ${contactData.phone}
        </div>
      </div>
      <div class="contact-social">
        ${Object.entries(contactData.social).map(([platform, url]) => `
          <a href="${url}" target="_blank" class="social-link ${platform}">${platform}</a>
        `).join('')}
      </div>
      <p class="contact-message">${contactData.message}</p>
    </div>
  `;
}

/**
 * Initialize client navigation in the projects section
 * @param {Array} clients - Array of client data
 */
function initClientNavigation(clients) {
  const clientNav = document.querySelector('.CLientProjNAv');
  if (!clientNav) return;
  
  // Clear existing navigation
  clientNav.innerHTML = '';
  
  // Create client navigation buttons
  clients.forEach((client, index) => {
    const clientButton = document.createElement('div');
    clientButton.className = `Client${index + 1}`;
    clientButton.setAttribute('data-client-id', client.id);
    clientButton.setAttribute('title', client.name);
    
    clientButton.addEventListener('click', () => {
      scrollToClient(client.id);
    });
    
    clientNav.appendChild(clientButton);
  });
}

/**
 * Scroll to a specific client section
 * @param {string} clientId - Client ID to scroll to
 */
function scrollToClient(clientId) {
  const clientElement = document.getElementById(`client-${clientId}`);
  if (clientElement) {
    clientElement.scrollIntoView({ behavior: 'smooth' });
  }
}