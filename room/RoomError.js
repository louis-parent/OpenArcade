const ErrorType = {
	CLIENT: 100,
	ROOM: 200
};

class RoomError
{
	constructor(type, reason)
	{
		this.code = type++;
		this.reason = reason;
	}
}

module.exports = {
	ROOM_FULL: new RoomError(ErrorType.CLIENT, "The room is full")
}
