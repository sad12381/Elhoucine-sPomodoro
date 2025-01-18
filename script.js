let timer;
let timeLeft = 1500; // 25 minutes
let isRunning = false;
let currentMode = 'pomodoro';
let pomodoroCount1 = 0;
let completedTasks1 = 0;

const modes = {
    pomodoro: 1500,
    'short-break': 300,
    'long-break': 900
};


let audioContext;
let soundSources = {};

// Dark Mode Toggle
const darkModeSwitch = document.getElementById('dark-mode-switch');

// Check for saved user preference
const savedDarkMode = localStorage.getItem('darkMode');

// If dark mode was previously enabled, apply it
if (savedDarkMode === 'true') {
    document.body.classList.add('dark-mode');
    darkModeSwitch.checked = true;
} else {
    // Default to light mode
    document.body.classList.remove('dark-mode');
    darkModeSwitch.checked = false;
}

// Toggle dark mode when the switch is clicked
darkModeSwitch.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
    // Save the user's preference in localStorage
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});



// Update Progress Bar
function updateProgressBar() {
    const progress = (timeLeft / modes[currentMode]) * 100;
    document.getElementById('progress').style.width = `${progress}%`;
}



// Initialize timer with the current mode's time
timeLeft = modes[currentMode];

// Function to switch modes
function switchMode(mode) {
    if (mode === currentMode) return; // Do nothing if switching to the same mode

    // Pause the timer if it's running
    if (isRunning) {
        pauseTimer();
    }

    // Update the current mode
    currentMode = mode;

    // Update the time left to the new mode's duration
    timeLeft = modes[mode];

    // Update the active button
    document.querySelectorAll('.timer-controls button').forEach(button => button.classList.remove('active'));
    document.getElementById(mode).classList.add('active');

    // Update the timer display
    updateTimerDisplay();

    // Restart the timer if it was running before switching modes
    if (isRunning) {
        startTimer();
    }
}

// Function to update the timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('time').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    updateProgressBar();
}

// Function to start the timer
function startTimer() {
    if (!isRunning) {
        timer = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(timer);
                isRunning = false;
                                // Play the sound when the timer ends
                                playSound('complete-sound'); 

                alert("Time's up! Take a break.");
                playSound('piano');
                switchMode(currentMode === 'pomodoro' ? 'short-break' : 'pomodoro'); // Switch to the next mode
            }
        }, 1000);
        isRunning = true;
    }
}

// Function to pause the timer
function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
}

// Function to reset the timer
function resetTimer() {
    clearInterval(timer);
    timeLeft = modes[currentMode];
    updateTimerDisplay();
    isRunning = false;
}

// Event Listeners for Timer Controls
document.getElementById('start').addEventListener('click', startTimer);
document.getElementById('pause').addEventListener('click', pauseTimer);
document.getElementById('reset').addEventListener('click', resetTimer);

// Event Listeners for Mode Switching
document.getElementById('pomodoro').addEventListener('click', () => switchMode('pomodoro'));
document.getElementById('short-break').addEventListener('click', () => switchMode('short-break'));
document.getElementById('long-break').addEventListener('click', () => switchMode('long-break'));

