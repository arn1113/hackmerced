const cardFaces = [
    { name: "Idea", icon: "💡" },
    { name: "Team", icon: "🤝" },
    { name: "Code", icon: "💻" },
    { name: "Design", icon: "🎨" },
    { name: "Debug", icon: "🛠️" },
    { name: "Demo", icon: "🚀" },
];
const roundLength = 45;
const board = document.querySelector("#game-board");
const startButton = document.querySelector("#game-start");
const timeDisplay = document.querySelector("#game-time");
const movesDisplay = document.querySelector("#game-moves");
const pairsDisplay = document.querySelector("#game-pairs");
const message = document.querySelector("#game-message");
const gameChoices = document.querySelectorAll(".game-choice");
const gamePanels = document.querySelectorAll(".game-panel");
const reactionStart = document.querySelector("#reaction-start");
const reactionPad = document.querySelector("#reaction-pad");
const reactionMessage = document.querySelector("#reaction-message");
const scrambleStart = document.querySelector("#scramble-start");
const scrambleTime = document.querySelector("#scramble-time");
const scrambleScoreDisplay = document.querySelector("#scramble-score");
const scrambleLetters = document.querySelector("#scramble-letters");
const scrambleForm = document.querySelector("#scramble-form");
const scrambleAnswer = document.querySelector("#scramble-answer");
const scrambleSubmit = document.querySelector("#scramble-submit");
const scrambleMessage = document.querySelector("#scramble-message");

let firstCard = null;
let secondCard = null;
let moves = 0;
let pairs = 0;
let secondsLeft = roundLength;
let timerId = null;
let flipTimeoutId = null;
let locked = true;
let reactionTimeoutId = null;
let reactionStartedAt = 0;
let reactionState = "idle";
let scrambleTimerId = null;
let scrambleSecondsLeft = roundLength;
let scrambleScore = 0;
let currentWord = "";
let scrambleActive = false;

const scrambleWords = ["CREATE", "TEAMWORK", "PROTOTYPE", "DEBUG", "INNOVATE"];

function makeDeck() {
    const deck = cardFaces.flatMap((face) => [face, face]);
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
    pairsDisplay.textContent = `${pairs} / ${cardFaces.length}`;
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
    secondsLeft = roundLength;
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

        if (pairs === cardFaces.length) {
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
    if (wasRunning) {
        scrambleMessage.textContent = "Round paused. Start again when you’re ready.";
    }
}

function selectGame(gameName) {
    if (document.querySelector(`#game-${gameName}`).hidden === false) {
        return;
    }

    stopMemoryGame();
    stopReactionGame();
    stopScrambleGame();

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
    reactionTimeoutId = window.setTimeout(() => {
        reactionState = "go";
        reactionStartedAt = performance.now();
        reactionPad.classList.add("is-go");
        reactionPad.textContent = "CLICK!";
        reactionMessage.textContent = "Now! Tap the button!";
        reactionTimeoutId = null;
    }, 1200 + Math.random() * 2800);
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
        reactionMessage.textContent = reactionTime < 250
            ? "Lightning fast! Nice reflexes."
            : "Nice reaction! Can you beat that?";
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
    currentWord = scrambleWords[Math.floor(Math.random() * scrambleWords.length)];
    scrambleLetters.textContent = makeScrambledWord(currentWord);
    scrambleAnswer.value = "";
    scrambleAnswer.focus();
}

function finishScrambleRound() {
    window.clearInterval(scrambleTimerId);
    scrambleTimerId = null;
    scrambleActive = false;
    scrambleAnswer.disabled = true;
    scrambleSubmit.disabled = true;
    scrambleStart.textContent = "Play again";
    scrambleLetters.textContent = "Time!";
    scrambleMessage.textContent = `Round over! You solved ${scrambleScore} ${scrambleScore === 1 ? "word" : "words"}.`;
}

function startScrambleRound() {
    window.clearInterval(scrambleTimerId);
    scrambleSecondsLeft = roundLength;
    scrambleScore = 0;
    scrambleActive = true;
    scrambleTime.textContent = `${scrambleSecondsLeft}s`;
    scrambleScoreDisplay.textContent = String(scrambleScore);
    scrambleStart.textContent = "Restart";
    scrambleAnswer.disabled = false;
    scrambleSubmit.disabled = false;
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

gameChoices.forEach((choice) => {
    choice.addEventListener("click", () => selectGame(choice.dataset.game));
});
reactionStart.addEventListener("click", startReactionTest);
reactionPad.addEventListener("click", handleReactionClick);
scrambleStart.addEventListener("click", startScrambleRound);
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
