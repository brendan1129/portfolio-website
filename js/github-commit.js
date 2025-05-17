document.addEventListener('DOMContentLoaded', function() {
    const commitInfoDiv = document.getElementById('latest-commit-info');
    const errorDiv = document.getElementById('commit-error');

    // Function to fetch and display the latest commit
    function fetchLatestCommit() {
        // Make an AJAX request to your PHP script
        // Adjust the URL if your PHP script is in a different location
        fetch('../get_latest_commit.php')
            .then(response => {
                // Check if the HTTP status is OK (200-299)
                if (!response.ok) {
                     // If not OK, read the response text and throw an error
                    return response.text().then(text => {
                        throw new Error(`HTTP error! status: ${response.status}, Response: ${text}`);
                    });
                }
                // If OK, clone the response so we can read it twice (once as text, once as json)
                const clonedResponse = response.clone();
                // First, read as text for debugging
                clonedResponse.text().then(text => {
                    console.log('Raw response text:', text); // Log the raw text
                });
                // Then, proceed to parse as JSON
                return response.json();
            })
            .then(data => {
                // Hide the loading message and error message
                commitInfoDiv.style.display = 'block';
                errorDiv.style.display = 'none';

                if (data.error) {
                    // Display the error message from the PHP script
                    commitInfoDiv.innerHTML = `<p>Error: ${data.error}</p>`;
                } else {
                    // Format the date nicely
                    const commitDate = new Date(data.date);
                    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                    const formattedDate = commitDate.toLocaleDateString(undefined, options);

                    // Populate the HTML element with commit information
                    commitInfoDiv.innerHTML = `
                        <p><strong>Message:</strong> ${data.message}</p>
                        <p><strong>Author:</strong> ${data.author}</p>
                        <p><strong>Date:</strong> ${formattedDate}</p>
                        <p><strong>SHA:</strong> ${data.sha}</p>
                        <p><strong>Repository:</strong> ${data.repository}</p> <p><a href="${data.url}" target="_blank">View Commit on GitHub</a></p>
                    `;
                }
            })
            .catch(error => {
                // Handle network errors or errors thrown from the fetch
                console.error('Error fetching latest commit:', error);
                commitInfoDiv.style.display = 'none'; // Hide loading message
                errorDiv.style.display = 'block'; // Show error message
                errorDiv.textContent = `Failed to load latest commit: ${error.message}`; // Display error details
            });
    }

    // Call the function to fetch the commit when the page loads
    fetchLatestCommit();
});
