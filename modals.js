// Modal functionality
document.addEventListener('DOMContentLoaded', () => {
    // Get modal elements
    const infoModal = document.getElementById('info-modal');
    const sourceModal = document.getElementById('source-modal');
    const infoButton = document.getElementById('info-button');
    const sourceButton = document.getElementById('source-button');
    const closeButtons = document.querySelectorAll('.close-button');

    // Open info modal
    infoButton.addEventListener('click', () => {
        infoModal.classList.add('active');
    });

    // Open source modal
    sourceButton.addEventListener('click', () => {
        sourceModal.classList.add('active');
    });

    // Close modals when clicking the X button
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            modal.classList.remove('active');
        });
    });

    // Close modals when clicking outside the modal content
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });

    // Close modals with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            infoModal.classList.remove('active');
            sourceModal.classList.remove('active');
        }
    });
});
