wifi-tools
==========

Utilities to interact with Wifi network.

### Ping

```js
ping(ip, function(alive) {
    
});
```

### Pouplate ARP table

```js
populateARP("192.168.1.10", 5, function(ips) {
    /* ips = {
        "192.168.1.8": true,
        "192.168.1.9": false,
        "192.168.1.10": false,
        "192.168.1.11": true
        "192.168.1.12": true
    } */
});
```

### Get connected clients on the network

```js
getConnectedClients("192.168.1.10", 5, function(clients) {
    /* clients = {
        "e0:xx:xx:xx:xx:xx": "192.168.1.8",
        "b8:xx:xx:xx:xx:xx": "192.168.1.11",
        "00:xx:xx:xx:xx:xx": "192.168.1.12"
    } */
});
```

### Monitor for active clients

```js
var monitor = new Monitor({
    startIP: "10.0.1.10",
    total: 5,
    frequency: 60 // in second
});
monitor.on("update", function(clients) {
    console.log(clients);
}).on("error", function(err) {
    console.log(err.message);
});
```