function renderModelImages(showFavoritesOnly = false) {
  const urlParams = new URLSearchParams(window.location.search);
  const userName = urlParams.get("model");
  const leaks = [...models1, ...models2, ...models3];
  const model = leaks.find((m) => m.user_name === userName);

  if (model) {
    // Update model name
    const modelName = document.getElementById("model-name");
    modelName.innerText = model.full_name;

    // Update model description
    const modelDescription = document.getElementById("model-description");
    let profile = "";
    if (model.profile) {
      profile = `<a class='profile' target='_blank' href="${model.profile}">Profile</a>`;
    }
    modelDescription.innerHTML = `${model.description ?? ""} ${profile ?? ""}`;

    // Update model about section
    const modelAbout = document.getElementById("model-about");
    modelAbout.className = "grid-container";

    const aboutInfo = [];
    if (model.about?.Age)
      aboutInfo.push(`<div><strong>Age:</strong> ${model.about.Age}</div>`);
    if (model.about?.Nationality)
      aboutInfo.push(
        `<div><strong>Nationality:</strong> ${model.about.Nationality}</div>`
      );
    if (model.about?.Birthday)
      aboutInfo.push(
        `<div><strong>Birthday:</strong> ${model.about.Birthday}</div>`
      );
    if (model.about?.Body)
      aboutInfo.push(`<div><strong>Body:</strong> ${model.about.Body}</div>`);
    if (model.about?.Height)
      aboutInfo.push(
        `<div><strong>Height:</strong> ${model.about.Height}</div>`
      );
    if (model.about?.Skin)
      aboutInfo.push(
        `<div><strong>Skin Color:</strong> ${model.about.Skin}</div>`
      );
    if (model.about?.Hair)
      aboutInfo.push(
        `<div><strong>Hair Color:</strong> ${model.about.Hair}</div>`
      );
    if (model.about?.Orientation)
      aboutInfo.push(
        `<div><strong>Orientation:</strong> ${model.about.Orientation}</div>`
      );
    if (model.images_count)
      aboutInfo.push(
        `<div><strong>Images Count:</strong> ${model.images_count}</div>`
      );
    if (model.videos_count)
      aboutInfo.push(
        `<div><strong>Videos Count:</strong> ${model.videos_count}</div>`
      );
    if (model.tags && model.tags.length > 1)
      aboutInfo.push(`<div><strong>Tags:</strong> ${model.tags}</div>`);

    modelAbout.innerHTML = aboutInfo.length > 0 ? aboutInfo.join("") : "";

    // Update images container
    const imagesContainer = document.getElementById("images-container");
    imagesContainer.innerHTML = "";

    // Filter images if only favorites should be shown
    const imagesToDisplay = showFavoritesOnly
      ? getFavoriteImages(model.user_name)
      : model.data;

    imagesToDisplay.forEach((imageUrl) => {
      const imageCard = document.createElement("div");
      imageCard.className = "image-card";

      // Create image element
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = "Model Image";

      // Check if the image is a favorite
      const isFavorite = isImageFavorite(model.user_name, imageUrl);

      // Create heart icon
      const heartIcon = document.createElement("div");
      heartIcon.className = `heart-icon ${isFavorite ? "favorite" : ""}`;
      heartIcon.innerHTML = "&hearts;";
      heartIcon.addEventListener("click", () =>
        toggleFavoriteImage(model.user_name, imageUrl, heartIcon)
      );

      // imageCard.appendChild(heartIcon);
      imageCard.appendChild(img);

      img.onload = () => {
        imageCard.appendChild(img);
        imageCard.appendChild(heartIcon);
      };

      // img.onerror = async () => {
      //   const videoUrl = imageUrl
      //     .replace("images", "videos")
      //     .replace(".jpg", ".mp4");
      //   const response = await fetch(videoUrl, { method: "HEAD" });
      //   const contentLength = response.headers.get("Content-Length");
      //   if (response.ok && parseInt(contentLength) !== 0) {
      //     imageCard.innerHTML = `
      //     <div class="heart-icon ${
      //       isFavorite ? "favorite" : ""
      //     }" data-url="${imageUrl}">&hearts;</div>
      //     <video controls width="100%" height="auto">
      //       <source src="${videoUrl}" type="video/mp4">
      //       Your browser does not support the video tag.
      //     </video>
      //   `;
      //   } else {
      //     imageCard.innerHTML = `
      //     <div class="fallback-message">
      //       <p>Video failed to load. Please try again later.</p>
      //     </div>
      //   `;
      //   }
      // };
      img.onerror = async () => {
        const videoUrl = imageUrl
          .replace("images", "videos")
          .replace(".jpg", ".mp4");

        // Create a temporary video element to check the duration
        const videoElement = document.createElement("video");
        videoElement.src = videoUrl;

        // Add event listeners to handle video loading and errors
        videoElement.addEventListener("loadedmetadata", () => {
          // Once metadata is loaded, check the video duration
          const duration = videoElement.duration;

          if (duration > 0) {
            // Video is valid, update the image card to display the video
            imageCard.innerHTML = `
              <div class="heart-icon ${
                isFavorite ? "favorite" : ""
              }" data-url="${imageUrl}">&hearts;</div>
              <video controls width="100%" height="auto">
                <source src="${videoUrl}" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            `;
          }
          // else {
          //   // Video is invalid, display a fallback message
          //   imageCard.innerHTML = `
          //     <div class="fallback-message">
          //       <p>Video failed to load. Please try again later.</p>
          //     </div>
          //   `;
          //   imageCard.classList.add("hidden");
          // }
        });

        videoElement.addEventListener("error", () => {
          imageCard.classList.add("hidden");
        });
      };

      imagesContainer.appendChild(imageCard);

      imageCard.addEventListener("click", (event) => {
        const clickedElement = event.target;
        const tagName = clickedElement.tagName.toLowerCase();
        if (tagName === "img") {
          openModal(clickedElement.src);
        } else if (tagName === "video") {
          enterFullscreenVideo(clickedElement);
        }
      });
    });
  } else {
    console.error("Model not found.");
  }
}

