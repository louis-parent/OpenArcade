const Express = require("express");
const HTTP = require('http');
const SocketServer = require("socket.io").Server;

const RoomManager = require("./room/RoomManager.js");
const TictactoeRoom = require("./room/tictactoe/TictactoeRoom.js");

const app = Express();
const server = HTTP.createServer(app);
const socketServer = new SocketServer(server);

const port = 8080;

const games = [{
	name: "Tic-Tac-Toe",
	image: "/assets/games/tictactoe/illustration.jpg",
	link: "/tictactoe/"
}];

app.use(Express.static("./public"));

app.get("/", (request, result) => {
	result.sendFile(__dirname + "/page/index.html");
});

app.get("/tictactoe", (request, result) => {
	result.sendFile(__dirname + "/page/tictactoe/index.html");
});

app.get("/tictactoe/:room", (request, result) => {
	const roomId = request.params.room;
	
	if(!RoomManager.exists(roomId))
	{
		RoomManager.open(roomId, new TictactoeRoom(roomId));	
	}
	
	result.sendFile(__dirname + "/page/tictactoe/game.html");
});

app.get("/api/games", (request, result) => {
	result.json(games);
});

app.get("/api/free/room/id", (request, result) => {
	let id = RoomManager.generateId();
	result.json(id);
});


socketServer.on("connection", (socket) => {
	socket.on("room", (roomId) => {
		RoomManager.in(roomId).connect(socket);
	});
});


server.listen(port, () => {
	console.log("🎮 Open Arcade Started !");
});
