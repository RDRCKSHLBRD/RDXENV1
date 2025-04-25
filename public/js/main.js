// public/js/main.js

// Import the hero block initializer
import { initHeroBlocks } from './modules/heroBlocks.js';

// --- Assumed RDXENV object and methods (likely from utils.js) ---
// Ensure RDXENV and RDXENV.API are defined before this script runs,
// possibly in utils.js loaded via <script> tag in HTML.
// Example structure assumed:
// const RDXENV = {
//   API: {
//     getCopy: async () => { /* fetch logic */ },
//     getClients: async () => { /* fetch logic */ },
//     getAllProjects: async () => { /* fetch logic */ },
//     getHero: async () => { /* fetch logic */ }
//   },
//   createClientSection: (client, projects) => { /* DOM creation logic */ },
//   generateCarousel: (projects, gridSelector, navSelector) => { /* carousel logic */ }
// };
// If RDXENV.API methods are not defined, replace calls below with direct fetch calls.

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize the application
  await initApp();
});

/**
 * Initialize the application
 */
async function initApp() {
  console.log("Initializing app...");
  try {
    // Load all necessary data (assuming RDXENV.API is available)
    const copyData = await RDXENV.API.getCopy();
    const clientsData = await RDXENV.API.getClients();
    const projectsData = await RDXENV.API.getAllProjects();
    const heroData = await RDXENV.API.getHero(); // Fetch hero data once

    if (!copyData || !clientsData || !projectsData || !heroData) {
      console.error('Failed to load required data');
      // Optionally display an error message to the user
      return;
    }

    // ---> Initialize the dynamic hero section <---
    if (document.getElementById('hero-section')) {
       await initHeroBlocks(heroData); // Pass fetched heroData to the module
    }
    // ---> Removed the old renderHeroSection call <---

    // Render about section (using existing logic)
    if (copyData.about && document.getElementById('about')) {
      renderAboutSection(copyData.about);
    } else {
      console.warn("About data or section element missing.");
    }

    // Render client projects (using existing logic)
    if (clientsData && clientsData.clients && projectsData && projectsData.projects && document.getElementById('client-container')) {
      renderClientProjects(clientsData.clients, projectsData.projects);
    } else {
       console.warn("Client/Project data or container element missing.");
    }

    // Render contact section (using existing logic)
    if (copyData.contact && document.getElementById('contact')) {
      renderContactSection(copyData.contact);
    } else {
       console.warn("Contact data or section element missing.");
    }

    // Initialize client navigation (using existing logic)
    if (clientsData && clientsData.clients && document.querySelector('.CLientProjNAv')) {
      initClientNavigation(clientsData.clients);
    } else {
       console.warn("Client data or navigation element missing.");
    }

    console.log("App initialization routines complete.");

  } catch (error) {
    console.error('Error initializing app:', error);
     // Optionally display an error message to the user
  }
}

// --- Keep your existing functions below (renderAboutSection, renderClientProjects, etc.) ---

/**
 * Render the about section
 * @param {Object} aboutData - About section data
 */
function renderAboutSection(aboutData) {
  const aboutSection = document.getElementById('about');
  if (!aboutSection || !aboutData) return; // Added check for data

  aboutSection.innerHTML = `
    <h2>${aboutData.title || 'About'}</h2>
    ${(aboutData.paragraphs || []).map(paragraph => `<p>${paragraph}</p>`).join('')}
  `;
}

/**
 * Render client project sections
 * @param {Array} clients - Array of client data
 * @param {Object} projects - Object containing projects by client ID
 */
