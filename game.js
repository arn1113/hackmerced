const cardFaces = [
    { name: "Idea", icon: "💡" },
    { name: "Team", icon: "🤝" },
    { name: "Code", icon: "💻" },
    { name: "Design", icon: "🎨" },
    { name: "Debug", icon: "🛠️" },
    { name: "Demo", icon: "🚀" },
    { name: "Cloud", icon: "☁️" },
    { name: "Data", icon: "📊" },
];
const difficulties = {
    easy: { label: "Chill", pairs: 4, seconds: 60, reactionTarget: 600, reactionDelay: [900, 1800] },
    medium: { label: "Standard", pairs: 6, seconds: 45, reactionTarget: 400, reactionDelay: [1200, 3000] },
    hard: { label: "Expert", pairs: 8, seconds: 30, reactionTarget: 250, reactionDelay: [1800, 4000] },
};
const board = document.querySelector("#game-board");
const startButton = document.querySelector("#game-start");
const timeDisplay = document.querySelector("#game-time");
const movesDisplay = document.querySelector("#game-moves");
const pairsDisplay = document.querySelector("#game-pairs");
const message = document.querySelector("#game-message");
const difficultySelect = document.querySelector("#game-difficulty");
const difficultyDescription = document.querySelector("#difficulty-description");
const memoryDescription = document.querySelector("#memory-description");
const gameChoices = document.querySelectorAll(".game-choice");
const gamePanels = document.querySelectorAll(".game-panel");
const reactionStart = document.querySelector("#reaction-start");
const reactionPad = document.querySelector("#reaction-pad");
const reactionMessage = document.querySelector("#reaction-message");
const scrambleStart = document.querySelector("#scramble-start");
const scrambleTime = document.querySelector("#scramble-time");
const scrambleScoreDisplay = document.querySelector("#scramble-score");
const scrambleSkipsDisplay = document.querySelector("#scramble-skips");
const scrambleLetters = document.querySelector("#scramble-letters");
const scrambleForm = document.querySelector("#scramble-form");
const scrambleAnswer = document.querySelector("#scramble-answer");
const scrambleSubmit = document.querySelector("#scramble-submit");
const scrambleSkip = document.querySelector("#scramble-skip");
const scrambleMessage = document.querySelector("#scramble-message");
const triviaStart = document.querySelector("#trivia-start");
const triviaProgress = document.querySelector("#trivia-progress");
const triviaScoreDisplay = document.querySelector("#trivia-score");
const triviaQuestion = document.querySelector("#trivia-question");
const triviaOptions = document.querySelector("#trivia-options");
const triviaMessage = document.querySelector("#trivia-message");
const typingStart = document.querySelector("#typing-start");
const typingTime = document.querySelector("#typing-time");
const typingScoreDisplay = document.querySelector("#typing-score");
const typingPrompt = document.querySelector("#typing-prompt");
const typingForm = document.querySelector("#typing-form");
const typingInput = document.querySelector("#typing-input");
const typingSubmit = document.querySelector("#typing-submit");
const typingMessage = document.querySelector("#typing-message");

let firstCard = null;
let secondCard = null;
let moves = 0;
let pairs = 0;
let secondsLeft = difficulties[difficultySelect.value].seconds;
let timerId = null;
let flipTimeoutId = null;
let locked = true;
let reactionTimeoutId = null;
let reactionStartedAt = 0;
let reactionState = "idle";
let scrambleTimerId = null;
let scrambleSecondsLeft = difficulties[difficultySelect.value].seconds;
let scrambleScore = 0;
let scrambleSkips = 0;
let currentWord = "";
let scrambleWordDeck = [];
let scrambleActive = false;
let triviaQuestions = [];
let triviaIndex = 0;
let triviaScore = 0;
let triviaActive = false;
let previousTriviaAnswerPosition = -1;
let typingTimerId = null;
let typingSecondsLeft = difficulties[difficultySelect.value].seconds;
let typingScore = 0;
let typingActive = false;

