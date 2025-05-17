document.addEventListener('DOMContentLoaded', () => {
    const statusMessageDiv = document.getElementById('formStatusMessage');
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const message = urlParams.get('message'); // Get specific error message if any

    if (statusMessageDiv && status) {
        if (status === 'success') {
            statusMessageDiv.textContent = 'Thank you for your message! I will get back to you shortly.';
            statusMessageDiv.className = 'status-message success'; // Apply success styles
        } else if (status === 'error') {
            let errorMessage = 'Sorry, there was an error sending your message. Please try again later.';
            if (message === 'missing_fields') {
                 errorMessage = 'Please fill in all required fields.';
            } else if (message === 'invalid_email') {
                 errorMessage = 'Please enter a valid email address.';
            } // You could add more specific messages here

            statusMessageDiv.textContent = errorMessage;
            statusMessageDiv.className = 'status-message error'; // Apply error styles
        }

        // Optional: Clear the URL parameters after displaying the message
        // history.replaceState(null, '', window.location.pathname);
    }
});