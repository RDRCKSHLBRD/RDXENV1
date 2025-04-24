// public/js/filmography.js
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize the filmography page
  await initFilmographyPage();
});

/**
 * Initialize the filmography page
 */
async function initFilmographyPage() {
  try {
    // Load filmography data
    const filmsData = await RDXENV.API.getFilms();
    const copyData = await RDXENV.API.getCopy();
    
    if (!filmsData || !copyData) {
      console.error('Failed to load filmography data');
      return;
    }
    
    // Render page title and description
    renderFilmographyHeader(copyData.filmography);
    
    // Render films grid
    renderFilmographyGrid(filmsData.filmography);
    
  } catch (error) {
    console.error('Error initializing filmography page:', error);
  }
}

/**
 * Render the filmography page header
 * @param {Object} headerData - Header data from copy.json
 */
function renderFilmographyHeader(headerData) {
  const headerElement = document.querySelector('header h1');
  const descriptionElement = document.querySelector('#filmography h2');
  
  if (headerElement) {
    headerElement.textContent = headerData.title;
  }
  
  if (descriptionElement) {
    descriptionElement.textContent = headerData.subtitle;
    
    // Add description paragraph if it doesn't exist
    const descPara = document.querySelector('#filmography .description');
    if (!descPara && headerData.description) {
      const descriptionPara = document.createElement('p');
      descriptionPara.className = 'description';
      descriptionPara.textContent = headerData.description;
      descriptionElement.after(descriptionPara);
    }
  }
}

/**
 * Render the filmography grid
 * @param {Array} films - Array of film data
 */
function renderFilmographyGrid(films) {
  const filmContainer = document.querySelector('.film-container');
  if (!filmContainer) return;
  
  // Clear existing content
  filmContainer.innerHTML = '';
  
  // Sort films by year (newest first)
  const sortedFilms = [...films].sort((a, b) => parseInt(b.year) - parseInt(a.year));
  
  // Add each film to the grid
  sortedFilms.forEach(film => {
    const filmElement = document.createElement('div');
    filmElement.className = 'film';
    filmElement.setAttribute('data-id', film.id);
    filmElement.setAttribute('data-client', film.client);
    
    filmElement.innerHTML = `
      <div class="film-thumbnail">
        <img src="${film.thumbnailUrl}" alt="${film.title}">
      </div>
      <div class="film-details">
        <h3>${film.title} <span class="film-year">(${film.year})</span></h3>
        <div class="film-client">Client: ${film.client}</div>
        <div class="film-duration">Duration: ${film.duration}</div>
        <p class="film-description">${film.description}</p>
        <div class="film-tags">
          ${film.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        ${film.videoUrl ? `<a href="${film.videoUrl}" class="watch-btn" target="_blank">Watch Film</a>` : ''}
      </div>
    `;
    
    filmContainer.appendChild(filmElement);
  });
  
  // Add filter functionality
  addFilmFilters(sortedFilms);
}

/**
 * Add filtering functionality to the filmography page
 * @param {Array} films - Array of film data
 */
function addFilmFilters(films) {
  // Extract unique clients and tags
  const clients = [...new Set(films.map(film => film.client))];
  const allTags = films.reduce((tags, film) => [...tags, ...film.tags], []);
  const uniqueTags = [...new Set(allTags)];
  
  // Create filter container if it doesn't exist
  let filterContainer = document.querySelector('.film-filters');
  if (!filterContainer) {
    filterContainer = document.createElement('div');
    filterContainer.className = 'film-filters';
    
    const filmsSection = document.querySelector('#filmography');
    const filmContainer = document.querySelector('.film-container');
    
    if (filmsSection && filmContainer) {
      filmsSection.insertBefore(filterContainer, filmContainer);
    }
  }
  
  // Create filter controls
  filterContainer.innerHTML = `
    <div class="filter-group">
      <label for="client-filter">Filter by Client:</label>
      <select id="client-filter">
        <option value="all">All Clients</option>
        ${clients.map(client => `<option value="${client}">${client}</option>`).join('')}
      </select>
    </div>
    
    <div class="filter-group">
      <label for="tag-filter">Filter by Tag:</label>
      <select id="tag-filter">
        <option value="all">All Tags</option>
        ${uniqueTags.map(tag => `<option value="${tag}">${tag}</option>`).join('')}
      </select>
    </div>
    
    <button id="reset-filters">Reset Filters</button>
  `;
  
  // Add event listeners for filters
  const clientFilter = document.getElementById('client-filter');
  const tagFilter = document.getElementById('tag-filter');
  const resetButton = document.getElementById('reset-filters');
  
  if (clientFilter && tagFilter && resetButton) {
    // Client filter change
    clientFilter.addEventListener('change', applyFilters);
    
    // Tag filter change
    tagFilter.addEventListener('change', applyFilters);
    
    // Reset button click
    resetButton.addEventListener('click', () => {
      clientFilter.value = 'all';
      tagFilter.value = 'all';
      applyFilters();
    });
  }
  
  /**
   * Apply selected filters to the film grid
   */
  function applyFilters() {
    const selectedClient = clientFilter.value;
    const selectedTag = tagFilter.value;
    
    const filmElements = document.querySelectorAll('.film');
    
    filmElements.forEach(filmEl => {
      const filmId = filmEl.getAttribute('data-id');
      const filmData = films.find(f => f.id === filmId);
      
      if (!filmData) return;
      
      const matchesClient = selectedClient === 'all' || filmData.client === selectedClient;
      const matchesTag = selectedTag === 'all' || filmData.tags.includes(selectedTag);
      
      if (matchesClient && matchesTag) {
        filmEl.style.display = 'block';
      } else {
        filmEl.style.display = 'none';
      }
    });
  }
}