const scrambleWords = [
    { word: "CODE", level: "easy" },
    { word: "TEAM", level: "easy" },
    { word: "IDEA", level: "easy" },
    { word: "BUILD", level: "easy" },
    { word: "PLAN", level: "easy" },
    { word: "BUG", level: "easy" },
    { word: "TEST", level: "easy" },
    { word: "SHIP", level: "easy" },
    { word: "CREATE", level: "medium" },
    { word: "DEBUG", level: "medium" },
    { word: "INNOVATE", level: "medium" },
    { word: "TEAMWORK", level: "medium" },
    { word: "FRONTEND", level: "medium" },
    { word: "DATABASE", level: "medium" },
    { word: "FUNCTION", level: "medium" },
    { word: "DESIGNER", level: "medium" },
    { word: "PROTOTYPE", level: "hard" },
    { word: "JAVASCRIPT", level: "hard" },
    { word: "HACKATHON", level: "hard" },
    { word: "COLLABORATE", level: "hard" },
    { word: "ALGORITHM", level: "hard" },
    { word: "ACCESSIBILITY", level: "hard" },
    { word: "DEPLOYMENT", level: "hard" },
    { word: "ASYNCHRONOUS", level: "hard" },
];
const typingPhrases = {
    easy: ["Build something cool.", "Ideas become projects."],
    medium: ["Great teams turn ideas into prototypes.", "Try, learn, build, and share."],
    hard: ["Curiosity, collaboration, and code can change everything.", "Ship a thoughtful prototype before the hackathon clock runs out."],
};
const triviaBank = {
    easy: [
        { question: "Which one is a programming language?", options: ["JavaScript", "JPEG", "Wi-Fi"], answer: "JavaScript" },
        { question: "What does HTML help define?", options: ["Web page structure", "Battery life", "Screen brightness"], answer: "Web page structure" },
        { question: "Which key usually adds a new line in a code editor?", options: ["Enter", "Escape", "Caps Lock"], answer: "Enter" },
        { question: "What is a bug in software?", options: ["An error in a program", "A design color", "A keyboard shortcut"], answer: "An error in a program" },
        { question: "Which is commonly used to style web pages?", options: ["CSS", "GPS", "USB"], answer: "CSS" },
    ],
    medium: [
        { question: "What does Git primarily help developers do?", options: ["Track changes to files", "Design logos", "Host video calls"], answer: "Track changes to files" },
        { question: "Which HTTP method is commonly used to retrieve data?", options: ["GET", "PAINT", "PUSH"], answer: "GET" },
        { question: "What does an API let software do?", options: ["Communicate with other software", "Charge a laptop", "Resize a monitor"], answer: "Communicate with other software" },
        { question: "Which value represents an array with no items in JavaScript?", options: ["[]", "{}", "null"], answer: "[]" },
        { question: "What is a database index designed to improve?", options: ["Lookup speed", "Font size", "Image quality"], answer: "Lookup speed" },
    ],
    hard: [
        { question: "What does a SQL LEFT JOIN keep from the left table?", options: ["Every row, matching right rows when available", "Only rows with no match", "Only the first row"], answer: "Every row, matching right rows when available" },
        { question: "What is a race condition?", options: ["An outcome that depends on timing between operations", "A slow image download", "A syntax highlighting theme"], answer: "An outcome that depends on timing between operations" },
        { question: "What does Big O notation describe?", options: ["How resource use scales with input size", "How old a programming language is", "How many files are in a project"], answer: "How resource use scales with input size" },
        { question: "Which status code usually means a request was unauthorized?", options: ["401", "201", "302"], answer: "401" },
        { question: "What is memoization?", options: ["Caching results of function calls", "Renaming variables", "Formatting a database table"], answer: "Caching results of function calls" },
    ],
};

function currentDifficulty() {
    return difficulties[difficultySelect.value];
}

function makeDeck() {
    const deck = cardFaces.slice(0, currentDifficulty().pairs).flatMap((face) => [face, face]);
    for (let index = deck.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
    }
    return deck;
}

function renderBoard() {
    board.replaceChildren();
    makeDeck().forEach((face, index) => {
        const card = document.createElement("button");
        card.className = "game-card";
        card.type = "button";
        card.disabled = true;
        card.dataset.name = face.name;
        card.setAttribute("aria-label", `Card ${index + 1}, hidden`);
        card.innerHTML = '<span class="game-card-back" aria-hidden="true">HM<span>26</span></span><span class="game-card-face" aria-hidden="true"><span class="game-card-icon"></span><span class="game-card-name"></span></span>';
        card.querySelector(".game-card-icon").textContent = face.icon;
        card.querySelector(".game-card-name").textContent = face.name;
        card.addEventListener("click", () => revealCard(card));
        board.append(card);
    });
}

