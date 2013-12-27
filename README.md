wifi-tools
==========

Utilities to interact with Wifi network.

Since this library uses raw sockets instead of spawning process,
you need to run your application with root priviledge.

### Ping

```js
ping(ip, function(alive) {
    
});
```

### Pouplate ARP table

```js
populateARP("10.0.1.10", 5, function(ips) {
    /* ips = {
        "10.0.1.8": true,
        "10.0.1.9": false,
        "10.0.1.10": false,
        "10.0.1.11": true
        "10.0.1.12": true
    } */
});
```

### Get connected clients on the network

```js
getConnectedClients("10.0.1.10", 5, function(clients) {
    /* clients = {
        "e0:xx:xx:xx:xx:xx": "10.0.1.8",
        "b8:xx:xx:xx:xx:xx": "10.0.1.11",
        "00:xx:xx:xx:xx:xx": "10.0.1.12"
    } */
});
```

### Monitor for active clients

```js
var monitor = new Monitor({
    startIP: "10.0.1.50",
    total: 100,
    frequency: 10 // in second
});
monitor.on("in", function(client) {
    console.log("in", client);
}).on("out", function(client) {
    console.log("out", client);
});
```

---

The MIT License (MIT)

Copyright (c) 2013 Son Tran-Nguyen

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
