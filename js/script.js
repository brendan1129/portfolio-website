// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.getElementById('hero');
    const keyboardContainer = heroSection.querySelector('.keyboard-container');
    const numberOfKeys = 50; // Adjust this number for more or fewer keys
    let keys = []; // Array to store the key elements

    // Store timeout IDs for each key so we can clear them
    const keyFallTimeouts = new Map(); // Using a Map to associate keys with their timeouts

    const fallDelay = 250; // 500 milliseconds = 0.5 second delay before falling

    // Function to create the piano keys
    function createKeys() {
        // Clear any existing keys and timeouts
        clearAllTimeouts(); // Clear before clearing elements
        keyboardContainer.innerHTML = '';
        keys = []; // Reset the keys array

        const containerWidth = keyboardContainer.clientWidth;
        // keyWidth will be implicitly handled by flex-grow: 1

        for (let i = 0; i < numberOfKeys; i++) {
            const key = document.createElement('div');
            key.classList.add('piano-key');
            key.style.height = '0'; // Start at height 0
            key.dataset.index = i;

            keys.push(key);
            keyboardContainer.appendChild(key);
        }
    }

    // Function to handle mouse movement
    function handleMouseMove(event) {
        const heroRect = heroSection.getBoundingClientRect();
        const mouseY = event.clientY - heroRect.top; // Y relative to hero top
        const mouseX = event.clientX - heroRect.left; // X relative to hero left

        const clampedMouseY = Math.max(0, Math.min(mouseY, heroRect.height));
        const targetHeight = heroRect.height - clampedMouseY;

        const containerWidth = keyboardContainer.clientWidth;
        const keyWidth = containerWidth / numberOfKeys; // Calculate actual key width
        const currentKeyIndex = Math.floor(mouseX / keyWidth);

        keys.forEach((key, index) => {
            if (index === currentKeyIndex) {
                // If the mouse is over this key horizontally:

                // 1. Clear any pending 'fall' timeout for this key
                if (keyFallTimeouts.has(key)) {
                    clearTimeout(keyFallTimeouts.get(key));
                    keyFallTimeouts.delete(key); // Remove the timeout reference
                }

                // 2. Set its height to the target height
                key.style.height = targetHeight + 'px';

            } else {
                // If the mouse is NOT over this key horizontally:

                // 1. If the key currently has a non-zero height AND
                // 2. If there isn't already a fall timeout scheduled for it
                // THEN, schedule a timeout to make it fall after the delay.
                if (key.style.height !== '0px' && !keyFallTimeouts.has(key)) {
                    const timeoutId = setTimeout(() => {
                        key.style.height = '0'; // Make it fall
                        keyFallTimeouts.delete(key); // Clean up the map entry after falling
                    }, fallDelay);

                    // Store the timeout ID so we can clear it later if the mouse comes back
                    keyFallTimeouts.set(key, timeoutId);
                }
                // If the height is already 0 or a timeout is already pending, do nothing (let the existing timeout handle it)
            }
        });
    }

    // Function to reset all keys immediately (e.g., when mouse leaves the section)
    function handleMouseLeave() {
        clearAllTimeouts(); // Clear all pending timeouts
        keys.forEach(key => {
            key.style.height = '0'; // Make all keys fall immediately
        });
    }

    // Helper function to clear all scheduled fall timeouts
    function clearAllTimeouts() {
         keyFallTimeouts.forEach(timeoutId => {
             clearTimeout(timeoutId);
         });
         keyFallTimeouts.clear(); // Empty the map
    }

    // Function to handle window resizing (recreate keys to adjust width)
    function handleResize() {
         // For simplicity, we recreate keys on resize.
         // This also inherently clears any pending timeouts and resets heights.
         createKeys();
    }

    // --- Initialize and Attach Event Listeners ---

    // Create the keys when the page loads
    createKeys();

    // Add mouse event listeners to the keyboard container (it covers the hero)
    // Use keyboardContainer because pointer-events: none is set on it.
    // Events on heroSection might get blocked by the container itself.
    // However, since pointer-events: none is on keyboardContainer, events should propagate
    // through it to heroSection. Let's add listeners to heroSection as originally planned
    // as pointer-events: none applies to the element itself and its children regarding pointer events.
    heroSection.addEventListener('mousemove', handleMouseMove);
    heroSection.addEventListener('mouseleave', handleMouseLeave);


    // Add a resize listener to window to adjust key widths if the window is resized
    window.addEventListener('resize', handleResize);
});