function updateStats() {
    timeDisplay.textContent = `${secondsLeft}s`;
    movesDisplay.textContent = String(moves);
    pairsDisplay.textContent = `${pairs} / ${currentDifficulty().pairs}`;
}

function finishRound(won) {
    window.clearInterval(timerId);
    window.clearTimeout(flipTimeoutId);
    timerId = null;
    flipTimeoutId = null;
    firstCard = null;
    secondCard = null;
    locked = true;
    board.querySelectorAll(".game-card").forEach((card) => {
        card.disabled = true;
    });
    startButton.textContent = "Play again";
    message.textContent = won
        ? `You found every pair in ${moves} moves. Nice teamwork!`
        : "Time’s up! Give it another sprint.";
}

function startRound() {
    window.clearInterval(timerId);
    window.clearTimeout(flipTimeoutId);
    flipTimeoutId = null;
    firstCard = null;
    secondCard = null;
    moves = 0;
    pairs = 0;
    secondsLeft = currentDifficulty().seconds;
    locked = false;
    renderBoard();
    board.querySelectorAll(".game-card").forEach((card) => {
        card.disabled = false;
    });
    updateStats();
    startButton.textContent = "Restart";
    message.textContent = "Find all six pairs before time runs out.";
    timerId = window.setInterval(() => {
        secondsLeft -= 1;
        updateStats();
        if (secondsLeft <= 0) {
            finishRound(false);
        }
    }, 1000);
}

function revealCard(card) {
    if (locked || card.classList.contains("is-revealed") || card.classList.contains("is-matched")) {
        return;
    }

    card.classList.add("is-revealed");
    card.setAttribute("aria-label", `${card.dataset.name}, revealed`);

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    moves += 1;
    updateStats();

    if (firstCard.dataset.name === secondCard.dataset.name) {
        firstCard.classList.add("is-matched");
        secondCard.classList.add("is-matched");
        firstCard.setAttribute("aria-label", `${firstCard.dataset.name}, matched`);
        secondCard.setAttribute("aria-label", `${secondCard.dataset.name}, matched`);
        firstCard.disabled = true;
        secondCard.disabled = true;
        pairs += 1;
        updateStats();
        firstCard = null;
        secondCard = null;

        if (pairs === currentDifficulty().pairs) {
            finishRound(true);
        }
        return;
    }

    locked = true;
    flipTimeoutId = window.setTimeout(() => {
        firstCard.classList.remove("is-revealed");
        secondCard.classList.remove("is-revealed");
        firstCard.setAttribute("aria-label", "Hidden card");
        secondCard.setAttribute("aria-label", "Hidden card");
        firstCard = null;
        secondCard = null;
        locked = false;
        flipTimeoutId = null;
    }, 750);
}

startButton.addEventListener("click", startRound);
renderBoard();
updateStats();

function stopMemoryGame() {
    const wasRunning = timerId !== null;
    window.clearInterval(timerId);
    window.clearTimeout(flipTimeoutId);
    timerId = null;
    flipTimeoutId = null;
    firstCard = null;
    secondCard = null;
    locked = true;
    board.querySelectorAll(".game-card").forEach((card) => {
        card.disabled = true;
    });
    if (wasRunning) {
        startButton.textContent = "Start game";
        message.textContent = "Round paused. Start again when you’re ready.";
    }
}

function stopReactionGame() {
    const wasRunning = reactionState === "waiting" || reactionState === "go";
    window.clearTimeout(reactionTimeoutId);
    reactionTimeoutId = null;
    reactionState = "idle";
    reactionStart.disabled = false;
    reactionStart.textContent = "Start test";
    reactionPad.disabled = true;
    reactionPad.classList.remove("is-go");
    reactionPad.textContent = "Ready when you are";
    if (wasRunning) {
        reactionMessage.textContent = "Round paused. Start again when you’re ready.";
    }
}

function stopScrambleGame() {
    const wasRunning = scrambleActive;
    window.clearInterval(scrambleTimerId);
    scrambleTimerId = null;
    scrambleActive = false;
    scrambleStart.textContent = "Start round";
    scrambleAnswer.disabled = true;
    scrambleSubmit.disabled = true;
    scrambleSkip.disabled = true;
    if (wasRunning) {
        scrambleMessage.textContent = "Round paused. Start again when you’re ready.";
    }
}

