// Modal functionality
document.addEventListener("DOMContentLoaded", () => {
  // Get modal elements
  const infoModal = document.getElementById("info-modal");
  const sourceModal = document.getElementById("source-modal");
  const infoButton = document.getElementById("info-button");
  const sourceButton = document.getElementById("source-button");
  const closeButtons = document.querySelectorAll(".close-button");

  // Debug: Check if elements exist
  console.log("Modal elements found:", {
    infoModal: !!infoModal,
    sourceModal: !!sourceModal,
    infoButton: !!infoButton,
    sourceButton: !!sourceButton,
    closeButtons: closeButtons.length,
  });

  // Open info modal
  if (infoButton && infoModal) {
    infoButton.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Info button clicked");
      infoModal.classList.add("active");
    });
  }

  // Open source modal
  if (sourceButton && sourceModal) {
    sourceButton.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Source button clicked");
      sourceModal.classList.add("active");
    });
  }

  // Close modals when clicking the X button
  closeButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const modalId = button.getAttribute("data-modal");
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove("active");
      }
    });
  });

  // Close modals when clicking outside the modal content
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.classList.remove("active");
    }
  });

  // Close modals with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (infoModal) infoModal.classList.remove("active");
      if (sourceModal) sourceModal.classList.remove("active");
    }
  });
});