// Button click to show only videos
document.getElementById("showVideosBtn").onclick = function () {
  // Get all image-card elements
  const imageCards = document.querySelectorAll("div.image-card");

  // Loop through each image-card
  imageCards.forEach((card) => {
    const imgElement = card.querySelector("img");
    const videoElement = card.querySelector("video");

    // Show only cards that contain a video element
    if (videoElement) {
      card.style.display = "block";
      videoElement.style.margin = "auto"; // Center video horizontally if needed
    } else if (imgElement) {
      card.style.display = "none"; // Hide cards that contain an img element
    }
  });
};

function toggleFavoriteImage(userName, imageUrl, heartIcon) {
  if (isImageFavorite(userName, imageUrl)) {
    removeFavoriteImage(userName, imageUrl);
    heartIcon.classList.remove("favorite");
  } else {
    addFavoriteImage(userName, imageUrl);
    heartIcon.classList.add("favorite");
  }
}

function isImageFavorite(userName, imageUrl) {
  const favorites = getFavoriteImages(userName);
  return favorites.includes(imageUrl);
}

function addFavoriteImage(userName, imageUrl) {
  const favorites = getFavoriteImages(userName);
  favorites.push(imageUrl);
  saveFavoriteImages(userName, favorites);
}

function removeFavoriteImage(userName, imageUrl) {
  let favorites = getFavoriteImages(userName);
  favorites = favorites.filter((url) => url !== imageUrl);
  saveFavoriteImages(userName, favorites);
}

function getFavoriteImages(userName) {
  const allFavorites = JSON.parse(localStorage.getItem("favoriteImages")) || {};
  return allFavorites[userName] || [];
}

function saveFavoriteImages(userName, images) {
  const allFavorites = JSON.parse(localStorage.getItem("favoriteImages")) || {};
  allFavorites[userName] = images;
  localStorage.setItem("favoriteImages", JSON.stringify(allFavorites));
}

// Function to show only favorite images
function showFavoriteImages() {
  renderModelImages(true);
}

// Function to show all images
function showAllImages() {
  renderModelImages(false);
}

