<?php
error_reporting(E_ALL); // Report all PHP errors
ini_set('display_errors', 1); // Display errors in the browser (temporarily for debugging)
ini_set('log_errors', 1); // Also log errors to a file
ini_set('error_log', __DIR__ . '/php_error.log'); // Specify a log file in the same directory

error_log("Script started. Request method: " . $_SERVER["REQUEST_METHOD"]); // Log script start

// Define the recipient email address
$recipient_email = "contact@bnh-dev.com"; // <-- **REPLACE WITH YOUR EMAIL ADDRESS**
error_log("Recipient email set to: " . $recipient_email); // Log recipient email

// Check if the form was submitted using POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    error_log("Method is POST. Processing form data.");

    // --- Sanitize and Validate Input ---
    // Basic sanitization
    $name = htmlspecialchars(trim($_POST['name']));
    $email = htmlspecialchars(trim($_POST['email']));
    $subject = htmlspecialchars(trim($_POST['subject']));
    $message = htmlspecialchars(trim($_POST['message']));

    error_log("Sanitized data - Name: " . $name . ", Email: " . $email . ", Subject: " . $subject); // Log sanitized data

    // Basic validation: Check if required fields are empty
    if (empty($name) || empty($email) || empty($message)) {
        error_log("Validation failed: Missing fields."); // Log validation failure
        header("Location: contact.html?status=error&message=missing_fields");
        exit;
    }

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
         error_log("Validation failed: Invalid email format for email: " . $email); // Log invalid email
         header("Location: contact.html?status=error&message=invalid_email");
         exit;
    }
    error_log("Validation successful."); // Log validation success


    // --- Prepare Email ---
    $email_subject = "Contact Form Message: " . $subject;
    $email_body = "You have received a new message from your website contact form.\n\n";
    $email_body .= "Name: " . $name . "\n";
    $email_body .= "Email: " . $email . "\n\n";
    $email_body .= "Message:\n" . $message . "\n";
    error_log("Email subject and body prepared."); // Log email preparation


    // --- Set Headers (Basic Spam Prevention) ---
    $safe_email = str_replace(["\n", "\r", "%0a", "%0d"], '', $email);
    $headers = "From: bnh-dev@spaceship.com\r\n"; // <-- **REPLACE WITH AN EMAIL RELATED TO YOUR DOMAIN**
    $headers .= "Reply-To: " . $safe_email . "\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    error_log("Email headers prepared: " . $headers); // Log headers

    // --- Send Email ---
    error_log("Attempting to send email to: " . $recipient_email); // Log attempt to send

    $mail_sent = mail($recipient_email, $email_subject, $email_body, $headers);

    // --- Redirect Based on Mail Status ---
    if ($mail_sent) {
        error_log("Mail function returned TRUE. Redirecting to success."); // Log mail success
        header("Location: contact.html?status=success");
        exit;
    } else {
        // mail() returned FALSE - check web server logs for details
        error_log("Mail function returned FALSE. Redirecting to error. Check server logs for details."); // Log mail failure
        header("Location: contact.html?status=error&message=mail_failed");
        exit;
    }

} else {
    // If the script was accessed directly (not via form POST)
    error_log("Method is NOT POST. Direct access attempt?"); // Log direct access attempt
    header("Location: contact.html?status=error&message=direct_access");
    exit;
}
?>