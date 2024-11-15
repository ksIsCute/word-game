const API_URL = "https://random-word-api.herokuapp.com/word?number=1&length=";

let targetWord = "";
let guessCount = 0;
let wordsFound = 0;

const usedLetters = new Set();

// Fetch random word based on the given length
async function fetchRandomWord(length) {
    try {
        const response = await fetch(`${API_URL}${length}`);
        const data = await response.json();
        if (data && data.length > 0) {
            return data[0].toLowerCase();
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching word:", error);
        return null;
    }
}

// Load a new word and update the UI
async function loadNewWord() {
    const length = parseInt(document.getElementById("wordLength").value);
    targetWord = await fetchRandomWord(length);
    if (targetWord) {
        console.log(`The target word is: ${targetWord}`);  // For debugging
        document.getElementById("message").style.color = "green";
        document.getElementById("message").innerText = `New word loaded: ${targetWord.length} letters.`;
        usedLetters.clear();  // Reset the used letters set for new game
        updateKeyboard();
    } else {
        document.getElementById("message").style.color = "red";
        document.getElementById("message").innerText = "Failed to load word. Please try again.";
    }
}

// Update keyboard with the status of the letters
function updateKeyboard() {
    const keyboardElement = document.getElementById("keyboard");
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

    // Clear existing keyboard
    keyboardElement.innerHTML = '';

    // Add keys to the keyboard
    alphabet.forEach(letter => {
        const key = document.createElement("div");
        key.innerText = letter.toUpperCase();
        key.classList.add("key");

        // Apply styling based on the letter's status
        if (usedLetters.has(letter)) {
            key.classList.add("used");
        }

        keyboardElement.appendChild(key);

        // Add event listener to highlight letter on click
        key.addEventListener("click", () => {
            const inputField = document.getElementById("wordInput");
            inputField.value += letter;  // Add clicked letter to the guess input
        });
    });
}

// Check each letter of the guess and apply colors
function check(word, input) {
    const messageElement = document.getElementById("message");
    const lengthMessageElement = document.getElementById("wordLengthMessage");
    const recentGuessesList = document.getElementById("recentGuessesList");

    // Clear previous messages
    messageElement.innerText = '';
    lengthMessageElement.innerText = '';

    // If the input is empty or doesn't match the length of the target word
    if (input.length !== word.length) {
        lengthMessageElement.innerText = `Your guess must be ${word.length} characters long.`;
        return;
    }

    let result = [];
    let wordArray = word.split('');
    let inputArray = input.toLowerCase().split('');

    // Check for correct letters (green)
    for (let i = 0; i < word.length; i++) {
        if (inputArray[i] === wordArray[i]) {
            result.push('correct');
            usedLetters.add(inputArray[i]);
        } else {
            result.push('empty');
        }
    }

    // Check for misplaced letters (yellow)
    for (let i = 0; i < word.length; i++) {
        if (result[i] !== 'correct' && wordArray.includes(inputArray[i])) {
            result[i] = 'misplaced';
            usedLetters.add(inputArray[i]);
        }
    }

    // Update the keyboard for used letters
    updateKeyboard();

    // Increment guess count
    guessCount++;
    document.getElementById("guessCount").innerText = guessCount;

    // Update the message based on guess outcome
    if (result.every(status => status === 'correct')) {
        messageElement.innerText = "Word was found!";
        messageElement.style.color = 'green';
        wordsFound++;
        document.getElementById("wordsFound").innerText = wordsFound;

        // Save game stats to cookies
        saveGameStats();

        // Refresh the page after a short delay to allow the user to see the message
        setTimeout(() => location.reload(), 2000);
    } else {
        messageElement.innerText = "Try again!";
        messageElement.style.color = 'red';
    }

    // Add the guess to the recent guesses list and apply colors
    const newGuess = document.createElement("li");
    result.forEach((status, index) => {
        const letterSpan = document.createElement("span");
        letterSpan.innerText = input[index].toUpperCase();
        if (status === 'correct') {
            letterSpan.style.backgroundColor = 'green';
            letterSpan.style.color = 'white';
        } else if (status === 'misplaced') {
            letterSpan.style.backgroundColor = 'yellow';
        } else {
            letterSpan.style.backgroundColor = 'gray';
            letterSpan.style.color = 'white';
        }
        newGuess.appendChild(letterSpan);
    });

    recentGuessesList.appendChild(newGuess);
}

// Save game stats to cookies
function saveGameStats() {
    const avgGuesses = (guessCount / wordsFound).toFixed(2);
    document.cookie = `guessCount=${guessCount}; path=/;`;
    document.cookie = `wordsFound=${wordsFound}; path=/;`;
    document.cookie = `avgGuesses=${avgGuesses}; path=/;`;
}

// Load game stats from cookies
function loadGameStats() {
    const cookies = document.cookie.split('; ');
    cookies.forEach(cookie => {
        const [name, value] = cookie.split('=');
        if (name === 'guessCount') {
            guessCount = parseInt(value);
            document.getElementById("guessCount").innerText = guessCount;
        } else if (name === 'wordsFound') {
            wordsFound = parseInt(value);
            document.getElementById("wordsFound").innerText = wordsFound;
            let averageGuesses = Math.round(guessCount / wordsFound, 2)
            document.getElementById("averageGuesses").innerText = guessCount / wordsFound
        }


        
    });
}

// Handle form submission
document.getElementById("guessForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const input = document.getElementById("wordInput").value.trim();
    check(targetWord, input);
    document.getElementById("wordInput").value = ''; // Clear input field
});

// Select a random word when the page loads or a new word is requested
window.onload = function() {
    loadGameStats();
    loadNewWord();
};

document.getElementById("loadNewWord").addEventListener("click", loadNewWord);