// Initialize Timer Display
updateTimerDisplay();
// Error Handling for Sound Playback
function playSound(sound) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (soundSources[sound]) {
        soundSources[sound].stop();
    }

    let soundSource;
    if (sound === 'rain') {
        soundSource = 'rain.mp3';
    } else if (sound === 'ocean') {
        soundSource = 'ocean.mp3';
    } else if (sound === 'piano') {
        soundSource = 'piano.mp3';
    }

    fetch(soundSource)
        .then(response => response.arrayBuffer())
        .then(data => audioContext.decodeAudioData(data))
        .then(buffer => {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);
            soundSources[sound] = source;
        })
        .catch(error => console.error('Error playing sound:', error));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    displayRandomQuote();
    updateStatistics();
});
// Task Management
document.getElementById('add-task').addEventListener('click', addTask);
document.getElementById('task-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

document.getElementById('remove-all-tasks').addEventListener('click', removeAllTasks);

function addTask() {
    const taskInput = document.getElementById('task-input');
    const taskText = taskInput.value.trim();

    if (taskText !== '') {
        const taskList = document.getElementById('task-list');
        const taskItem = document.createElement('li');

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.addEventListener('change', function () {
            taskItem.classList.toggle('completed', checkbox.checked);
        });

        // Task Text
        const taskTextElement = document.createElement('span');
        taskTextElement.className = 'task-text';
        taskTextElement.textContent = taskText;

        // Edit Button
        const editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.addEventListener('click', function () {
            const newText = prompt('Edit your task:', taskTextElement.textContent);
            if (newText !== null && newText.trim() !== '') {
                taskTextElement.textContent = newText.trim();
            }
        });

        // Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.addEventListener('click', function () {
            taskList.removeChild(taskItem);
        });

        // Task Actions Container
        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';
        taskActions.appendChild(editButton);
        taskActions.appendChild(deleteButton);

        // Append Elements to Task Item
        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskTextElement);
        taskItem.appendChild(taskActions);

        // Append Task Item to List
        taskList.appendChild(taskItem);

        // Clear Input
        taskInput.value = '';
    }
}

function removeAllTasks() {
    const taskList = document.getElementById('task-list');
    while (taskList.firstChild) {
        taskList.removeChild(taskList.firstChild);
    }
}
// Sound Effects
const soundButtons = document.querySelectorAll('.sound-controls button');

soundButtons.forEach(button => {
    button.addEventListener('click', function () {
        // Remove active class from all buttons
        soundButtons.forEach(btn => btn.classList.remove('active'));

        // Add active class to the clicked button
        if (button.id !== 'stop-sounds') {
            button.classList.add('active');
        }

        // Play the selected sound
        const sound = button.id;
        if (sound === 'stop-sounds') {
            stopAllSounds();
        } else {
            playSound(sound);
        }
    });
});

function stopAllSounds() {
    for (const sound in soundSources) {
        if (soundSources[sound]) {
            soundSources[sound].stop();
        }
    }
}
// Statistics Variables
let pomodoroCount = 0;
let completedTasks = 0;

// Update Statistics Display
function updateStatistics() {
    document.getElementById('pomodoro-count').textContent = pomodoroCount;
    document.getElementById('task-count').textContent = completedTasks;
}

// Increment Pomodoro Count
function incrementPomodoroCount() {
    pomodoroCount++;
    updateStatistics();
}

// Increment Task Count
function incrementTaskCount() {
    completedTasks++;
    updateStatistics();
}

// Example Usage:
// Call these functions when a Pomodoro or task is completed
// incrementPomodoroCount(); // Call this when a Pomodoro is completed
// incrementTaskCount(); // Call this when a task is completed

// Initialize Statistics on Page Load
document.addEventListener('DOMContentLoaded', updateStatistics);

// Integrate with Timer
function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('time').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    updateProgressBar();

    if (timeLeft === 0) {
        clearInterval(timer);
        alert("Time's up! Take a break.");
        playSound('piano');
        incrementPomodoroCount(); // Increment Pomodoro count
        switchMode();
    }
    timeLeft--;
}

