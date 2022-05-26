const RoomManager = require("./RoomManager.js");

module.exports = class {
	constructor(id)
	{
		this.id = id;
		this.players = new Array();
	}
	
	connect(player)
	{
		this.players.push(player);
		
		player.on('disconnect', () => {
			this.disconnect(player);
		});
	}
	
	disconnect(player)
	{
		this.players.splice(this.players.indexOf(player), 1);
		
		if(this.players.length === 0)
		{
			RoomManager.close(this.id);
		}
	}
	
	size()
	{
		return this.players.length;
	}
	
	broadcast(event, data)
	{
		for(let player of this.players)
		{
			player.emit(event, data);
		}
	}
	
	getName()
	{
		return "Empty";
	}
};
