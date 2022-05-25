const Express = require("express");
const app = Express();

const port = 8080;

app.use(Express.static("./public"));

app.get("/", (request, result) => {
  result.sendFile(__dirname + "/game/index.html");
});

app.listen(port, () => {
	console.log("🎮 Open Arcade Started !");
});