function stopTriviaGame() {
    const wasRunning = triviaActive;
    triviaActive = false;
    triviaStart.textContent = "Start quiz";
    triviaOptions.querySelectorAll("button").forEach((button) => {
        button.disabled = true;
    });
    if (wasRunning) {
        triviaMessage.textContent = "Quiz paused. Start again when you’re ready.";
    }
}

function stopTypingGame() {
    const wasRunning = typingActive;
    window.clearInterval(typingTimerId);
    typingTimerId = null;
    typingActive = false;
    typingInput.disabled = true;
    typingSubmit.disabled = true;
    typingStart.textContent = "Start sprint";
    if (wasRunning) {
        typingMessage.textContent = "Sprint paused. Start again when you’re ready.";
    }
}

function selectGame(gameName) {
    if (document.querySelector(`#game-${gameName}`).hidden === false) {
        return;
    }

    stopMemoryGame();
    stopReactionGame();
    stopScrambleGame();
    stopTriviaGame();
    stopTypingGame();

    gameChoices.forEach((choice) => {
        const selected = choice.dataset.game === gameName;
        choice.classList.toggle("is-selected", selected);
        choice.setAttribute("aria-pressed", String(selected));
    });
    gamePanels.forEach((panel) => {
        panel.hidden = panel.id !== `game-${gameName}`;
    });
}

function startReactionTest() {
    window.clearTimeout(reactionTimeoutId);
    reactionState = "waiting";
    reactionStart.disabled = true;
    reactionPad.disabled = false;
    reactionPad.classList.remove("is-go");
    reactionPad.textContent = "Wait for green…";
    reactionMessage.textContent = "Get ready…";
    const [minimumDelay, maximumDelay] = currentDifficulty().reactionDelay;
    reactionTimeoutId = window.setTimeout(() => {
        reactionState = "go";
        reactionStartedAt = performance.now();
        reactionPad.classList.add("is-go");
        reactionPad.textContent = "CLICK!";
        reactionMessage.textContent = "Now! Tap the button!";
        reactionTimeoutId = null;
    }, minimumDelay + Math.random() * (maximumDelay - minimumDelay));
}

function handleReactionClick() {
    if (reactionState === "waiting") {
        window.clearTimeout(reactionTimeoutId);
        reactionTimeoutId = null;
        reactionState = "idle";
        reactionPad.disabled = true;
        reactionPad.textContent = "Too soon!";
        reactionStart.disabled = false;
        reactionStart.textContent = "Try again";
        reactionMessage.textContent = "False start! Wait for the green signal next time.";
    } else if (reactionState === "go") {
        const reactionTime = Math.round(performance.now() - reactionStartedAt);
        reactionState = "done";
        reactionPad.disabled = true;
        reactionPad.textContent = `${reactionTime} ms`;
        reactionStart.disabled = false;
        reactionStart.textContent = "Try again";
        reactionMessage.textContent = reactionTime <= currentDifficulty().reactionTarget
            ? `Great job! You beat the ${currentDifficulty().reactionTarget} ms ${currentDifficulty().label} target.`
            : `${reactionTime} ms. Try to beat the ${currentDifficulty().reactionTarget} ms target!`;
    }
}

function makeScrambledWord(word) {
    const letters = word.split("");
    do {
        for (let index = letters.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [letters[index], letters[swapIndex]] = [letters[swapIndex], letters[index]];
        }
    } while (letters.join("") === word);
    return letters.join(" ");
}

function nextScrambleWord() {
    if (scrambleWordDeck.length === 0) {
        finishScrambleRound("You unscrambled every unique word in this round. Great work!");
        return;
    }
    currentWord = scrambleWordDeck.pop();
    scrambleLetters.textContent = makeScrambledWord(currentWord);
    scrambleAnswer.value = "";
    scrambleAnswer.focus();
}

function finishScrambleRound(resultMessage) {
    window.clearInterval(scrambleTimerId);
    scrambleTimerId = null;
    scrambleActive = false;
    scrambleAnswer.disabled = true;
    scrambleSubmit.disabled = true;
    scrambleSkip.disabled = true;
    scrambleStart.textContent = "Play again";
    scrambleLetters.textContent = resultMessage ? "Round complete!" : "Time!";
    scrambleMessage.textContent = resultMessage ??
        `Round over! You solved ${scrambleScore} ${scrambleScore === 1 ? "word" : "words"}.`;
}

