"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tempo = void 0;
const vite_plugin_pages_1 = __importDefault(require("vite-plugin-pages"));
const defaultOptions = {
    pagesDir: 'src/tempobook',
    baseRoute: '/tempobook',
    pathToGlobalStyles: 'src/index.css',
};
function tempo(options) {
    const resolvedOptions = Object.assign(Object.assign({}, defaultOptions), options);
    return [
        (0, vite_plugin_pages_1.default)({
            dirs: [
                { dir: resolvedOptions.pagesDir, baseRoute: resolvedOptions.baseRoute },
            ],
            caseSensitive: true,
            importMode: 'sync',
        }),
        {
            name: 'tempo-routes',
            resolveId(id) {
                if (id === 'tempo-routes') {
                    return id;
                }
                return null;
            },
            load(id) {
                if (id === 'tempo-routes') {
                    return `
            import routes from '~react-pages';
            export default routes;
          `;
                }
                return null;
            },
        },
        {
            // If a new file was added we need to make sure it
            // gets picked up by tailwind, so invalidate the global css file
            name: 'vite-plugin-tailwind-hmr',
            configureServer(_server) {
                let server = _server;
                server.watcher.on('add', (filePath) => __awaiter(this, void 0, void 0, function* () {
                    // Only care about files in the pages dir as this only
                    // happens for files in dynamically loaded routes
                    if (!filePath.includes(resolvedOptions.pagesDir)) {
                        return;
                    }
                    const pathToRepo = filePath.split(resolvedOptions.pagesDir)[0];
                    if (filePath.match(/\.(js|jsx|ts|tsx)$/)) {
                        const timestamp = Date.now();
                        const seen = new Set();
                        const globalStylesModule = server.moduleGraph.idToModuleMap.get(pathToRepo + resolvedOptions.pathToGlobalStyles);
                        if (globalStylesModule) {
                            // Jul 18 2024 - sometimes new added file that is added is not yet processed
                            // by the vite server, need to wait until it is
                            // Note that this function is marked experimental but it works when tested on this date
                            yield server.waitForRequestsIdle(filePath);
                            server.moduleGraph.invalidateModule(globalStylesModule, seen, timestamp);
                        }
                    }
                }));
            },
        },
    ];
}
exports.tempo = tempo;
