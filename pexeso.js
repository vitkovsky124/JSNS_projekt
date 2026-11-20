(() => {
  const imageFolder = "images/Small/";
  const imageFiles = [
    "Afghanske_divky_bio.png", "Afghanske_divky_cit.png",
    "Brendar_bio.png", "Brendar_cit.png",
    "Can_Thi_Theu_bio.png", "Can_Thi_Theu_cit.png",
    "Ela_bio.png", "Ela_cit.png",
    "Fatima_Rahimi_bio.png", "Fatima_Rahimi_cit.png",
    "Lartey_bio.png", "Lartey_cit.png",
    "Mahsa_Amini_bio.png", "Mahsa_Amini_cit.png",
    "Mia_Mitkevich_bio.png", "Mia_Mitkevich_cit.png",
    "Mikalaj_Statkevic_bio.png", "Mikalaj_Statkevic_cit.png",
    "Parastoo_Ahmadi_bio.png", "Parastoo_Ahmadi_cit.png",
    "Rowland_Castro_bio.png", "Rowland_Castro_cit.png",
    "Saadia_Mosbah_bio.png", "Saadia_Mosbah_cit.png",
    "Sergio_Ramirez_bio.png", "Sergio_Ramirez_cit.png",
    "Trinh_Ba_Phuong_bio.png", "Trinh_Ba_Phuong_cit.png",
    "Viktoria_Roscynova_bio.png", "Viktoria_Roscynova_cit.png"
  ];

  const board = document.querySelector("#board");
  const movesDisplay = document.querySelector("#moves");
  const pairsDisplay = document.querySelector("#pairs");
  const totalDisplay = document.querySelector(".stat-total");
  const winMessage = document.querySelector("#winMessage");
  const restartButton = document.querySelector("#restart");
  const pairSpotlight = document.querySelector("#pairSpotlight");
  const spotlightCards = document.querySelector("#spotlightCards");
  const continueButton = document.querySelector("#continueGame");
  const turnStatus = document.querySelector("#turnStatus");
  const playerScores = document.querySelector("#playerScores");
  const winResult = document.querySelector("#winResult");
  const returnHomeLink = document.querySelector(".return-home");
  const debugButton = document.querySelector("#debugPlay");
  const requestedPlayers = Number(new URLSearchParams(window.location.search).get("players"));
  const playerCount = Number.isInteger(requestedPlayers) && requestedPlayers >= 1 && requestedPlayers <= 4
    ? requestedPlayers
    : 1;

  let firstCard = null;
  let lockBoard = false;
  let moves = 0;
  let matchedPairs = 0;
  let currentPlayer = 0;
  let scores = [];
  let mismatchTimer;
  let debugTimer;
  let debugRunning = false;

  function updatePlayers() {
    turnStatus.textContent = matchedPairs === imageFiles.length / 2
      ? "Všechny karty jsou otočené. Hra skončila!"
      : `Na tahu je hráč ${currentPlayer + 1}`;
    playerScores.replaceChildren(...scores.map((score, index) => {
      const item = document.createElement("div");
      item.className = `player-score${index === currentPlayer && matchedPairs < imageFiles.length / 2 ? " is-current" : ""}`;
      item.setAttribute("aria-current", index === currentPlayer && matchedPairs < imageFiles.length / 2 ? "true" : "false");
      item.innerHTML = `<span>Hráč ${index + 1}</span><strong>${score}</strong><span class="score-label">${score === 1 ? "pár" : "párů"}</span>`;
      return item;
    }));
  }

  function finishGame() {
    stopDebug();
    const bestScore = Math.max(...scores);
    const winners = scores
      .map((score, index) => score === bestScore ? `hráč ${index + 1}` : null)
      .filter(Boolean);
    winResult.textContent = `${winners.length > 1 ? "Remíza:" : "Vyhrává"} ${winners.join(" a ")} s nejvyšším počtem nalezených párů (${bestScore}).`;
    winMessage.hidden = false;
    updatePlayers();
    returnHomeLink.focus();
  }

  function stopDebug() {
    debugRunning = false;
    window.clearTimeout(debugTimer);
    debugButton.textContent = "Debug start";
    debugButton.setAttribute("aria-pressed", "false");
  }

  function debugStep() {
    if (!debugRunning || matchedPairs === imageFiles.length / 2) return;

    if (!pairSpotlight.hidden) {
      continueGame();
      debugTimer = window.setTimeout(debugStep, 250);
      return;
    }
    if (lockBoard) {
      debugTimer = window.setTimeout(debugStep, 100);
      return;
    }

    const availableCards = [...board.querySelectorAll(".card:not(.is-open):not(.is-matched)")];
    if (availableCards.length === 0) {
      stopDebug();
      return;
    }

    const nextCard = availableCards[Math.floor(Math.random() * availableCards.length)];
    nextCard.click();
    debugTimer = window.setTimeout(debugStep, 300);
  }

  function toggleDebug() {
    if (debugRunning) {
      stopDebug();
      return;
    }
    debugRunning = true;
    debugButton.textContent = "Debug stop";
    debugButton.setAttribute("aria-pressed", "true");
    debugStep();
  }

  function namePrefix(file) {
    return file.replace(/\.[^.]+$/, "").replace(/[^a-z]/gi, "").slice(0, 3).toLowerCase();
  }

  function shuffledImages() {
    const images = imageFiles.map((file, id) => ({ id, file, prefix: namePrefix(file) }));
    for (let index = images.length - 1; index > 0; index--) {
      const otherIndex = Math.floor(Math.random() * (index + 1));
      [images[index], images[otherIndex]] = [images[otherIndex], images[index]];
    }
    return images;
  }

  function createCard(item, index) {
    const button = document.createElement("button");
    button.className = "card";
    button.type = "button";
    button.setAttribute("aria-label", `Card ${index + 1}, face down`);
    button.innerHTML = `
      <span class="card-inner">
        <span class="card-face card-back" aria-hidden="true"></span>
        <span class="card-face card-front"><img src="${imageFolder}${item.file}" alt="${item.file.replace(/\.png$/i, "").replaceAll("_", " ")}" draggable="false"></span>
      </span>`;
    button.addEventListener("click", () => flipCard(button, item));
    return button;
  }

  function flipCard(card, item) {
    if (lockBoard || card.classList.contains("is-open") || card.classList.contains("is-matched")) return;

    card.classList.add("is-open");
    card.setAttribute("aria-label", `Picture ${item.file.replace(/\.png$/i, "").replaceAll("_", " ")}`);

    if (!firstCard) {
      firstCard = { element: card, item };
      return;
    }

    moves += 1;
    movesDisplay.textContent = moves;
    const previous = firstCard;
    firstCard = null;

    if (previous.item.prefix === item.prefix) {
      previous.element.classList.add("is-matched");
      card.classList.add("is-matched");
      previous.element.setAttribute("aria-label", `Picture ${previous.item.file}, matched`);
      card.setAttribute("aria-label", `Picture ${item.file}, matched`);
      matchedPairs += 1;
      scores[currentPlayer] += 1;
      pairsDisplay.textContent = matchedPairs;
      updatePlayers();
      if (matchedPairs * 2 === imageFiles.length) {
        finishGame();
      } else {
        showPair(previous.item, item);
      }
      return;
    }

    lockBoard = true;
    mismatchTimer = window.setTimeout(() => {
      for (const missedCard of [previous, { element: card, item }]) {
        missedCard.element.classList.remove("is-open");
        missedCard.element.setAttribute("aria-label", "Face-down card");
      }
      lockBoard = false;
      currentPlayer = (currentPlayer + 1) % playerCount;
      updatePlayers();
    }, 850);
  }

  function showPair(first, second) {
    spotlightCards.replaceChildren(...[first, second].map((item) => {
      const image = document.createElement("img");
      image.src = `${imageFolder}${item.file}`;
      image.alt = item.file.replace(/\.png$/i, "").replaceAll("_", " ");
      return image;
    }));
    pairSpotlight.hidden = false;
    lockBoard = true;
    continueButton.focus();
  }

  function continueGame() {
    pairSpotlight.hidden = true;
    lockBoard = false;
  }

  function newGame() {
    window.clearTimeout(mismatchTimer);
    firstCard = null;
    lockBoard = false;
    moves = 0;
    matchedPairs = 0;
    scores = Array(playerCount).fill(0);
    currentPlayer = Math.floor(Math.random() * playerCount);
    movesDisplay.textContent = "0";
    pairsDisplay.textContent = "0";
    totalDisplay.textContent = ` / ${imageFiles.length / 2}`;
    winMessage.hidden = true;
    pairSpotlight.hidden = true;
    updatePlayers();
    board.replaceChildren(...shuffledImages().map(createCard));
  }

  restartButton.addEventListener("click", () => {
    window.location.href = "uvodni_stranka.html";
  });
  debugButton.addEventListener("click", toggleDebug);
  continueButton.addEventListener("click", continueGame);
  newGame();
})();





