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
  const requestedPlayers = Number(new URLSearchParams(window.location.search).get("players"));
  const playerCount = Number.isInteger(requestedPlayers) && requestedPlayers >= 1 && requestedPlayers <= 4
    ? requestedPlayers
    : 1;
  const hasBot = playerCount === 1;
  const totalPlayers = hasBot ? 2 : playerCount;
  const requestedDifficulty = new URLSearchParams(window.location.search).get("difficulty");
  const botDifficulty = ["easy", "medium", "hard"].includes(requestedDifficulty) ? requestedDifficulty : "medium";
  const playerNames = new URLSearchParams(window.location.search).getAll("name")
    .slice(0, playerCount)
    .map((name, index) => name.trim().slice(0, 24) || `Hráč ${index + 1}`);
  while (playerNames.length < playerCount) playerNames.push(`Hráč ${playerNames.length + 1}`);
  if (hasBot) playerNames.push("Bot");

  let firstCard = null;
  let lockBoard = false;
  let moves = 0;
  let matchedPairs = 0;
  let currentPlayer = 0;
  let scores = [];
  let mismatchTimer;
  let botTimer;
  const knownCards = new Map();

  function playerName(index) {
    return playerNames[index];
  }

  function scheduleBotTurn(delay = 650) {
    if (!hasBot || currentPlayer !== 1 || matchedPairs === imageFiles.length / 2) return;
    window.clearTimeout(botTimer);
    botTimer = window.setTimeout(playBotTurn, delay);
  }

  function playBotTurn() {
    if (!hasBot || currentPlayer !== 1 || lockBoard) return;
    const available = [...board.querySelectorAll(".card:not(.is-open):not(.is-matched)")];
    if (available.length < 2) return;
    let first = null;
    const rememberPairChance = botDifficulty === "hard" ? 0.7 : botDifficulty === "medium" ? 0.2 : 0;
    if (botDifficulty !== "easy" && Math.random() < rememberPairChance) {
      for (const indexes of knownCards.values()) {
        const candidates = indexes.map((index) => board.children[index]).filter((card) => card && !card.classList.contains("is-matched") && !card.classList.contains("is-open"));
        if (candidates.length >= 2) { first = candidates.slice(0, 2); break; }
      }
    }
    if (!first) {
      const choices = available;
      const one = choices[Math.floor(Math.random() * choices.length)];
      const secondChoices = choices.filter((card) => card !== one);
      const second = secondChoices[Math.floor(Math.random() * secondChoices.length)];
      first = [one, second];
    }
    lockBoard = true;
    flipCard(first[0], first[0].__cardItem, true);
    window.setTimeout(() => {
      flipCard(first[1], first[1].__cardItem, true);
    }, 550);
  }

  function updatePlayers() {
    turnStatus.textContent = matchedPairs === imageFiles.length / 2
      ? "Všechny karty jsou otočené. Hra skončila!"
      : `Na tahu je ${playerName(currentPlayer)}`;
    playerScores.replaceChildren(...scores.map((score, index) => {
      const item = document.createElement("div");
      item.className = `player-score${index === currentPlayer && matchedPairs < imageFiles.length / 2 ? " is-current" : ""}`;
      item.setAttribute("aria-current", index === currentPlayer && matchedPairs < imageFiles.length / 2 ? "true" : "false");
      const name = document.createElement("span");
      name.textContent = playerName(index);
      const scoreValue = document.createElement("strong");
      scoreValue.textContent = score;
      const label = document.createElement("span");
      label.className = "score-label";
      label.textContent = score === 1 ? "pár" : "párů";
      item.append(name, scoreValue, label);
      return item;
    }));
  }

  function finishGame() {
    const bestScore = Math.max(...scores);
    const winners = scores
      .map((score, index) => score === bestScore ? playerName(index) : null)
      .filter(Boolean);
    winResult.textContent = `${winners.length > 1 ? "Remíza:" : "Vyhrává"} ${winners.join(" a ")} s nejvyšším počtem nalezených párů (${bestScore}).`;
    winMessage.hidden = false;
    updatePlayers();
    returnHomeLink.focus();
  }

  function namePrefix(file) {
    return file.replace(/_(bio|cit)\.png$/i, "").toLowerCase();
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
    button.dataset.prefix = item.prefix;
    button.__cardItem = item;
    button.setAttribute("aria-label", `Card ${index + 1}, face down`);
    button.innerHTML = `
      <span class="card-inner">
        <span class="card-face card-back" aria-hidden="true"></span>
        <span class="card-face card-front"><img src="${imageFolder}${item.file}" alt="${item.file.replace(/\.png$/i, "").replaceAll("_", " ")}" draggable="false"></span>
      </span>`;
    button.addEventListener("click", () => flipCard(button, item));
    return button;
  }

  function flipCard(card, item, fromBot = false) {
    if ((lockBoard && !fromBot) || (hasBot && currentPlayer === 1 && !fromBot) || card.classList.contains("is-open") || card.classList.contains("is-matched")) return;

    card.classList.add("is-open");
    card.setAttribute("aria-label", `Picture ${item.file.replace(/\.png$/i, "").replaceAll("_", " ")}`);
    if (!knownCards.has(item.prefix)) knownCards.set(item.prefix, []);
    const knownIndexes = knownCards.get(item.prefix);
    const cardIndex = [...board.children].indexOf(card);
    if (!knownIndexes.includes(cardIndex)) knownIndexes.push(cardIndex);

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
      currentPlayer = (currentPlayer + 1) % totalPlayers;
      updatePlayers();
      scheduleBotTurn();
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
    scheduleBotTurn();
  }

  function newGame() {
    window.clearTimeout(mismatchTimer);
    window.clearTimeout(botTimer);
    firstCard = null;
    lockBoard = false;
    moves = 0;
    matchedPairs = 0;
    scores = Array(totalPlayers).fill(0);
    currentPlayer = 0;
    knownCards.clear();
    movesDisplay.textContent = "0";
    pairsDisplay.textContent = "0";
    totalDisplay.textContent = ` / ${imageFiles.length / 2}`;
    winMessage.hidden = true;
    pairSpotlight.hidden = true;
    updatePlayers();
    board.replaceChildren(...shuffledImages().map(createCard));
    updatePlayers();
  }

  function setupPageUrl() {
    const params = new URLSearchParams({ players: String(playerCount) });
    playerNames.slice(0, playerCount).forEach((name) => params.append("name", name));
    return `uvodni_stranka.html?${params.toString()}`;
  }

  returnHomeLink.href = setupPageUrl();
  restartButton.addEventListener("click", () => {
    window.location.href = setupPageUrl();
  });
  continueButton.addEventListener("click", continueGame);
  newGame();
})();





