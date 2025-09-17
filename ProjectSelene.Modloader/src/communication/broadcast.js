"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadcastCommunication = void 0;
var worker_1 = require("./worker");
var BroadcastCommunication = /** @class */ (function () {
    function BroadcastCommunication(name) {
        var _this = this;
        this.messageQueue = new Map();
        this.channel = new BroadcastChannel(name);
        this.channel.onmessage = function () { return void 0; }; //Does nothing but is required for it to work
        this.channel.addEventListener('message', function (event) {
            if (event.origin !== location.origin) {
                return;
            }
            var data = event.data;
            var queue = _this.messageQueue.get(data.id);
            if (queue && data.success !== undefined) {
                queue.count++;
                queue.results.push(data.data);
                if (!data.success) {
                    queue.success = false;
                }
                if (queue.count >= worker_1.WORKER_COUNT) {
                    if (data.success) {
                        queue.resolve(queue.results);
                    }
                    else {
                        queue.reject(queue.results);
                    }
                    _this.messageQueue.delete(data.id);
                }
            }
        });
    }
    BroadcastCommunication.prototype.send = function (type, message) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var id = Math.random() * 1000000 + Math.random();
            _this.messageQueue.set(id, {
                count: 0,
                results: [],
                success: true,
                resolve: resolve,
                reject: reject,
            });
            _this.channel.postMessage({
                id: id,
                data: message,
                type: type,
            });
        });
    };
    BroadcastCommunication.prototype.on = function (type, handle) {
        var _this = this;
        this.channel.addEventListener('message', function (event) {
            if (event.origin !== location.origin) {
                return;
            }
            var data = event.data;
            if (data.type === type) {
                Promise.resolve()
                    .then(function () { return handle(data.data); })
                    .then(function (result) {
                    return _this.channel.postMessage({
                        id: data.id,
                        success: true,
                        data: result,
                    });
                })
                    .catch(function (result) {
                    return _this.channel.postMessage({
                        id: data.id,
                        success: false,
                        data: result,
                    });
                });
            }
        });
    };
    return BroadcastCommunication;
}());
exports.BroadcastCommunication = BroadcastCommunication;
