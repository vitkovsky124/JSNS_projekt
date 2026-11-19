(() => {
  const imageFolder = "images/";
  const filePrefix = "26122_CLK_lidskopravni_kampan_80x80_pexeso_05_96dpi_";
  const board = document.querySelector("#board");
  const movesDisplay = document.querySelector("#moves");
  const pairsDisplay = document.querySelector("#pairs");
  const winMessage = document.querySelector("#winMessage");
  const finalMoves = document.querySelector("#finalMoves");
  const restartButton = document.querySelector("#restart");
  const playAgainButton = document.querySelector("#playAgain");

  let firstCard = null;
  let lockBoard = false;
  let moves = 0;
  let matchedPairs = 0;
  let mismatchTimer;

  function shuffledCards() {
    const cards = Array.from({ length: 31 }, (_, index) => ({
      id: index + 1,
      image: `${imageFolder}${filePrefix}${String(index + 1).padStart(2, "0")}.png`
    })).flatMap((card) => [card, { ...card }]);
    for (let index = cards.length - 1; index > 0; index--) {
      const otherIndex = Math.floor(Math.random() * (index + 1));
      [cards[index], cards[otherIndex]] = [cards[otherIndex], cards[index]];
    }
    return cards;
  }

  function createCard(item, index) {
    const button = document.createElement("button");
    button.className = "card";
    button.type = "button";
    button.dataset.pair = item.id;
    button.setAttribute("aria-label", `Card ${index + 1}, face down`);
    button.innerHTML = `
      <span class="card-inner">
        <span class="card-face card-back" aria-hidden="true"></span>
        <span class="card-face card-front"><img src="${item.image}" alt="Picture ${item.id}" draggable="false"></span>
      </span>`;
    button.addEventListener("click", () => flipCard(button, item));
    return button;
  }

  function flipCard(card, item) {
    if (lockBoard || card.classList.contains("is-open") || card.classList.contains("is-matched")) return;
    card.classList.add("is-open");
    card.setAttribute("aria-label", `Picture ${item.id}`);

    if (!firstCard) {
      firstCard = { element: card, item };
      return;
    }

    moves += 1;
    movesDisplay.textContent = moves;
    if (firstCard.item.id === item.id) {
      firstCard.element.classList.add("is-matched");
      card.classList.add("is-matched");
      firstCard.element.setAttribute("aria-label", `Picture ${item.id}, matched`);
      card.setAttribute("aria-label", `Picture ${item.id}, matched`);
      matchedPairs += 1;
      pairsDisplay.textContent = matchedPairs;
      firstCard = null;
      if (matchedPairs === 31) {
        finalMoves.textContent = moves;
        winMessage.hidden = false;
      }
      return;
    }

    lockBoard = true;
    const previous = firstCard.element;
    firstCard = null;
    mismatchTimer = window.setTimeout(() => {
      previous.classList.remove("is-open");
      card.classList.remove("is-open");
      previous.setAttribute("aria-label", "Face-down card");
      card.setAttribute("aria-label", "Face-down card");
      lockBoard = false;
    }, 850);
  }

  function newGame() {
    window.clearTimeout(mismatchTimer);
    firstCard = null;
    lockBoard = false;
    moves = 0;
    matchedPairs = 0;
    movesDisplay.textContent = "0";
    pairsDisplay.textContent = "0";
    winMessage.hidden = true;
    board.replaceChildren(...shuffledCards().map(createCard));
  }

  restartButton.addEventListener("click", newGame);
  playAgainButton.addEventListener("click", newGame);
  newGame();
})();
