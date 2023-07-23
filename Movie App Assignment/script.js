const apiKey = '9e51230a'; 
const moviesListElement = document.getElementById('moviesList');
const paginationElement = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const movieDetailsElement = document.getElementById('movieDetails');

let currentPage = 1;
let totalResults = 0;
let currentMovieId = '';
let moviesData = {}; // Object to store movie data (ratings and comments)


let movieDetailsContainer = document.getElementById("movie-details");

function fetchMovies(page, search = '') {
  const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${search}&page=${page}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      totalResults = parseInt(data.totalResults);
      displayMovies(data.Search);
      displayPagination();
    })

    
    .catch(error => console.error('Error fetching movies:', error));

    
}


function displayMovies(movies) {
  moviesListElement.innerHTML = '';

  if (!movies) {
    // moviesListElement.innerHTML = '<p>Favorite Movies</p>';
    fetchMovies(1,'Avengers');
    return;
  }


  movies.forEach(movie => {
    const movieElement = document.createElement('div');
    movieElement.classList.add('movie');
    movieElement.dataset.movieId = movie.imdbID; // Set data attribute for movie ID
    const movieRating = moviesData[movie.imdbID] ? moviesData[movie.imdbID].rating : null;
    const movieComments = moviesData[movie.imdbID] ? moviesData[movie.imdbID].comments : [];
    movieElement.innerHTML = `
      <img src="${movie.Poster}" alt="${movie.Title}">
      <p>${movie.Title}</p>
      <div class="rating">
        <input type="number" min="0" max="5" step="1" placeholder="Rate" value="${movieRating}">
        <button class="rate-button">Rate</button>
      </div>
      <textarea class="comment" placeholder="Add a comment">${movieComments.join('\n')}</textarea>
      <button class="comment-button">Submit Comment</button>
    `;
    movieElement.addEventListener('click', () => showMovieDetails(movie.imdbID));
    const rateButton = movieElement.querySelector('.rate-button');
    const commentButton = movieElement.querySelector('.comment-button');
    rateButton.addEventListener('click', () => rateMovie(movie.imdbID, movie.Title));
    commentButton.addEventListener('click', () => commentMovie(movie.imdbID, movie.Title));
    moviesListElement.appendChild(movieElement);
  });
}


function displayPagination() {
  const totalPages = Math.ceil(totalResults / 10);
  paginationElement.innerHTML = '';

  if (currentPage > 1) {
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Prev';
    prevButton.addEventListener('click', () => {
      currentPage--;
      fetchMovies(currentPage, searchInput.value);
    });
    paginationElement.appendChild(prevButton);
  }

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    button.addEventListener('click', () => {
      currentPage = i;
      fetchMovies(currentPage, searchInput.value);
    });

    // Add "active" class to the current page button
    if (i === currentPage) {
      button.classList.add('active');
    }

    paginationElement.appendChild(button);
  }

  if (currentPage < totalPages) {
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.addEventListener('click', () => {
      currentPage++;
      fetchMovies(currentPage, searchInput.value);
    });
    paginationElement.appendChild(nextButton);
  }
}


function rateMovie(movieId, movieTitle) {
  const ratingInput = document.querySelector(`[data-movie-id="${movieId}"] .rating input`);
  const rating = parseFloat(ratingInput.value);
  if (rating >= 0 && rating <= 5) {
    if (!moviesData[movieId]) {
      moviesData[movieId] = {
        title: movieTitle,
        rating: rating,
        comments: []
      };
    }
    moviesData[movieId].rating = rating;
    saveDataToLocal();
    alert(`You rated "${movieTitle}" ${rating} stars.`);
  } else {
    alert('Please enter a valid rating between 0 and 5.');
  }
}

function commentMovie(movieId, movieTitle) {
  const commentInput = document.querySelector(`[data-movie-id="${movieId}"] .comment`);
  const comment = commentInput.value;
  if (comment.trim() !== '') {
    if (!moviesData[movieId]) {
      moviesData[movieId] = {
        title: movieTitle,
        rating: null,
        comments: []
      };
    }
    moviesData[movieId].comments.push(comment);
    saveDataToLocal();
    alert(`Comment saved for "${movieTitle}":\n${comment}`);
  } else {
    alert('Please enter a comment.');
  }
}

function showMovieDetails(movieId) {
  const url = `https://www.omdbapi.com/?apikey=${apiKey}&i=${movieId}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const movieDetails = `
        <img src="${data.Poster}" alt="${data.Title}">
        <h2>${data.Title}</h2>
        <p><strong>Year:</strong> ${data.Year}</p>
        <p><strong>Genre:</strong> ${data.Genre}</p>
        <p><strong>Plot:</strong> ${data.Plot}</p>
        <p><strong>Rated:</strong> ${data.Rated}</p>
        <p><strong>Actors:</strong> ${data.Actors}</p>
        <p><strong>Directed By:</strong> ${data.Director}</p>
        <p><strong>imdbRating:</strong> ${data.imdbRating}</p>
        <p><strong>Country:</strong> ${data.Country}</p>
      `;
      movieDetailsElement.innerHTML = movieDetails;
      movieDetailsElement.style.display = 'block';
      currentMovieId = movieId;
    })
    .catch(error => console.error('Error fetching movie details:', error));
}

function saveDataToLocal() {
  localStorage.setItem('moviesData', JSON.stringify(moviesData));
}

function loadDataFromLocal() {
  const data = localStorage.getItem('moviesData');
  if (data) {
    moviesData = JSON.parse(data);
  }
}

window.addEventListener('load', () => {
  fetchMovies(currentPage, searchInput.value);
});

// Event listener for search button
searchButton.addEventListener('click', () => {
  currentPage = 1;
  fetchMovies(currentPage, searchInput.value);
});

// Load movies data from local storage on page load
loadDataFromLocal();
// Fetch initial movies list on page load
fetchMovies(currentPage);
