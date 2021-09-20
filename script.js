class TetrisGame {
	constructor(canvas) {
		this.canvas = canvas;
		this.context = this.canvas.getContext("2d");
		canvas.setAttribute("width", 600);
		canvas.setAttribute("height", 540);
		this.scaleFactor = 10;
		this.context.scale(this.scaleFactor * 3, this.scaleFactor * 2.7);		

		this.blankRow = [];
		for (let bR = 0; bR < this.gameGridWidth; bR++) {
			blankRow.push(0);
		}

		this.piece = {
			blockI: [
				[
					[0, 0, 0, 0],
					[0, 0, 0, 0],
					[1, 1, 1, 1],
					[0, 0, 0, 0],
				],
				[
					[0, 0, 1, 0],
					[0, 0, 1, 0],
					[0, 0, 1, 0],
					[0, 0, 1, 0],
				]
			],
			blockJ: [
				[
					[0, 0, 0],
					[2, 2, 2],
					[0, 0, 2]
				],
				[
					[0, 2, 2],
					[0, 2, 0],
					[0, 2, 0]
				],
				[
					[2, 0, 0],
					[2, 2, 2],
					[0, 0, 0]
				],
				[
					[0, 2, 0],
					[0, 2, 0],
					[2, 2, 0]
				]
			],
			blockL: [
				[
					[0, 0, 0],
					[3, 3, 3],
					[3, 0, 0]
				],
				[
					[0, 3, 0],
					[0, 3, 0],
					[0, 3, 3]
				],
				[
					[0, 0, 3],
					[3, 3, 3],
					[0, 0, 0]
				],
				[
					[3, 3, 0],
					[0, 3, 0],
					[0, 3, 0]
				]
			],
			blockO: [
				[
					[4, 4],
					[4, 4]
				]
			],
			blockS: [
				[
					[0, 5, 5],
					[5, 5, 0],
					[0, 0, 0],
				],
				[
					[5, 0, 0],
					[5, 5, 0],
					[0, 5, 0]
				],
			],
			blockT: [
				[
					[6, 6, 6],
					[0, 6, 0],
					[0, 0, 0]
				],
				[
					[6, 0, 0],
					[6, 6, 0],
					[6, 0, 0]
				],
				[
					[0, 0, 0],
					[0, 6, 0],
					[6, 6, 6]
				],
				[
					[0, 0, 6],
					[0, 6, 6],
					[0, 0, 6]
				]
			],
			blockZ: [
				[
					[7, 7, 0],
					[0, 7, 7],
					[0, 0, 0]
				],
				[
					[0, 7, 0],
					[7, 7, 0],
					[7, 0, 0]
				]
			]
		};

		this.gameState = "menu";
		this.dropTimeInterval = 1000;
		this.gameGridWidth = 10;
		this.gameGridHeigth = 20;
		this.gameHighScore = parseInt(window.localStorage.getItem("highScore") || 0);

		this.lastTime = 0;

		this.blankRow = [];
		for (let bR = 0; bR < this.gameGridWidth; bR++) {
			this.blankRow.push(0);
		}

		this.nextPiece = this.pickRandomPiece();

		document.addEventListener("keydown", this.onKeyPressGateway.bind(this)); //слушаем нажатия клавиш

		this.colors = {
			transparent: "rgba(0, 0, 0, 0)",
			blockI: "#C980A6", //purple
			blockJ: "#7C9AC3", //skyBlue
			blockL: "#E3655B", //coral
			blockO: "#F9C489", //lightYellow
			blockS: "#F9A345", //yellow
			blockT: "#0757C4", //blue
			blockZ: "#F6A6A0", //peach
			colorDark: "rgb(12, 12, 90)",
			colorLight: "white",
			gridBackground: "rgb(7, 7, 54)",
			dropTarget: "rgba(255, 255, 255, 0.1)"
		};
	}

	gameInit() {
		this.dropTimeInterval = 1000;
		this.gridSize = 1;
		this.snakeMoved = true;
		this.gameScore = 0;
		this.brokenLines = 0;

		this.getNewPiece();

		this.currentPieceStacked = true;

		this.gameGrid = this.createGameGrid(this.gameGridWidth, this.gameGridHeigth);

		this.loop();
	}

	pickRandomPiece() {
		//отправить тот же тетрамино
		if (this.isSamePiece())
			return this.currentPiece.selected;

		let keepChanging = true;
		let newPiece = [];
		while (keepChanging) {
			switch (this.randomBetween(1, 6)) {
				case 1:
					newPiece = this.piece.blockI;
					break;
				case 2:
					newPiece = this.piece.blockJ;
					break;
				case 3:
					newPiece = this.piece.blockL;
					break;
				case 4:
					newPiece = this.piece.blockO;
					break;
				case 5:
					newPiece = this.piece.blockS;
					break;
				case 6:
					newPiece = this.piece.blockT;
					break;
				case 7:
					newPiece = this.piece.blockZ;
					break;
			}

			if (this.currentPiece) {
				if (newPiece !== this.currentPiece.selected) { keepChanging = false; }
			} else {
				keepChanging = false;
			}
		}
		return newPiece;
	}

	createGameGrid(width, height) {
		let gameGrid = [];
		for (let rows = 0; rows < height; rows++) {
			let rowArray = [];
			for (let cells = 0; cells < width; cells++) {
				rowArray.push(0);
			}
			gameGrid.push(rowArray);
		}
		return gameGrid;
	}

	rotate() {
		if (this.currentPiece.selected.length > 1) {
			let nextIndex = this.currentPieceIndex;
			if (this.currentPieceIndex === this.currentPiece.selected.length - 1) nextIndex = 0;
			else nextIndex++;

			let nextPieceBefore = this.currentPiece.selected[nextIndex];
			rows: for (let row = 0; row < nextPieceBefore.length; row++) {
				cells: for (let cell = 0; cell < nextPieceBefore[row].length; cell++) {
					let relRow = this.currentPiecePosition.y + row;
					let relCell = this.currentPiecePosition.x + cell;

					//проверка при повороте: не касается ли третрамино нижней границы
					if ((relRow >= this.gameGridHeigth) && (nextPieceBefore[row][cell] > 0)) return;

					//проверка при повороте: не касается ли третрамино стен или соседних элементов
					if ((relRow >= 0) && (relRow < this.gameGridHeigth) && (relCell >= 0) && (relCell < this.gameGridWidth)) {
						if ((nextPieceBefore[row][cell] > 0) && (this.gameGrid[relRow][relCell] > 0)) return; //не поворачивать
					}
				}
			}

			this.currentPieceIndex = nextIndex;

			this.currentPiece.active = this.currentPiece.selected[this.currentPieceIndex];

			let l = this.getLeftSpaceOfActivePiece();
			let r = this.getRightSpaceOfActivePiece(); 

			//столкновение с левой стеной
			if (this.currentPiecePosition.x + l < 0) { this.currentPiecePosition.x = 0; }

			//столкновение с правой стеной
			if (this.currentPiecePosition.x + this.currentPiece.active.length - r > this.gameGridWidth) {
				this.currentPiecePosition.x = this.gameGridWidth - r - this.currentPiece.active.length;
			}
		}
	}

	getLeftSpaceOfActivePiece() {
		let leftSpace = 0;

		row: for (let row = 0; row < this.currentPiece.active.length; row++) {
			cell: for (let cell = 0; cell < this.currentPiece.active[row].length; cell++) {
				if (this.currentPiece.active[cell][row] > 0) break row;
			}
			leftSpace = row + 1;
		}
		return leftSpace;
	}

	getRightSpaceOfActivePiece() {
		let rightSpace = 0;

		row: for (let row = this.currentPiece.active.length - 1; row >= 0; row--) {
			rightSpace = (this.currentPiece.active.length - 1) - row;
			cell: for (let cell = this.currentPiece.active[row].length - 1; cell >= 0; cell--) {
				if (this.currentPiece.active[cell][row] > 0) break row;
			}
		}
		return rightSpace;
	}

	getBottomSpaceOfActivePiece() {
		let bottomSpace = 0;

		row: for (let row = this.currentPiece.active.length - 1; row >= 0; row--) {
			cell: for (let cell = 0; cell < this.currentPiece.active[row].length; cell++) {
				if (this.currentPiece.active[row][cell] > 0) break row;
			}
			bottomSpace = this.currentPiece.active.length - row;
		}
		return bottomSpace;
	}

	moveLeft() {
		// Проверить не касается ли тетрамино границы. Если да, то остановить и вернуть значение
		row: for (let row = 0; row < this.currentPiece.active.length; row++) {
			cell: for (let cell = 0; cell < this.currentPiece.active[row].length; cell++) {
				let lYcheck = this.currentPiecePosition.y + row;
				let lXcheck = (this.currentPiecePosition.x + cell) - 1;

				if (
					lXcheck >= 0 &&
					lYcheck >= 0 &&
					this.currentPiece.active[row][cell] > 0 &&
					this.gameGrid[lYcheck][lXcheck] > 0
				) {
					return;
				}
			}
		}
		let leftSpace = this.getLeftSpaceOfActivePiece();

		if (this.currentPiecePosition.x > 0 - leftSpace) {
			this.currentPiecePosition.x += -1;
		}
	}

	moveRight() {
		row: for (let row = 0; row < this.currentPiece.active.length; row++) {
			cell: for (let cell = 0; cell < this.currentPiece.active[row].length; cell++) {
				let rYcheck = this.currentPiecePosition.y + row;
				let rXcheck = (this.currentPiecePosition.x + cell) + 1;

				if (
					rXcheck < this.gameGridWidth &&
					rYcheck > 0 &&
					this.currentPiece.active[row][cell] > 0 &&
					this.gameGrid[rYcheck][rXcheck] > 0
				) {
					return;
				}
			}
		}
		let rightSpace = this.getRightSpaceOfActivePiece();

		if (this.currentPiecePosition.x < (this.gameGridWidth - this.currentPiece.active.length) + rightSpace) {
			this.currentPiecePosition.x += 1;
		}
	}

	reset() {
		this.gameInit();
	}

	gameOver() {
		clearInterval(this.timer);
		this.gameState = "over";
	}

	startGame() {
		this.gameInit();
		clearInterval(this.timer);
		this.gameState = "game";
	}

	moveDown() {
		if (this.currentPiecePosition.y < 0 && this.isCurrentPieceCollidesWithGridItemsOrGround()) {
			this.gameState = "over";
		} else if (this.isCurrentPieceCollidesWithGridItemsOrGround()) {
			this.mergeCurrentPieceWithGrid();
			this.checkSweep();
			this.getNewPiece();
		} else {
			this.currentPiecePosition.y++;
		}
	}

	// Игровой цикл
	loop(time = 0) {
		const deltaTime = time - this.lastTime;

		switch (this.gameState) {
			case "menu":
				this.drawMenu();
				break;
			case "game":
				if (deltaTime > this.dropTimeInterval) {
					this.lastTime = time;
					this.moveDown();
				}
				this.drawGame();
				break;
			case "over":
				this.drawOver();
				break;
		}

		window.requestAnimationFrame(this.loop.bind(this));
	}

	isCurrentPieceCollidesWithGridItemsOrGround() {
		row: for (let row = this.currentPiece.active.length - 1; row >= 0; row--) {
			cell: for (let cell = 0; cell < this.currentPiece.active[row].length; cell++) {

				//проверить тетрамино с нижней линии по верхнюю
				let gRow = this.currentPiecePosition.y + row + 1;
				let gCell = this.currentPiecePosition.x + cell;
				if (gRow >= 0 && gRow < this.gameGridHeigth) {
					if ((this.currentPiece.active[row][cell] > 0) && (this.gameGrid[gRow][gCell] > 0))
						return true;
				}

				if (this.currentPiecePosition.y + row - this.getBottomSpaceOfActivePiece() === this.gameGridHeigth - 1)
					return true;
			}
		}
		return false;
	}

	getNewPiece() {
		this.currentPieceIndex = 0;
		this.randomlySelectedPiece = this.nextPiece;
		this.currentPiece = {
			active: this.randomlySelectedPiece[this.currentPieceIndex],
			selected: this.randomlySelectedPiece
		};
		this.currentPiecePosition = {
			x: Math.round(this.gameGridWidth / 2 - this.currentPiece.active.length / 2),
			y: 0 - this.currentPiece.active.length + this.getBottomSpaceOfActivePiece()
		};
		this.nextPiece = this.pickRandomPiece();
	}

	mergeCurrentPieceWithGrid() {
		for (let row = 0; row < this.currentPiece.active.length; row++) {
			for (let cell = 0; cell < this.currentPiece.active[row].length; cell++) {
				if (this.currentPiece.active[row][cell] > 0) {
					if ((this.currentPiecePosition.y + row >= 0) &&	(this.currentPiecePosition.y + row < this.gameGridHeigth)) {
						this.gameGrid[this.currentPiecePosition.y + row][this.currentPiecePosition.x + cell] = this.currentPiece.active[row][cell];
					}
				}
			}
		}
	}

	selectColorForContent(selectionNumber) {
		switch (selectionNumber) {
			case 0:
				this.context.fillStyle = this.colors.transparent;
				break;
			case 1:
				this.context.fillStyle = this.colors.blockI;
				break;
			case 2:
				this.context.fillStyle = this.colors.blockJ;
				break;
			case 3:
				this.context.fillStyle = this.colors.blockL;
				break;
			case 4:
				this.context.fillStyle = this.colors.blockO;
				break;
			case 5:
				this.context.fillStyle = this.colors.blockS;
				break;
			case 6:
				this.context.fillStyle = this.colors.blockT;
				break;
			case 7:
				this.context.fillStyle = this.colors.blockZ;
				break;
			default:
				this.context.fillStyle = "rgb(220, 220, 220)";
				break;
		}
	}

	checkSweep() {
		let removeIndices = [];
		//проверить все линии на наличи тетрамино
		rows: for (let row = 0; row < this.gameGrid.length; row++) {
			for (let cell = 0; cell < this.gameGrid[row].length; cell++) {
				if (this.gameGrid[row][cell] === 0) { continue rows; }
			}
			removeIndices.push(row);
		}

		//убрать полный ряд
		if (removeIndices.length > 0) {
			removeIndices.forEach((v) => {
				this.gameGrid.splice(v, 1);
				this.gameGrid.unshift(this.blankRow.slice());
			});

			this.increaseScore(removeIndices.length);
		}
	}

	dropPiece() {
		let targetPosition = this.detectDropTargetPosition();
		let diffMultiplier = targetPosition.y - this.currentPiecePosition.y;
		this.currentPiecePosition.y = targetPosition.y;

		this.addDropScore(diffMultiplier);

		if (this.currentPiecePosition.y < 0 && this.isCurrentPieceCollidesWithGridItemsOrGround()) {
			this.gameState = "over";
		} else if (this.isCurrentPieceCollidesWithGridItemsOrGround()) {
			this.mergeCurrentPieceWithGrid();
			this.checkSweep();
			this.getNewPiece();
		}
	}

	addDropScore(diff) {
		this.gameScore += 10 * diff;
		this.checkHighScore();
	}

	detectDropTargetPosition() {
		let position = {
			x: this.currentPiecePosition.x,
			y: this.currentPiecePosition.y
		};

		let dropOne = true;

		dropper: while (dropOne) {
			row: for (let row = this.currentPiece.active.length - 1; row >= 0; row--) {
				cell: for (let cell = 0; cell < this.currentPiece.active[row].length; cell++) {

					//проверить все линии на наличи тетрамино
					let gRow = position.y + row + 1;
					let gCell = position.x + cell;
					if (gRow >= 0 && gRow < this.gameGridHeigth) {
						if ((this.currentPiece.active[row][cell] > 0) && (this.gameGrid[gRow][gCell] > 0)) {
							dropOne = false;
							break dropper;
						}
					}

					//касается ли нижней границы
					if (position.y + row - this.getBottomSpaceOfActivePiece() === this.gameGridHeigth - 1) {
						dropOne = false;
						break dropper;
					}
				}
			}
			position.y++;
		}
		return position;
	}

	increaseScore(multiplier = 1) {
		this.brokenLines += multiplier;
		if (this.brokenLines % 30 === 0) { this.dropTimeInterval -= 50; }

		this.gameScore += (100 * multiplier) * multiplier;
		this.checkHighScore();
	}

	//Проверить и обновить высшее количество очков
	checkHighScore() {
		if (this.gameScore >= this.gameHighScore) {
			this.gameHighScore = this.gameScore;
			window.localStorage.setItem("highScore", this.gameHighScore);
		}
	}

	drawMenu() {
		this.context.fillStyle = this.colors.colorDark;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.context.fillStyle = this.colors.colorLight;
		this.context.font = "3px 'Arial', sans-serif";
		this.context.textAlign = "center";
		this.context.textBaseline = "middle";
		this.context.fillText("ТЕТРИС", 10, 3);

		this.context.font = "1px 'Arial', sans-serif";
		this.context.fillText("↑", 10, 8);
		this.context.fillText("← ↓ →", 10, 9);
		this.context.fillText("Управление стрелками,", 10, 11);
		this.context.fillText("вверх - поворот", 10, 12);
		this.context.fillText("Пробел - мгновенный сброс", 10, 14);
		this.context.fillText("Нажмите \"Enter\", чтобы начать игру", 10, 18);
	}

	drawGame() {
		//правая часть поля
		this.context.fillStyle = this.colors.colorDark;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.context.fillStyle = this.colors.colorLight;
		this.context.fillRect(
			10 * this.gridSize,
			0 * this.gridSize,
			this.gridSize / 2,
			20 * this.gridSize
		);
		this.context.fillRect(
			10 * this.gridSize,
			7 * this.gridSize,
			10 * this.gridSize,
			this.gridSize / 2
		);

		//region draw level of game
		this.context.font = "1px 'Arial', sans-serif";
		this.context.textAlign = "left";
		this.context.textBaseline = "top";
		this.context.fillText("Линии : " + this.brokenLines, 12, 9);
		this.context.fillText("Очки : " + this.gameScore, 12, 11);
		this.context.fillText("Рекорд : ", 12, 16);
		this.context.fillText(this.gameHighScore, 12, 17);

		this.drawNextPiecesArea();
		this.drawGridPieces();
		this.drawCurrentPiece();
		this.drawDropTarget();
	}

	drawNextPiecesArea() {
		this.context.font = "1px 'Arial', sans-serif";
		this.context.textAlign = "center";
		this.context.textBaseline = "top";
		this.context.fillText("Далее : ", 13.5, 1.5);

		for (let row = 0; row < this.nextPiece[0].length; row++) {
			for (let cell = 0; cell < this.nextPiece[0][row].length; cell++) {
				this.selectColorForContent(this.nextPiece[0][row][cell]);
				this.context.fillRect(12 + cell, 3 + row, 1, 1);
			}
		}
	}

	drawGridPieces() {
		// фон игровой зоны
		this.context.fillStyle = this.colors.gridBackground;
		this.context.fillRect(0, 0, this.gameGridWidth, this.gameGridHeigth);

		//сами тетрамино
		for (let row = 0; row < this.gameGrid.length; row++) {
			for (let cell = 0; cell < this.gameGrid[row].length; cell++) {
				this.selectColorForContent(this.gameGrid[row][cell]);
				this.context.fillRect(cell, row, this.gridSize,	this.gridSize);
			}
		}
	}

	drawCurrentPiece() {
		for (let row = 0; row < this.currentPiece.active.length; row++) {
			for (let cell = 0; cell < this.currentPiece.active[row].length; cell++) {
				this.selectColorForContent(this.currentPiece.active[row][cell]);
				if (this.currentPiece.active[row][cell] > 0) {
					this.context.fillRect(
						this.currentPiecePosition.x + cell,
						this.currentPiecePosition.y + row,
						this.gridSize,
						this.gridSize
					);
				}
			}
		}
	}

	//тень положения, как упадёт тетрамино
	drawDropTarget() {
		let position = this.detectDropTargetPosition();

		this.context.fillStyle = this.colors.dropTarget;
		for (let row = 0; row < this.currentPiece.active.length; row++) {
			for (let cell = 0; cell < this.currentPiece.active[row].length; cell++) {
				if (this.currentPiece.active[row][cell] > 0) {
					this.context.fillRect(position.x + cell, position.y + row, this.gridSize, this.gridSize);
				}
			}
		}
	}

	//Конец игры
	drawOver() {
		this.context.fillStyle = this.colors.colorDark;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.context.fillStyle = this.colors.colorLight;
		this.context.font = "3px 'Arial', sans-serif";
		this.context.textAlign = "center";
		this.context.textBaseline = "middle";
		this.context.fillText("GAME", 10, 4);

		this.context.fillText("OVER", 10, 7);

		this.context.font = "1px 'Arial', sans-serif";
		this.context.fillText("Ваши очки : " + this.gameScore, 10, 11);
		this.context.fillText("Линии : " + this.brokenLines, 10, 12);

		if (this.gameScore === this.gameHighScore)
			this.context.fillText("Поздравляем, вы побили рекорд!", 10,	14);

		this.context.fillText("\"Enter\", чтобы вернуться к меню",	10, 18);
	}

	//key detection gateway for all screens
	onKeyPressGateway(e) {
		switch (this.gameState) {
			case "menu":
				this.readMenuKeys(e);
				break;
			case "game":
				this.readGameKeys(e);
				break;
			case "over":
				this.readOverKeys(e);
				break;
		}
	}

	readMenuKeys(e) {
		if (e.keyCode === 13) {	this.startGame(); } //enter 
	}

	readGameKeys(e) {
		switch(e.keyCode) {
			case 37: //влево
				this.moveLeft();
				break;
			case 38: //вверх
				this.rotate();
				break;
			case 39: //вправо
				this.moveRight(); 
				break;
			case 40: //вниз
				this.moveDown(); 
				break;
			case 32: //пробел
				this.dropPiece();
				break;
			case 27: //esc
				this.gameState = "menu";
		}
	}

	readOverKeys(e) {
		//Enter Key
		if (e.keyCode === 13) {
			this.gameState = "menu";
		}
	}

	randomBetween(min, max) {
		return Math.round(Math.random() * max + min);
	}

	isSamePiece() {
		if (this.randomBetween(0, 1000) % 50 === 0)
			return true;
		else 
			return false;
	}
}

document.addEventListener("DOMContentLoaded", event => {
	const game = new TetrisGame(document.getElementById("game"));
	game.gameInit();
});