"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleCommunication = void 0;
var SingleCommunication = /** @class */ (function () {
    function SingleCommunication(messagePort) {
        var _this = this;
        this.messagePort = messagePort;
        this.resolveQueue = new Map();
        this.rejectQueue = new Map();
        this.messagePort.onmessage = function () { return void 0; }; //Does nothing but is required for it to work
        this.messagePort.addEventListener('message', function (event) {
            var _a, _b;
            var data = event.data;
            if (data.success) {
                (_a = _this.resolveQueue.get(data.id)) === null || _a === void 0 ? void 0 : _a(data.data);
            }
            else {
                (_b = _this.rejectQueue.get(data.id)) === null || _b === void 0 ? void 0 : _b(data.data);
            }
            _this.resolveQueue.delete(data.id);
            _this.rejectQueue.delete(data.id);
        });
    }
    SingleCommunication.prototype.send = function (type, message) {
        var _this = this;
        var transferables = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            transferables[_i - 2] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            var id = Math.random() * 1000000 + Math.random();
            _this.resolveQueue.set(id, resolve);
            _this.rejectQueue.set(id, reject);
            _this.messagePort.postMessage({
                id: id,
                data: message,
                type: type,
            }, transferables.filter(function (t) { return t; }));
        });
    };
    SingleCommunication.prototype.on = function (type, handle) {
        var _this = this;
        this.messagePort.addEventListener('message', function (event) {
            var data = event.data;
            if (data.type === type) {
                Promise.resolve()
                    .then(function () { return handle(data.data); })
                    .then(function (result) {
                    return _this.messagePort.postMessage({
                        id: data.id,
                        success: true,
                        data: result,
                    });
                })
                    .catch(function (result) {
                    return _this.messagePort.postMessage({
                        id: data.id,
                        success: false,
                        data: result,
                    });
                });
            }
        });
    };
    return SingleCommunication;
}());
exports.SingleCommunication = SingleCommunication;
