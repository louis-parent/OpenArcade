module.exports = {
	ID_SIZE: 16,
	CHARS: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789",
	
	rooms: new Object(),
	
	generateId() {
		let id;
		
		do
		{
			id = "";
			
			for(let i = 0; i < this.ID_SIZE; i++)
			{
				id += this.CHARS[Math.floor(Math.random() * this.CHARS.length)];
			}
			
		} while(!this.isIdFree(id))
		
		return id;
	},
	
	isIdFree(id) {
		return this.rooms[id] === undefined;
	},
	
	exists(id) {
		return this.rooms[id] !== undefined;
	},
	
	in(id){
		return this.rooms[id];
	},
	
	open(id, room) {
		console.log("🔑 A new", room.getName(), "room is open at", id);
		this.rooms[id] = room;
	},
	
	close(id) {
		const room = this.rooms[id];
		this.rooms[id] = undefined;

		console.log("🔒 The", room.getName(), "room at", id, "is closed");
	}
};
