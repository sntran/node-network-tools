var range = require('ipv4-range');
var ping = require('ping').sys.probe;
var arp = require('arp-a');

module.exports.ping = ping;

module.exports.populateARP = function(address, total, callback) {
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

module.exports.getConnectedClients = function(startIP, total, callback) {
    var activeClients = {};
    populateARP(startIP, total, function(ips) {
        // Populate ARP tale
        arp.table(function(err, entry) {
            if (err) console.log('arp: ' + err.message);
            if (entry && ips[entry.ip]) {
                // alive client
                activeClients[entry.mac] = entry.ip;
            }
            if (!entry) {
                // arp-p also callback after the last entry with both null arguments.
                callback(activeClients);
            }
        });
    });
}

// getConnectedClients("10.0.1.10", 20, function(clients) {
//     console.log(clients);
// })