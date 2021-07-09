const boxes = document.querySelectorAll(".item");
const selectorCross = document.querySelector(".playerSelector__cross");
const selectorCircle = document.querySelector(".playerSelector__circle");
const statusDisplay = document.querySelector(".status-display");
const crossScore = document.querySelector(".score__cross");
const circleScore = document.querySelector(".score__circle");
const restartButton = document.querySelector(".restart");
const modeButton = document.querySelector("#modebtn");
const modeDisplay = document.querySelector("#mode");

//EndGameScreen
const gameoverScreen = document.querySelectorAll(".gameover");
const crossWinningScreen = document.querySelector(".win__cross");
const circleWinningScreen = document.querySelector(".win__circle");
const drawScreen = document.querySelector(".draw");

const crossTurn = "cross";
const circleTurn = "circle";
let currentTurn = crossTurn;
let isEnd = false;
let score = {
    cross: 0,
    circle: 0,
};

let mode = "player";
modeDisplay.innerText = mode;

const winStates = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 4, 8],
    [2, 4, 6],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
];

// Listeners
modeButton.addEventListener("click", changeMode);

boxes.forEach((box) => box.addEventListener("click", clickHandler));
gameoverScreen.forEach((screen) =>
    screen.addEventListener("click", hideEndScreen)
);
restartButton.addEventListener("click", hideEndScreen);

function changeMode(e) {
    e.preventDefault();
    mode = mode === "AI" ? "player" : "AI";
    modeDisplay.innerText = mode;
    restartHandler();
}

// onClick boxes
function clickHandler(e) {
    e.preventDefault();

    if (
        e.target.classList.contains("circle") ||
        e.target.classList.contains("cross") ||
        isEnd ||
        (mode === "AI" && currentTurn === circleTurn)
    ) {
        return;
    }

    e.target.classList.add(currentTurn);

    gameStateChecker();
    changePlayerTurn();
    changeDisplayStatus();

    if (mode === "AI" && currentTurn === circleTurn) {
        setTimeout(() => {
            runHardAIMode();
        }, 500);
    }
}

function runAIMode() {
    // find empty box
    const emptyBoxes = [...boxes].flatMap((box, i) => {
        return !box.classList.contains("circle") &&
            !box.classList.contains("cross")
            ? i
            : [];
    });
    const numOfEmpty = emptyBoxes.length;
    const randomPick = emptyBoxes[Math.floor(Math.random() * numOfEmpty)];
    boxes.forEach((box, i) => {
        i === randomPick ? box.classList.add(currentTurn) : null;
    });

    gameStateChecker();
    changePlayerTurn();
    changeDisplayStatus();
}

