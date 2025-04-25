// public/js/main.js

import { initHeroBlocks } from './modules/heroBlocks.js';

// Assumes RDXENV object and methods are available globally (likely from utils.js)

document.addEventListener('DOMContentLoaded', async () => {
  await initApp();
});

/**
 * Fetches hero configuration data from the API.
 * @returns {Promise<object|null>} - Resolves to the config data or null on error.
 */
async function getHeroConfig() {
  try {
    const response = await fetch('/api/hero/config');
    if (!response.ok) {
      throw new Error(`API error fetching config: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching hero config:", error);
    return null;
  }
}

/**
 * Initializes the application by fetching data and rendering sections.
 */
async function initApp() {
  console.log("Initializing app...");
  try {
    // Load all necessary data concurrently
    const [copyData, clientsData, projectsData, heroData, heroConfigData] = await Promise.all([
        RDXENV.API.getCopy(),
        RDXENV.API.getClients(),
        RDXENV.API.getAllProjects(),
        RDXENV.API.getHero(),
        getHeroConfig()
    ]);

    // Check if essential data loaded
    if (!copyData || !clientsData || !projectsData || !heroData || !heroConfigData) {
      console.error('Failed to load required data (copy, clients, projects, hero, or hero config)');
      // Consider displaying a user-friendly error message here
      return;
    }

    // Initialize the dynamic hero section
    if (document.getElementById('hero-section')) {
       initHeroBlocks(heroData, heroConfigData);
    }

    // Render other sections
    if (copyData.about && document.getElementById('about')) {
      renderAboutSection(copyData.about);
    } else {
      console.warn("About data or section element missing.");
    }

    if (clientsData?.clients && projectsData?.projects && document.getElementById('client-container')) {
      renderClientProjects(clientsData.clients, projectsData.projects);
    } else {
       console.warn("Client/Project data or container element missing.");
    }

    if (copyData.contact && document.getElementById('contact')) {
      renderContactSection(copyData.contact);
    } else {
       console.warn("Contact data or section element missing.");
    }

    // Initialize client navigation
    if (clientsData?.clients && document.querySelector('.CLientProjNAv')) {
      initClientNavigation(clientsData.clients);
    } else {
       console.warn("Client data or navigation element missing.");
    }

    console.log("App initialization routines complete.");

  } catch (error) {
    console.error('Error initializing app:', error);
    // Consider displaying a user-friendly error message here
  }
}

// --- Section Rendering Functions ---

/**
 * Render the about section.
 * @param {object} aboutData - About section data from API.
 */
function renderAboutSection(aboutData) {
  const aboutSection = document.getElementById('about');
  if (!aboutSection || !aboutData) return;

  aboutSection.innerHTML = `
    <h2>${aboutData.title || 'About'}</h2>
    ${(aboutData.paragraphs || []).map(p => `<p>${p}</p>`).join('')}
  `;
}

/**
 * Render client project sections and initialize carousels.
 * @param {Array} clients - Array of client data.
 * @param {object} projects - Object containing projects keyed by client ID.
 */
function renderClientProjects(clients, projects) {
  const clientContainer = document.getElementById('client-container');
  if (!clientContainer || !clients || !projects) return;

  clientContainer.innerHTML = ''; // Clear container

  const sortedClients = [...clients].sort((a, b) => (a.order || 0) - (b.order || 0));

  sortedClients.forEach((client, index) => {
    if (!client || !client.id) {
        console.warn("Skipping invalid client data:", client);
        return;
    }

    // Create client section using RDXENV helper (ensure RDXENV.createClientSection exists)
    if (typeof RDXENV?.createClientSection === 'function') {
        const clientSection = RDXENV.createClientSection(client, projects[client.id] || []);
        if (clientSection) {
            clientContainer.appendChild(clientSection);
        } else {
            console.warn(`Failed to create section for client: ${client.id}`);
        }
    } else {
        console.error("RDXENV.createClientSection is not defined.");
        return; // Stop processing if function missing
    }

    // Add divider
    if (index < sortedClients.length - 1) {
      const divider = document.createElement('span');
      divider.className = 'divider';
      clientContainer.appendChild(divider);
    }

    // Initialize carousel using RDXENV helper (ensure RDXENV.generateCarousel exists)
    if (typeof RDXENV?.generateCarousel === 'function') {
        const clientProjects = projects[client.id];
        if (clientProjects?.length > 0) {
          const gridSelector = `.${client.id}-project-grid`;
          const navSelector = `.${client.id}-project-nav`;
          // Check elements exist before initializing carousel
          if (document.querySelector(gridSelector) && document.querySelector(navSelector)) {
             RDXENV.generateCarousel(clientProjects, gridSelector, navSelector);
          }
        }
    } else {
         console.error("RDXENV.generateCarousel is not defined.");
    }
  });
}

/**
 * Render the contact section.
 * @param {object} contactData - Contact section data from API.
 */
function renderContactSection(contactData) {
  const contactSection = document.getElementById('contact');
  if (!contactSection || !contactData) return;

  // Basic structure, assumes properties exist or uses fallbacks
  contactSection.innerHTML = `
    <h2>${contactData.title || 'Contact'}</h2>
    <div class="contact-container">
      <div class="contact-info">
        ${contactData.email ? `<div class="contact-email"><strong>Email:</strong> <a href="mailto:${contactData.email}">${contactData.email}</a></div>` : ''}
        ${contactData.phone ? `<div class="contact-phone"><strong>Phone:</strong> ${contactData.phone}</div>` : ''}
      </div>
      <div class="contact-social">
        ${contactData.social ? Object.entries(contactData.social).map(([platform, url]) =>
          `<a href="${url || '#'}" target="_blank" rel="noopener noreferrer" class="social-link ${platform}">${platform}</a>`
        ).join('') : ''}
      </div>
      ${contactData.message ? `<p class="contact-message">${contactData.message}</p>` : ''}
    </div>
  `;
}

// --- Navigation Functions ---

/**
 * Initialize client navigation buttons in the projects section.
 * @param {Array} clients - Array of client data.
 */
function initClientNavigation(clients) {
  const clientNav = document.querySelector('.CLientProjNAv');
  if (!clientNav || !clients) return;

  clientNav.innerHTML = ''; // Clear existing buttons

  clients.forEach((client, index) => {
     if (!client || !client.id || !client.name) return; // Skip incomplete client data

     const clientButton = document.createElement('div');
     // Consider using a more descriptive class name if possible
     clientButton.className = `Client${index + 1}`; // Keep if CSS depends on it
     clientButton.setAttribute('data-client-id', client.id);
     clientButton.setAttribute('title', client.name);
     clientButton.setAttribute('role', 'button'); // Accessibility
     clientButton.tabIndex = 0; // Make it focusable

     clientButton.addEventListener('click', () => scrollToClient(client.id));
     // Add keyboard accessibility
     clientButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            scrollToClient(client.id);
        }
     });

     clientNav.appendChild(clientButton);
  });
}

/**
 * Scroll smoothly to a specific client section.
 * @param {string} clientId - Client ID to scroll to.
 */
function scrollToClient(clientId) {
  // Basic validation
  if (!clientId || typeof clientId !== 'string' || !clientId.match(/^[a-zA-Z0-9_-]+$/)) {
    console.warn("Invalid clientId for scrolling:", clientId);
    return;
  }
  const clientElement = document.getElementById(`client-${clientId}`);
  if (clientElement) {
    clientElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    clientElement.focus(); // Improve accessibility by moving focus
  } else {
      console.warn(`Element not found for scrolling: #client-${clientId}`);
  }
}