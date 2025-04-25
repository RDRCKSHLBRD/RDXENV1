// public/js/modules/heroBlocks.js
// ----- UPDATED VERSION -----

// --- Removed hardcoded configuration ---
// const heroBlockConfig = { ... }; // This is now fetched

// --- Helper Functions ---
function shuffle(array) {
  // Make sure array is not empty before shuffling
  if (!array || array.length === 0) return [];
  return array.sort(() => Math.random() - 0.5);
}

// --- Modified getRandomBackground function ---
function getRandomBackground(backgrounds) {
  if (!backgrounds || backgrounds.length === 0) {
    // Return a fallback color or empty string if no backgrounds defined
    console.warn("No block backgrounds found in config.");
    return 'background-color: #cccccc;'; // Simple fallback grey
  }
  const shuffledBackgrounds = shuffle([...backgrounds]);
  const selectedBg = shuffledBackgrounds[0];

  // Return CSS string for background image
  // Ensure path is correct (should be relative to public root)
  return `background-image: url('${selectedBg}'); background-size: cover; background-position: center;`;
}

// --- Core Block Generation Logic ---
let generatedBlocks = [];
let currentConfig = null; // To store fetched config

function createHeroTile(container, x, y, width, height) {
  if (!currentConfig) {
      console.error("Configuration not loaded in createHeroTile");
      return; // Cannot create tile without config
  }
  const tile = document.createElement("div");
  tile.style.position = "absolute";
  tile.style.left = `${x}px`;
  tile.style.top = `${y}px`;
  tile.style.width = `${width}px`;
  tile.style.height = `${height}px`;

  // --- Apply random background SVG ---
  const backgroundStyle = getRandomBackground(currentConfig.blockBackgrounds);
  tile.style.cssText += backgroundStyle; // Append background styles
  // -----------------------------------

  tile.style.border = "1px solid rgba(0,0,0,0.1)";
  tile.style.boxSizing = "border-box";
  tile.style.overflow = 'hidden';
  tile.classList.add('hero-block'); // Add class for potential CSS styling

  // Add interactivity listeners if needed (from previous step)
  // tile.addEventListener('mouseover', handleBlockMouseOver);
  // tile.addEventListener('mouseout', handleBlockMouseOut);
  // tile.addEventListener('click', handleBlockClick);

  container.appendChild(tile);
  const blockId = `block-${generatedBlocks.length}`;
  tile.dataset.blockId = blockId;
  generatedBlocks.push({ id: blockId, element: tile, x, y, width, height, area: width * height });
}

function createHeroGrid(container, x, y, width, height, depth = 0) {
    if (!currentConfig) {
      console.error("Configuration not loaded in createHeroGrid");
      return; // Cannot proceed without config
    }
    // Use config values
    const minSize = currentConfig.minSize;
    const maxDepth = currentConfig.maxDepth;
    const ratios = currentConfig.ratios;

    // Base case
    if (width < minSize || height < minSize || depth >= maxDepth) {
      createHeroTile(container, x, y, width, height);
      return;
    }

    // Choose random ratio and split direction
    const ratio = ratios[Math.floor(Math.random() * ratios.length)];
    const splitVertical = Math.random() > 0.5;

    // --- Rest of the createHeroGrid logic remains the same ---
    // (Using minSize and ratios from the fetched currentConfig)
    if (splitVertical && height > minSize * 2) {
      let splitPoint = height * (ratio.y / (ratio.x + ratio.y));
      if (splitPoint < minSize) splitPoint = minSize;
      if (height - splitPoint < minSize) splitPoint = height - minSize;
      if (splitPoint > 0 && height - splitPoint > 0) {
         createHeroGrid(container, x, y, width, splitPoint, depth + 1);
         createHeroGrid(container, x, y + splitPoint, width, height - splitPoint, depth + 1);
      } else { createHeroTile(container, x, y, width, height); }
    } else if (!splitVertical && width > minSize * 2) {
      let splitPoint = width * (ratio.x / (ratio.x + ratio.y));
      if (splitPoint < minSize) splitPoint = minSize;
      if (width - splitPoint < minSize) splitPoint = width - minSize;
      if (splitPoint > 0 && width - splitPoint > 0) {
        createHeroGrid(container, x, y, splitPoint, height, depth + 1);
        createHeroGrid(container, x + splitPoint, y, width - splitPoint, height, depth + 1);
      } else { createHeroTile(container, x, y, width, height); }
    } else {
      if (!splitVertical && height > minSize * 2) {
         let splitPoint = height * (ratio.y / (ratio.x + ratio.y));
         if (splitPoint < minSize) splitPoint = minSize;
         if (height - splitPoint < minSize) splitPoint = height - minSize;
         if (splitPoint > 0 && height - splitPoint > 0) {
             createHeroGrid(container, x, y, width, splitPoint, depth + 1);
             createHeroGrid(container, x, y + splitPoint, width, height - splitPoint, depth + 1);
         } else { createHeroTile(container, x, y, width, height); }
      } else if (splitVertical && width > minSize * 2) {
          let splitPoint = width * (ratio.x / (ratio.x + ratio.y));
          if (splitPoint < minSize) splitPoint = minSize;
          if (width - splitPoint < minSize) splitPoint = width - minSize;
          if (splitPoint > 0 && width - splitPoint > 0) {
            createHeroGrid(container, x, y, splitPoint, height, depth + 1);
            createHeroGrid(container, x + splitPoint, y, width - splitPoint, height, depth + 1);
          } else { createHeroTile(container, x, y, width, height); }
      } else { createHeroTile(container, x, y, width, height); }
    }
}