function runHardAIMode() {
    //find stakeholders' pick
    const playerPicks = [...boxes].flatMap((box, i) => {
        return box.classList.contains("cross") ? i : [];
    });

    const emptyBoxes = [...boxes].flatMap((box, i) => {
        return !box.classList.contains("circle") &&
            !box.classList.contains("cross")
            ? i
            : [];
    });

    const AIPicks = [...boxes].flatMap((box, i) => {
        return box.classList.contains("circle") ? i : [];
    });

    //Counterpick method
    const losingCombinations = winStates.filter((state) => {
        return state.some((index) => playerPicks.includes(index));
    });

    const cautiousPickComb = losingCombinations.filter((comb) => {
        return (
            comb.reduce((acc, cur) => {
                playerPicks.includes(cur) ? (acc += 1) : null;
                AIPicks.includes(cur) ? (acc -= 1) : null;
                return acc;
            }, 0) === 2
        );
    });

    const counterCautiousPicks = cautiousPickComb.flatMap((comb) => {
        return comb.filter((index) => !playerPicks.includes(index));
    });

    // console.log("playerPicks", playerPicks);
    // console.log("losingCombinations", losingCombinations);
    // console.log("cautiousPickComb", cautiousPickComb);
    console.log("counterCautiousPicks", counterCautiousPicks);

    // Aggresive method

    const winningCombinations = winStates.filter((state) => {
        return (
            state.some((index) => AIPicks.includes(index)) &&
            state.every((index) => !playerPicks.includes(index))
        );
    });

    const winningPickComb1st = winningCombinations.filter((comb) => {
        return (
            comb.reduce((acc, cur) => {
                AIPicks.includes(cur) ? (acc += 1) : null;
                return acc;
            }, 0) === 1
        );
    });

    const winningPicks1st = winningPickComb1st.flatMap((comb) => {
        return comb.filter((index) => !AIPicks.includes(index));
    });

    const winningPickComb2nd = winningCombinations.filter((comb) => {
        return (
            comb.reduce((acc, cur) => {
                AIPicks.includes(cur) ? (acc += 1) : null;
                return acc;
            }, 0) === 2
        );
    });

    const winningPicks2nd = winningPickComb2nd.flatMap((comb) => {
        return comb.filter((index) => !AIPicks.includes(index));
    });

    // console.log("emptyBoxes", emptyBoxes);
    // console.log("AIPicks", AIPicks);
    // console.log("winningCombinations", winningCombinations);
    console.log("winningPicks1st", winningPicks1st);
    console.log("winningPicks2nd", winningPicks2nd);

    //Random method

    if (counterCautiousPicks.length > 0) {
        //player getting winning combination
        const randomPick =
            counterCautiousPicks[
                Math.floor(Math.random() * counterCautiousPicks.length)
            ];

        boxes.forEach((box, i) => {
            i === randomPick ? box.classList.add(currentTurn) : null;
        });
    } else if (winningPicks2nd.length > 0) {
        //AI getting winning combination after 1 more pick
        const randomPick =
            winningPicks2nd[Math.floor(Math.random() * winningPicks2nd.length)];

        boxes.forEach((box, i) => {
            i === randomPick ? box.classList.add(currentTurn) : null;
        });
    } else if (winningPicks1st.length > 0) {
        //AI getting winning combination after 2 more picks
        const randomPick =
            winningPicks1st[Math.floor(Math.random() * winningPicks1st.length)];

        boxes.forEach((box, i) => {
            i === randomPick ? box.classList.add(currentTurn) : null;
        });
    } else {
        //AI place random pick
        const randomPick =
            emptyBoxes[Math.floor(Math.random() * emptyBoxes.length)];

        boxes.forEach((box, i) => {
            i === randomPick ? box.classList.add(currentTurn) : null;
        });
    }

    gameStateChecker();
    changePlayerTurn();
    changeDisplayStatus();
}

function runPlayerMode(e) {}

function gameStateChecker() {
    currentTurn_index = [...boxes].map((box, i) => {
        return box.classList.contains(currentTurn) ? i : null;
    });
    let isWon = winStates.some((child) =>
        child.every((index) => currentTurn_index.includes(index))
    );
    let draw =
        [...boxes].every(
            (box, i) =>
                box.classList.contains("cross") ||
                box.classList.contains("circle")
        ) && !isWon;

    if (isWon) {
        isEnd = true;
        statusDisplay.innerHTML = "Game Over";

        if (currentTurn === crossTurn) {
            crossWinningScreen.classList.add("show");
            score.cross += 1;
            crossScore.innerText = score.cross;
        } else {
            circleWinningScreen.classList.add("show");
            score.circle += 1;
            circleScore.innerText = score.circle;
        }
    } else if (draw) {
        isEnd = true;
        statusDisplay.innerHTML = "Game Over";
        drawScreen.classList.add("show");
    }
}

function changePlayerTurn() {
    if (isEnd) return;

    if (currentTurn === crossTurn) {
        currentTurn = circleTurn;
    } else {
        currentTurn = crossTurn;
    }
}

function changeDisplayStatus() {
    if (isEnd) return;

    if (currentTurn === crossTurn) {
        statusDisplay.classList.add("text__turn");

        setTimeout(() => {
            selectorCircle.classList.remove("currentturn");
            selectorCross.classList.add("currentturn");
            statusDisplay.innerHTML =
                "<div>" +
                '<img src="./cross.png"/ width="15px" height="15px">' +
                "<p>Turn</p>" +
                "</div>";
        }, 250);
    } else if (currentTurn === circleTurn) {
        statusDisplay.classList.add("text__turn");

        setTimeout(() => {
            selectorCross.classList.remove("currentturn");
            selectorCircle.classList.add("currentturn");
            statusDisplay.innerHTML =
                "<div>" +
                '<img src="./circle.png"/ width="15px" height="15px">' +
                "<p>Turn</p>" +
                "</div>";
        }, 250);
    }
}

function hideEndScreen(e) {
    e.preventDefault();
    gameoverScreen.forEach((screen) => {
        screen.classList.remove("show");
    });
    restartHandler();
}

function restartHandler() {
    boxes.forEach((box) => {
        box.classList.remove("circle");
        box.classList.remove("cross");
    });
    isEnd = false;
    currentTurn = crossTurn;
    statusDisplay.innerHTML = "Start game or select player ";
    selectorCircle.classList.remove("currentturn");
    selectorCross.classList.remove("currentturn");
}
