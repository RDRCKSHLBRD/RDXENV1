// public/js/modules/heroBlocks.js
// ----- REFACTORED VERSION for CSS Grid Layout -----

// Helper function to shuffle an array (for random backgrounds)
function shuffle(array) {
  if (!array || array.length === 0) return [];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Initializes the hero section using CSS Grid.
 * @param {object} heroData - Data object containing hero content (title, subtitle, etc.)
 * @param {object} configData - Configuration object (targetSelector, blockBackgrounds, etc.)
 */
function initialize(heroData, configData) {
  if (!heroData || !heroData.hero) {
    console.error("Hero data is missing or invalid.");
    return;
  }
  if (!configData) {
    console.error("Hero configuration data is missing.");
    return;
  }

  const heroContainer = document.querySelector(configData.targetSelector || '#hero-section'); //
  if (!heroContainer) {
    console.error('Hero container not found:', configData.targetSelector || '#hero-section');
    return;
  }

  // --- Clear container ---
  heroContainer.innerHTML = '';

  // --- Define number of background blocks ---
  // Let's create 5 background blocks + 1 content block = 6 total grid items
  const numberOfBlocks = 6;
  const contentBlockIndex = 0; // Let's make the first block the content container

  // --- Get shuffled background images ---
  const backgrounds = configData.blockBackgrounds ? shuffle([...configData.blockBackgrounds]) : []; //

  // --- Create Grid Items (Blocks) ---
  for (let i = 0; i < numberOfBlocks; i++) {
    const block = document.createElement('div');
    block.classList.add('hero-block');

    if (i === contentBlockIndex) {
      // --- This is the block designated for content ---
      block.classList.add('hero-block-content-container');

      // Create the inner wrapper for padding, background, etc.
      const contentWrapper = document.createElement('div');
      contentWrapper.classList.add('hero-block-content'); // Use this class for styling the content box
      contentWrapper.style.color = configData.contentTextColor || '#ebefdf'; //
      contentWrapper.style.backgroundColor = configData.contentBackgroundColor || 'rgba(34, 95, 110, 0.7)'; //
      // Add animation class if configured
      if (heroData.hero.animation?.enabled && heroData.hero.animation.type === 'fade-in') { //
          contentWrapper.classList.add('fade-in'); // Assumes .fade-in is defined in hero.css
      }


      // --- Add hero text elements ---
      const heroContent = heroData.hero; //
      if (heroContent.title) { //
        const title = document.createElement('h1');
        title.textContent = heroContent.title; //
        title.classList.add('hero-title');
        contentWrapper.appendChild(title);
      }
      if (heroContent.subtitle) { //
        const subtitle = document.createElement('h2');
        subtitle.textContent = heroContent.subtitle; //
        subtitle.classList.add('hero-subtitle');
        contentWrapper.appendChild(subtitle);
      }
      if (heroContent.tagline) { //
        const tagline = document.createElement('p');
        tagline.textContent = heroContent.tagline; //
        tagline.classList.add('hero-tagline');
        contentWrapper.appendChild(tagline);
      }
      if (heroContent.ctaText && heroContent.ctaLink) { //
        const cta = document.createElement('a');
        cta.textContent = heroContent.ctaText; //
        cta.href = heroContent.ctaLink; //
        cta.classList.add('hero-cta');
        contentWrapper.appendChild(cta);
      }
      // ----------------------------

      block.appendChild(contentWrapper); // Add the styled wrapper to the grid item

    } else {
      // --- These are background blocks ---
      // Apply a background image, cycling through the available ones
      if (backgrounds.length > 0) {
        const bgIndex = (i - (i > contentBlockIndex ? 1 : 0)) % backgrounds.length; // Cycle through backgrounds
        block.style.backgroundImage = `url('${backgrounds[bgIndex]}')`; //
      } else {
        // Fallback background color if no images are provided
        block.style.backgroundColor = `hsl(${i * 60}, 30%, 80%)`; // Simple fallback
      }
    }

    heroContainer.appendChild(block);
  }

  console.log("Hero section initialized with CSS Grid structure.");
}

// --- Export the main function ---
export { initialize as initHeroBlocks };