let currentPage = 1;
const leaks = [...models1, ...models2, ...models3];
const models = shuffle(leaks);
let filteredModels = shuffle(leaks);

function getSelectedValue() {
  const selectElement = document.getElementById("items-per-page");
  const value = Number(selectElement.value);
  return value;
}

// Initial setting of modelsPerPage
let modelsPerPage = getSelectedValue();

// Add an event listener to handle changes in the dropdown
const selectElement = document.getElementById("items-per-page");
selectElement.addEventListener("change", () => {
  // Update modelsPerPage with the new selected value
  modelsPerPage = getSelectedValue();
  renderModels();
});

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    // Generate a random index between 0 and i
    const j = Math.floor(Math.random() * (i + 1));

    // Swap elements at indices i and j
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

function getRandomItem(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("The input must be a non-empty array.");
  }
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}

document.addEventListener("DOMContentLoaded", () => {
  renderModels();
});

document.getElementById("show-videos").addEventListener("click", function () {
  renderModels(false, true); // Pass a flag to show models with more than 2 videos
});

function renderModels(
  showFavoritesOnly = false,
  showMoreThanTwoVideos = false
) {
  const minVideosCount = 2;
  const modelsContainer = document.getElementById("models-container");
  modelsContainer.innerHTML = "";

  const start = (currentPage - 1) * modelsPerPage;
  const end = start + modelsPerPage;
  let currentModels = filteredModels;
  // Filter models based on the showMoreThanTwoVideos flag
  if (showMoreThanTwoVideos) {
    currentModels = filteredModels.filter(
      (model) => model.videos_count > minVideosCount
    );
  }
  currentModels = currentModels.slice(start, end);

  // If only showing favorites, filter the models
  if (showFavoritesOnly) {
    const favorites = getFavorites();
    currentModels = currentModels.filter((model) =>
      favorites.includes(model.user_name)
    );
  }

  currentModels.forEach((model) => {
    const modelCard = document.createElement("div");
    modelCard.className = "model-card";

    // Check if model is in favorites
    const isFavorite = isModelFavorite(model.user_name);

    // Create the image element
    const imgElement = document.createElement("img");
    imgElement.src = getRandomItem(model.data);
    imgElement.alt = model.full_name;

    // Add an error handler to load another random image if the current one fails
    imgElement.onerror = function () {
      imgElement.src = model.thumbnail_image;
    };

    modelCard.innerHTML = `
        <div class="heart-icon ${
          isFavorite ? "favorite" : ""
        }" data-username="${model.user_name}">&hearts;</div>
        <a href="details.html?model=${encodeURIComponent(
          model.user_name
        )}" target="_blank">
            <h3>${model.full_name}</h3>
        </a>
        <small>
            Images: ${model.images_count}
            ${model.videos_count ? `| Videos: ${model.videos_count}` : ""}
            ${model.about?.Orientation ? `| ${model.about.Orientation}` : ""}
            ${model.profile ? `| <a href=${model.profile}>Profile</a>` : ""}
            <a href="#" class="random-img-btn">
            <img id='reload' src='./imgs/reload.svg' width='25px' height='25px'/>
            </a>
        </small>
    `;

    // Insert the image at the right place in the DOM
    modelCard
      .querySelector("a")
      .insertBefore(imgElement, modelCard.querySelector("h3"));

    modelsContainer.appendChild(modelCard);

    // Add event listener for the "Random" button to change the image
    const randomBtn = modelCard.querySelector(".random-img-btn");
    randomBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const randomImage = getRandomItem(model.data);
      imgElement.src = randomImage;
    });

    imgElement.addEventListener("click", (event) => {
      event.preventDefault();
      const randomImage = getRandomItem(model.data);
      imgElement.src = randomImage;
    });

    setTimeout(() => {
      const randomImage = getRandomItem(model.data);
      imgElement.src = randomImage;
    }, "1000");
  });

  // Attach event listeners to heart icons
  document.querySelectorAll(".heart-icon").forEach((heartIcon) => {
    heartIcon.addEventListener("click", toggleFavorite);
  });

  renderPagination();
}

function toggleFavorite(event) {
  const heartIcon = event.target;
  const userName = heartIcon.dataset.username;

  if (isModelFavorite(userName)) {
    removeFavorite(userName);
    heartIcon.classList.remove("favorite");
  } else {
    addFavorite(userName);
    heartIcon.classList.add("favorite");
  }
}

function isModelFavorite(userName) {
  const favorites = getFavorites();
  return favorites.includes(userName);
}

