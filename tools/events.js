class SocketEmitter extends require("events") {}
const socketEmitter = new SocketEmitter();

exports = module.exports = {
    "on": socketEmitter.on,
    "emit": socketEmitter.emit
};
