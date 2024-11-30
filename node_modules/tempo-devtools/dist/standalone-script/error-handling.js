"use strict";
(function () {
    if (window.location.href.includes('framework=VITE')) {
        const showErrorOverlay = (err) => {
            // must be within function call because that's when the element is defined for sure.
            const ErrorOverlay = customElements.get('vite-error-overlay');
            // don't open outside vite environment
            if (!ErrorOverlay) {
                return;
            }
            const overlay = new ErrorOverlay(err);
            document.body.appendChild(overlay);
        };
        window.addEventListener('error', showErrorOverlay);
        window.addEventListener('unhandledrejection', ({ reason }) => showErrorOverlay(reason));
    }
    let parentPort = null;
    let queuedErrorToSend = null;
    // Setup the transfered port
    const initPort = (e) => {
        if (e.data === 'init') {
            parentPort = e.ports[0];
            if (queuedErrorToSend) {
                sendErrorToParent(queuedErrorToSend);
                queuedErrorToSend = null;
            }
        }
    };
    // Listen for the intial port transfer message
    window.addEventListener('message', initPort);
    const sendErrorToParent = (err) => {
        var _a;
        if (parentPort) {
            const serializedError = {
                message: err.message,
                filename: err.filename,
                lineno: err.lineno,
                colno: err.colno,
                stack: (_a = err.error) === null || _a === void 0 ? void 0 : _a.stack, // Optional chaining in case `error` is undefined
            };
            parentPort.postMessage({
                id: 'ERROR',
                error: serializedError,
            });
        }
        else {
            queuedErrorToSend = err;
        }
    };
    window.addEventListener('error', sendErrorToParent);
    window.addEventListener('unhandledrejection', ({ reason }) => sendErrorToParent(reason));
})();