// --- Initialization and Content Injection ---
// Now fetches config first
async function initialize(heroData) { // Accepts heroData from main.js

  // --- Fetch Configuration ---
  try {
      // Assume fetchData function is available (e.g., globally or imported)
      currentConfig = await fetchData('/api/hero/config');
      if (!currentConfig) {
          throw new Error("Hero configuration could not be fetched.");
      }
      console.log("Hero config loaded:", currentConfig);
  } catch (error) {
      console.error("Failed to load hero configuration:", error);
      // Optional: display an error message or fallback
      return; // Stop initialization if config fails
  }
  // -------------------------

  const heroContainer = document.querySelector(currentConfig.targetSelector);
  if (!heroContainer) {
    console.error('Hero container not found:', currentConfig.targetSelector);
    return;
  }

  heroContainer.innerHTML = '';
  generatedBlocks = []; // Reset blocks array
  heroContainer.style.position = 'relative';
  heroContainer.style.overflow = 'hidden';

  const containerWidth = heroContainer.clientWidth;
  const containerHeight = heroContainer.clientHeight;

   if (containerWidth <= 0 || containerHeight <= 0) {
     console.warn("Hero container has zero dimensions. Cannot generate blocks.");
     return;
   }

  // Generate the grid using fetched config
  createHeroGrid(heroContainer, 0, 0, containerWidth, containerHeight);

  // Inject content (using heroData argument and fetched config)
  try {
    if (heroData && heroData.hero && generatedBlocks.length > 0) {
      generatedBlocks.sort((a, b) => b.area - a.area);
      const largestBlock = generatedBlocks[0];

      if (largestBlock) {
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('hero-block-content');
        contentDiv.style.position = 'relative';
        contentDiv.style.padding = '2rem';
        contentDiv.style.color = currentConfig.contentTextColor; // Use color from config
        contentDiv.style.backgroundColor = currentConfig.contentBackgroundColor; // Use color from config
        contentDiv.style.zIndex = '10';
        contentDiv.style.maxWidth = '90%';
        contentDiv.style.margin = 'auto';
        contentDiv.style.textAlign = 'center';
        contentDiv.style.height = 'auto';

        // Add hero text elements
        if (heroData.hero.title) { /* ... */ }
        if (heroData.hero.subtitle) { /* ... */ }
        if (heroData.hero.tagline) { /* ... */ }
        if (heroData.hero.ctaText && heroData.hero.ctaLink) { /* ... */ }
        // (Keep the DOM element creation logic for h1, h2, p, a here)
        if (heroData.hero.title) {
            const title = document.createElement('h1');
            title.textContent = heroData.hero.title;
            title.style.fontSize = '2.5rem'; title.style.marginBottom = '0.5rem';
            contentDiv.appendChild(title);
        }
        // ... (add subtitle, tagline, cta as before) ...


        largestBlock.element.style.display = 'flex';
        largestBlock.element.style.justifyContent = 'center';
        largestBlock.element.style.alignItems = 'center';
        largestBlock.element.innerHTML = '';
        largestBlock.element.appendChild(contentDiv);
      }
    } else if (!heroData || !heroData.hero) {
        console.warn("Valid heroData was not provided to initHeroBlocks.");
    }
  } catch (error) {
    console.error('Error injecting hero content into blocks:', error);
  }
}

// --- Export the main function ---
export { initialize as initHeroBlocks };

// --- Optional: Export debounce if needed ---
function debounce(func, wait) { /* ... */ }
export { debounce };

// --- IMPORTANT: Ensure fetchData is available ---
// If fetchData is not globally defined (e.g., in utils.js loaded before main.js),
// you might need to import it here or pass it as an argument.
// Example if fetchData is also a module:
// import { fetchData } from '../utils.js'; // Adjust path as needed
// Or define it here if simple:
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Could not fetch data:", url, error);
    return null;
  }
}