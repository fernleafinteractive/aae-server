const net = require('net');
const {Server : SocketIOServer} = require('socket.io');


const port = 7070;
const ioPort = 7071;
const host = 'localhost';

const connectedSockets = [];


// TCP server to connect with AAE C++
const server = net.createServer(
    (socket) => {
        let buffer = "";

        console.log('Client connected', socket.address());

        socket.on('data', data => {

            buffer += data.toString();
            let endIndex;
            let jsonMessage = "";

            if(buffer.includes('Starting to buffer')) {
                console.log("---FOUND HERE---");
            }

            while((endIndex = buffer.indexOf('--end--')) !== -1) {
                jsonMessage = buffer.slice(0, endIndex);
                buffer = buffer.slice(endIndex + 7);

                for(const connected of connectedSockets) {
                    if(!connected.connected) {
                        connectedSockets.splice(connectedSockets.indexOf(connected), 1);
                        continue;
                    }
                    connected.emit('data', jsonMessage);
                }
            }
        })
        socket.on('end', () => {
            console.log('Client disconnected', socket.address());
            console.log("-------------");
        });
    }
)

server.listen(port, host, () => {
    console.log(`Server listening on port ${port}`);
})

// Socket.io server to connect to frontend since TCP connections are not yet available directly from the frontend
const io = new SocketIOServer(ioPort, {
    cors: {
        origin: '*',
    }
});

io.on('connection', socket => {
    console.log("Frontend connection");

    connectedSockets.push(socket);

    socket.on('disconnect', () => {
        connectedSockets.splice(connectedSockets.indexOf(socket), 1);
    })
});

