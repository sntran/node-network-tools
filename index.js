var range = require('ipv4-range');
var ping = require('ping').sys.probe;
var arp = require('arp-a');

var events = require('events'),
    util = require("util");

function setIntervalAndExecute(fn, t) {
    fn();
    return(setInterval(fn, t));
}

var DEFAULT_FREQUENCY = 60;

var populateARP = function(address, total, callback) {
    var count = total, ips = [];
 
    range(address, total).forEach(function( address, index) {
        // Get a range of surrounding IP addresses
        ping(address, function(alive) {
            ips[address] = alive;
            // Populate ARP table by pinging the IPs
            if (--count === 0) {
                callback(ips) ;
            }
        });
    });
}

var getConnectedClients = function(startIP, total, callback) {
    var activeClients = {};
    populateARP(startIP, total, function(ips) {
        // Populate ARP tale
        arp.table(function(err, entry) {
            if (err) return callback(err, activeClients);

            if (entry && ips[entry.ip]) {
                // alive client
                activeClients[entry.mac] = entry.ip;
            }
            if (!entry) {
                // arp-p also callback after the last entry with both null arguments.
                callback(null, activeClients);
            }
        });
    });
}

var Monitor = function (options) {
    this.timer = null;
    events.EventEmitter.call(this);
    this.ping(options);
}
util.inherits(Monitor, events.EventEmitter);

Monitor.prototype.ping = function(options) {
    var stream = this;

    if (typeof options !== 'object') return; // No specs, bail out
    var startIP = options.startIP || this.startIP; // Either new poll, or resume with or without a new url
    if (!startIP) return; // No known url, bail out
    var total = options.total || 1;

    this.startIP = startIP;
    this.frequency = (options.frequency || this.frequency || DEFAULT_FREQUENCY) * 1000;

    this.timer = setIntervalAndExecute(function() {
        getConnectedClients(startIP, total, function(err, activeClients) {
            if (err) {
                stream.emit("error", err);
            } else {
                stream.emit("update", activeClients);
            }
        });
    }, stream.frequency);
}

Monitor.prototype.stop = function() {
    if (this.timer) clearInterval(this.timer);
}

Monitor.prototype.pause = function() {
    if (this.timer) clearInterval(this.timer);
}

Monitor.prototype.resume = function(options) {
    this.stop();
    this.poll(options);
}

module.exports.ping = ping;
module.exports.populateARP = populateARP;
module.exports.getConnectedClients = getConnectedClients;
module.exports.Monitor = Monitor;

// var monitor = new Monitor({
//     startIP: "10.0.1.10",
//     total: 20,
//     frequency: 10
// });
// monitor.on("update", function(clients) {
//     console.log(clients);
// });