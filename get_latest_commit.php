<?php
// Ensure Composer autoloader is included
require 'vendor/autoload.php';

use Github\Client;
use Symfony\Component\HttpClient\HttplugClient;

// --- Configuration ---
// Replace with your GitHub username
$githubUsername = 'brendan1129'; // e.g., 'your-github-username'

// Optional: Personal Access Token for higher rate limits
// Make sure this file is NOT accessible from the web!
$githubToken = ''; // Replace with your PAT or leave empty for public user events

// --- Fetch Latest Commit Across All Repos ---
try {
    $httpClient = new HttplugClient();
    $client = Client::createWithHttpClient($httpClient);

    // Authenticate if a token is provided
    // Authentication is recommended for higher rate limits, even for public data
    if (!empty($githubToken)) {
        $client->authenticate($githubToken, null, Client::AUTH_HTTP_TOKEN);
    }

    // Fetch recent public events for the user
    // We limit the results to a reasonable number (e.g., 30) and paginate if necessary
    // to find the most recent PushEvent.
    $events = $client->api('user')->publicEvents($githubUsername, ['per_page' => 100]); // Fetch up to 100 recent events

    $latestCommitData = null;

    // Iterate through events to find the most recent PushEvent
    foreach ($events as $event) {
        if ($event['type'] === 'PushEvent') {
            // PushEvent payload contains an array of commits in that push
            $commitsInPush = $event['payload']['commits'];

            if (!empty($commitsInPush)) {
                // The first commit in the payload's commits array is typically the latest in that push
                $latestCommitInPush = $commitsInPush[0];

                // Extract repository information from the event
                $repoName = $event['repo']['name']; // Format: username/repo-name
                $commitSha = $latestCommitInPush['sha'];

                // Construct the full commit URL
                $commitUrl = 'https://github.com/' . $repoName . '/commit/' . $commitSha;

                // Prepare the data for the latest commit found
                $latestCommitData = [
                    'message' => $latestCommitInPush['message'],
                    'author' => $latestCommitInPush['author']['name'],
                    'date' => $event['created_at'], // Use event creation date for recency
                    'url' => $commitUrl,
                    'sha' => substr($commitSha, 0, 7), // Short SHA
                    'repository' => $repoName // Include repository name
                ];

                // Found the most recent PushEvent with commits, break the loop
                break;
            }
        }
    }

    // Check if a latest commit was found
    if ($latestCommitData) {
        // Set the content type to JSON and output the data
        header('Content-Type: application/json');
        echo json_encode($latestCommitData);

    } else {
        // No recent PushEvents with commits found in the fetched events
        header('Content-Type: application/json');
        echo json_encode(['error' => 'No recent commits found for this user.']);
    }

} catch (\RuntimeException $e) {
    // Handle API errors
    http_response_code(500); // Internal Server Error
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Error fetching GitHub user events: ' . $e->getMessage()]);
}

?>