// Initial render
document.addEventListener("DOMContentLoaded", () => {
  renderModelImages();

  // Event listeners for showing all/favorite images
  const showFavBut = document.getElementById("show-favorites");
  showFavBut.addEventListener("click", showFavoriteImages);
  document.getElementById("show-all").addEventListener("click", showAllImages);
});

// Modal functionality
// function openModal(imageUrl) {
//   const modal = document.getElementById("modal");
//   const modalImage = document.getElementById("modal-image");
//   modalImage.src = imageUrl;
//   modal.style.display = "block";
// }

// let currentScale = 1; // Initial scale factor

// function openModal(imageUrl) {
//   const modal = document.getElementById("modal");
//   const modalImage = document.getElementById("modal-image");
//   modalImage.src = imageUrl;
//   modal.style.display = "block";

//   // Reset scale when opening the modal
//   currentScale = 1;
// modalImage.style.transform = `scale(${currentScale})`;

// // Add event listener to enable zooming with mouse wheel
// modalImage.addEventListener("wheel", (event) => {
//   // Prevent default scrolling behavior
//   event.preventDefault();

//   // Calculate the zoom factor
//   const zoomFactor = 0.1;
//   const delta = event.deltaY > 0 ? -zoomFactor : zoomFactor;

//   // Update the scale factor and apply transformation
//   currentScale += delta;
//   currentScale = Math.max(currentScale, 0.1); // Prevent scaling to negative values or zero

//   // Apply the scale transform
//   modalImage.style.transform = `scale(${currentScale})`;
//   });
// }
// document.getElementById("close").addEventListener("click", () => {
//   document.getElementById("modal").style.display = "none";
// });

// let scale = 1;
// let x = 0;
// let y = 0;

// function openModal(imageUrl) {
//   const modal = document.getElementById("modal");
//   const modalImage = document.getElementById("modal-image");
//   modalImage.src = imageUrl;
//   modal.style.display = "block";

//   // Reset transformations
//   scale = 1;
//   x = 0;
//   y = 0;
//   modalImage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;

//   // Function to recenter the image
//   function recenterImage() {
//     const modalRect = modal.getBoundingClientRect();
//     const imageRect = modalImage.getBoundingClientRect();

//     // Calculate new x and y to center the image
//     const imageWidth = imageRect.width;
//     const imageHeight = imageRect.height;

//     x = (modalRect.width - imageWidth) / 2;
//     y = (modalRect.height - imageHeight) / 2;

//     modalImage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
//   }

//   // Initialize Interact.js for dragging and scaling
//   interact(modalImage)
//     .draggable({
//       listeners: {
//         move(event) {
//           x += event.dx;
//           y += event.dy;
//           modalImage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
//         },
//       },
//     })
//     .gesturable({
//       listeners: {
//         move(event) {
//           scale *= event.scale;
//           scale = Math.max(scale, 0.1); // Prevent scaling to negative values or zero
//           modalImage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
//         },
//       },
//     });

//   // Add event listener to enable zooming with mouse wheel
//   modalImage.addEventListener("wheel", (event) => {
//     event.preventDefault();

//     const zoomFactor = 0.2;
//     const delta = event.deltaY > 0 ? -zoomFactor : zoomFactor;

//     scale += delta;
//     scale = Math.max(scale, 1);

//     // Recenter if scale is 1
//     if (scale === 1) {
//       recenterImage();
//     } else {
//       modalImage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
//     }
//   });

//   // Close modal on clicking outside the image
//   modal.addEventListener("click", function (event) {
//     if (event.target === modal) {
//       closeModal();
//     }
//   });

//   // Recenter the image when modal is opened
//   recenterImage();
// }

// function closeModal() {
//   const modal = document.getElementById("modal");
//   modal.style.display = "none";
// }

let scale = 1;
let x = 0;
let y = 0;

