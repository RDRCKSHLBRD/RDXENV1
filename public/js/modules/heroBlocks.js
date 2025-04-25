// public/js/modules/heroBlocks.js
// ----- REFACTORED VERSION for Percentage-Based Scaling -----

// --- Module-level variables to store initial container dimensions ---
let initialContainerWidth = 0;
let initialContainerHeight = 0;
// -----------------------------------------------------------------

// --- Module-level variables for script state ---
let generatedBlocks = [];
let currentConfig = null; // To store fetched config
// -----------------------------------------------------------------

// --- Helper Functions ---

function shuffle(array) {
  // Make sure array is not empty before shuffling
  if (!array || array.length === 0) return [];
  // Fisher-Yates (Knuth) Shuffle for better randomness
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// --- Helper function to calculate percentage ---
function calculatePercentage(value, total) {
  // Avoid division by zero
  return total > 0 ? (value / total) * 100 : 0;
}
// ---------------------------------------------

function getRandomBackground(backgrounds) {
  if (!backgrounds || backgrounds.length === 0) {
    console.warn("No block backgrounds found in config.");
    // Return an object indicating fallback, easier to handle
    return { fallback: true, style: 'background-color: #cccccc;' };
  }
  const shuffledBackgrounds = shuffle([...backgrounds]);
  const selectedBgUrl = shuffledBackgrounds[0];

  // Return an object with the URL for easier application
  return {
      url: selectedBgUrl,
      style: `background-image: url('${selectedBgUrl}'); background-size: cover; background-position: center;`
  };
}

// --- Core Block Generation Logic ---

// --- REFACTORED createHeroTile function ---
function createHeroTile(container, x, y, width, height) {
  // x, y, width, height arguments are the calculated pixel values
  // relative to the initial container dimensions captured in initialize().

  if (!currentConfig) {
    console.error("Configuration not loaded in createHeroTile");
    return; // Cannot create tile without config
  }
  // Ensure initial dimensions are valid before proceeding
  if (initialContainerWidth <= 0 || initialContainerHeight <= 0) {
    console.error("Initial container dimensions are invalid in createHeroTile.");
    return;
  }

  const tile = document.createElement("div");
  tile.style.position = "absolute";
  tile.style.boxSizing = "border-box"; // Set box-sizing first
  tile.style.overflow = 'hidden';
  tile.classList.add('hero-block'); // Add class for potential CSS styling

  // --- Apply position and size using percentages ---
  tile.style.left = `${calculatePercentage(x, initialContainerWidth)}%`;
  tile.style.top = `${calculatePercentage(y, initialContainerHeight)}%`;
  tile.style.width = `${calculatePercentage(width, initialContainerWidth)}%`;
  tile.style.height = `${calculatePercentage(height, initialContainerHeight)}%`;
  // -------------------------------------------------

  // --- Apply random background SVG ---
  const backgroundResult = getRandomBackground(currentConfig.blockBackgrounds);

  if (backgroundResult && !backgroundResult.fallback && backgroundResult.url) {
    tile.style.backgroundImage = `url('${backgroundResult.url}')`;
    tile.style.backgroundSize = 'cover';
    tile.style.backgroundPosition = 'center';
  } else {
    // Apply fallback style directly
    tile.style.cssText += backgroundResult.style || 'background-color: #cccccc;';
  }
  // -----------------------------------

  // Apply border (optional, consider CSS class instead)
  tile.style.border = "1px solid rgba(0,0,0,0.1)";

  // Add interactivity listeners if needed
  // tile.addEventListener('mouseover', handleBlockMouseOver);
  // tile.addEventListener('mouseout', handleBlockMouseOut);
  // tile.addEventListener('click', handleBlockClick);

  container.appendChild(tile);
  const blockId = `block-${generatedBlocks.length}`;
  tile.dataset.blockId = blockId;

  // Store original pixel values for area calculation or other logic if needed
  generatedBlocks.push({
    id: blockId,
    element: tile, // The DOM element which will scale
    x: x,         // Original pixel offset X
    y: y,         // Original pixel offset Y
    width: width, // Original pixel width
    height: height,// Original pixel height
    area: width * height // Area based on original pixels for sorting
  });
}

// --- createHeroGrid function (no changes needed to its core logic) ---
// It continues to calculate splits based on the pixel dimensions passed to it,
// representing the layout based on the initial container size.
// The conversion to percentages happens inside createHeroTile.
function createHeroGrid(container, x, y, width, height, depth = 0) {
    if (!currentConfig) {
      console.error("Configuration not loaded in createHeroGrid");
      return; // Cannot proceed without config
    }
    // Use config values
    const minSize = currentConfig.minSize || 50; // Add default fallback
    const maxDepth = currentConfig.maxDepth || 4;  // Add default fallback
    const ratios = currentConfig.ratios || [{ x: 1, y: 1 }]; // Add default fallback

    // Base case: Stop splitting if area is too small or depth limit reached
    // Using area check might be slightly more robust than separate width/height checks
    if ((width * height < minSize * minSize && depth > 0) || width < minSize || height < minSize || depth >= maxDepth) {
      // Ensure minimum dimensions before creating tile if needed, though percentage scaling helps
      if (width > 0 && height > 0) {
          createHeroTile(container, x, y, width, height);
      } else {
          console.warn(`Skipping tile creation due to zero dimension: W=${width}, H=${height}`);
      }
      return;
    }


    // Choose random ratio and split direction
    const ratio = ratios[Math.floor(Math.random() * ratios.length)];
    const splitVertical = Math.random() > 0.5; // Prefer vertical split? Tweak if needed (e.g., > 0.5)

    let splitSuccess = false;

    // Attempt to split based on direction preference
    if (splitVertical && height >= minSize * 2) {
      let splitPoint = height * (ratio.y / (ratio.x + ratio.y));
      // Ensure split points respect minSize
      splitPoint = Math.max(minSize, Math.min(splitPoint, height - minSize));

      if (splitPoint > 0 && height - splitPoint >= minSize) {
         createHeroGrid(container, x, y, width, splitPoint, depth + 1);
         createHeroGrid(container, x, y + splitPoint, width, height - splitPoint, depth + 1);
         splitSuccess = true;
      }
    } else if (!splitVertical && width >= minSize * 2) {
      let splitPoint = width * (ratio.x / (ratio.x + ratio.y));
      // Ensure split points respect minSize
      splitPoint = Math.max(minSize, Math.min(splitPoint, width - minSize));

      if (splitPoint > 0 && width - splitPoint >= minSize) {
        createHeroGrid(container, x, y, splitPoint, height, depth + 1);
        createHeroGrid(container, x + splitPoint, y, width - splitPoint, height, depth + 1);
        splitSuccess = true;
      }
    }

    // If preferred split direction failed (due to minSize constraints), try the other direction
    if (!splitSuccess) {
        if (!splitVertical && height >= minSize * 2) { // Try vertical if horizontal failed
            let splitPoint = height * (ratio.y / (ratio.x + ratio.y));
            splitPoint = Math.max(minSize, Math.min(splitPoint, height - minSize));

            if (splitPoint > 0 && height - splitPoint >= minSize) {
                 createHeroGrid(container, x, y, width, splitPoint, depth + 1);
                 createHeroGrid(container, x, y + splitPoint, width, height - splitPoint, depth + 1);
                 splitSuccess = true;
            }
        } else if (splitVertical && width >= minSize * 2) { // Try horizontal if vertical failed
            let splitPoint = width * (ratio.x / (ratio.x + ratio.y));
            splitPoint = Math.max(minSize, Math.min(splitPoint, width - minSize));

            if (splitPoint > 0 && width - splitPoint >= minSize) {
                createHeroGrid(container, x, y, splitPoint, height, depth + 1);
                createHeroGrid(container, x + splitPoint, y, width - splitPoint, height, depth + 1);
                splitSuccess = true;
            }
        }
    }

    // If no split was possible (due to minSize constraints in both directions), create the tile
    if (!splitSuccess) {
        if (width > 0 && height > 0) {
           createHeroTile(container, x, y, width, height);
        } else {
            console.warn(`Skipping final tile creation due to zero dimension: W=${width}, H=${height}`);
        }
    }
}


// --- REFACTORED Initialization and Content Injection ---
async function initialize(heroData) { // Accepts heroData from main.js

  // --- Fetch Configuration ---
  try {
    // Use the fetchData function defined later in this file
    currentConfig = await fetchData('/api/hero/config');
    if (!currentConfig) {
        throw new Error("Hero configuration could not be fetched or was empty.");
    }
    console.log("Hero config loaded:", currentConfig);
  } catch (error) {
    console.error("Failed to load hero configuration:", error);
    // Optional: display an error message or fallback to default config?
    // For now, stop initialization if config fails
    return;
  }
  // -------------------------

  const heroContainer = document.querySelector(currentConfig.targetSelector || '#hero-section'); // Add fallback selector
  if (!heroContainer) {
    console.error('Hero container not found:', currentConfig.targetSelector || '#hero-section');
    return;
  }

  // --- Clear container and reset state ---
  heroContainer.innerHTML = '';
  generatedBlocks = []; // Reset blocks array
  heroContainer.style.position = 'relative'; // Essential for absolute children
  heroContainer.style.overflow = 'hidden'; // Prevent internal overflow issues
  // --------------------------------------

  // ---> CAPTURE INITIAL DIMENSIONS HERE <---
  initialContainerWidth = heroContainer.clientWidth;
  initialContainerHeight = heroContainer.clientHeight;
  // ----------------------------------------

   // Check if dimensions are valid
   if (initialContainerWidth <= 0 || initialContainerHeight <= 0) {
     // Attempt to get dimensions from CSS if clientWidth/Height fail (e.g., if hidden initially)
     const styles = window.getComputedStyle(heroContainer);
     // Try parsing width/height, removing 'px'
     initialContainerWidth = parseFloat(styles.width) || 0;
     initialContainerHeight = parseFloat(styles.height) || 0;

     if (initialContainerWidth <= 0 || initialContainerHeight <= 0) {
         console.warn("Hero container has zero or invalid dimensions even after checking CSS. Cannot generate blocks accurately. Check CSS for #hero-section size.");
         // You might want to set a default size or return
         return; // Stop generation if dimensions are invalid
     } else {
         console.log("Used computed dimensions:", initialContainerWidth, initialContainerHeight);
     }
   }

  // --- Generate the grid using initial pixel dimensions for calculation logic ---
  // The createHeroTile function internally converts these to percentages for styling.
  createHeroGrid(heroContainer, 0, 0, initialContainerWidth, initialContainerHeight);
  // --------------------------------------------------------------------------

  // --- Inject content (using heroData argument and fetched config) ---
  try {
    // Ensure data exists and blocks were generated
    if (heroData && heroData.hero && generatedBlocks.length > 0) {
      // Sort blocks by area based on original pixel calculation to find largest
      generatedBlocks.sort((a, b) => b.area - a.area);
      const largestBlock = generatedBlocks[0];

      if (largestBlock && largestBlock.element) {
        // Create the content container div
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('hero-block-content'); // Use class for styling from hero.css if possible
        contentDiv.style.position = 'relative'; // Relative to allow z-index if needed
        contentDiv.style.zIndex = '10';         // Ensure content is above background
        contentDiv.style.padding = 'clamp(1rem, 5vmin, 2rem)'; // Responsive padding
        contentDiv.style.color = currentConfig.contentTextColor || '#ebefdf';
        contentDiv.style.backgroundColor = currentConfig.contentBackgroundColor || 'rgba(34, 95, 110, 0.7)';
        contentDiv.style.maxWidth = '90%';      // Limit width within the block
        contentDiv.style.margin = 'auto';       // Center horizontally
        contentDiv.style.textAlign = 'center';
        // Remove fixed height, let content determine height
        // Add some rounding/effects potentially
        contentDiv.style.borderRadius = '4px';
        contentDiv.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';

        // --- Add hero text elements ---
        // Use optional chaining (?) for safer access to nested properties
        if (heroData.hero?.title) {
            const title = document.createElement('h1');
            title.textContent = heroData.hero.title;
            // Use clamp for responsive font size
            title.style.fontSize = 'clamp(1.8rem, 5vmin, 3rem)';
            title.style.marginBottom = '0.5rem';
            title.style.fontWeight = '400'; // Example weight
            title.style.lineHeight = '1.2';
             title.style.letterSpacing = '1px';
            contentDiv.appendChild(title);
        }
        if (heroData.hero?.subtitle) {
            const subtitle = document.createElement('h2');
            subtitle.textContent = heroData.hero.subtitle;
            subtitle.style.fontSize = 'clamp(1.2rem, 3.5vmin, 1.8rem)';
            subtitle.style.marginBottom = '1rem';
            subtitle.style.fontWeight = '300';
            contentDiv.appendChild(subtitle);
        }
         if (heroData.hero?.tagline) {
            const tagline = document.createElement('p');
            tagline.textContent = heroData.hero.tagline;
            tagline.style.fontSize = 'clamp(1rem, 3vmin, 1.2rem)';
            tagline.style.marginBottom = '1.5rem';
            tagline.style.fontWeight = '300';
            tagline.style.color = '#a0c0c0'; // Example secondary color
            contentDiv.appendChild(tagline);
        }
        if (heroData.hero?.ctaText && heroData.hero?.ctaLink) {
            const cta = document.createElement('a');
            cta.textContent = heroData.hero.ctaText;
            cta.href = heroData.hero.ctaLink;
            cta.classList.add('hero-cta'); // Use class from hero.css
            // Add inline styles only if overriding or not in CSS
            // cta.style.display = 'inline-block';
            // cta.style.padding = '0.8rem 1.5rem';
            // ... etc
            contentDiv.appendChild(cta);
        }
        // ----------------------------

        // Style the block containing the content
        largestBlock.element.style.display = 'flex';
        largestBlock.element.style.justifyContent = 'center';
        largestBlock.element.style.alignItems = 'center';
        largestBlock.element.style.padding = '5%'; // Add some padding inside the largest block itself
        largestBlock.element.innerHTML = ''; // Clear potential previous content/styles
        largestBlock.element.appendChild(contentDiv);

        // Optional: Add animation class if configured and defined in CSS
         if (heroData.hero?.animation?.enabled && heroData.hero.animation.type === 'fade-in') {
            contentDiv.classList.add('fade-in'); // Assumes .fade-in is defined in hero.css
         }

      } else {
          console.warn("Largest block or its element not found for content injection.");
      }
    } else if (!heroData?.hero) {
        console.warn("Hero data (heroData.hero) was not provided or invalid.");
    } else if (generatedBlocks.length === 0) {
         console.warn("No blocks were generated, cannot inject content.");
    }
  } catch (error) {
    console.error('Error injecting hero content into blocks:', error);
  }
}
// --------------------------------------------------------------

// --- Export the main function ---
export { initialize as initHeroBlocks };
// --------------------------------

// --- Optional: Export debounce if needed ---
// Basic debounce implementation
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
export { debounce }; // Export if needed elsewhere, e.g., for resize handling
// ------------------------------------------

// --- FetchData function (kept internal to this module) ---
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      // Throw detailed error
      throw new Error(`HTTP error fetching ${url}! Status: ${response.status} ${response.statusText}`);
    }
    // Check content type before parsing JSON
     const contentType = response.headers.get("content-type");
     if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
     } else {
        // Handle non-JSON responses if necessary, or throw error
         console.warn(`Received non-JSON response from ${url}`);
         // Return raw text or handle differently?
         // For now, return null as config expects JSON
         throw new Error(`Expected JSON response from ${url}, received ${contentType}`);
     }
  } catch (error) {
    console.error("Could not fetch data:", error); // Log the detailed error
    return null; // Return null to indicate failure
  }
}
// -------------------------------------------------------