var range = require('ipv4-range');
var session = require ("net-ping").createSession({timeout: 500});
var ping = session.pingHost.bind(session);
var arp = require('arp-a');

var events = require('events'),
    util = require("util");

function setIntervalAndExecute(fn, t) {
    fn();
    return(setInterval(fn, t));
}

var DEFAULT_FREQUENCY = 60;

var populateARP = function(address, total, callback) {
    var count = total, ips = {};
    
    // Get a range of surrounding IP addresses
    range(address, total).forEach(function( address, index) {
        ping(address, function(err, target) {
            if (err) ips[address] = false;
            ips[address] = true;
            // Populate ARP table by pinging the IPs
            if (--count === 0) {
                callback(ips) ;
            }
        });
    });
}

var getConnectedClients = function(startIP, total, callback) {
    var activeClients = {};
    // Populate ARP tale
    populateARP(startIP, total, function(ips) {
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
    this.previous = {};
    events.EventEmitter.call(this);
    this.ping(options);
}
util.inherits(Monitor, events.EventEmitter);

Monitor.prototype.ping = function(options) {
    var stream = this;

    if (typeof options !== 'object') return; // No specs, bail out
    var startIP = options.startIP || this.startIP; // Either new ping, or resume
    if (!startIP) return; // No known startIP, bail out
    var total = options.total || 1;

    this.startIP = startIP;
    this.frequency = (options.frequency || this.frequency || DEFAULT_FREQUENCY) * 1000;

    this.timer = setIntervalAndExecute(function() {
        getConnectedClients(startIP, total, function(err, activeClients) {
            if (err) {
                stream.emit("error", err);
            } else {
                var previous = stream.previous, updates = {};
                for(var mac in activeClients){
                    var ip = activeClients[mac];
                    updates[mac] = ip; // Clone the new data.
                    if (previous.hasOwnProperty(mac)){
                        // Remove all duplicate clients from previous list
                        // so that it only contains old clients.
                        delete previous[mac];
                    } else {
                        stream.emit("in", {mac: mac, ip: ip});
                    }
                }
                for (var mac in previous) {
                    var ip = previous[mac];
                    // After the first loop, previous now only contains old clients
                    stream.emit("out", {mac: mac, ip: ip});
                }
                stream.emit("update", activeClients);
                stream.previous = updates;
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