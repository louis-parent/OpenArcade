const Room = require("../Room.js");
const RoomError = require("../RoomError.js");

const Events = {
	ERROR: "error",
	INIT: "init",
	ALONE: "alone",
	CHECK: "check",
	TURN: "turn",
	WIN: "win",
	RESET: "reset",
	ASK_RESET: "ask_reset",
	CANCEL_RESET: "cancel_reset"
};

const Turns = {
	PLAYER1: 0,
	PLAYER2: 1,
	
	random() {
		return Math.floor(Math.random() * 2);
	}
};

const CellType = {
	EMPTY: 0,
	PLAYER1: 1,
	PLAYER2: 2
};

module.exports = class extends Room{
	constructor(roomId)
	{
		super(roomId);
		
		this.askingForReset = false;
		this.resetResponseCount = 0;
		
		this.player1 = null;
		this.player2 = null;
		
		this.newGame();
	}
	
	emitToOther(player, event, data)
	{
		let other = null;
			
		if(player === this.player1)
		{
			other = this.player2;
		}
		else if(player === this.player2)
		{
			other = this.player1;
		}
		
		other.emit(event, data);
	}
	
	connect(player)
	{
		if(!this.isFull())
		{
			super.connect(player);
			
			if(this.player1 === null)
			{
				this.player1 = player;
			}
			else
			{
				this.player2 = player;
			}
			
			this.initializePlayer(player);
			
			player.on(Events.CHECK, (cell) => {
				this.check(player, cell);
			});
			
			player.on(Events.RESET, (data) => {
				this.askReset(player, data);
			});
		}
		else
		{
			player.emit(Events.ERROR, RoomError.ROOM_FULL);
			player.disconnect();	
		}
	}
	
	disconnect(player)
	{
		super.disconnect(player);
		
		if(this.player1 === player)
		{
			this.player1 = null;
			this.player2?.emit(Events.ALONE);
		}
		else
		{
			this.player2 = null;
			this.player1?.emit(Events.ALONE);
		}
	}
	
	isFull()
	{
		return this.size() === 2;
	}
	
	getName()
	{
		return "TicTacToe";
	}
	
	newGame()
	{
		this.turn = Turns.random();
		
		this.grid = [
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0]
		];
	}
	
	initializePlayer(player)
	{		
		player.emit(Events.INIT, {
			yourTurn: (this.player1 === player && this.turn === Turns.PLAYER1) || (this.player2 === player && this.turn === Turns.PLAYER2),
			grid: this.grid
		});
	}
	
	check(player, cell)
	{
		const row = Math.floor(cell / 3);
		const column = cell % 3;
		
		if(this.isFull() && this.grid[row][column] === CellType.EMPTY)
		{
			let isCorrectMove = false;
			let newValue = CellType.EMPTY;
			let nextTurn = Turns.PLAYER1;
			
			if(player === this.player1 && this.turn === Turns.PLAYER1)
			{
				isCorrectMove = true;
				newValue = CellType.PLAYER1;
				nextTurn = Turns.PLAYER2;
			}
			else if(player === this.player2 && this.turn === Turns.PLAYER2)
			{
				isCorrectMove = true;
				newValue = CellType.PLAYER2;
				nextTurn = Turns.PLAYER1;
			}
			
			if(isCorrectMove)
			{
				this.checkToAll(cell, newValue);
				this.grid[row][column] = newValue;
				this.changeTurn(nextTurn);
				this.verifyWin();
			}
		}
	}
	
	checkToAll(cell, value)
	{
		this.broadcast(Events.CHECK, {
			cell: cell,
			value: value
		});
	}
	
	changeTurn(turn)
	{
		this.turn = turn;
		
		if(this.turn === Turns.PLAYER1)
		{
			this.player1.emit(Events.TURN, true);
			this.player2.emit(Events.TURN, false);
		}
		else if(this.turn === Turns.PLAYER2)
		{
			this.player1.emit(Events.TURN, false);
			this.player2.emit(Events.TURN, true);
		}
	}
	
	verifyWin()
	{
		let isEnded = false;
		let winner = CellType.EMPTY;
		let cells = new Array();
		
		if(this.grid[0][0] !== CellType.EMPTY && this.grid[0][0] === this.grid[0][1] && this.grid[0][0] === this.grid[0][2])
		{
			isEnded = true;
			winner = this.grid[0][0];
			cells = [0, 1, 2];
		}
		else if(this.grid[1][0] !== CellType.EMPTY && this.grid[1][0] === this.grid[1][1] && this.grid[1][0] === this.grid[1][2])
		{
			isEnded = true;
			winner = this.grid[1][0];
			cells = [3, 4, 5];
		}
		else if(this.grid[2][0] !== CellType.EMPTY && this.grid[2][0] === this.grid[2][1] && this.grid[2][0] === this.grid[2][2])
		{
			isEnded = true;
			winner = this.grid[2][0];
			cells = [6, 7, 8];
		}
		else if(this.grid[0][0] !== CellType.EMPTY && this.grid[0][0] === this.grid[1][0] && this.grid[0][0] === this.grid[2][0])
		{
			isEnded = true;
			winner = this.grid[0][0];
			cells = [0, 3, 6];
		}
		else if(this.grid[0][1] !== CellType.EMPTY && this.grid[0][1] === this.grid[1][1] && this.grid[0][1] === this.grid[2][1])
		{
			isEnded = true;
			winner = this.grid[0][1];
			cells = [1, 4, 7];
		}
		else if(this.grid[0][2] !== CellType.EMPTY && this.grid[0][2] === this.grid[1][2] && this.grid[0][2] === this.grid[2][2])
		{
			isEnded = true;
			winner = this.grid[0][2];
			cells = [2, 5, 8];
		}
		else if(this.grid[0][0] !== CellType.EMPTY && this.grid[0][0] === this.grid[1][1] && this.grid[0][0] === this.grid[2][2])
		{
			isEnded = true;
			winner = this.grid[0][0];
			cells = [0, 4, 8];
		}
		else if(this.grid[0][2] !== CellType.EMPTY && this.grid[0][2] === this.grid[1][1] && this.grid[0][2] === this.grid[2][0])
		{
			isEnded = true;
			winner = this.grid[0][2];
			cells = [2, 4, 6];
		}
		else
		{
			let noEmpty = true;
			
			for(let row = 0; row < this.grid.length; row++)
			{
				for(let column = 0; column < this.grid[row].length; column++)
				{
					noEmpty &= this.grid[row][column] !== CellType.EMPTY;
				}
			}
			
			isEnded = noEmpty;
		}
		
		if(isEnded)
		{
			if(winner === CellType.PLAYER1)
			{
				this.player1.emit(Events.WIN, {
					winner: true,
					cells: cells
				});
				
				this.player2.emit(Events.WIN, {
					winner: false,
					cells: cells
				});
			}
			else if(winner === CellType.PLAYER2)
			{
				this.player1.emit(Events.WIN, {
					winner: false,
					cells: cells
				});
				
				this.player2.emit(Events.WIN, {
					winner: true,
					cells: cells
				});
			}
			else
			{
				this.broadcast(Events.WIN, {
					winner: undefined,
					cells: cells
				});
			}
		}
	}
	
	askReset(asker, confirm)
	{
		if(this.askingForReset)
		{
			if(confirm)
			{
				this.resetResponseCount++;
				
				if(this.resetResponseCount === this.size())
				{
					this.newGame();
					this.initializePlayer(this.player1);
					this.initializePlayer(this.player2);
					
					this.askingForReset = false;
				}			
			}
			else
			{
				this.broadcast(Events.CANCEL_RESET);
				this.askingForReset = false;
			}
		}
		else
		{			
			this.resetResponseCount = 1;
			this.askingForReset = true;
			
			this.emitToOther(asker, Events.ASK_RESET);
		}
	}
};