function startScrambleRound() {
    window.clearInterval(scrambleTimerId);
    scrambleSecondsLeft = currentDifficulty().seconds;
    scrambleScore = 0;
    scrambleSkips = 0;
    scrambleActive = true;
    scrambleWordDeck = shuffle(scrambleWords
        .filter((entry) => entry.level === difficultySelect.value)
        .map((entry) => entry.word));
    scrambleTime.textContent = `${scrambleSecondsLeft}s`;
    scrambleScoreDisplay.textContent = String(scrambleScore);
    scrambleSkipsDisplay.textContent = String(scrambleSkips);
    scrambleStart.textContent = "Restart";
    scrambleAnswer.disabled = false;
    scrambleSubmit.disabled = false;
    scrambleSkip.disabled = false;
    scrambleMessage.textContent = "Unscramble the letters and submit your guess.";
    nextScrambleWord();
    scrambleTimerId = window.setInterval(() => {
        scrambleSecondsLeft -= 1;
        scrambleTime.textContent = `${scrambleSecondsLeft}s`;
        if (scrambleSecondsLeft <= 0) {
            finishScrambleRound();
        }
    }, 1000);
}

function skipScrambleWord() {
    if (!scrambleActive) {
        return;
    }
    scrambleSkips += 1;
    scrambleSkipsDisplay.textContent = String(scrambleSkips);
    scrambleMessage.textContent = `Skipped ${currentWord}. Here comes another.`;
    nextScrambleWord();
}

function shuffle(items) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
}

function showTriviaQuestion() {
    const question = triviaQuestions[triviaIndex];
    triviaProgress.textContent = `${triviaIndex + 1} / ${triviaQuestions.length}`;
    triviaQuestion.textContent = question.question;
    triviaOptions.replaceChildren();
    const correctPositionChoices = [0, 1, 2].filter((position) => position !== previousTriviaAnswerPosition);
    const correctPosition = correctPositionChoices[Math.floor(Math.random() * correctPositionChoices.length)];
    previousTriviaAnswerPosition = correctPosition;
    const options = shuffle(question.options.filter((option) => option !== question.answer));
    options.splice(correctPosition, 0, question.answer);
    options.forEach((option) => {
        const button = document.createElement("button");
        button.className = "trivia-option";
        button.type = "button";
        button.textContent = option;
        button.addEventListener("click", () => answerTriviaQuestion(button, question.answer));
        triviaOptions.append(button);
    });
    triviaMessage.textContent = "Choose your answer.";
    triviaStart.textContent = "Quiz in progress";
    triviaStart.disabled = true;
    triviaAnswered = false;
}

function startTriviaRound() {
    triviaQuestions = shuffle(triviaBank[difficultySelect.value]);
    triviaIndex = 0;
    triviaScore = 0;
    triviaActive = true;
    triviaAnswered = false;
    previousTriviaAnswerPosition = -1;
    triviaScoreDisplay.textContent = "0";
    showTriviaQuestion();
}

function answerTriviaQuestion(selectedButton, correctAnswer) {
    if (!triviaActive || triviaAnswered) {
        return;
    }
    triviaAnswered = true;
    const correct = selectedButton.textContent === correctAnswer;
    if (correct) {
        triviaScore += 1;
        triviaScoreDisplay.textContent = String(triviaScore);
    }
    triviaOptions.querySelectorAll("button").forEach((button) => {
        button.disabled = true;
        if (button.textContent === correctAnswer) {
            button.classList.add("is-correct");
        }
    });
    if (!correct) {
        selectedButton.classList.add("is-incorrect");
    }

    if (triviaIndex === triviaQuestions.length - 1) {
        triviaActive = false;
        triviaStart.disabled = false;
        triviaStart.textContent = "Play again";
        triviaMessage.textContent = `${correct ? "Correct!" : "Not quite."} Final score: ${triviaScore} / ${triviaQuestions.length}.`;
        return;
    }
    triviaMessage.textContent = correct ? "Correct! Ready for the next one?" : `Not quite—the answer is ${correctAnswer}.`;
    triviaStart.disabled = false;
    triviaStart.textContent = "Next question";
}

