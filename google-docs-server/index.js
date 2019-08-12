const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

io.on("connection", function(socket) {
  console.log("a user conncented");
  socket.on("new-operations", function(data) {
    io.emit("new-remote-operations", data);
  });
});

http.listen(4000, function() {
  console.log("listening on *:4000");
});
