"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceWorkerCommunicationClient = void 0;
var ServiceWorkerCommunicationClient = /** @class */ (function () {
    function ServiceWorkerCommunicationClient() {
        var _this = this;
        this.nextId = 1;
        this.messageQueue = new Map();
        navigator.serviceWorker.onmessage = function () { return void 0; }; //Does nothing but is required for it to work
        navigator.serviceWorker.addEventListener('message', function (event) {
            if (event.origin !== location.origin) {
                return;
            }
            _this.handleCallback(event.data);
        });
    }
    ServiceWorkerCommunicationClient.prototype.handleCallback = function (data) {
        var queue = this.messageQueue.get(data.id);
        if (queue && data.success !== undefined) {
            if (data.success) {
                queue.resolve(data.data);
            }
            else {
                queue.reject(data.data);
            }
            this.messageQueue.delete(data.id);
        }
    };
    ServiceWorkerCommunicationClient.prototype.sendToSW = function (type, message) {
        var _this = this;
        var transferables = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            transferables[_i - 2] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            var id = _this.nextId++;
            _this.messageQueue.set(id, {
                resolve: resolve,
                reject: reject,
            });
            navigator.serviceWorker.ready.then(function (sw) {
                var _a;
                return (_a = sw.active) === null || _a === void 0 ? void 0 : _a.postMessage({
                    id: id,
                    data: message,
                    type: type,
                }, transferables);
            });
        });
    };
    ServiceWorkerCommunicationClient.prototype.on = function (type, handle) {
        navigator.serviceWorker.addEventListener('message', function (event) {
            var source = event.source;
            if (event.origin !== location.origin || !source) {
                return;
            }
            var data = event.data;
            if (data.type === type) {
                Promise.resolve()
                    .then(function () { return handle(data.data, ''); })
                    .then(function (result) {
                    return source.postMessage({
                        id: data.id,
                        success: true,
                        data: result,
                    });
                })
                    .catch(function (result) {
                    return source.postMessage({
                        id: data.id,
                        success: false,
                        data: result,
                    });
                });
            }
        });
    };
    return ServiceWorkerCommunicationClient;
}());
exports.ServiceWorkerCommunicationClient = ServiceWorkerCommunicationClient;
