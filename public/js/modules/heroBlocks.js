// public/js/modules/heroBlocks.js
// ----- VERSION 3: Simplified Layered Approach -----

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
  if (bgImage) { //
    backgroundLayer.style.backgroundImage = `url('${bgImage}')`; //
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
  contentBox.style.color = configData.contentTextColor || '#ebefdf'; //
  contentBox.style.backgroundColor = configData.contentBackgroundColor || 'rgba(34, 95, 110, 0.7)'; //

  // Add animation class if configured
  if (heroContent.animation?.enabled && heroContent.animation.type === 'fade-in') { //
    contentBox.classList.add('fade-in');
  }

  // --- Add hero text elements ---
  if (heroContent.title) { //
    const title = document.createElement('h1');
    title.textContent = heroContent.title; //
    title.classList.add('hero-title');
    contentBox.appendChild(title);
  }
  if (heroContent.subtitle) { //
    const subtitle = document.createElement('h2');
    subtitle.textContent = heroContent.subtitle; //
    subtitle.classList.add('hero-subtitle');
    contentBox.appendChild(subtitle);
  }
  if (heroContent.tagline) { //
    const tagline = document.createElement('p');
    tagline.textContent = heroContent.tagline; //
    tagline.classList.add('hero-tagline');
    contentBox.appendChild(tagline);
  }
  if (heroContent.ctaText && heroContent.ctaLink) { //
    const cta = document.createElement('a');
    cta.textContent = heroContent.ctaText; //
    cta.href = heroContent.ctaLink; //
    cta.classList.add('hero-cta');
    contentBox.appendChild(cta);
  }
  // ----------------------------

  contentLayer.appendChild(contentBox); // Add box to layer
  heroContainer.appendChild(contentLayer); // Add layer to container
  // --- --- --- --- --- ---

  console.log("Hero section initialized with simplified layered structure.");
}

// --- Export the main function ---
export { initialize as initHeroBlocks };