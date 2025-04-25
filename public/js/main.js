// public/js/main.js

// Import the necessary functions from heroBlocks module
import { initHeroBlocks, startBackgroundColorTransition } from './modules/heroBlocks.js';

// Assumes RDXENV object and methods are available globally (likely from utils.js)

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize the application when the DOM is ready
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
    return null; // Return null to indicate failure
  }
}

/**
 * Fetches background colour data from the API.
 * @returns {Promise<Array|null>} - Resolves to the array of color objects or null on error.
 */
async function getBackgroundColours() {
  try {
    // Use the API route defined in api.js
    const response = await fetch('/api/background-colours');
    if (!response.ok) {
      throw new Error(`API error fetching background colours: ${response.status}`);
    }
    const data = await response.json();
    // Validate the expected structure
    if (!data || !Array.isArray(data.colors)) {
      console.error("Invalid background colour data format received:", data);
      throw new Error("Invalid background colour data format received.");
    }
    return data.colors; // Return only the array of color objects
  } catch (error) {
    console.error("Error fetching background colours:", error);
    return null; // Return null to indicate failure
  }
}


/**
 * Initializes the application by fetching data and rendering sections.
 */
async function initApp() {
  console.log("Initializing app...");
  try {
    // Load all necessary data concurrently using Promise.all
    const [copyData, clientsData, projectsData, heroData, heroConfigData, backgroundColours] = await Promise.all([
        RDXENV.API.getCopy(),
        RDXENV.API.getClients(),
        RDXENV.API.getAllProjects(),
        RDXENV.API.getHero(),
        getHeroConfig(),
        getBackgroundColours() // Fetch background colours
    ]);

    // --- Essential Data Check ---
    // Check if critical data needed for basic page function loaded
    if (!copyData || !clientsData || !projectsData || !heroData || !heroConfigData) {
      console.error('Failed to load essential page data (copy, clients, projects, hero, or hero config)');
      // Optionally display a user-friendly error message on the page
      return; // Stop initialization if critical data is missing
    }

    // --- Optional Data Check (Background Colours) ---
    if (!backgroundColours) {
      // Log a warning but allow the app to continue without the transition effect
      console.warn('Background colour data failed to load or is invalid. Background transition feature disabled.');
    }
    // --- --- --- --- --- --- --- --- --- --- ---


    // --- Initialize Hero Section ---
    const heroElement = document.getElementById('hero-section'); // Get the hero element
    if (heroElement) { // Check if the hero section exists in the DOM
       // Initialize the hero content and layout first
       initHeroBlocks(heroData, heroConfigData);

       // Start the background transition *if* colours were loaded successfully
       if (backgroundColours && backgroundColours.length > 0) {
          // Pass the DOM element, the array of colors, and the interval time (in ms)
          startBackgroundColorTransition(heroElement, backgroundColours, 7000); // Example: 7 seconds interval
       }
    } else {
        console.warn("Hero section element (#hero-section) not found in the DOM.");
    }
    // --- --- --- --- --- --- ---


    // --- Render Other Page Sections ---
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

    // --- Initialize Navigation ---
    if (clientsData?.clients && document.querySelector('.CLientProjNAv')) {
      initClientNavigation(clientsData.clients);
    } else {
      console.warn("Client data or navigation element missing.");
    }
    // --- --- --- --- --- --- ---

    console.log("App initialization routines complete.");

  } catch (error) {
    // Catch any errors during the async operations (fetching, rendering)
    console.error('Error during app initialization:', error);
    // Optionally display a user-friendly error message on the page
  }
}