// Integrate with Task Section
function addTask() {
    const taskInput = document.getElementById('task-input');
    const taskText = taskInput.value.trim();

    if (taskText !== '') {
        const taskList = document.getElementById('task-list');
        const taskItem = document.createElement('li');

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.addEventListener('change', function () {
            taskItem.classList.toggle('completed', checkbox.checked);
            if (checkbox.checked) {
                incrementTaskCount(); // Increment task count when checked
            }
        });

        // Task Text
        const taskTextElement = document.createElement('span');
        taskTextElement.className = 'task-text';
        taskTextElement.textContent = taskText;

        // Edit Button
        const editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.addEventListener('click', function () {
            const newText = prompt('Edit your task:', taskTextElement.textContent);
            if (newText !== null && newText.trim() !== '') {
                taskTextElement.textContent = newText.trim();
            }
        });

        // Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.addEventListener('click', function () {
            taskList.removeChild(taskItem);
        });

        // Task Actions Container
        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';
        taskActions.appendChild(editButton);
        taskActions.appendChild(deleteButton);

        // Append Elements to Task Item
        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskTextElement);
        taskItem.appendChild(taskActions);

        // Append Task Item to List
        taskList.appendChild(taskItem);

        // Clear Input
        taskInput.value = '';
    }
}
// Quotes Array
const quotes = [
    "The future depends on what you do today. ",
    "Do what you can, with what you have, where you are. ",
    "It always seems impossible until it’s done. ",
    "Dream big. Start small. Act now.",
"Do it now. Sometimes 'later' becomes 'never'.",
"Small steps lead to big changes.",
"Progress, not perfection.",
"Stay focused. Stay hungry.",
"Work hard in silence. Let success make the noise.",
"Be the energy you want to attract.",
"Rise and grind.",
"Hustle until you no longer need to introduce yourself.",
"Stay positive. Work hard. Make it happen.",
"Done is better than perfect.",
"Focus on the process, not the outcome.",
"One task at a time.",
"Plan. Execute. Succeed.",
"Less procrastination, more action."
];

// Function to Display Quotes with Typing Animation
function displayQuoteWithTyping() {
    const quoteDisplay = document.getElementById('quote-display');
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    let i = 0;
    quoteDisplay.textContent = ''; // Clear previous quote

    function typeQuote() {
        if (i < randomQuote.length) {
            quoteDisplay.textContent += randomQuote.charAt(i);
            i++;
            setTimeout(typeQuote, 95); // Typing speed (50ms per character)
        } else {
            setTimeout(displayQuoteWithTyping, 5000); // Show next quote after 5 seconds
        }
    }

    typeQuote();
}

// Initialize Quotes on Page Load
document.addEventListener('DOMContentLoaded', displayQuoteWithTyping);

// Floating Button and Notification Logic
const floatingButton = document.getElementById('floating-button');
const notification = document.getElementById('notification');
const closeNotificationButton = document.getElementById('close-notification');

// Show notification for first-time users
if (!localStorage.getItem('hasSeenNotification')) {
    notification.style.display = 'flex';
}

// Close notification and set flag in localStorage
closeNotificationButton.addEventListener('click', () => {
    notification.style.display = 'none';
    localStorage.setItem('hasSeenNotification', true);
});

// Scroll to "How to Use" section when floating button is clicked
floatingButton.addEventListener('click', () => {
    document.getElementById('how-to-use').scrollIntoView({ behavior: 'smooth' });
});
// Button Click Sound Logic
const clickSound = document.getElementById('click-sound');

// Function to play button click sound
function playClickSound() {
    clickSound.currentTime = 0; // Reset the sound to the beginning
    clickSound.play();
}

// Add event listeners to all buttons
document.querySelectorAll('button').forEach(button => {
    if (!button.classList.contains('no-sound')) { // Exclude buttons with the "no-sound" class
        button.addEventListener('click', () => {
            playClickSound();
        });
    }
});
// Function to play a sound
function playSound(soundId) {
    const audioElement = document.getElementById(soundId);
    if (audioElement) {
        audioElement.currentTime = 0; // Reset the sound to the beginning
        audioElement.play();
    } else {
        console.error(`Audio element with ID "${soundId}" not found.`);
    }
}

// Function to stop all sounds
function stopAllSounds() {
    const sounds = ['rain-sound', 'ocean-sound', 'piano-sound']; // Add all sound IDs here
    sounds.forEach(soundId => {
        const audioElement = document.getElementById(soundId);
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0; // Reset sound to the beginning
        }
    });
}

