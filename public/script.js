document.addEventListener("DOMContentLoaded", function () {
    const cookieConsent = document.getElementById('cookie-consent');
    const acceptCookiesBtn = document.getElementById('accept-cookies');
    const autoplayToggle = document.getElementById('autoplay-toggle');
    const movieGrid = document.getElementById("movie-grid");
    const loading = document.getElementById("loading");
    const error = document.getElementById("error");
    const searchInput = document.getElementById("searchInput");
    const settingsButton = document.getElementById('settingsButton');
    const settingsWindow = document.getElementById('settingsWindow');
    let allMovies = [];
    
    // Toggle settings window
    settingsButton.addEventListener('click', () => {
        settingsWindow.classList.toggle('hidden');
    });

    // Close settings window when clicking outside
    document.addEventListener('click', (event) => {
        if (!settingsWindow.contains(event.target) && event.target !== settingsButton) {
            settingsWindow.classList.add('hidden');
        }
    });

    // Load autoplay state from localStorage
    const autoplayState = localStorage.getItem('autoplay') === 'true';
    autoplayToggle.checked = autoplayState;

    // Update autoplay state in localStorage
    autoplayToggle.addEventListener('change', () => {
        localStorage.setItem('autoplay', autoplayToggle.checked);
    });

    if (!localStorage.getItem('cookiesAccepted')) {
        cookieConsent.classList.remove('hidden');
    }

    acceptCookiesBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        localStorage.setItem('autoplay', autoplayToggle.checked);
        cookieConsent.classList.add('hidden');
    });

    // Set initial state of autoplay toggle
    autoplayToggle.checked = localStorage.getItem('autoplay') === 'true';

    autoplayToggle.addEventListener('change', () => {
        if (localStorage.getItem('cookiesAccepted') === 'true') {
            localStorage.setItem('autoplay', autoplayToggle.checked);
        }
    });

    // Display message in the popup
    function displayMessagePopup(message) {
        error.textContent = message;
        if (message.trim() === '') {
            error.classList.add('hidden');
        } else {
            error.classList.remove('hidden');
            setTimeout(() => error.classList.add('hidden'), 3000);
        }
    }

    // Create movie card elements
    function createMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'movie-card';
    
        const title = document.createElement('h2');
        title.textContent = movie.originalTitle.replace(/}/g, ':'); // Replace colon with hyphen
    
        const info = document.createElement('p');
        let infoText = `${movie.year || 'Unknown'} · ${movie.quality || 'Unknown'}`;
    
        if (movie.duration && movie.duration < 10 * 60) {
            infoText += ' · Funny';
        }
    
        info.textContent = infoText;
    
        if (movie.path) {
            const formatText = document.createElement('span');
            formatText.className = 'format-text';
    
            const extension = movie.path.slice(((movie.path.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
            const formats = {
                'mkv': 'MKV',
                'mp4': 'MP4',
                'avi': 'AVI',
                'mov': 'MOV',
                'webm': 'WEBM'
            };
    
            formatText.textContent = formats[extension] || 'Unknown Format';
    
            card.appendChild(formatText);
        }
    
        card.appendChild(title);
        card.appendChild(info);
    
        card.addEventListener('click', () => {
            const formattedTitle = movie.title.replace(/:/g, '-').replace(/\s+/g, '-');
            window.open(`/play/${encodeURIComponent(formattedTitle)}`, '_blank');
        });    
    
        return card;
    }

    // Display movies in the grid
    function displayMovies(movies) {
        movieGrid.innerHTML = '';
        if (movies.length === 0) {
            handleError("No movies found.");
            return;
        }
        error.classList.add('hidden');

        movies.forEach(movie => {
            if (movie.title && movie.path) {
                const card = createMovieCard(movie);
                movieGrid.appendChild(card);
            } else {
                console.warn('Movie object is missing required properties:', movie);
            }
        });

        if (movies.length === 1) {
            const singleCard = movieGrid.firstChild;
            singleCard.classList.add('single-card-hover');
            error.classList.remove('hidden');
        }
    }

    // Handle error messages
    function handleError(message) {
        error.textContent = message.trim() === '' ? '' : message;
        if (message.trim() === '') {
            error.classList.add('hidden');
        } else {
            error.classList.remove('hidden');
            setTimeout(() => {
                error.classList.add('hidden');
                error.textContent = '';
            }, 3000);
        }
    }

    // Fetch movies from the API
    const apiBaseUrl = '/api';
    fetch(`${apiBaseUrl}/movies`)
        .then(response => response.json())
        .then(data => {
            loading.style.display = 'none';
            if (!Array.isArray(data) || data.length === 0) {
                return handleError("No movies found.");
            }
            allMovies = data;
            displayMovies(allMovies);
            error.classList.add('hidden');
        })
        .catch(err => {
            if (err.message.includes("Failed to fetch")) {
                handleError("Server isn't running");

                const additionalMessage1 = document.createElement('p');
                additionalMessage1.innerHTML = "Run it Clyd boi <span class=\"spin\">😈</span>";
                error.appendChild(additionalMessage1);

                const additionalMessage2 = document.createElement('p');
                additionalMessage2.className = 'message';
                additionalMessage2.innerHTML = "(won't access movies without server running)";
                error.appendChild(additionalMessage2);
            } else {
                handleError("Failed to load movies.");
            }
            console.error('Error fetching movies:', err);
        });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.replace(/\s+/g, '').toLowerCase();
        const filteredMovies = allMovies.filter(movie => 
            movie.title.replace(/\s+/g, '').toLowerCase().includes(searchTerm)
        );
        displayMovies(filteredMovies);

        if (filteredMovies.length !== 1) {
            const cards = movieGrid.querySelectorAll('.movie-card');
            cards.forEach(card => card.classList.remove('single-card-hover'));
        }
    });

    // Handle 404 status in URL
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');

    if (status === '404') {
        error.textContent = 'Movie not found (404)';
        error.classList.remove('hidden');
        error.style.opacity = 1;

        setTimeout(() => {
            error.style.opacity = 0;
        }, 3000);

        setTimeout(() => {
            error.classList.add('hidden');
            error.textContent = '';
        }, 4500);
    }
});