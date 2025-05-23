document.addEventListener('DOMContentLoaded', () => {
    const reminderIntervalInput = document.getElementById('reminderInterval');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const statusMessage = document.getElementById('statusMessage');

    let reminderIntervalId; // Stores the ID returned by setInterval
    const sound = new Audio('water-sound.mp3'); // Path to your sound file (optional)
    const notificationIcon = 'water-icon.png'; // Path to your notification icon (optional)

    // --- Functions ---

    function showWaterReminder() {
        // Check if notifications are supported and permission is granted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('💧 Time to Drink Water!', {
                body: 'Stay hydrated for better health and focus!',
                icon: notificationIcon // Optional icon
            });
            // Play sound if available
            if (sound) {
                sound.play().catch(e => console.error("Error playing sound:", e));
            }
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            // If permission hasn't been asked or is default, ask for it
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showWaterReminder(); // Try showing reminder again
                } else {
                    alert("Notification permission denied. Reminders may not show.");
                }
            });
        } else {
            // Fallback for browsers that don't support notifications or if denied
            alert("💧 Time to Drink Water! Stay hydrated!");
        }
    }

    function startReminders() {
        const intervalMinutes = parseInt(reminderIntervalInput.value);

        if (isNaN(intervalMinutes) || intervalMinutes <= 0) {
            statusMessage.textContent = "Please enter a valid reminder interval (minutes).";
            statusMessage.style.color = '#d32f2f'; // Red for error
            return;
        }

        // Convert minutes to milliseconds
        const intervalMilliseconds = intervalMinutes * 60 * 1000;

        // Clear any existing interval to prevent duplicates
        if (reminderIntervalId) {
            clearInterval(reminderIntervalId);
        }

        // Set the new interval
        reminderIntervalId = setInterval(showWaterReminder, intervalMilliseconds);

        // Save the interval to localStorage
        localStorage.setItem('waterReminderInterval', intervalMinutes);
        localStorage.setItem('waterReminderRunning', 'true');

        // Update UI
        startButton.disabled = true;
        stopButton.disabled = false;
        reminderIntervalInput.disabled = true;
        statusMessage.textContent = `Reminders started! You'll be reminded every ${intervalMinutes} minutes.`;
        statusMessage.style.color = '#00796b'; // Green for success

        // Trigger the first reminder immediately or after the first interval?
        // For a water reminder, it's often good to show it immediately.
        // showWaterReminder(); // Uncomment if you want an immediate first reminder
    }

    function stopReminders() {
        clearInterval(reminderIntervalId);
        reminderIntervalId = null; // Clear the ID

        // Update localStorage
        localStorage.removeItem('waterReminderRunning');

        // Update UI
        startButton.disabled = false;
        stopButton.disabled = true;
        reminderIntervalInput.disabled = false;
        statusMessage.textContent = "Reminders stopped. You can start them again anytime!";
        statusMessage.style.color = '#555'; // Grey for neutral
    }

    function loadSettings() {
        const savedInterval = localStorage.getItem('waterReminderInterval');
        const isRunning = localStorage.getItem('waterReminderRunning');

        if (savedInterval) {
            reminderIntervalInput.value = savedInterval;
        }

        if (isRunning === 'true') {
            // Request notification permission if not already granted and reminders were running
            if ('Notification' in window) {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        startReminders(); // Restart if permission is granted
                    } else {
                        statusMessage.textContent = "Notification permission denied. Reminders cannot auto-start.";
                        statusMessage.style.color = '#d32f2f';
                        localStorage.removeItem('waterReminderRunning'); // Don't try to auto-start next time
                    }
                });
            } else {
                statusMessage.textContent = "Your browser does not support notifications.";
                statusMessage.style.color = '#d32f2f';
                localStorage.removeItem('waterReminderRunning'); // Don't try to auto-start next time
            }
        }
    }

    // --- Event Listeners ---
    startButton.addEventListener('click', startReminders);
    stopButton.addEventListener('click', stopReminders);

    // --- Initial Load ---
    loadSettings();
});