function renderClientProjects(clients, projects) {
  const clientContainer = document.getElementById('client-container');
  if (!clientContainer || !clients || !projects) return; // Added checks

  // Clear container
  clientContainer.innerHTML = '';

  // Sort clients by order property (ensure clients have 'order' property)
  const sortedClients = [...clients].sort((a, b) => (a.order || 0) - (b.order || 0));

  sortedClients.forEach((client, index) => {
    if (!client || !client.id) {
        console.warn("Skipping invalid client data:", client);
        return;
    }
    // Ensure RDXENV object and method exist
    if (typeof RDXENV !== 'undefined' && typeof RDXENV.createClientSection === 'function') {
        // Create client section
        const clientSection = RDXENV.createClientSection(client, projects[client.id] || []); // Pass empty array if no projects
        if (clientSection) { // Check if section was created
            clientContainer.appendChild(clientSection);
        } else {
            console.warn(`Failed to create section for client: ${client.id}`);
        }
    } else {
        console.error("RDXENV.createClientSection is not defined.");
        return; // Stop if critical function missing
    }


    // Add divider between clients (except after the last one)
    if (index < sortedClients.length - 1) {
      const divider = document.createElement('span');
      divider.className = 'divider';
      clientContainer.appendChild(divider);
    }

    // Initialize carousel for this client (Ensure RDXENV object and method exist)
    if (typeof RDXENV !== 'undefined' && typeof RDXENV.generateCarousel === 'function') {
        const clientProjects = projects[client.id];
        if (clientProjects && clientProjects.length > 0) {
          // Ensure selectors are valid and elements exist before calling
          const gridSelector = `.${client.id}-project-grid`;
          const navSelector = `.${client.id}-project-nav`;
          if (document.querySelector(gridSelector) && document.querySelector(navSelector)) {
             RDXENV.generateCarousel(
               clientProjects,
               gridSelector,
               navSelector
             );
          } else {
            // This might happen if createClientSection didn't create these elements
            // console.warn(`Carousel elements not found for client ${client.id}. Selectors: ${gridSelector}, ${navSelector}`);
          }
        }
    } else {
         console.error("RDXENV.generateCarousel is not defined.");
    }
  });
}

/**
 * Render the contact section
 * @param {Object} contactData - Contact section data
 */
function renderContactSection(contactData) {
  const contactSection = document.getElementById('contact');
  if (!contactSection || !contactData) return; // Added check

  contactSection.innerHTML = `
    <h2>${contactData.title || 'Contact'}</h2>
    <div class="contact-container">
      <div class="contact-info">
        ${contactData.email ? `<div class="contact-email"><strong>Email:</strong> <a href="mailto:${contactData.email}">${contactData.email}</a></div>` : ''}
        ${contactData.phone ? `<div class="contact-phone"><strong>Phone:</strong> ${contactData.phone}</div>` : ''}
      </div>
      <div class="contact-social">
        ${contactData.social ? Object.entries(contactData.social).map(([platform, url]) => `
          <a href="${url || '#'}" target="_blank" class="social-link ${platform}">${platform}</a>
        `).join('') : ''}
      </div>
      ${contactData.message ? `<p class="contact-message">${contactData.message}</p>` : ''}
    </div>
  `;
}

/**
 * Initialize client navigation in the projects section
 * @param {Array} clients - Array of client data
 */
function initClientNavigation(clients) {
  const clientNav = document.querySelector('.CLientProjNAv');
  if (!clientNav || !clients) return; // Added check

  // Clear existing navigation
  clientNav.innerHTML = '';

  // Create client navigation buttons
  clients.forEach((client, index) => {
     if (!client || !client.id) return; // Skip invalid client data
    const clientButton = document.createElement('div');
    clientButton.className = `Client${index + 1}`; // Keep class if CSS depends on it
    clientButton.setAttribute('data-client-id', client.id);
    clientButton.setAttribute('title', client.name || `Client ${index + 1}`); // Add default title

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
  // Ensure clientId is valid before creating selector
  if (!clientId || typeof clientId !== 'string' || !clientId.match(/^[a-zA-Z0-9_-]+$/)) {
    console.warn("Invalid clientId for scrolling:", clientId);
    return;
  }
  const clientElement = document.getElementById(`client-${clientId}`);
  if (clientElement) {
    clientElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
      console.warn(`Element not found for scrolling: #client-${clientId}`);
  }
}