// public/js/modules/heroBlocks.js
// ----- VERSION 3.1: Simplified Layers + Background Transition -----

/**
 * Initializes the hero section with a background layer and a content layer.
 * @param {object} heroData - Data object containing hero content (title, subtitle, etc.)
 * @param {object} configData - Configuration object (blockBackgrounds, contentTextColor, etc.)
 */
function initialize(heroData, configData) {
  // --- Validate Input Data ---
  if (!heroData?.hero) { // Use optional chaining
    console.error("Hero data is missing or invalid.");
    return;
  }
  if (!configData) {
    console.error("Hero configuration data is missing.");
    return;
  }
  const heroContent = heroData.hero;
  // --- --- --- --- --- --- ---

  // --- Get Container ---
  const heroContainer = document.querySelector(configData.targetSelector || '#hero-section');
  if (!heroContainer) {
    console.error('Hero container not found:', configData.targetSelector || '#hero-section');
    return;
  }
  // --- --- --- --- ---

  // --- Clear container ---
  heroContainer.innerHTML = '';
  // --- --- --- --- ---

  // --- Create Background Layer ---
  const backgroundLayer = document.createElement('div');
  backgroundLayer.classList.add('hero-background-layer');
  // Use the first background image from the config, or fallback
  const bgImage = configData.blockBackgrounds?.[0]; // Get first background
  if (bgImage) {
    backgroundLayer.style.backgroundImage = `url('${bgImage}')`;
  } else {
    // Optional: Apply a fallback background color if no image specified
    backgroundLayer.style.backgroundColor = '#184551'; // Fallback color
    console.warn("No hero background image specified in config, using fallback color.");
  }
  heroContainer.appendChild(backgroundLayer);
  // --- --- --- --- --- --- ---

  // --- Create Content Layer ---
  const contentLayer = document.createElement('div');
  contentLayer.classList.add('hero-content-layer');

  // Create the actual content box (for padding, background, etc.)
  const contentBox = document.createElement('div');
  contentBox.classList.add('hero-content-box');
  contentBox.style.color = configData.contentTextColor || '#ebefdf';
  contentBox.style.backgroundColor = configData.contentBackgroundColor || 'rgba(34, 95, 110, 0.7)';

  // Add animation class if configured
  if (heroContent.animation?.enabled && heroContent.animation.type === 'fade-in') {
    contentBox.classList.add('fade-in');
  }

  // --- Add hero text elements ---
  if (heroContent.title) {
    const title = document.createElement('h1');
    title.textContent = heroContent.title;
    title.classList.add('hero-title');
    contentBox.appendChild(title);
  }
  if (heroContent.subtitle) {
    const subtitle = document.createElement('h2');
    subtitle.textContent = heroContent.subtitle;
    subtitle.classList.add('hero-subtitle');
    contentBox.appendChild(subtitle);
  }
  if (heroContent.tagline) {
    const tagline = document.createElement('p');
    tagline.textContent = heroContent.tagline;
    tagline.classList.add('hero-tagline');
    contentBox.appendChild(tagline);
  }
  if (heroContent.ctaText && heroContent.ctaLink) {
    const cta = document.createElement('a');
    cta.textContent = heroContent.ctaText;
    cta.href = heroContent.ctaLink;
    cta.classList.add('hero-cta');
    contentBox.appendChild(cta);
  }
  // ----------------------------

  contentLayer.appendChild(contentBox); // Add box to layer
  heroContainer.appendChild(contentLayer); // Add layer to container
  // --- --- --- --- --- ---

  console.log("Hero section initialized with simplified layered structure.");
}


// --- Function for Background Transition ---
let transitionIntervalId = null; // Keep track of the interval

/**
 * Starts transitioning the background color of a target element.
 * @param {HTMLElement} targetElement - The DOM element to apply the background color to.
 * @param {Array<object>} colors - Array of color objects, e.g., [{ name: '..', hex: '#...' }, ...]
 * @param {number} intervalMs - The time in milliseconds between transitions.
 */
function startBackgroundColorTransition(targetElement, colors, intervalMs = 7000) {
  if (!targetElement || !colors || colors.length === 0) {
    console.warn("Cannot start background transition: Invalid element or no colors provided.");
    return;
  }

  // Clear any existing interval to prevent duplicates if called again
  if (transitionIntervalId) {
    clearInterval(transitionIntervalId);
  }

  // Function to set a random color
  const setRandomColor = () => {
    try {
      const randomIndex = Math.floor(Math.random() * colors.length);
      const randomColor = colors[randomIndex].hex; // Get the hex value from the color object
      if (randomColor && /^#[0-9A-F]{6}$/i.test(randomColor)) { // Basic validation for hex color
         targetElement.style.backgroundColor = randomColor;
      } else {
         console.warn("Invalid or missing hex color found at index:", randomIndex, colors[randomIndex]);
      }
    } catch (error) {
        console.error("Error setting random background color:", error);
        // Optionally stop the interval if errors persist
        // clearInterval(transitionIntervalId);
    }
  };

  // Set the first color immediately so it doesn't wait for the first interval
  setRandomColor();

  // Set interval to change color periodically
  transitionIntervalId = setInterval(setRandomColor, intervalMs);

  console.log(`Background color transition started on element with interval ${intervalMs}ms`, targetElement);
}
// --- END OF Background Transition Function ---


// --- Export the necessary functions ---
// Make sure BOTH initialize (as initHeroBlocks) and startBackgroundColorTransition are exported
export { initialize as initHeroBlocks, startBackgroundColorTransition };