function openModal(imageUrl) {
  const modal = document.getElementById("modal");
  const modalImage = document.getElementById("modal-image");
  modalImage.src = imageUrl;
  modal.style.display = "block";

  // Reset transformations
  scale = 1;
  x = 0;
  y = 0;
  modalImage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;

  // Function to recenter the image
  function recenterImage() {
    const modalRect = modal.getBoundingClientRect();
    const imageRect = modalImage.getBoundingClientRect();

    // Calculate new x and y to center the image
    const imageWidth = imageRect.width;
    const imageHeight = imageRect.height;

    // x = (modalRect.width - imageWidth) / 2;
    // y = (modalRect.height - imageHeight) / 2;
    x = 0;
    y = 0;

    // modalImage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }

  // Initialize Interact.js for dragging and scaling
  interact(modalImage)
    .draggable({
      listeners: {
        move(event) {
          x += event.dx;
          y += event.dy;
          modalImage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
        },
      },
    })
    .gesturable({
      listeners: {
        move(event) {
          scale *= event.scale;
          scale = Math.max(scale, 1); // Prevent scaling to negative values or zero
          modalImage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
        },
      },
    });

  // Add event listener to enable zooming with mouse wheel
  modalImage.addEventListener("wheel", (event) => {
    event.preventDefault();

    const zoomFactor = 0.1;
    const delta = event.deltaY > 0 ? -zoomFactor : zoomFactor;

    scale += delta;
    scale = Math.max(scale, 1); // Prevent scaling to negative values or zero

    // Recenter if scale is 1
    if (scale === 1) {
      recenterImage();
      modalImage.style.transform = `translate(${0}px, ${0}px) scale(${scale})`;
    } else {
      modalImage.style.transform = `translate(${0}px, ${0}px) scale(${scale})`;
    }
  });

  // Recenter the image when modal is opened
  recenterImage();

  // Close modal on clicking outside the image
  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";
}

document.getElementById("close").addEventListener("click", () => {
  document.getElementById("modal").style.display = "none";
});

// When the user clicks anywhere outside of the modal, close it
window.addEventListener("click", (event) => {
  if (event.target == modal) {
    document.getElementById("modal").style.display = "none";
  }
});

// Function to enter fullscreen mode for a video and keep playing it
function enterFullscreenVideo(videoElement) {
  const playVideo = () => {
    videoElement.play().catch((error) => {
      console.error("Failed to play video:", error);
    });
  };

  if (videoElement.requestFullscreen) {
    videoElement
      .requestFullscreen()
      .then(playVideo)
      .catch((error) => {
        console.error("Fullscreen request failed:", error);
        playVideo(); // Continue playing video even if fullscreen fails
      });
  } else if (videoElement.mozRequestFullScreen) {
    // Firefox
    videoElement
      .mozRequestFullScreen()
      .then(playVideo)
      .catch((error) => {
        console.error("Fullscreen request failed:", error);
        playVideo(); // Continue playing video even if fullscreen fails
      });
  } else if (videoElement.webkitRequestFullscreen) {
    // Chrome, Safari, and Opera
    videoElement
      .webkitRequestFullscreen()
      .then(playVideo)
      .catch((error) => {
        console.error("Fullscreen request failed:", error);
        playVideo(); // Continue playing video even if fullscreen fails
      });
  } else if (videoElement.msRequestFullscreen) {
    // IE/Edge
    videoElement
      .msRequestFullscreen()
      .then(playVideo)
      .catch((error) => {
        console.error("Fullscreen request failed:", error);
        playVideo(); // Continue playing video even if fullscreen fails
      });
  } else {
    // Fallback: Just play the video if fullscreen isn't supported
    playVideo();
  }
}

document.getElementById("home-button").addEventListener("click", function () {
  window.location.href = "index.html";
});

// Get the button
const scrollToTopBtn = document.getElementById("scrollToTopBtn");

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
function checkEmpty() {
  const imageContainer = document.getElementById("images-container");
  const noItemsMessage = document.getElementById("no-items-message");

  // Check if the container has child elements
  if (imageContainer.children.length === 0) {
    noItemsMessage.classList.add("visible");
    noItemsMessage.classList.remove("hidden");
  } else {
    noItemsMessage.classList.add("hidden");
    noItemsMessage.classList.remove("visible");
  }
}

checkEmpty();
