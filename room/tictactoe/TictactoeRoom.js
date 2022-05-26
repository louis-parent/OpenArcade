const Room = require("../Room.js");
const RoomError = require("../RoomError.js");

module.exports = class extends Room{
	constructor(roomId)
	{
		super(roomId);
		
		this.grid = [
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0]
		];
	}
	
	connect(player)
	{
		if(this.size() < 2)
		{		
			super.connect(player);
			player.emit("init", this.grid);
		}
		else
		{
			player.emit("error", RoomError.ROOM_FULL);
			player.disconnect();	
		}
	}
	
	getName()
	{
		return "TicTacToe";
	}
};
