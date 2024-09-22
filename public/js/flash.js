// Function to show flash messages for a limited time
function showFlashMessages() {
    // Handle both success and error messages
    const messages = document.querySelectorAll('.alert-success, .alert-danger');

    if (messages.length > 0) {
        messages.forEach((message) => {
            const progressBar = message.querySelector('.progress-bar');
            hideMessage(message, progressBar);
        });
    }

    // Function to hide messages after a timeout
    function hideMessage(message, progressBar) {
        const duration = 3000; // Time to display the message before hiding (3000 ms)

        // Animate progress bar if present
        if (progressBar) {
            progressBar.style.transitionDuration = `${duration}ms`;
            progressBar.style.width = '100%'; // Start fully filled
            setTimeout(() => {
                progressBar.style.width = '0%'; // Animate to empty
            }, 100); // Start the animation after a slight delay
        }

        // Hide the message after the duration
        setTimeout(() => {
            message.classList.remove('show'); // Remove Bootstrap 'show' class
            message.classList.add('fade'); // Add 'fade' class for a smooth transition
            setTimeout(() => {
                message.remove(); // Remove the message from the DOM after fade-out
            }, 150); // Short timeout for the fade-out effect
        }, duration); // Time to display the message before it fades out
    }
}

// Call the function immediately
showFlashMessages();
