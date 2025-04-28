// Constants for class names
const CLASS_CROSS = "cross"
const CLASS_CIRCLE = "circle"
const CLASS_CURRENT_TURN = "currentturn"
const CLASS_SHOW = "show"
const CLASS_TEXT_TURN = "text__turn"

// DOM Elements
const boxes = document.querySelectorAll(".item")
const selectorCross = document.querySelector(".playerSelector__cross")
const selectorCircle = document.querySelector(".playerSelector__circle")
const statusDisplay = document.querySelector(".status-display")
const crossScore = document.querySelector(".score__cross")
const circleScore = document.querySelector(".score__circle")
const restartButton = document.querySelector(".restart")
const modeButton = document.querySelector("#modebtn")
const modeDisplay = document.querySelector("#mode")
const gameoverScreen = document.querySelectorAll(".gameover")
const crossWinningScreen = document.querySelector(".win__cross")
const circleWinningScreen = document.querySelector(".win__circle")
const drawScreen = document.querySelector(".draw")

// Game State
const crossTurn = CLASS_CROSS
const circleTurn = CLASS_CIRCLE
let isLoading = false
let currentTurn = crossTurn
let isEnd = false
let score = { cross: 0, circle: 0 }
let mode = "player"
modeDisplay.innerText = mode

// Winning Combinations
const winStates = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 4, 8],
	[2, 4, 6],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
]

// Event Listeners
modeButton.addEventListener("click", changeMode)
boxes.forEach((box) => box.addEventListener("click", clickHandler))
gameoverScreen.forEach((screen) =>
	screen.addEventListener("click", hideEndScreen)
)
restartButton.addEventListener("click", hideEndScreen)

// Change Game Mode
function changeMode(e) {
	e.preventDefault()
	mode = mode === "AI" ? "player" : "AI"
	modeDisplay.innerText = mode
	restartHandler()
}

// Handle Box Click
async function clickHandler(e) {
	e.preventDefault()
	if (isLoading) return
	isLoading = true

	if (isInvalidClick(e.target)) return

	e.target.classList.add(currentTurn)
	await gameStateChecker()
	changePlayerTurn()
	changeDisplayStatus()

	if (mode === "AI" && currentTurn === circleTurn) {
		setTimeout(runHardAIMode, 500)
	}
	isLoading = false
}

// Check if Click is Invalid
function isInvalidClick(target) {
	return (
		target.classList.contains(CLASS_CIRCLE) ||
		target.classList.contains(CLASS_CROSS) ||
		isEnd ||
		(mode === "AI" && currentTurn === circleTurn)
	)
}

// Run AI Mode (Random)
async function runAIMode() {
	const randomPick = getRandomEmptyBox()
	if (randomPick !== null) {
		boxes[randomPick].classList.add(currentTurn)
		await gameStateChecker()
		changePlayerTurn()
		changeDisplayStatus()
	}
}

// Get Random Empty Box
function getRandomEmptyBox() {
	const emptyBoxes = getEmptyBoxes()
	return emptyBoxes.length > 0
		? emptyBoxes[Math.floor(Math.random() * emptyBoxes.length)]
		: null
}

// Get Empty Boxes
function getEmptyBoxes() {
	return [...boxes].flatMap((box, i) =>
		!box.classList.contains(CLASS_CIRCLE) &&
		!box.classList.contains(CLASS_CROSS)
			? i
			: []
	)
}

// Run Hard AI Mode
async function runHardAIMode() {
	const playerPicks = getPlayerPicks(CLASS_CROSS)
	const AIPicks = getPlayerPicks(CLASS_CIRCLE)
	const emptyBoxes = getEmptyBoxes()

	const counterPick = getCounterPick(playerPicks, AIPicks)
	const winningPick = getWinningPick(AIPicks, playerPicks)

	const pick = winningPick || counterPick || getRandomEmptyBox()
	if (pick !== null) {
		boxes[pick].classList.add(currentTurn)
		await gameStateChecker()
		changePlayerTurn()
		changeDisplayStatus()
	}
}

