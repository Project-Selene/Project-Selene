(() => {
    console.log("test");
    "use strict";
    var __webpack_modules__ = ({
        219: ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            __webpack_require__.d(__webpack_exports__, {
                "K": () => (cylcic)
            });
            var _b__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(809);
            const x = __injectConst("x", { a: 1 });
            let l;
            __injectLet("l", function () { return l; }, function (value) { l = value; });
            var cylcic = __injectFunction("cylcic", { cylcic: function () {
                    for (let i = 0; i < globalThis["a"]; i++) {
                        if (globalThis["continue"]) {
                            (0, _b__WEBPACK_IMPORTED_MODULE_0__.Bu)(x);
                            console.log(x);
                            console.log(l);
                        }
                    }
                } }["cylcic"]);
        }),
        809: ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            __webpack_require__.d(__webpack_exports__, {
                "Bu": () => (test),
                "Qo": () => (TestParent)
            });
            var _a__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(219);
            var _test__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(127);
            var test = __injectFunction("test", { test: function (asdfasdasd) {
                    console.log("x");
                    new _test__WEBPACK_IMPORTED_MODULE_1__.Q().bar();
                    (0, _a__WEBPACK_IMPORTED_MODULE_0__.K)();
                } }["test"]);
            var TestParent = __injectClass("TestParent", { TestParent: class {
                    constructor() {
                        this.msg = "hi";
                    }
                    target() {
                        console.log(this.msg);
                    }
                } }["TestParent"]);
            const harmony = __injectConst("harmony", () => 42);
        }),
        127: ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            __webpack_require__.d(__webpack_exports__, {
                "Q": () => (Foo)
            });
            var _a__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(219);
            var Foo = __injectClass("Foo", { Foo: class {
                    bar() {
                        console.log("asdf");
                        (0, _a__WEBPACK_IMPORTED_MODULE_0__.K)();
                    }
                } }["Foo"]);
        })
    });
    var __webpack_module_cache__ = {};
    var __webpack_require__ = __injectFunction("__webpack_require__", { __webpack_require__: function (moduleId) {
            var cachedModule = __webpack_module_cache__[moduleId];
            if (cachedModule !== undefined) {
                return cachedModule.exports;
            }
            var module = __webpack_module_cache__[moduleId] = {
                exports: {}
            };
            __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
            return module.exports;
        } }["__webpack_require__"]);
    (() => {
        __webpack_require__.d = (exports, definition) => {
            for (var key in definition) {
                if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
                    Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
                }
            }
        };
    })();
    (() => {
        __webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop));
    })();
    var __webpack_exports__ = {};
    (() => {
        var _b__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(809);
        var _test__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(127);
        const x = __injectConst("x", { a: 1 });
        let l;
        __injectLet("l", function () { return l; }, function (value) { l = value; });
        var TestClient = __injectClass("TestClient", { TestClient: class extends _b__WEBPACK_IMPORTED_MODULE_0__.Qo {
                constructor() {
                    super();
                    this.msg = "hi2";
                }
                target() {
                    console.log("test before super");
                    super.target();
                    console.log("test after super");
                }
            } }["TestClient"]);
        var y = __injectFunction("y", { y: function () {
                l = 123;
                _b__WEBPACK_IMPORTED_MODULE_0__.Bu(x);
                console.log(x);
                console.log(l);
                new TestClient().target();
                new _test__WEBPACK_IMPORTED_MODULE_1__.Q().bar();
            } }["y"]);
        y();
    })();
})();