// ==================================================
// --- Section Rendering & Helper Functions Below ---
// ==================================================

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

  // Sort clients by 'order' property if it exists
  const sortedClients = [...clients].sort((a, b) => (a.order || 0) - (b.order || 0));

  sortedClients.forEach((client, index) => {
    if (!client || !client.id) {
        console.warn("Skipping invalid client data:", client);
        return; // Skip this client
    }

    // Create client section using RDXENV helper
    if (typeof RDXENV?.createClientSection === 'function') {
        const clientSection = RDXENV.createClientSection(client, projects[client.id] || []); // Pass projects or empty array
        if (clientSection) {
            clientContainer.appendChild(clientSection);
        } else {
            console.warn(`Failed to create section for client: ${client.id}`);
        }
    } else {
        // Log error only once if function is missing?
        console.error("RDXENV.createClientSection is not defined.");
        return; // Stop processing further clients if critical function missing
    }

    // Add divider between client sections
    if (index < sortedClients.length - 1) {
      const divider = document.createElement('span');
      divider.className = 'divider';
      clientContainer.appendChild(divider);
    }

    // Initialize carousel using RDXENV helper
    if (typeof RDXENV?.generateCarousel === 'function') {
        const clientProjects = projects[client.id];
        if (clientProjects?.length > 0) {
          const gridSelector = `.${client.id}-project-grid`;
          const navSelector = `.${client.id}-project-nav`;
          // Ensure elements exist before trying to initialize carousel
          if (document.querySelector(gridSelector) && document.querySelector(navSelector)) {
             RDXENV.generateCarousel(clientProjects, gridSelector, navSelector);
          } else {
             // This might happen if createClientSection didn't create these elements
             // console.warn(`Carousel elements not found for client ${client.id}`);
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

  // Construct contact section HTML
  contactSection.innerHTML = `
    <h2>${contactData.title || 'Contact'}</h2>
    <div class="contact-container">
      <div class="contact-info">
        ${contactData.email ? `<div class="contact-email"><strong>Email:</strong> <a href="mailto:${contactData.email}">${contactData.email}</a></div>` : ''}
        ${contactData.phone ? `<div class="contact-phone"><strong>Phone:</strong> ${contactData.phone}</div>` : ''}
      </div>
      <div class="contact-social">
        ${contactData.social ? Object.entries(contactData.social).map(([platform, url]) =>
          // Added rel="noopener noreferrer" for security on target="_blank"
          `<a href="${url || '#'}" target="_blank" rel="noopener noreferrer" class="social-link ${platform.toLowerCase()}">${platform}</a>`
        ).join('') : ''}
      </div>
      ${contactData.message ? `<p class="contact-message">${contactData.message}</p>` : ''}
    </div>
  `;
}

/**
 * Initialize client navigation buttons in the projects section.
 * @param {Array} clients - Array of client data.
 */
function initClientNavigation(clients) {
  const clientNav = document.querySelector('.CLientProjNAv');
  if (!clientNav || !clients) return;

  clientNav.innerHTML = ''; // Clear existing buttons

  clients.forEach((client, index) => {
     // Ensure necessary client data exists
     if (!client || !client.id || !client.name) {
        console.warn("Skipping client nav button due to incomplete data:", client);
        return;
     }

     const clientButton = document.createElement('div');
     // Consider a more semantic class if Client1, Client2 etc. aren't specifically styled
     clientButton.className = `Client${index + 1} client-nav-button`; // Added generic class
     clientButton.setAttribute('data-client-id', client.id);
     clientButton.setAttribute('title', `Scroll to ${client.name}`);
     clientButton.setAttribute('role', 'button'); // Accessibility: treat as button
     clientButton.tabIndex = 0; // Make it focusable via keyboard

     // Click event listener
     clientButton.addEventListener('click', () => scrollToClient(client.id));

     // Keyboard event listener (Enter or Space to activate)
     clientButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); // Prevent default space bar scroll
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
  // Validate clientId format (basic check)
  if (!clientId || typeof clientId !== 'string' || !clientId.match(/^[a-zA-Z0-9_-]+$/)) {
    console.warn("Invalid clientId format for scrolling:", clientId);
    return;
  }

  // Construct the element ID
  const elementId = `client-${clientId}`;
  const clientElement = document.getElementById(elementId);

  if (clientElement) {
    // Scroll into view smoothly
    clientElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Improve accessibility: set focus to the scrolled-to section (or its heading)
    // Using setTimeout allows the scroll to finish before setting focus
    setTimeout(() => {
        // Try focusing the element itself, or a heading within it
        const focusableElement = clientElement.querySelector('h4') || clientElement;
        if (focusableElement) {
            focusableElement.setAttribute('tabindex', '-1'); // Make non-interactive element focusable
            focusableElement.focus({ preventScroll: true }); // Focus without triggering another scroll
        }
    }, 500); // Adjust delay if needed

  } else {
      console.warn(`Element not found for scrolling: #${elementId}`);
  }
}