function finishTypingSprint() {
    window.clearInterval(typingTimerId);
    typingTimerId = null;
    typingActive = false;
    typingInput.disabled = true;
    typingSubmit.disabled = true;
    typingStart.textContent = "Play again";
    typingMessage.textContent = `Time! You completed ${typingScore} ${typingScore === 1 ? "phrase" : "phrases"}.`;
    typingPrompt.textContent = "Sprint complete!";
}

function nextTypingPhrase() {
    const phrases = typingPhrases[difficultySelect.value];
    typingPrompt.textContent = phrases[Math.floor(Math.random() * phrases.length)];
    typingInput.value = "";
    typingInput.focus();
}

function startTypingSprint() {
    window.clearInterval(typingTimerId);
    typingSecondsLeft = currentDifficulty().seconds;
    typingScore = 0;
    typingActive = true;
    typingTime.textContent = `${typingSecondsLeft}s`;
    typingScoreDisplay.textContent = "0";
    typingStart.textContent = "Restart";
    typingInput.disabled = false;
    typingSubmit.disabled = false;
    typingMessage.textContent = "Type the phrase exactly, then check it.";
    nextTypingPhrase();
    typingTimerId = window.setInterval(() => {
        typingSecondsLeft -= 1;
        typingTime.textContent = `${typingSecondsLeft}s`;
        if (typingSecondsLeft <= 0) {
            finishTypingSprint();
        }
    }, 1000);
}

function updateDifficulty() {
    const level = difficultySelect.value;
    const settings = currentDifficulty();
    const descriptions = {
        easy: "Chill: fewer memory cards, shorter words, and a generous timer.",
        medium: "Standard: a balanced challenge for your next break.",
        hard: "Expert: more memory cards, longer words, and less time.",
    };
    stopMemoryGame();
    stopReactionGame();
    stopScrambleGame();
    stopTriviaGame();
    stopTypingGame();
    moves = 0;
    pairs = 0;
    secondsLeft = settings.seconds;
    renderBoard();
    board.querySelectorAll(".game-card").forEach((card) => {
        card.disabled = true;
    });
    updateStats();
    difficultyDescription.textContent = descriptions[level];
    memoryDescription.textContent = `Match all ${settings.pairs} pairs before the ${settings.seconds}-second sprint runs out.`;
    scrambleSecondsLeft = settings.seconds;
    scrambleTime.textContent = `${settings.seconds}s`;
    typingSecondsLeft = settings.seconds;
    typingTime.textContent = `${settings.seconds}s`;
    reactionMessage.textContent = `Beat the ${settings.reactionTarget} ms ${settings.label} target.`;
}

gameChoices.forEach((choice) => {
    choice.addEventListener("click", () => selectGame(choice.dataset.game));
});
reactionStart.addEventListener("click", startReactionTest);
reactionPad.addEventListener("click", handleReactionClick);
scrambleStart.addEventListener("click", startScrambleRound);
scrambleSkip.addEventListener("click", skipScrambleWord);
triviaStart.addEventListener("click", () => {
    if (!triviaActive) {
        startTriviaRound();
        return;
    }
    if (triviaAnswered) {
        triviaIndex += 1;
        showTriviaQuestion();
    }
});
typingStart.addEventListener("click", startTypingSprint);
difficultySelect.addEventListener("change", updateDifficulty);
scrambleForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!scrambleActive) {
        return;
    }

    if (scrambleAnswer.value.trim().toUpperCase() === currentWord) {
        scrambleScore += 1;
        scrambleScoreDisplay.textContent = String(scrambleScore);
        scrambleMessage.textContent = "That’s it! Here comes another.";
        nextScrambleWord();
    } else {
        scrambleMessage.textContent = "Not quite—give those letters another look.";
        scrambleAnswer.select();
    }
});
typingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!typingActive) {
        return;
    }
    if (typingInput.value.trim() === typingPrompt.textContent) {
        typingScore += 1;
        typingScoreDisplay.textContent = String(typingScore);
        typingMessage.textContent = "Perfect! Here comes another phrase.";
        nextTypingPhrase();
    } else {
        typingMessage.textContent = "Not quite—check the phrase and try again.";
        typingInput.select();
    }
});

let triviaAnswered = false;
updateDifficulty();
