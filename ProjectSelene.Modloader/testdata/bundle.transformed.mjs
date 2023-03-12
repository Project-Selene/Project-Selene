/******/ (() => {
    /******/ console.log("test" // webpackBootstrap
    /******/ );
    /******/ "use strict";
    /******/ var __webpack_modules__ = ({
        /***/ 219: 
        /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                /* harmony export */ "K": () => ( /* binding */cylcic)
                /* harmony export */ 
            });
            /* harmony import */ var _b__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(809);
            const x = __injectConst("x", { a: 1 });
            let l;
            __injectLet("l", function () { return l; }, function (value) { l = value; });
            function cylcic() {
                for (let i = 0; i < globalThis["a"]; i++) {
                    if (globalThis["continue"]) {
                        (0, _b__WEBPACK_IMPORTED_MODULE_0__ /* .test */.Bu)(x);
                        console.log(x);
                        console.log(l);
                    }
                }
            }
        }),
        /***/ 809: 
        /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                /* harmony export */ "Bu": () => ( /* binding */test),
                /* harmony export */ "Qo": () => ( /* binding */TestParent)
                /* harmony export */ 
            });
            /* unused harmony export harmony */
            /* harmony import */ var _a__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(219);
            /* harmony import */ var _test__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(127);
            function test(asdfasdasd) {
                console.log("x");
                new _test__WEBPACK_IMPORTED_MODULE_1__ /* .Foo */.Q().bar();
                (0, _a__WEBPACK_IMPORTED_MODULE_0__ /* .cylcic */.K)();
            }
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
        /***/ 127: 
        /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                /* harmony export */ "Q": () => ( /* binding */Foo)
                /* harmony export */ 
            });
            /* harmony import */ var _a__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(219);
            var Foo = __injectClass("Foo", { Foo: class {
                    bar() {
                        console.log("asdf");
                        (0, _a__WEBPACK_IMPORTED_MODULE_0__ /* .cylcic */.K)();
                    }
                } }["Foo"]);
        })
        /******/ 
    });
    /************************************************************************/
    /******/ // The module cache
    /******/ var __webpack_module_cache__ = {};
    /******/
    /******/ // The require function
    /******/ function __webpack_require__(moduleId) {
        /******/ // Check if module is in cache
        /******/ var cachedModule = __webpack_module_cache__[moduleId];
        /******/ if (cachedModule !== undefined) {
            /******/ return cachedModule.exports;
            /******/ }
        /******/ // Create a new module (and put it into the cache)
        /******/ var module = __webpack_module_cache__[moduleId] = {
            /******/ // no module.id needed
            /******/ // no module.loaded needed
            /******/ exports: {}
            /******/ 
        };
        /******/
        /******/ // Execute the module function
        /******/ __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
        /******/
        /******/ // Return the exports of the module
        /******/ return module.exports;
        /******/ 
    }
    /******/
    /************************************************************************/
    /******/ /* webpack/runtime/define property getters */
    /******/ (() => {
        /******/ // define getter functions for harmony exports
        /******/ __webpack_require__.d = (exports, definition) => {
            /******/ for (var key in definition) {
                /******/ if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
                    /******/ Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
                    /******/ }
                /******/ }
            /******/ 
        };
        /******/ 
    })();
    /******/
    /******/ /* webpack/runtime/hasOwnProperty shorthand */
    /******/ (() => {
        /******/ __webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop));
        /******/ 
    })();
    /******/
    /************************************************************************/
    var __webpack_exports__ = {};
    // This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
    (() => {
        /* harmony import */ var _b__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(809);
        /* harmony import */ var _test__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(127);
        const x = __injectConst("x", { a: 1 });
        let l;
        __injectLet("l", function () { return l; }, function (value) { l = value; });
        var TestClient = __injectClass("TestClient", { TestClient: class extends _b__WEBPACK_IMPORTED_MODULE_0__ /* .TestParent */.Qo {
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
        function y() {
            l = 123;
            _b__WEBPACK_IMPORTED_MODULE_0__ /* .test */.Bu(x);
            console.log(x);
            console.log(l);
            new TestClient().target();
            new _test__WEBPACK_IMPORTED_MODULE_1__ /* .Foo */.Q().bar();
        }
        y();
    })();
})();