function addFavorite(userName) {
  const favorites = getFavorites();
  favorites.push(userName);
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function removeFavorite(userName) {
  let favorites = getFavorites();
  favorites = favorites.filter((fav) => fav !== userName);
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

// Function to show only favorite models
function showFavorites() {
  renderModels(true);
}

// Function to show all models
function showAllModels() {
  renderModels(false);
}

// Initial render
renderModels();

// Assuming you have buttons for showing favorites and all models
document
  .getElementById("show-favorites")
  .addEventListener("click", showFavorites);
document.getElementById("show-all").addEventListener("click", showAllModels);

// // Render pagination
// function renderPagination() {
//   const pagination = document.getElementById("pagination");
//   pagination.innerHTML = "";

//   const totalPages = Math.ceil(filteredModels.length / modelsPerPage);

//   for (let i = 1; i <= totalPages; i++) {
//     const button = document.createElement("button");
//     button.innerText = i;
//     if (i === currentPage) {
//       button.style.backgroundColor = "#333";
//       button.style.color = "white";
//     }
//     button.addEventListener("click", () => {
//       currentPage = i;
//       renderModels();
//     });
//     pagination.appendChild(button);
//   }
//   window.scrollTo({
//     top: 0,
//     behavior: "smooth",
//   });
// }

function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(filteredModels.length / modelsPerPage);

  // Hide pagination if total items are less than modelsPerPage
  if (totalPages <= 1) {
    return;
  }

  const range = 1; // Number of pages to show before and after the current page
  const startPages = totalPages > 3 ? 2 : 1; // show the first few pages based on totalPages
  const endPages = totalPages > 3 ? 2 : 1; // show the last few pages based on totalPages

  function createButton(page) {
    const button = document.createElement("button");
    button.innerText = page;
    if (page === currentPage) {
      button.style.backgroundColor = "#333";
      button.style.color = "white";
    }
    button.addEventListener("click", () => {
      currentPage = page;
      renderModels();
    });
    pagination.appendChild(button);
  }

  // Create "Prev" button
  const prevButton = document.createElement("button");
  prevButton.innerText = "Prev";
  if (currentPage > 1) {
    prevButton.addEventListener("click", () => {
      currentPage--;
      renderModels();
    });
  } else {
    prevButton.disabled = true;
  }
  pagination.appendChild(prevButton);

  // Show the first few pages
  for (let i = 1; i <= Math.min(startPages, totalPages); i++) {
    createButton(i);
  }

  // Show "..." before the current page range if necessary
  if (currentPage > startPages + range + 1) {
    const ellipsis = document.createElement("span");
    ellipsis.innerText = "...";
    pagination.appendChild(ellipsis);
  }

  // Show the range around the current page
  const start = Math.max(startPages + 1, currentPage - range);
  const end = Math.min(totalPages - endPages, currentPage + range);

  for (let i = start; i <= end; i++) {
    if (i > startPages && i <= totalPages - endPages) {
      createButton(i);
    }
  }

  // Show "..." after the current page range if necessary
  if (currentPage < totalPages - endPages - range) {
    const ellipsis = document.createElement("span");
    ellipsis.innerText = "...";
    pagination.appendChild(ellipsis);
  }

  // Show the last few pages
  for (
    let i = Math.max(totalPages - endPages + 1, end + 1);
    i <= totalPages;
    i++
  ) {
    createButton(i);
  }

  // Create "Next" button
  const nextButton = document.createElement("button");
  nextButton.innerText = "Next";
  if (currentPage < totalPages) {
    nextButton.addEventListener("click", () => {
      currentPage++;
      renderModels();
    });
  } else {
    nextButton.disabled = true;
  }
  pagination.appendChild(nextButton);

  // Scroll to top when navigating pages
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// Search functionality
document.getElementById("search").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();

  if (!query) {
    renderModels();
    return; // Exit early if query is empty
  }

  // Split the query into individual words
  const queryWords = query.split(/\s+/); // Split by whitespace

  // filteredModels = models.filter((model) => {
  //   // Use optional chaining and nullish coalescing to handle possible null values
  //   return queryWords.every((word) => {
  //     return (
  //       (model.full_name?.toLowerCase() ?? "").includes(word) ||
  //       (model.user_name?.toLowerCase() ?? "").includes(word) ||
  //       (model.description?.toLowerCase() ?? "").includes(word) ||
  //       (model.about?.Age?.toLowerCase() ?? "").includes(word) ||
  //       (model.about?.Nationality?.toLowerCase() ?? "").includes(word) ||
  //       (model.about?.Skin?.toLowerCase() ?? "").includes(word) ||
  //       (model.about?.Hair?.toLowerCase() ?? "").includes(word) ||
  //       (model.about?.Orientation?.toLowerCase() ?? "").includes(word)
  //     );
  //   });
  // });
  filteredModels = models.filter((model) => {
    // Use optional chaining and nullish coalescing to handle possible null values
    return queryWords.every((word) => {
      const lowerCaseWord = word.toLowerCase();
      return (
        (model.full_name?.toLowerCase() ?? "").includes(lowerCaseWord) ||
        (model.user_name?.toLowerCase() ?? "").includes(lowerCaseWord) ||
        (model.description?.toLowerCase() ?? "").includes(lowerCaseWord) ||
        (model.about?.Age?.toLowerCase() ?? "").includes(lowerCaseWord) ||
        (model.about?.Body?.toLowerCase() ?? "").includes(lowerCaseWord) ||
        (model.about?.Birthday?.toLowerCase() ?? "").includes(lowerCaseWord) ||
        (model.about?.Nationality?.toLowerCase() ?? "").includes(
          lowerCaseWord
        ) ||
        (model.about?.Skin?.toLowerCase() ?? "").includes(lowerCaseWord) ||
        (model.about?.Hair?.toLowerCase() ?? "").includes(lowerCaseWord) ||
        (model.about?.Orientation?.toLowerCase() ?? "").includes(
          lowerCaseWord
        ) ||
        (model.tags ?? []).some((tag) =>
          tag.toLowerCase().includes(lowerCaseWord)
        ) // Check tags
      );
    });
  });

  currentPage = 1; // Reset to first page
  renderModels();
});

// Show the button when the user scrolls down 20px from the top
window.onscroll = function () {
  if (
    document.body.scrollTop > 1000 ||
    document.documentElement.scrollTop > 1000
  ) {
    scrollToTopBtn.style.display = "flex";
  } else {
    scrollToTopBtn.style.display = "none";
  }
};

// When the user clicks on the button, scroll to the top of the document
scrollToTopBtn.onclick = function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