// Event listeners for sound buttons
document.getElementById('rain').addEventListener('click', () => {
    stopAllSounds(); // Stop other sounds
    playSound('rain-sound'); // Play rain sound
});

document.getElementById('ocean').addEventListener('click', () => {
    stopAllSounds(); // Stop other sounds
    playSound('ocean-sound'); // Play ocean sound
});

document.getElementById('piano').addEventListener('click', () => {
    stopAllSounds(); // Stop other sounds
    playSound('piano-sound'); // Play piano sound
});

document.getElementById('stop-sounds').addEventListener('click', () => {
    stopAllSounds(); // Stop all sounds
});

// Volume Control Logic
const volumeSlider = document.getElementById('volume-slider');
const rainSound = document.getElementById('rain-sound');
const oceanSound = document.getElementById('ocean-sound');
const pianoSound = document.getElementById('piano-sound');

// Set initial volume for all sounds
rainSound.volume = volumeSlider.value;
oceanSound.volume = volumeSlider.value;
pianoSound.volume = volumeSlider.value;

// Update volume when the slider changes
volumeSlider.addEventListener('input', () => {
    const volume = volumeSlider.value;
    rainSound.volume = volume;
    oceanSound.volume = volume;
    pianoSound.volume = volume;
});
// Hide the loading screen when the page is fully loaded
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        // Add a delay to ensure the loading screen is visible for at least 1 second
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500); // Wait for the opacity transition to finish
        }, 1000); // Adjust the delay as needed
    }
});
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                document.body.classList.add('loaded'); // Add the 'loaded' class
            }, 500);
        }, 1000);
    }
});
// Theme Logic
const body = document.body;
const container = document.querySelector('.container');
const animatedHeader = document.querySelector('.animated-header');
const tagline = document.querySelector('.tagline');
const timerDisplay = document.getElementById('time');
const progressBar = document.getElementById('progress');
const buttons = document.querySelectorAll('button');

// Audio Elements
const netflixSound = document.getElementById('netflix-sound');
const helloKittySound = document.getElementById('hello-kitty-sound');
const onePieceSound = document.getElementById('one-piece-sound');

