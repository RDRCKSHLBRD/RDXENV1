// public/js/main.js

import { initHeroBlocks, startBackgroundColorTransition } from './modules/heroBlocks.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initApp();
});

async function getHeroConfig() {
  try {
    const response = await fetch('/api/hero/config');
    if (!response.ok) throw new Error(`API error fetching config: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching hero config:", error);
    return null;
  }
}

async function getBackgroundColours() {
  try {
    const response = await fetch('/api/background-colours');
    if (!response.ok) throw new Error(`API error fetching background colours: ${response.status}`);
    const data = await response.json();
    if (!data || !Array.isArray(data.colors)) throw new Error("Invalid background colour data format received.");
    return data.colors;
  } catch (error) {
    console.error("Error fetching background colours:", error);
    return null;
  }
}

async function initApp() {
  console.log("Initializing app...");
  try {
    const [copyData, clientsData, projectsData, heroData, heroConfigData, backgroundColours] = await Promise.all([
      RDXENV.API.getCopy(),
      RDXENV.API.getClients(),
      RDXENV.API.getAllProjects(),
      RDXENV.API.getHero(),
      getHeroConfig(),
      getBackgroundColours()
    ]);

    if (!copyData || !clientsData || !projectsData || !heroData || !heroConfigData) {
      console.error('Failed to load essential page data.');
      return;
    }

    if (!backgroundColours) {
      console.warn('Background colour data failed to load. Background transition feature disabled.');
    }

    const heroElement = document.getElementById('hero-section');
    if (heroElement) {
      initHeroBlocks(heroData, heroConfigData);
      if (backgroundColours && backgroundColours.length > 0) {
        startBackgroundColorTransition(heroElement, backgroundColours, 7000);
      }
    } else {
      console.warn("Hero section element (#hero-section) not found in the DOM.");
    }

    if (copyData.about && document.getElementById('about')) {
      renderAboutSection(copyData.about);
    }

    if (clientsData?.clients && projectsData?.projects && document.getElementById('client-container')) {
      renderClientProjects(clientsData.clients, projectsData.projects);
    }

    if (copyData.contact && document.getElementById('contact')) {
      renderContactSection(copyData.contact);
    }

    if (clientsData?.clients && document.querySelector('.CLientProjNAv')) {
      initClientNavigation(clientsData.clients);
    }

    console.log("App initialization routines complete.");

  } catch (error) {
    console.error('Error during app initialization:', error);
  }
}

function renderAboutSection(aboutData) {
  const aboutSection = document.getElementById('about');
  if (!aboutSection || !aboutData) return;

  aboutSection.innerHTML = `
    <h2>${aboutData.title || 'About'}</h2>
    ${(aboutData.paragraphs || []).map(p => `<p>${p}</p>`).join('')}
  `;
}

function renderClientProjects(clients, projects) {
  const clientContainer = document.getElementById('client-container');
  if (!clientContainer || !clients || !projects) return;

  clientContainer.innerHTML = '';

  const sortedClients = [...clients].sort((a, b) => (a.order || 0) - (b.order || 0));

  sortedClients.forEach((client, index) => {
    if (!client || !client.id) {
      console.warn("Skipping invalid client data:", client);
      return;
    }

    if (typeof RDXENV?.createClientSection === 'function') {
      const clientSection = RDXENV.createClientSection(client, projects[client.id] || []);
      if (clientSection) {
        clientContainer.appendChild(clientSection);

        const images = clientSection.querySelectorAll('img');
        const clientProjects = projects[client.id];

        images.forEach((img, idx) => {
          const project = clientProjects?.[idx];
          if (project) {
            img.classList.add('project-image');

            if (project.objectFit === 'cover') {
              img.classList.add('fit-cover');
            } else if (project.objectFit === 'contain') {
              img.classList.add('fit-contain');
            } else {
              img.classList.add('fit-contain');
            }

            const parent = img.closest('.imageCont');
            if (parent) {
              if (project.aspect === 'portrait') {
                parent.classList.add('aspect-portrait');
              } else if (project.aspect === 'landscape') {
                parent.classList.add('aspect-landscape');
              } else {
                parent.classList.add('aspect-square');
              }
            }
          }
        });

      } else {
        console.warn(`Failed to create section for client: ${client.id}`);
      }
    } else {
      console.error("RDXENV.createClientSection is not defined.");
      return;
    }

    if (index < sortedClients.length - 1) {
      const divider = document.createElement('span');
      divider.className = 'divider';
      clientContainer.appendChild(divider);
    }

    if (typeof RDXENV?.generateCarousel === 'function') {
      const clientProjects = projects[client.id];
      if (clientProjects?.length > 0) {
        const gridSelector = `.${client.id}-project-grid`;
        const navSelector = `.${client.id}-project-nav`;
        if (document.querySelector(gridSelector) && document.querySelector(navSelector)) {
          RDXENV.generateCarousel(clientProjects, gridSelector, navSelector);
        }
      }
    } else {
      console.error("RDXENV.generateCarousel is not defined.");
    }
  });

  // 🧠 Reset calibration after everything is rendered
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
    console.log('[Calibration] Forced resize event for recalibration.');
  }, 100);
}

function renderContactSection(contactData) {
  const contactSection = document.getElementById('contact');
  if (!contactSection || !contactData) return;

  contactSection.innerHTML = `
    <h2>${contactData.title || 'Contact'}</h2>
    <div class="contact-container">
      <div class="contact-info">
        ${contactData.email ? `<div class="contact-email"><strong>Email:</strong> <a href="mailto:${contactData.email}">${contactData.email}</a></div>` : ''}
        ${contactData.phone ? `<div class="contact-phone"><strong>Phone:</strong> ${contactData.phone}</div>` : ''}
      </div>
      <div class="contact-social">
        ${contactData.social ? Object.entries(contactData.social).map(([platform, url]) =>
          `<a href="${url || '#'}" target="_blank" rel="noopener noreferrer" class="social-link ${platform.toLowerCase()}">${platform}</a>`
        ).join('') : ''}
      </div>
      ${contactData.message ? `<p class="contact-message">${contactData.message}</p>` : ''}
    </div>
  `;
}

function initClientNavigation(clients) {
  const clientNav = document.querySelector('.CLientProjNAv');
  if (!clientNav || !clients) return;

  clientNav.innerHTML = '';

  clients.forEach((client, index) => {
    if (!client || !client.id || !client.name) {
      console.warn("Skipping client nav button due to incomplete data:", client);
      return;
    }

    const clientButton = document.createElement('div');
    clientButton.className = `Client${index + 1} client-nav-button`;
    clientButton.setAttribute('data-client-id', client.id);
    clientButton.setAttribute('title', `Scroll to ${client.name}`);
    clientButton.setAttribute('role', 'button');
    clientButton.tabIndex = 0;

    clientButton.addEventListener('click', () => scrollToClient(client.id));
    clientButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollToClient(client.id);
      }
    });

    clientNav.appendChild(clientButton);
  });
}

function scrollToClient(clientId) {
  if (!clientId || typeof clientId !== 'string' || !clientId.match(/^[a-zA-Z0-9_-]+$/)) {
    console.warn("Invalid clientId format for scrolling:", clientId);
    return;
  }

  const elementId = `client-${clientId}`;
  const clientElement = document.getElementById(elementId);
  const clientContainer = document.getElementById('client-container');

  if (clientElement) {
    console.log(`Preparing to scroll to client: ${clientId}`);
    if (clientContainer) {
      clientContainer.style.transform = 'scale(1.001)';
      requestAnimationFrame(() => {
        clientContainer.style.transform = 'scale(1)';
        requestAnimationFrame(() => {
          clientElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => {
            const focusableElement = clientElement.querySelector('h4') || clientElement;
            if (focusableElement) {
              focusableElement.setAttribute('tabindex', '-1');
              focusableElement.focus({ preventScroll: true });
            }
          }, 500);
        });
      });
    } else {
      clientElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } else {
    console.warn(`Element not found for scrolling: #${elementId}`);
  }
}
