// keep_alive.js
var http = require('http');

function startServer() {
    http.createServer(function (req, res) {
        res.write("I'm alive");
        res.end();
    }).listen(8080, () => {
        console.log('Server is running and alive at http://localhost:8080');
    });
}

module.exports = startServer; // Export the function to start the server