// Function to apply a theme
function applyTheme(theme) {
    // Reset all styles
    body.style.backgroundColor = '';
    body.style.color = '';
    body.style.fontFamily = '';
    body.style.backgroundImage = ''; // Reset background image
    container.style.backgroundColor = '';
    container.style.color = '';
    animatedHeader.style.color = '';
    animatedHeader.style.fontSize = '';
    animatedHeader.style.textShadow = '';
    tagline.style.color = '';
    tagline.style.fontSize = '';
    timerDisplay.style.color = '';
    progressBar.style.backgroundColor = '';
    progressBar.style.background = '';

    buttons.forEach(button => {
        button.style.backgroundColor = '';
        button.style.color = '';
        button.style.borderRadius = '';
        button.style.padding = '';
        button.style.fontSize = '';
        button.style.transition = '';
    });

    // Apply the selected theme
    if (theme === 'netflix') {
        // Netflix Theme
        body.style.backgroundColor = '#141414';
        body.style.color = '#E50914';
        body.style.fontFamily = 'Bebas Neue, cursive';
        body.style.backgroundImage = 'url("images/netflix-background.jpg")'; // Netflix background
        container.style.backgroundColor = '#000';
        container.style.color = '#FFF';
        animatedHeader.style.color = '#E50914';
        animatedHeader.style.fontSize = '3.5em';
        animatedHeader.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
        tagline.style.color = '#FFF';
        tagline.style.fontSize = '1.2em';
        timerDisplay.style.color = '#E50914';
        progressBar.style.backgroundColor = '#333';
        progressBar.style.background = '#E50914';

        buttons.forEach(button => {
            button.style.backgroundColor = '#E50914';
            button.style.color = '#FFF';
            button.style.borderRadius = '5px';
            button.style.padding = '10px 20px';
            button.style.fontSize = '1em';
            button.style.transition = 'background-color 0.3s ease, transform 0.2s ease';
        });

        // Play Netflix sound
        netflixSound.play();
    } else if (theme === 'hello-kitty') {
        // Hello Kitty Theme
        body.style.backgroundColor = '#FFC0CB';
        body.style.color = '#FF69B4';
        body.style.fontFamily = 'Comic Sans MS, cursive';
        body.style.backgroundImage = 'url("images/hello-kitty-background.jpg")'; // Hello Kitty background
        container.style.backgroundColor = '#FFF';
        container.style.color = '#000';
        animatedHeader.style.color = '#FF69B4';
        animatedHeader.style.fontSize = '3.5em';
        animatedHeader.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.2)';
        tagline.style.color = '#000';
        tagline.style.fontSize = '1.2em';
        timerDisplay.style.color = '#FF69B4';
        progressBar.style.backgroundColor = '#FF69B4';
        progressBar.style.background = '#FFF';

        buttons.forEach(button => {
            button.style.backgroundColor = '#FF69B4';
            button.style.color = '#FFF';
            button.style.borderRadius = '20px';
            button.style.padding = '10px 20px';
            button.style.fontSize = '1em';
            button.style.transition = 'background-color 0.3s ease, transform 0.2s ease';
        });

        // Play Hello Kitty sound
        helloKittySound.play();
    } else if (theme === 'one-piece') {
        // One Piece Theme
        body.style.backgroundColor = '#002366';
        body.style.color = '#FFD700';
        body.style.fontFamily = 'Pirata One, cursive';
        body.style.backgroundImage = 'url("images/one-piece-background.jpg")'; // One Piece background
        container.style.backgroundColor = '#000';
        container.style.color = '#FFD700';
        animatedHeader.style.color = '#FFD700';
        animatedHeader.style.fontSize = '3.5em';
        animatedHeader.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
        tagline.style.color = '#FFF';
        tagline.style.fontSize = '1.2em';
        timerDisplay.style.color = '#FFD700';
        progressBar.style.backgroundColor = '#333';
        progressBar.style.background = '#FFD700';

        buttons.forEach(button => {
            button.style.backgroundColor = '#FFD700';
            button.style.color = '#000';
            button.style.borderRadius = '5px';
            button.style.padding = '10px 20px';
            button.style.fontSize = '1em';
            button.style.transition = 'background-color 0.3s ease, transform 0.2s ease';
        });

        // Play One Piece sound
        onePieceSound.play();
    } else {
        // Default Theme
        body.style.backgroundColor = '#EFE9E1';
        body.style.color = '#322D29';
        body.style.fontFamily = 'Inter, sans-serif';
        container.style.backgroundColor = '#D9D9D9';
        container.style.color = '#322D29';
        animatedHeader.style.color = '#72383D';
        animatedHeader.style.fontSize = '3em';
        animatedHeader.style.textShadow = 'none';
        tagline.style.color = '#322D29';
        tagline.style.fontSize = '1.2em';
        timerDisplay.style.color = '#72383D';
        progressBar.style.backgroundColor = '#72383D';
        progressBar.style.background = '#72383D';

        buttons.forEach(button => {
            button.style.backgroundColor = '#72383D';
            button.style.color = '#EFE9E1';
            button.style.borderRadius = '5px';
            button.style.padding = '10px 20px';
            button.style.fontSize = '1em';
            button.style.transition = 'background-color 0.3s ease, transform 0.2s ease';
        });
    }
}
// Easter Egg Logic
let keySequence = [];
const secretKeySequence = ['s', 'a', 'd']; // Key combination: P, O, M, O
const secretCode = "iloveelhoucine"; // Secret code to unlock themes