// Get Player Picks
function getPlayerPicks(playerClass) {
	return [...boxes].flatMap((box, i) =>
		box.classList.contains(playerClass) ? i : []
	)
}

// Get Counter Pick
function getCounterPick(playerPicks, AIPicks) {
	const losingCombinations = winStates.filter((state) =>
		state.some((index) => playerPicks.includes(index))
	)

	const cautiousPickComb = losingCombinations.filter(
		(comb) =>
			comb.reduce((acc, cur) => {
				if (playerPicks.includes(cur)) acc += 1
				if (AIPicks.includes(cur)) acc -= 1
				return acc
			}, 0) === 2
	)

	return cautiousPickComb.flatMap((comb) =>
		comb.filter((index) => !playerPicks.includes(index))
	)[0]
}

// Get Winning Pick
function getWinningPick(AIPicks, playerPicks) {
	const winningCombinations = winStates.filter(
		(state) =>
			state.some((index) => AIPicks.includes(index)) &&
			state.every((index) => !playerPicks.includes(index))
	)

	const winningPickComb = winningCombinations.find(
		(comb) =>
			comb.reduce(
				(acc, cur) => (AIPicks.includes(cur) ? acc + 1 : acc),
				0
			) === 2
	)

	return winningPickComb?.find((index) => !AIPicks.includes(index))
}

// Check Game State
async function gameStateChecker() {
	return new Promise((resolve) => {
		const currentTurnIndexes = getPlayerPicks(currentTurn)
		const isWon = winStates.some((state) =>
			state.every((index) => currentTurnIndexes.includes(index))
		)
		const isDraw = [...boxes].every(
			(box) =>
				box.classList.contains(CLASS_CROSS) ||
				box.classList.contains(CLASS_CIRCLE)
		)

		if (isWon) {
			setTimeout(() => {
				handleWin()
				resolve()
			}, 500)
		} else if (isDraw && !isWon) {
			setTimeout(() => {
				handleDraw()
				resolve()
			}, 500)
		} else {
			resolve()
		}
	})
}

// Handle Win
function handleWin() {
	isEnd = true
	statusDisplay.innerHTML = "Game Over"

	if (currentTurn === crossTurn) {
		crossWinningScreen.classList.add(CLASS_SHOW)
		updateScore(crossScore, "cross")
	} else {
		circleWinningScreen.classList.add(CLASS_SHOW)
		updateScore(circleScore, "circle")
	}
}

// Handle Draw
function handleDraw() {
	isEnd = true
	statusDisplay.innerHTML = "Game Over"
	drawScreen.classList.add(CLASS_SHOW)
}

// Update Score
function updateScore(scoreElement, player) {
	score[player] += 1
	scoreElement.innerText = score[player]
}

// Change Player Turn
function changePlayerTurn() {
	if (isEnd) return
	currentTurn = currentTurn === crossTurn ? circleTurn : crossTurn
}

// Change Display Status
function changeDisplayStatus() {
	if (isEnd) return

	const isCrossTurn = currentTurn === crossTurn
	statusDisplay.classList.add(CLASS_TEXT_TURN)

	setTimeout(() => {
		selectorCircle.classList.toggle(CLASS_CURRENT_TURN, !isCrossTurn)
		selectorCross.classList.toggle(CLASS_CURRENT_TURN, isCrossTurn)
		statusDisplay.innerHTML = `
            <div>
                <img src="./${
					isCrossTurn ? "cross" : "circle"
				}.png" width="15px" height="15px" />
                <p>Turn</p>
            </div>`
	}, 250)
}

// Hide End Screen
function hideEndScreen(e) {
	e.preventDefault()
	gameoverScreen.forEach((screen) => screen.classList.remove(CLASS_SHOW))
	restartHandler()
}

// Restart Game
function restartHandler() {
	boxes.forEach((box) => {
		box.classList.remove(CLASS_CIRCLE, CLASS_CROSS)
	})
	isEnd = false
	currentTurn = crossTurn
	statusDisplay.innerHTML = "Start game or select player"
	selectorCircle.classList.remove(CLASS_CURRENT_TURN)
	selectorCross.classList.remove(CLASS_CURRENT_TURN)
}
