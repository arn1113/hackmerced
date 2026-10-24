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

let firstCard = null;
let secondCard = null;
let moves = 0;
let pairs = 0;
let secondsLeft = roundLength;
let timerId = null;
let flipTimeoutId = null;
let locked = true;

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