const codePromptModal = document.getElementById('code-prompt-modal');
const codeInput = document.getElementById('code-input');
const submitCodeButton = document.getElementById('submit-code');
const codeError = document.getElementById('code-error');

const themePopup = document.getElementById('theme-popup');
const closeThemePopup = document.getElementById('close-theme-popup');

// Listen for key presses
window.addEventListener('keydown', (event) => {
    keySequence.push(event.key.toLowerCase());
    if (keySequence.length > secretKeySequence.length) {
        keySequence.shift(); // Keep the sequence length in check
    }
    if (keySequence.join('') === secretKeySequence.join('')) {
        codePromptModal.style.display = 'block'; // Show the code prompt modal
        keySequence = []; // Reset the sequence
    }
});

// Handle code submission
submitCodeButton.addEventListener('click', () => {
    const enteredCode = codeInput.value.trim();

    if (enteredCode === secretCode) {
        // Correct code: Show the theme selection pop-up
        codePromptModal.style.display = 'none'; // Hide the code prompt modal
        themePopup.style.display = 'block'; // Show the theme selection pop-up
    } else {
        // Incorrect code: Show error message
        codeError.style.display = 'block';
    }
});

// Close the code prompt modal if clicked outside
window.addEventListener('click', (event) => {
    if (event.target === codePromptModal) {
        codePromptModal.style.display = 'none';
    }
});

// Theme Selection Pop-up Logic
document.getElementById('theme-default-popup').addEventListener('click', () => {
    applyTheme('default'); // Default theme
    themePopup.style.display = 'none'; // Hide the pop-up
});

document.getElementById('theme-netflix-popup').addEventListener('click', () => {
    applyTheme('netflix'); // Netflix theme
    themePopup.style.display = 'none'; // Hide the pop-up
});

document.getElementById('theme-hello-kitty-popup').addEventListener('click', () => {
    applyTheme('hello-kitty'); // Hello Kitty theme
    themePopup.style.display = 'none'; // Hide the pop-up
});

document.getElementById('theme-one-piece-popup').addEventListener('click', () => {
    applyTheme('one-piece'); // One Piece theme
    themePopup.style.display = 'none'; // Hide the pop-up
});

// Close the theme selection pop-up
closeThemePopup.addEventListener('click', () => {
    themePopup.style.display = 'none'; // Hide the pop-up
});
// Name Prompt Logic
const namePromptModal = document.getElementById('name-prompt-modal');
const nameInput = document.getElementById('name-input');
const submitNameButton = document.getElementById('submit-name');

// Greeting Pop-up Logic
const greetingPopup = document.getElementById('greeting-popup');
const userNameDisplay = document.getElementById('user-name');
const closeGreetingButton = document.getElementById('close-greeting');

// Function to show the greeting pop-up
function showGreetingPopup(name) {
    userNameDisplay.textContent = name;
    greetingPopup.style.display = 'block';

    // Hide the greeting pop-up after 5 seconds
    setTimeout(() => {
        greetingPopup.style.display = 'none';
    }, 8000);
}

// Check if the user's name is already saved in localStorage
const savedUserName = localStorage.getItem('userName');

if (!savedUserName) {
    // If no name is saved, show the name prompt modal
    namePromptModal.style.display = 'flex';
} else {
    // If the name is saved, show the greeting pop-up
    showGreetingPopup(savedUserName);
}

// Handle name submission
submitNameButton.addEventListener('click', () => {
    const userName = nameInput.value.trim();

    if (userName) {
        // Save the user's name in localStorage
        localStorage.setItem('userName', userName);

        // Hide the name prompt modal
        namePromptModal.style.display = 'none';

        // Show the greeting pop-up
        showGreetingPopup(userName);
    } else {
        alert('Please enter your name!');
    }
});

// Close the greeting pop-up
closeGreetingButton.addEventListener('click', () => {
    greetingPopup.style.display = 'none';
});