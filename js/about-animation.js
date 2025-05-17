// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get references to the elements
    const birdContainer = document.querySelector('.bird-container');
    const birdSprite = document.querySelector('.bird-sprite');

    // --- Animation Variables ---
    // Check if elements exist before proceeding
    if (!birdContainer || !birdSprite) {
        console.warn("Bird animation elements not found on this page.");
        return; // Stop if elements aren't present
    }

    let containerWidth = birdContainer.clientWidth;
    let birdWidth = birdSprite.clientWidth; // Get the actual rendered width
    let birdHeight = birdSprite.clientHeight; // Get the actual rendered height

    let currentPosition = 0; // Current horizontal position (left offset)
    let direction = 1; // 1 for right, -1 for left
    const horizontalSpeed = 1; // Pixels to move horizontally per frame (adjust for speed)

    let animationFrameId = null; // To store the ID of the single animation frame

    let isFalling = false; // State variable to track if the bird is falling

    // Falling specific variables
    let verticalVelocity = 0; // Current vertical speed
    const gravity = 0.1; // Downward acceleration (adjust for fall speed)
    const initialPopVelocity = 3; // Initial upward velocity when clicked (adjust for pop height)

    // Spin and Fade variables
    let fallStartTime = null; // Timestamp when the fall animation started
    const spinDuration = 1500; // Duration of the spin animation in milliseconds
    const totalSpinDegrees = 720; // Total degrees to spin (e.g., 720 = 2 full rotations)
    const fadeDuration = 1000; // Duration of the fade animation in milliseconds


    // Function to update element widths and heights on resize
    function updateDimensions() {
        containerWidth = birdContainer.clientWidth;
        // Get dimensions after they might have been affected by CSS/layout
        birdWidth = birdSprite.offsetWidth; // Use offsetWidth/Height for rendered size
        birdHeight = birdSprite.offsetHeight;

        // If the bird is not falling, ensure it stays within bounds after resize
        if (!isFalling) {
             // Clamp horizontal position to stay within container bounds
             currentPosition = Math.max(0, Math.min(currentPosition, containerWidth - birdWidth));
             birdSprite.style.left = currentPosition + 'px';
             // Ensure bird is at the bottom if not falling (resets vertical position)
             birdSprite.style.bottom = '0px';
             birdSprite.style.opacity = '1'; // Reset opacity
             birdSprite.style.transform = `scaleX(${direction})`; // Reset transform (just flip)
        }
        // If falling, the animateBird loop will handle its position based on velocity/gravity.
    }

    // The single animation loop
    function animateBird(timestamp) {
        if (!isFalling) {
            // --- Horizontal Movement ---
            // Calculate the new horizontal position
            currentPosition += horizontalSpeed * direction;

            // Check for boundaries and change direction/flip image
            if (direction === 1 && currentPosition >= containerWidth - birdWidth) {
                // Reached right edge
                currentPosition = containerWidth - birdWidth; // Snap to edge
                direction = -1; // Change direction to left
                birdSprite.style.transform = 'scaleX(-1)'; // Flip horizontally
            } else if (direction === -1 && currentPosition <= 0) {
                // Reached left edge
                currentPosition = 0; // Snap to edge
                direction = 1; // Change direction to right
                birdSprite.style.transform = 'scaleX(1)'; // Flip back
            }

            // Apply the new horizontal position
            birdSprite.style.left = currentPosition + 'px';
            // Ensure bottom and opacity are base values when not falling
            birdSprite.style.bottom = '0px';
            birdSprite.style.opacity = '1';

        } else {
            // --- Falling, Spin, and Fade ---
            if (!fallStartTime) { // Should be set on click, but a safeguard
                 fallStartTime = timestamp;
            }
            const elapsedTime = timestamp - fallStartTime;

            // Update Horizontal position (continue existing horizontal velocity)
            currentPosition += horizontalSpeed * direction;
            birdSprite.style.left = currentPosition + 'px';

            // Update Vertical position (gravity effect)
            verticalVelocity -= gravity; // Gravity pulls downwards
            let currentBottom = parseFloat(birdSprite.style.bottom);
            currentBottom += verticalVelocity; // Add velocity to current bottom position
            birdSprite.style.bottom = currentBottom + 'px';

            // --- Update Spin ---
            // Calculate current rotation based on time elapsed
            const rotationProgress = Math.min(elapsedTime / spinDuration, 1); // Progress from 0 to 1
            const currentRotation = rotationProgress * totalSpinDegrees; // Linear rotation

            // --- Update Opacity (Fade Out) ---
            // Calculate current opacity based on time elapsed
            const opacityProgress = Math.min(elapsedTime / fadeDuration, 1); // Progress from 0 to 1
            const currentOpacity = 1 - opacityProgress; // Opacity goes from 1 to 0

            // Apply the spin and fade
            // Combine rotate with the existing horizontal flip (scaleX)
            birdSprite.style.transform = `rotate(${currentRotation}deg) scaleX(${direction})`;
            birdSprite.style.opacity = currentOpacity;

            // Check if the bird has fallen off the bottom OR faded out completely
            // Use containerHeight for checking against the bottom of the container
             if (currentBottom + birdHeight < 0 || currentOpacity <= 0) {
                 // Bird is off screen or invisible, stop animation and remove element
                 cancelAnimationFrame(animationFrameId); // Cancel the main loop
                 birdSprite.remove();
                 console.log("Bird fell off or faded out!");
                 return; // Stop the current animation frame execution
             }
        }

        // Request the next frame for the appropriate animation state
        animationFrameId = requestAnimationFrame(animateBird);
    }

    // Function to handle the bird click
    function handleClick(event) {
        if (isFalling) {
            return; // Ignore clicks if already falling
        }

        isFalling = true; // Set falling state
        console.log("Bird clicked! Starting fall with spin and fade.");

        // Record the start time for spin and fade animations
        fallStartTime = performance.now();

        // Apply the initial upward 'pop' velocity
        verticalVelocity = initialPopVelocity;

        // Remove the click listener so it can't be clicked again while falling
        birdSprite.removeEventListener('click', handleClick);

        // The animation loop is already running, it will pick up the 'isFalling' state
        // No need to start a new animation frame loop here
        // requestAnimationFrame(animateBird); // This might cause issues, loop is already running

        // Prevent the click event from doing anything else if it was on a link or button
        event.preventDefault();
    }


    // --- Initialize and Attach Event Listeners ---

    // Add click listener to the bird sprite
    birdSprite.addEventListener('click', handleClick);

    // Add resize listener to window to update dimensions
    window.addEventListener('resize', updateDimensions);

    // Start the single animation loop
    // Use requestAnimationFrame for the first call too for consistency
    requestAnimationFrame(animateBird);

    // Get initial dimensions after potential image load (important for accurate size)
    birdSprite.addEventListener('load', updateDimensions);
    // If the image is already loaded (e.g., from cache), call updateDimensions directly
    if (birdSprite.complete) {
        updateDimensions();
    }
});