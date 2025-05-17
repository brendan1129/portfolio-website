<?php
// Enable error reporting for debugging (remove in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Ensure Composer autoloader is included
// This path assumes vendor/ is in the same directory as this script
require __DIR__ . '/vendor/autoload.php';

use Github\Client; // This is the GitHub API Client class
use GuzzleHttp\Client as GuzzleClient; // Corrected: Use a different alias for Guzzle's Client class

// --- Configuration ---
// Replace with your GitHub username
$githubUsername = 'brendan1129'; // e.g., 'your-github-username'

// Optional: Personal Access Token for higher rate limits
// Make sure this file is NOT accessible from the web!
$githubToken = ''; // Replace with your PAT or leave empty for public user events

// --- Fetch Latest Commit Across All Repos ---
try {
    // Instantiate Guzzle HTTP Client using the new alias
    $guzzleClient = new GuzzleClient();

    // Create GitHub Client using the Guzzle client
    // knplabs/github-api v3+ can accept a PSR-18 client directly
    $client = Client::createWithHttpClient($guzzleClient); // This refers to Github\Client

    // Authenticate if a token is provided
    // Authentication is recommended for higher rate limits, even for public data
    if (!empty($githubToken)) {
        $client->authenticate($githubToken, null, Client::AUTH_HTTP_TOKEN);
    }

    // Fetch recent public events for the user
    // We limit the results to a reasonable number (e.g., 100) and paginate if necessary
    // to find the most recent PushEvent.
    // The GitHub API limits event fetching to the last 300 public events.
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
        echo json_encode(['error' => 'No recent commits found for this user in the last 300 events.']);
    }

} catch (\Exception $e) { // Catch any Exception, including RuntimeException
    // Handle API errors or other exceptions
    http_response_code(500); // Internal Server Error
    header('Content-Type: application/json');
    // Output the actual error message for debugging
    echo json_encode(['error' => 'Server Error: ' . $e->getMessage()]);
}

// It's good practice to omit the closing PHP tag if the file contains only PHP
