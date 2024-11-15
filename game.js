const API_URL = "https://random-word-api.herokuapp.com/word?number=1&length=";

// This will hold the randomly chosen word
let targetWord = "";

// Function to fetch a random word from the API
async function fetchRandomWord(length) {
    try {
        const response = await fetch(`${API_URL}${length}`);
        const data = await response.json();
        if (data && data.length > 0) {
            return data[0].toLowerCase();
        } else {
            return null;  // If no word is returned, we can handle it here
        }
    } catch (error) {
        console.error("Error fetching word:", error);
        return null;
    }
}

// Function to load a new word based on the user's chosen length
async function loadNewWord() {
    const length = parseInt(document.getElementById("wordLength").value);
    targetWord = await fetchRandomWord(length);
    if (targetWord) {
        console.log(`The target word is: ${targetWord}`);  // For debugging
        document.getElementById("message").textContent = `New word loaded: ${targetWord.length} letters.`;
    } else {
        document.getElementById("message").textContent = "Failed to load word. Please try again.";
    }
}

// Select a random word when the page loads or a new word is requested
window.onload = loadNewWord;

document.getElementById("loadNewWord").addEventListener("click", loadNewWord);

// Function to check if the input matches the target word
function check(word, input) {
    const messageElement = document.getElementById("message");
    const lengthMessageElement = document.getElementById("wordLengthMessage");
    const recentGuessesList = document.getElementById("recentGuessesList");

    // If the input is empty or doesn't match the length of the target word
    if (input.length !== word.length) {
        lengthMessageElement.textContent = `Your guess must be ${word.length} characters long.`;
        messageElement.textContent = '';  // Clear any other messages
        return;
    } else {
        lengthMessageElement.textContent = '';  // Clear length mismatch message
    }

    // Check if the word matches (case-insensitive)
    if (word.toLowerCase() === input.toLowerCase()) {
        messageElement.textContent = "Word was found!";
        messageElement.style.color = 'green';
    } else {
        messageElement.textContent = "Try again!";
        messageElement.style.color = 'red';
    }

    // Check if the guess is close (first letter matches)
    if (word.toLowerCase().charAt(0) === input.toLowerCase().charAt(0)) {
        messageElement.textContent += " You're close!";
        messageElement.style.color = 'orange';
    }

    // Add the guess to the recent guesses list
    const newGuess = document.createElement("li");
    newGuess.textContent = input;
    
    // Highlight close guesses
    if (word.toLowerCase().charAt(0) === input.toLowerCase().charAt(0)) {
        newGuess.classList.add("close-guess");
    }

    recentGuessesList.appendChild(newGuess);
}

// Handle form submission and check user input
document.getElementById("guessForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const input = document.getElementById("wordInput").value.trim();

    // Check the input against the target word
    check(targetWord, input);

    // Clear the input field after submission
    document.getElementById("wordInput").value = '';
});