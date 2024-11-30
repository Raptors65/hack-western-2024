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
exports.initChannelMessagingFunctions = void 0;
const identifierUtils_1 = require("./identifierUtils");
const sessionStorageUtils_1 = require("./sessionStorageUtils");
const navTreeUtils_1 = require("./navTreeUtils");
// @ts-ignore
const jquery_1 = __importDefault(require("jquery"));
const lodash_1 = __importDefault(require("lodash"));
const outlineUtils_1 = require("./outlineUtils");
const cssFunctions_1 = require("./cssFunctions");
const constantsAndTypes_1 = require("./constantsAndTypes");
const changeItemFunctions_1 = require("./changeItemFunctions");
const resqUtils_1 = require("./resqUtils");
const tempoElement_1 = require("./tempoElement");
const editTextUtils_1 = require("./editTextUtils");
const PIXELS_TO_MOVE_BEFORE_DRAG = 20;
const IMMEDIATELY_REMOVE_POINTER_LOCK = 'IMMEDIATELY_REMOVE_POINTER_LOCK';
const LAST_NAV_TREE_REFRESH_TIME = 'LAST_NAV_TREE_REFRESH_TIME';
// TODO: Change all of this to be a react wrapper library
const initChannelMessagingFunctions = () => {
    // @ts-ignore
    String.prototype.hashCode = function () {
        var hash = 0, i, chr;
        if (this.length === 0)
            return hash;
        for (i = 0; i < this.length; i++) {
            chr = this.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };
    // We want to make event listeners non-passive, and to do so have to check
    // that browsers support EventListenerOptions in the first place.
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Safely_detecting_option_support
    let passiveSupported = false;
    const makePassiveEventOption = () => {
        try {
            const options = {
                get passive() {
                    // This function will be called when the browser
                    //   attempts to access the passive property.
                    passiveSupported = true;
                    return false;
                },
            };
            return options;
        }
        catch (err) {
            passiveSupported = false;
            return passiveSupported;
        }
    };
    /**
     * Taken from: https://stackoverflow.com/questions/3219758/detect-changes-in-the-dom
     *
     * Returns the function to disconnect the observer
     */
    const observeDOM = (function () {
        // @ts-ignore
        var MutationObserver = 
        // @ts-ignore
        window.MutationObserver || window.WebKitMutationObserver;
        return function (obj, callback) {
            if (!obj || obj.nodeType !== 1)
                return () => { };
            if (MutationObserver) {
                // define a new observer
                var mutationObserver = new MutationObserver(callback);
                // have the observer observe foo for changes in children
                mutationObserver.observe(obj, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                });
                return () => {
                    mutationObserver.disconnect();
                };
            }
            // browser support fallback
            // @ts-ignore
            else if (window.addEventListener) {
                obj.addEventListener('DOMNodeInserted', callback, false);
                obj.addEventListener('DOMNodeRemoved', callback, false);
                return () => {
                    obj.removeEventListener('DOMNodeInserted', callback, false);
                    obj.removeEventListener('DOMNodeRemoved', callback, false);
                };
            }
            return () => { };
        };
    })();
    /**
     * When selecting in normal mode (not meta key), can select one level down, a sibling
     * or a parent of the selected element
     */
    const getSelectableNavNode = (e) => {
        const selectedElementKey = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.SELECTED_ELEMENT_KEY);
        const selectedElement = tempoElement_1.TempoElement.fromKey(selectedElementKey);
        const elementKeyToNavNode = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.ELEMENT_KEY_TO_NAV_NODE);
        // Move up the tree until you find the first valid nav node
        let firstNavNode = null;
        let searchNode = e.target;
        while (searchNode && !firstNavNode) {
            firstNavNode =
                elementKeyToNavNode[(0, identifierUtils_1.getElementKeyFromNode)(searchNode) || ''];
            searchNode = searchNode.parentElement;
        }
        if (!firstNavNode) {
            return constantsAndTypes_1.SELECT_OR_HOVER_STORYBOARD;
        }
        const isNavNodeMatch = (navTreeNode) => {
            var _a, _b, _c, _d;
            if (selectedElement.isEmpty()) {
                // This function cannot be called if there is no selected element, see code logic below the function
                throw Error('No selected element when isNavNodeMatch called');
            }
            if (!navTreeNode) {
                return false;
            }
            // If there is no codebase ID it should not be selectable as there is nothing we can do with it
            if (!navTreeNode.tempoElement.codebaseId.startsWith('tempo-') ||
                navTreeNode.tempoElement.codebaseId === navTreeUtils_1.SKIP_ROOT_CODEBASE_ID) {
                return false;
            }
            // If it matches, we already passed all possible children, so re-select it
            if (selectedElement.isEqual(navTreeNode.tempoElement)) {
                return true;
            }
            // Any parent is ok to select
            if (navTreeNode.tempoElement.isParentOf(selectedElement)) {
                return true;
            }
            // Check parents
            // Pick the first parent with a codebase ID
            let parent = navTreeNode.parent;
            while (parent && !parent.tempoElement.codebaseId.startsWith('tempo-')) {
                parent = parent.parent;
            }
            // One level down
            if ((_a = parent === null || parent === void 0 ? void 0 : parent.tempoElement) === null || _a === void 0 ? void 0 : _a.isEqual(selectedElement)) {
                return true;
            }
            // Sibling of any parent
            const selectedNode = elementKeyToNavNode[selectedElement.getKey()];
            if (selectedNode &&
                ((_d = (_c = (_b = navTreeNode.parent) === null || _b === void 0 ? void 0 : _b.children) === null || _c === void 0 ? void 0 : _c.includes) === null || _d === void 0 ? void 0 : _d.call(_c, selectedNode))) {
                return true;
            }
            return false;
        };
        let foundNavNode = null;
        let searchNavNode = firstNavNode;
        while (searchNavNode) {
            if (!selectedElement.isEmpty() && !selectedElement.isStoryboard()) {
                // If there is a selected element key loop from this element up the stack to find the element that is the direct child
                // of the expected selected element, so that you can only hover one level deeper than you've selected
                if (isNavNodeMatch(searchNavNode)) {
                    foundNavNode = searchNavNode;
                    // Exit the loop as we found the node that matches
                    break;
                }
            }
            else {
                // If there is no selected element key, or the selection is the storyboard itself, loop up to the top-most element with a codebase ID
                if (searchNavNode.tempoElement.codebaseId &&
                    searchNavNode.tempoElement.codebaseId.startsWith('tempo-')) {
                    foundNavNode = searchNavNode;
                    // Note: we do not exit the loop here as we want to keep searching for the top-most element
                }
            }
            searchNavNode = searchNavNode.parent;
        }
        return foundNavNode || null;
    };
    const onPointerOver = (e, parentPort, storyboardId, selectBottomMostElement) => {
        const passedThrough = passThroughEventsIfNeeded(e, parentPort, storyboardId);
        const editingTextInfo = (0, editTextUtils_1.getEditingInfo)();
        // Allow on pointer over events if editing (so we can click out)
        if (e.altKey || (passedThrough && !editingTextInfo)) {
            return;
        }
        if ((0, sessionStorageUtils_1.getMemoryStorageItem)('mouseDragContext')) {
            return;
        }
        const currentHoveredKey = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.HOVERED_ELEMENT_KEY);
        const elementKeyToNavNode = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.ELEMENT_KEY_TO_NAV_NODE) || {};
        let hoveredNavNode;
        if (e.metaKey || e.ctrlKey || selectBottomMostElement) {
            const elementKey = (0, identifierUtils_1.getElementKeyFromNode)(e.target);
            hoveredNavNode = elementKeyToNavNode[elementKey];
            // Special case -> this is the top-most node so it should trigger a hover on the storyboard
            if (!hoveredNavNode && e.target.parentNode === document.body) {
                hoveredNavNode = constantsAndTypes_1.SELECT_OR_HOVER_STORYBOARD;
            }
        }
        else {
            hoveredNavNode = getSelectableNavNode(e);
        }
        const currentSelectedKey = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.SELECTED_ELEMENT_KEY);
        const currentSelectedElement = tempoElement_1.TempoElement.fromKey(currentSelectedKey);
        // If the user is holding shift, only allow selecting siblings
        if (e.shiftKey && hoveredNavNode && currentSelectedKey) {
            // Trying to select the entire storyboard, allow only if the other selected element is also a storyboard
            if (typeof hoveredNavNode === 'string' &&
                !currentSelectedElement.isStoryboard()) {
                hoveredNavNode = null;
            }
            if (typeof hoveredNavNode !== 'string' &&
                !(hoveredNavNode === null || hoveredNavNode === void 0 ? void 0 : hoveredNavNode.tempoElement.isSiblingOf(currentSelectedElement))) {
                hoveredNavNode = null;
            }
        }
        if (!hoveredNavNode) {
            if (currentHoveredKey !== null) {
                (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.HOVERED_ELEMENT_KEY, null);
                parentPort.postMessage({
                    id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.HOVERED_ELEMENT_KEY,
                    elementKey: null,
                });
                (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
            }
            return;
        }
        if (typeof hoveredNavNode === 'string') {
            if (hoveredNavNode === constantsAndTypes_1.SELECT_OR_HOVER_STORYBOARD) {
                const storyboardKey = tempoElement_1.TempoElement.forStoryboard(storyboardId).getKey();
                if (currentHoveredKey !== storyboardKey) {
                    (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.HOVERED_ELEMENT_KEY, storyboardKey);
                    parentPort.postMessage({
                        id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.HOVERED_ELEMENT_KEY,
                        elementKey: storyboardKey,
                    });
                    (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
                }
            }
            return;
        }
        const tempoElementKey = hoveredNavNode.tempoElement.getKey();
        if (currentHoveredKey !== tempoElementKey) {
            parentPort.postMessage({
                id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.HOVERED_ELEMENT_KEY,
                elementKey: tempoElementKey,
            });
            (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.HOVERED_ELEMENT_KEY, tempoElementKey);
            (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
        }
    };
    const clearHoveredElements = (parentPort, storyboardId) => {
        const currentHoveredKey = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.HOVERED_ELEMENT_KEY);
        if (!currentHoveredKey) {
            return;
        }
        parentPort.postMessage({
            id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.HOVERED_ELEMENT_KEY,
            elementKey: null,
        });
        (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.HOVERED_ELEMENT_KEY, null);
        (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
    };
    const onPointerMove = (e, parentPort, storyboardId) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        passThroughEventsIfNeeded(e, parentPort, storyboardId);
        // If no buttons are pressed the drag end event may not have correctly triggered
        // reset the drag state
        let mouseDragData = (0, sessionStorageUtils_1.getMemoryStorageItem)('mouseDragContext');
        if (!e.buttons && mouseDragData) {
            (0, sessionStorageUtils_1.setMemoryStorageItem)('mouseDragContext', null);
            if (mouseDragData === null || mouseDragData === void 0 ? void 0 : mouseDragData.dragging) {
                parentPort.postMessage({
                    id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.DRAG_CANCEL_EVENT,
                    event: {},
                });
            }
            mouseDragData = null;
        }
        const importantFields = {
            pageX: e.pageX,
            pageY: e.pageY,
            clientX: e.clientX,
            clientY: e.clientY,
        };
        (0, sessionStorageUtils_1.setMemoryStorageItem)('mousePos', importantFields);
        parentPort.postMessage({
            id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.MOUSE_MOVE_EVENT,
            event: importantFields,
        });
        if (mouseDragData && !mouseDragData.dragging) {
            const zoomPerc = (0, sessionStorageUtils_1.getMemoryStorageItem)('zoomPerc') || 1;
            const totalMovementPixels = Math.abs(mouseDragData.pageX - e.pageX) +
                Math.abs(mouseDragData.pageY - e.pageY);
            // Start the drag event if the user has moved enough
            if (totalMovementPixels >= PIXELS_TO_MOVE_BEFORE_DRAG / zoomPerc) {
                // Reselect the parent if there was one to select
                if (mouseDragData.parentSelectedElementKey) {
                    const elementKeyToNavNode = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.ELEMENT_KEY_TO_NAV_NODE) || {};
                    const navNodeToSelect = elementKeyToNavNode[mouseDragData.parentSelectedElementKey];
                    if (navNodeToSelect) {
                        parentPort.postMessage({
                            id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.SELECTED_ELEMENT_KEY,
                            elementKey: mouseDragData.parentSelectedElementKey,
                            outerHTML: (_a = (0, jquery_1.default)(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${mouseDragData.parentSelectedElementKey}`).get(0)) === null || _a === void 0 ? void 0 : _a.outerHTML,
                        });
                        (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.SELECTED_ELEMENT_KEY, mouseDragData.parentSelectedElementKey);
                    }
                }
                const aiContextSelection = (0, sessionStorageUtils_1.getMemoryStorageItem)('aiContext');
                // Don't enable dragging if the AI context is enabled
                if (!aiContextSelection) {
                    (0, sessionStorageUtils_1.setMemoryStorageItem)('mouseDragContext', Object.assign(Object.assign({}, mouseDragData), { dragging: true }));
                    const selectedElementKey = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.SELECTED_ELEMENT_KEY);
                    const selectedElement = (0, jquery_1.default)(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${selectedElementKey}`).get(0);
                    // Trigger the drag start event
                    parentPort.postMessage({
                        id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.DRAG_START_EVENT,
                        event: mouseDragData,
                        outerHTML: selectedElement === null || selectedElement === void 0 ? void 0 : selectedElement.outerHTML,
                    });
                    const bodyObject = (0, jquery_1.default)('body').get(0);
                    // HACK: March 8, 2024
                    // Without this workaround events stay inside the iframe so it's not possible to
                    // track mouse movements outside the iframe when clicking & dragging.
                    // Set the pointer lock and immediately remove it so that
                    // the events start to propagate upwards in the outer application.
                    (0, sessionStorageUtils_1.setMemoryStorageItem)(IMMEDIATELY_REMOVE_POINTER_LOCK, true);
                    yield (bodyObject === null || bodyObject === void 0 ? void 0 : bodyObject.requestPointerLock());
                }
            }
        }
        if ((0, sessionStorageUtils_1.getMemoryStorageItem)('mouseDragContext')) {
            (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
        }
    });
    const getParentDomElementForNavNode = (navNode) => {
        if (!navNode) {
            return null;
        }
        if (!(navNode === null || navNode === void 0 ? void 0 : navNode.isComponent)) {
            const childDomElement = (0, jquery_1.default)(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${navNode.tempoElement.getKey()}`).get(0);
            return childDomElement === null || childDomElement === void 0 ? void 0 : childDomElement.parentElement;
        }
        // This is the list of real DOM elements that are at the top level of this component
        const elementKeyToLookupList = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.ELEMENT_KEY_TO_LOOKUP_LIST) || {};
        const lookupList = elementKeyToLookupList[navNode.tempoElement.getKey()] || [];
        let childDomElement;
        lookupList.forEach((lookupElementKey) => {
            if (childDomElement) {
                return;
            }
            childDomElement = (0, jquery_1.default)(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${lookupElementKey}`).get(0);
        });
        return childDomElement === null || childDomElement === void 0 ? void 0 : childDomElement.parentElement;
    };
    const onPointerDown = (e, parentPort, storyboardId) => {
        // This variable determines which button was used
        // 1 -> left, 2 -> middle, 3 -> right
        if (e.which !== 1) {
            return;
        }
        // Allow the edit dynamic text button to be clicked
        if ((0, identifierUtils_1.hasClass)(e.target, identifierUtils_1.EDIT_TEXT_BUTTON)) {
            return;
        }
        const passedThrough = passThroughEventsIfNeeded(e, parentPort, storyboardId);
        if (passedThrough) {
            return;
        }
        const selectedElementKey = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.SELECTED_ELEMENT_KEY);
        const selectedElement = tempoElement_1.TempoElement.fromKey(selectedElementKey);
        const selectedNavNode = onSelectElement(e, parentPort, storyboardId);
        const useSelectedIfDragging = !selectedElement.isEmpty() &&
            selectedElement.isParentOf(selectedNavNode === null || selectedNavNode === void 0 ? void 0 : selectedNavNode.tempoElement);
        let offsetX, offsetY;
        if (selectedNavNode === null || selectedNavNode === void 0 ? void 0 : selectedNavNode.pageBoundingBox) {
            offsetX =
                selectedNavNode.pageBoundingBox.pageX +
                    selectedNavNode.pageBoundingBox.width / 2 -
                    e.pageX;
            offsetY =
                selectedNavNode.pageBoundingBox.pageY +
                    selectedNavNode.pageBoundingBox.height / 2 -
                    e.pageY;
        }
        const importantFields = {
            pageX: e.pageX,
            pageY: e.pageY,
            // The difference between where the user clicked and the center of the element
            offsetX,
            offsetY,
            // Used to reselect the parent if the user starts to move
            parentSelectedElementKey: useSelectedIfDragging
                ? selectedElementKey
                : null,
        };
        const elementKeyToNavNode = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.ELEMENT_KEY_TO_NAV_NODE) || {};
        // Get the parent element (actual DOM element) that this node is being dragged inside
        // To do this pick one child element that is being dragged (can be multiple children if the node being dragged is a component),
        // and get its parent in the DOM
        const navNodeToUseForDragging = useSelectedIfDragging
            ? elementKeyToNavNode[selectedElementKey]
            : selectedNavNode;
        const parentDomElement = getParentDomElementForNavNode(navNodeToUseForDragging);
        if (parentDomElement) {
            importantFields['selectedParentDisplay'] = (0, cssFunctions_1.cssEval)(parentDomElement, 'display');
            importantFields['selectedParentFlexDirection'] = (0, cssFunctions_1.cssEval)(parentDomElement, 'flex-direction');
        }
        const aiContextSelection = (0, sessionStorageUtils_1.getMemoryStorageItem)('aiContext');
        // Don't enable dragging if the AI context is enabled
        if (!aiContextSelection) {
            (0, sessionStorageUtils_1.setMemoryStorageItem)('mouseDragContext', importantFields);
        }
        (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
    };
    const onPointerUp = (e, parentPort, storyboardId) => {
        passThroughEventsIfNeeded(e, parentPort, storyboardId);
        const mouseDragData = (0, sessionStorageUtils_1.getMemoryStorageItem)('mouseDragContext');
        (0, sessionStorageUtils_1.setMemoryStorageItem)('mouseDragContext', null);
        if (mouseDragData === null || mouseDragData === void 0 ? void 0 : mouseDragData.dragging) {
            parentPort.postMessage({
                id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.DRAG_END_EVENT,
                event: {},
            });
        }
        (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
    };
    const onSelectElement = (e, parentPort, storyboardId) => {
        var _a, _b, _c;
        const driveModeEnabled = !!(0, sessionStorageUtils_1.getSessionStorageItem)('driveModeEnabled', storyboardId);
        if (driveModeEnabled) {
            return null;
        }
        const elementKeyToNavNode = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.ELEMENT_KEY_TO_NAV_NODE) || {};
        let selectedNavNode;
        if (e.metaKey || e.ctrlKey) {
            const elementKey = (0, identifierUtils_1.getElementKeyFromNode)(e.target);
            selectedNavNode = elementKeyToNavNode[elementKey];
            // Special case -> this is the top-most node so it should trigger a select on the storyboard
            if (!selectedNavNode && e.target.parentNode === document.body) {
                selectedNavNode = constantsAndTypes_1.SELECT_OR_HOVER_STORYBOARD;
            }
        }
        else {
            selectedNavNode = getSelectableNavNode(e);
        }
        const currentSelectedElementKey = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.SELECTED_ELEMENT_KEY);
        // If this is not a valid nav node, it's not something we track - deselect all
        if (!selectedNavNode) {
            if (currentSelectedElementKey) {
                parentPort.postMessage({
                    id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.SELECTED_ELEMENT_KEY,
                    elementKey: null,
                });
                (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.SELECTED_ELEMENT_KEY, null);
                (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
            }
            return null;
        }
        const currentSelectedElement = tempoElement_1.TempoElement.fromKey(currentSelectedElementKey);
        const currentMultiSelectedKeys = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.MULTI_SELECTED_ELEMENT_KEYS) || [];
        let newSelectedElement = typeof selectedNavNode === 'string'
            ? tempoElement_1.TempoElement.forStoryboard(storyboardId)
            : selectedNavNode.tempoElement;
        let newMultiSelectKeys = [];
        // If the user is holding shift, check if we can multi-select (something has to be already selected)
        // Note: this logic generally matches the logic in the iframe slice on tempo-web
        if (e.shiftKey && currentSelectedElementKey) {
            // First check if we are deselecting
            const elementToDeselect = currentMultiSelectedKeys
                .map((elementKey) => tempoElement_1.TempoElement.fromKey(elementKey))
                .find((element) => {
                return (element.isParentOf(newSelectedElement) ||
                    element.isEqual(newSelectedElement));
            });
            if (elementToDeselect) {
                newMultiSelectKeys = currentMultiSelectedKeys.filter((elementKey) => {
                    return elementKey !== elementToDeselect.getKey();
                });
                // Pick a new element to be the main selected element
                // Note, if the length is 1, there is logic further down to handle that case explicitly (to exit multiselect mode)
                if (elementToDeselect.isEqual(currentSelectedElement) &&
                    newMultiSelectKeys.length > 1) {
                    parentPort.postMessage({
                        id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.SELECTED_ELEMENT_KEY,
                        elementKey: newMultiSelectKeys[0],
                        outerHTML: (_a = (0, jquery_1.default)(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${newMultiSelectKeys[0]}`).get(0)) === null || _a === void 0 ? void 0 : _a.outerHTML,
                    });
                    (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.SELECTED_ELEMENT_KEY, newMultiSelectKeys[0]);
                }
                // Check if we can add this element
            }
            else if (currentSelectedElement.isSiblingOf(newSelectedElement)) {
                if (currentMultiSelectedKeys === null || currentMultiSelectedKeys === void 0 ? void 0 : currentMultiSelectedKeys.length) {
                    newMultiSelectKeys = currentMultiSelectedKeys.concat([
                        newSelectedElement.getKey(),
                    ]);
                }
                else {
                    newMultiSelectKeys = [
                        currentSelectedElementKey,
                        newSelectedElement.getKey(),
                    ];
                }
            }
            else {
                // This case the user is trying to multiselect but it's not something that's allowed, just return but don't make any changes
                return null;
            }
        }
        // In multiselect mode, set the necessary values
        if (newMultiSelectKeys.length > 1) {
            parentPort.postMessage({
                id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.MULTI_SELECTED_ELEMENT_KEYS,
                elementKeys: newMultiSelectKeys,
                outerHTMLs: newMultiSelectKeys === null || newMultiSelectKeys === void 0 ? void 0 : newMultiSelectKeys.map((elementKey) => { var _a; return (_a = (0, jquery_1.default)(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${elementKey}`).get(0)) === null || _a === void 0 ? void 0 : _a.outerHTML; }),
            });
            (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.MULTI_SELECTED_ELEMENT_KEYS, newMultiSelectKeys);
            (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
            (0, editTextUtils_1.teardownEditableText)(parentPort, storyboardId);
            return null; // Cannot perform regular actions on any particular node
        }
        // Special case - multiselecting but deselecting down to 1, stop the multiselect mode
        if (newMultiSelectKeys.length === 1) {
            newSelectedElement = tempoElement_1.TempoElement.fromKey(newMultiSelectKeys[0]);
        }
        const clearMultiSelectState = () => {
            // Not multi-selecting, so clear the multiselect state
            // Want to do this after setting the selected element to prevent flashing
            parentPort.postMessage({
                id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.MULTI_SELECTED_ELEMENT_KEYS,
                elementKeys: [],
                outerHTMLs: [],
            });
            (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.MULTI_SELECTED_ELEMENT_KEYS, null);
        };
        // Selecting the storyboard from within
        if (newSelectedElement.isStoryboard()) {
            if (newSelectedElement.getKey() !== currentSelectedElementKey) {
                parentPort.postMessage({
                    id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.SELECTED_ELEMENT_KEY,
                    elementKey: newSelectedElement.getKey(),
                    outerHTML: (_b = (0, jquery_1.default)(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${newSelectedElement.getKey()}`).get(0)) === null || _b === void 0 ? void 0 : _b.outerHTML,
                });
                (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.SELECTED_ELEMENT_KEY, newSelectedElement.getKey());
                (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
            }
            (0, editTextUtils_1.teardownEditableText)(parentPort, storyboardId);
            clearMultiSelectState();
            return null;
        }
        if ((0, editTextUtils_1.currentlyEditing)()) {
            const editingInfo = (0, editTextUtils_1.getEditingInfo)();
            if ((editingInfo === null || editingInfo === void 0 ? void 0 : editingInfo.key) !== currentSelectedElementKey) {
                (0, editTextUtils_1.teardownEditableText)(parentPort, storyboardId);
            }
            clearMultiSelectState();
            return null;
        }
        e.preventDefault();
        e.stopPropagation();
        if ((0, editTextUtils_1.canEditText)(newSelectedElement) &&
            newSelectedElement.getKey() === currentSelectedElementKey) {
            (0, editTextUtils_1.setupEditableText)(newSelectedElement, parentPort, storyboardId);
        }
        if (newSelectedElement.getKey() === currentSelectedElementKey) {
            clearMultiSelectState();
            return selectedNavNode;
        }
        parentPort.postMessage({
            id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.SELECTED_ELEMENT_KEY,
            elementKey: newSelectedElement.getKey(),
            outerHTML: (_c = (0, jquery_1.default)(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${newSelectedElement.getKey()}`).get(0)) === null || _c === void 0 ? void 0 : _c.outerHTML,
        });
        (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.SELECTED_ELEMENT_KEY, newSelectedElement.getKey());
        (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
        clearMultiSelectState();
        return selectedNavNode;
    };
    /**
     * Returns if events were passed through
     */
    const passThroughEventsIfNeeded = (e, parentPort, storyboardId) => {
        var _a, _b;
        const driveModeEnabled = !!(0, sessionStorageUtils_1.getSessionStorageItem)('driveModeEnabled', storyboardId);
        const editingTextInfo = (0, editTextUtils_1.getEditingInfo)();
        if (driveModeEnabled || editingTextInfo) {
            return true;
        }
        (_a = e === null || e === void 0 ? void 0 : e.preventDefault) === null || _a === void 0 ? void 0 : _a.call(e);
        (_b = e === null || e === void 0 ? void 0 : e.stopPropagation) === null || _b === void 0 ? void 0 : _b.call(e);
        return false;
    };
    const onClickElementContextMenu = (e, parentPort, storyboardId) => {
        var _a;
        const passedThrough = passThroughEventsIfNeeded(e, parentPort, storyboardId);
        if (passedThrough) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        // Mouse down is called when a user clicks the context menu, but not mouse up, so clear the mouse down
        (0, sessionStorageUtils_1.setMemoryStorageItem)('mouseDragContext', null);
        const elementKeyToNavNode = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.ELEMENT_KEY_TO_NAV_NODE) || {};
        let requestedNavNode;
        if (e.metaKey || e.ctrlKey) {
            const elementKey = (0, identifierUtils_1.getElementKeyFromNode)(e.target);
            requestedNavNode = elementKeyToNavNode[elementKey];
            // Special case -> this is the top-most node so it should trigger a context menu on the storyboard
            if (!requestedNavNode && e.target.parentNode === document.body) {
                requestedNavNode = constantsAndTypes_1.SELECT_OR_HOVER_STORYBOARD;
            }
        }
        else {
            requestedNavNode = getSelectableNavNode(e);
        }
        const currentSelectedElementKey = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.SELECTED_ELEMENT_KEY);
        const currentMultiSelectedKeys = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.MULTI_SELECTED_ELEMENT_KEYS);
        if (!requestedNavNode || typeof requestedNavNode === 'string') {
            if (requestedNavNode === constantsAndTypes_1.SELECT_OR_HOVER_STORYBOARD &&
                !(currentMultiSelectedKeys === null || currentMultiSelectedKeys === void 0 ? void 0 : currentMultiSelectedKeys.length)) {
                const storyboardKey = tempoElement_1.TempoElement.forStoryboard(storyboardId).getKey();
                if (currentSelectedElementKey === storyboardKey) {
                    return;
                }
                parentPort.postMessage({
                    id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.SELECTED_ELEMENT_KEY,
                    elementKey: storyboardKey,
                });
                (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.SELECTED_ELEMENT_KEY, storyboardKey);
                (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
            }
            return;
        }
        let contextRequestedElementKey = null;
        const selectedElementKey = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.SELECTED_ELEMENT_KEY);
        const selectedElement = tempoElement_1.TempoElement.fromKey(selectedElementKey);
        // Don't select any children as the user might be right clicking a node they selected
        if (!requestedNavNode.tempoElement.isEqual(selectedElement) &&
            !selectedElement.isParentOf(requestedNavNode.tempoElement) &&
            !(currentMultiSelectedKeys === null || currentMultiSelectedKeys === void 0 ? void 0 : currentMultiSelectedKeys.length) // Also don't select anything new if in multiselect mode
        ) {
            contextRequestedElementKey = requestedNavNode.tempoElement.getKey();
            parentPort.postMessage({
                id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.SELECTED_ELEMENT_KEY,
                elementKey: contextRequestedElementKey,
                outerHTML: (_a = (0, jquery_1.default)(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${contextRequestedElementKey}`).get(0)) === null || _a === void 0 ? void 0 : _a.outerHTML,
            });
            (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.SELECTED_ELEMENT_KEY, contextRequestedElementKey);
            (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
        }
        const importantFields = {
            clientX: e.clientX,
            clientY: e.clientY,
        };
        parentPort.postMessage({
            id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.CONTEXT_REQUESTED,
            event: importantFields,
        });
    };
    const buildAndSendNavTree = (parentPort, storyboardId, treeElementLookup, scopeLookup, storyboardComponentElement) => {
        let treeElements = treeElementLookup;
        if (!treeElements) {
            treeElements = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.TREE_ELEMENT_LOOKUP) || {};
        }
        let scopes = scopeLookup;
        if (!scopes) {
            scopes = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.SCOPE_LOOKUP) || {};
        }
        let storyboardComponent = storyboardComponentElement;
        if (storyboardComponentElement === 'EXPLICIT_NONE') {
            storyboardComponent = null;
        }
        else if (!storyboardComponent) {
            storyboardComponent = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.STORYBOARD_COMPONENT) || {};
        }
        const rootReactElement = (0, resqUtils_1.getRootReactElement)();
        const reactTree = (0, resqUtils_1.buildNodeTree)(rootReactElement, null);
        const lookupIdToReactTreeMap = {};
        (0, resqUtils_1.buildTreeLookupMap)(reactTree, lookupIdToReactTreeMap);
        const knownComponentNames = new Set();
        const knownComponentInstanceNames = new Set();
        if (treeElements) {
            Object.values(treeElements).forEach((treeElement) => {
                if (treeElement.type === 'component' ||
                    treeElement.type === 'storybook-component') {
                    knownComponentNames.add(treeElement.componentName);
                }
                if (treeElement.type === 'component-instance') {
                    knownComponentInstanceNames.add(treeElement.componentName);
                }
            });
        }
        const elementKeyToLookupList = {};
        const elementKeyToNavNode = {};
        const builtNavTree = (0, navTreeUtils_1.buildNavForNode)(storyboardId, undefined, (0, jquery_1.default)('body').get(0), '', 'root', scopes, treeElements, lookupIdToReactTreeMap, knownComponentNames, knownComponentInstanceNames, elementKeyToLookupList, elementKeyToNavNode);
        (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.ELEMENT_KEY_TO_LOOKUP_LIST, elementKeyToLookupList);
        (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.CURRENT_NAV_TREE, builtNavTree);
        (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.ELEMENT_KEY_TO_NAV_NODE, elementKeyToNavNode);
        (0, resqUtils_1.clearLookupsFromTree)(reactTree);
        parentPort.postMessage({
            id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.NAV_TREE,
            navTree: builtNavTree,
            outerHtml: document.documentElement.outerHTML,
        });
        // Run callbacks
        (0, navTreeUtils_1.runNavTreeBuiltCallbacks)();
    };
    const onFlushStart = () => {
        // Find all instant update styling classes to delete
        const classesToDelete = [];
        (0, jquery_1.default)(`*[class*=${identifierUtils_1.TEMPO_INSTANT_UPDATE_STYLING_PREFIX}]`).each((i, element) => {
            const classes = (element.getAttribute('class') || '').split(' ');
            classes.forEach((className) => {
                if (className.startsWith(identifierUtils_1.TEMPO_INSTANT_UPDATE_STYLING_PREFIX)) {
                    classesToDelete.push(className);
                }
            });
        });
        (0, jquery_1.default)(`*[${identifierUtils_1.TEMPO_DELETE_AFTER_REFRESH}=true]`).attr(identifierUtils_1.TEMPO_QUEUE_DELETE_AFTER_HOT_RELOAD, 'true');
        // Clear the add class instant update queue as those items will be applied in the hot reload
        (0, sessionStorageUtils_1.setMemoryStorageItem)(changeItemFunctions_1.ADD_CLASS_INSTANT_UPDATE_QUEUE, []);
        (0, sessionStorageUtils_1.setMemoryStorageItem)('POST_HOT_RELOAD_CLEAR', {
            classesToDelete,
        });
    };
    const clearInstantUpdatesAndSendNavTree = (parentPort, storyboardId) => {
        (0, sessionStorageUtils_1.setMemoryStorageItem)(LAST_NAV_TREE_REFRESH_TIME, new Date());
        const { classesToDelete } = (0, sessionStorageUtils_1.getMemoryStorageItem)('POST_HOT_RELOAD_CLEAR') || {};
        // Delete all instant update changed elements
        (0, jquery_1.default)(`*[${identifierUtils_1.TEMPO_QUEUE_DELETE_AFTER_HOT_RELOAD}=true]`).remove();
        // Clear the added display nones
        (0, jquery_1.default)(`.${identifierUtils_1.TEMPO_DISPLAY_NONE_UNTIL_REFRESH_CLASS}`).removeClass(identifierUtils_1.TEMPO_DISPLAY_NONE_UNTIL_REFRESH_CLASS);
        (0, jquery_1.default)(`*[${identifierUtils_1.TEMPO_INSTANT_UPDATE}=true]`).removeAttr(identifierUtils_1.TEMPO_INSTANT_UPDATE);
        (0, jquery_1.default)(`*[${identifierUtils_1.TEMPO_DO_NOT_SHOW_IN_NAV_UNTIL_REFRESH}=true]`).removeAttr(identifierUtils_1.TEMPO_DO_NOT_SHOW_IN_NAV_UNTIL_REFRESH);
        (0, jquery_1.default)(`.${changeItemFunctions_1.TEMPORARY_STYLING_CLASS_NAME}`).removeClass(changeItemFunctions_1.TEMPORARY_STYLING_CLASS_NAME);
        // Any classes marked to delete before the hot reload
        classesToDelete === null || classesToDelete === void 0 ? void 0 : classesToDelete.forEach((cls) => {
            (0, jquery_1.default)(`.${cls}`).removeClass(cls);
        });
        const newAddClassQueue = (0, sessionStorageUtils_1.getMemoryStorageItem)(changeItemFunctions_1.ADD_CLASS_INSTANT_UPDATE_QUEUE) || [];
        // Any attributes that start with the styling prefix leftover mean that the class needs to be re-applied
        // these are classes that were added in instant updates while the hot reload was in progress
        newAddClassQueue.forEach((item) => {
            if (!item) {
                return;
            }
            const { codebaseId, className } = item;
            if (codebaseId && className) {
                (0, jquery_1.default)(`.${codebaseId}`).attr(identifierUtils_1.TEMPO_INSTANT_UPDATE, 'true');
                (0, jquery_1.default)(`.${codebaseId}`).addClass(className);
            }
        });
        // Rebuild the nav tree on DOM changed after some time has passed
        // this gives the react fiber time to be fully reconciled
        try {
            setTimeout(() => {
                buildAndSendNavTree(parentPort, storyboardId);
                (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
            }, 300);
        }
        catch (e) {
            console.error('ERROR: Could not re-create nav tree on DOM change, ' + e);
        }
    };
    const onDOMChanged = (mutations, parentPort, storyboardId, 
    // If set to true this is called from the shadow root for the nextjs build watcher (the spinning triangle)
    fromNextJsLoader) => {
        var _a;
        // Udpate the href in the parent container
        if ((0, sessionStorageUtils_1.getMemoryStorageItem)('href') !== window.location.href) {
            parentPort.postMessage({
                id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.LATEST_HREF,
                href: window.location.href,
            });
            (0, sessionStorageUtils_1.setMemoryStorageItem)('href', window.location.href);
        }
        // Check if we should refresh the nav tree
        let refreshNavTree = false;
        if (fromNextJsLoader) {
            // From the nextjs loader, refresh when the loader gets hidden (means refresh is done)
            const mutationTarget = (_a = mutations === null || mutations === void 0 ? void 0 : mutations[0]) === null || _a === void 0 ? void 0 : _a.target;
            if (mutationTarget && mutationTarget.id === 'container') {
                const currentlyHotReloading = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.HOT_RELOADING);
                if (mutationTarget.classList.contains('visible')) {
                    (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.HOT_RELOADING, true);
                }
                else {
                    (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.HOT_RELOADING, false);
                    refreshNavTree = true;
                }
            }
        }
        else {
            mutations.forEach((e) => {
                // If the class attribute has changed on an element we have to reparse the nav tree to add the element key
                if (e.type === 'attributes' &&
                    e.attributeName === 'class' &&
                    e.target &&
                    !(0, outlineUtils_1.isNodeOutline)(e.target) &&
                    !(0, identifierUtils_1.isMovingElement)(e.target) &&
                    // And not a script
                    // Bug found on Oct 8, 2024, for some reason the script kept triggering a reload
                    !e.target.tagName.toLowerCase().includes('script')) {
                    const elementKey = (0, identifierUtils_1.getElementKeyFromNode)(e.target);
                    const uniqueLookup = (0, identifierUtils_1.getUniqueLookupFromNode)(e.target);
                    // An element which doesn't have an element key has changed
                    if (!elementKey && !uniqueLookup && !(0, identifierUtils_1.isElementInSvg)(e.target)) {
                        refreshNavTree = true;
                    }
                    return;
                }
                [e.addedNodes, e.removedNodes].forEach((nodeList) => {
                    if (!nodeList) {
                        return;
                    }
                    nodeList.forEach((node) => {
                        if (!(0, outlineUtils_1.isNodeOutline)(node) && !(0, identifierUtils_1.isMovingElement)(node)) {
                            refreshNavTree = true;
                        }
                    });
                });
            });
        }
        if (!refreshNavTree) {
            return;
        }
        // In these cases we don't want to trigger a nav tree refresh right away
        // since the hot reload may not have happened yet. So we set a timeout and only
        // trigger a nav tree refresh if another one hasn't happened in between
        if (fromNextJsLoader) {
            const triggerTime = new Date();
            setTimeout(() => {
                const lastRefreshTime = (0, sessionStorageUtils_1.getMemoryStorageItem)(LAST_NAV_TREE_REFRESH_TIME);
                // Don't re-clear and send if another refresh has happened in the meantime
                if (!lastRefreshTime || lastRefreshTime < triggerTime) {
                    clearInstantUpdatesAndSendNavTree(parentPort, storyboardId);
                }
            }, 1000);
            return;
        }
        clearInstantUpdatesAndSendNavTree(parentPort, storyboardId);
    };
    const onWheel = (e, parentPort, storyboardId) => {
        const passedThrough = passThroughEventsIfNeeded(e, parentPort, storyboardId);
        const isScrollShortcut = e.altKey;
        const isZoomShortcut = e.ctrlKey || e.metaKey;
        // If the user wants to scroll (either by being in drive mode, or by holding alt)
        // and they aren't trying to zoom, fallback to default behaviour.
        if (!isZoomShortcut && (passedThrough || isScrollShortcut)) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        const importantFields = {
            deltaX: e.deltaX,
            deltaY: e.deltaY,
            wheelDelta: e.wheelDelta,
            x: e.x,
            y: e.y,
            altKey: e.altKey,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            metaKey: e.metaKey,
        };
        parentPort.postMessage({
            id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.WHEEL_EVENT,
            event: importantFields,
        });
    };
    const activeElementMetadata = () => {
        const activeElement = document.activeElement;
        let tagName, isContentEditable, elementType;
        if (activeElement) {
            tagName = activeElement.tagName;
            if (activeElement instanceof HTMLElement) {
                isContentEditable = activeElement.isContentEditable;
            }
            if (activeElement instanceof HTMLInputElement) {
                elementType = activeElement.type;
            }
        }
        return {
            tagName: tagName,
            isContentEditable: isContentEditable,
            elementType: elementType,
        };
    };
    const onKeyDown = (e, parentPort) => {
        parentPort.postMessage({
            id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.KEY_DOWN_EVENT,
            event: {
                key: e.key,
                metaKey: e.metaKey,
                shiftKey: e.shiftKey,
                ctrlKey: e.ctrlKey,
                activeElement: Object.assign({}, activeElementMetadata()),
            },
        });
    };
    const onKeyUp = (e, parentPort) => {
        parentPort.postMessage({
            id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.KEY_UP_EVENT,
            event: {
                key: e.key,
                metaKey: e.metaKey,
                shiftKey: e.shiftKey,
                ctrlKey: e.ctrlKey,
                activeElement: Object.assign({}, activeElementMetadata()),
            },
        });
    };
    const throttledUpdateOutlines = lodash_1.default.throttle((parentPort, storyboardId) => (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId), 15);
    const onScroll = (e, parentPort, storyboardId) => {
        throttledUpdateOutlines(parentPort, storyboardId);
    };
    // Need to register functions on the window for channel messaging to use them
    // @ts-ignore
    window.initProject = (parentPort, storyboardId, treeElementLookup, scopeLookup, storyboardComponentElement, options = {}, storyboardType, savedComponentFilename, originalStoryboardUrl) => {
        const passive = makePassiveEventOption();
        passive['capture'] = true;
        const body$ = (0, jquery_1.default)('body');
        (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.TREE_ELEMENT_LOOKUP, treeElementLookup);
        (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.SCOPE_LOOKUP, scopeLookup);
        if (storyboardComponentElement) {
            (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.STORYBOARD_COMPONENT, storyboardComponentElement);
        }
        (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.STORYBOARD_TYPE, storyboardType);
        (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.SAVED_STORYBOARD_COMPONENT_FILENAME, savedComponentFilename);
        // The URL that was originally loaded for this storyboard, it may be different from href
        // if the user navigated away to a new route
        if (originalStoryboardUrl) {
            (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.ORIGINAL_STORYBOARD_URL, originalStoryboardUrl);
        }
        // Clear iframe outlines
        (0, sessionStorageUtils_1.removeMemoryStorageItem)(sessionStorageUtils_1.SELECTED_ELEMENT_KEY);
        (0, sessionStorageUtils_1.removeMemoryStorageItem)(sessionStorageUtils_1.HOVERED_ELEMENT_KEY);
        (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
        // Register event listeners
        const bodyObject = body$.get(0);
        bodyObject === null || bodyObject === void 0 ? void 0 : bodyObject.addEventListener('click', (e) => {
            passThroughEventsIfNeeded(e, parentPort, storyboardId);
        }, passive);
        bodyObject === null || bodyObject === void 0 ? void 0 : bodyObject.addEventListener('pointerover', (e) => {
            onPointerOver(e, parentPort, storyboardId);
        }, passive);
        bodyObject === null || bodyObject === void 0 ? void 0 : bodyObject.addEventListener('pointerdown', (e) => {
            onPointerDown(e, parentPort, storyboardId);
        }, passive);
        bodyObject === null || bodyObject === void 0 ? void 0 : bodyObject.addEventListener('pointerup', (e) => {
            onPointerUp(e, parentPort, storyboardId);
        }, passive);
        bodyObject === null || bodyObject === void 0 ? void 0 : bodyObject.addEventListener('pointermove', (e) => {
            onPointerMove(e, parentPort, storyboardId);
        }, passive);
        bodyObject === null || bodyObject === void 0 ? void 0 : bodyObject.addEventListener('pointerleave', (e) => {
            passThroughEventsIfNeeded(e, parentPort, storyboardId);
        }, passive);
        bodyObject === null || bodyObject === void 0 ? void 0 : bodyObject.addEventListener('contextmenu', (e) => {
            onClickElementContextMenu(e, parentPort, storyboardId);
        }, passive);
        bodyObject === null || bodyObject === void 0 ? void 0 : bodyObject.addEventListener('dblclick', (e) => {
            passThroughEventsIfNeeded(e, parentPort, storyboardId);
        }, passive);
        bodyObject === null || bodyObject === void 0 ? void 0 : bodyObject.addEventListener('mouseover', (e) => {
            passThroughEventsIfNeeded(e, parentPort, storyboardId);
        }, passive);
        bodyObject === null || bodyObject === void 0 ? void 0 : bodyObject.addEventListener('mouseout', (e) => {
            passThroughEventsIfNeeded(e, parentPort, storyboardId);
        }, passive);
        bodyObject === null || bodyObject === void 0 ? void 0 : bodyObject.addEventListener('mousemove', (e) => {
            passThroughEventsIfNeeded(e, parentPort, storyboardId);
        }, passive);
        bodyObject === null || bodyObject === void 0 ? void 0 : bodyObject.addEventListener('mousedown', (e) => {
            passThroughEventsIfNeeded(e, parentPort, storyboardId);
        }, passive);
        bodyObject === null || bodyObject === void 0 ? void 0 : bodyObject.addEventListener('mouseup', (e) => {
            passThroughEventsIfNeeded(e, parentPort, storyboardId);
        }, passive);
        bodyObject === null || bodyObject === void 0 ? void 0 : bodyObject.addEventListener('wheel', (e) => {
            onWheel(e, parentPort, storyboardId);
        }, passive);
        bodyObject === null || bodyObject === void 0 ? void 0 : bodyObject.addEventListener('keydown', (e) => {
            onKeyDown(e, parentPort);
        }, passive);
        bodyObject === null || bodyObject === void 0 ? void 0 : bodyObject.addEventListener('keyup', (e) => {
            onKeyUp(e, parentPort);
        }, passive);
        window.addEventListener('scroll', (e) => {
            onScroll(e, parentPort, storyboardId);
        }, passive);
        // Hack: this is used to
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement &&
                (0, sessionStorageUtils_1.getMemoryStorageItem)(IMMEDIATELY_REMOVE_POINTER_LOCK)) {
                document.exitPointerLock();
                (0, sessionStorageUtils_1.setMemoryStorageItem)(IMMEDIATELY_REMOVE_POINTER_LOCK, false);
            }
        }, false);
        observeDOM(bodyObject, (e) => {
            onDOMChanged(e, parentPort, storyboardId);
        });
        // If this is NextJS, also listen to the shadow root of the __next-build-watcher
        // This triggeres the onDOMChanged when the hot reload symbol shows up
        const nextBuildWatcher = document.getElementById('__next-build-watcher');
        if (nextBuildWatcher && nextBuildWatcher.shadowRoot) {
            Array.from(nextBuildWatcher.shadowRoot.children).forEach((child) => {
                observeDOM(child, (e) => {
                    onDOMChanged(e, parentPort, storyboardId, true);
                });
            });
        }
        if (options.driveModeEnabled) {
            enableDriveMode(parentPort, storyboardId);
        }
        else {
            disableDriveMode(parentPort, storyboardId);
        }
        if (options.aiContextSelection) {
            (0, sessionStorageUtils_1.setMemoryStorageItem)('aiContext', true);
            (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
        }
        else {
            (0, sessionStorageUtils_1.setMemoryStorageItem)('aiContext', false);
            (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
        }
        // Build the Nav Tree and send it back
        try {
            buildAndSendNavTree(parentPort, storyboardId, treeElementLookup, scopeLookup, storyboardComponentElement || 'EXPLICIT_NONE');
        }
        catch (e) {
            console.log(e);
            console.error('Error building nav tree: ' + e);
        }
    };
    const enableDriveMode = (parentPort, storyboardId) => {
        // @ts-ignore
        if (!(0, sessionStorageUtils_1.getSessionStorageItem)('driveModeEnabled', storyboardId)) {
            // @ts-ignore
            (0, sessionStorageUtils_1.setSessionStorageItem)('driveModeEnabled', 'enabled', storyboardId);
            clearHoveredElements(parentPort, storyboardId);
            (0, outlineUtils_1.clearAllOutlines)();
        }
        (0, jquery_1.default)('body').css('cursor', '');
    };
    const disableDriveMode = (parentPort, storyboardId) => {
        // @ts-ignore
        if ((0, sessionStorageUtils_1.getSessionStorageItem)('driveModeEnabled', storyboardId)) {
            // @ts-ignore
            (0, sessionStorageUtils_1.removeSessionStorageItem)('driveModeEnabled', storyboardId);
            (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
            clearHoveredElements(parentPort, storyboardId);
        }
        (0, jquery_1.default)('body').attr('style', function (i, s) {
            return (s || '') + 'cursor: default !important;';
        });
    };
    // @ts-ignore
    window.enableDriveMode = (parentPort, storyboardId) => {
        enableDriveMode(parentPort, storyboardId);
    };
    // @ts-ignore
    window.disableDriveMode = (parentPort, storyboardId) => {
        disableDriveMode(parentPort, storyboardId);
    };
    // @ts-ignore
    window.setNewLookups = (parentPort, storyboardId, treeElementLookup, scopeLookup) => {
        const prevTreeElemntLookup = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.TREE_ELEMENT_LOOKUP) || {};
        const prevScopeLookup = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.SCOPE_LOOKUP) || {};
        const newTreeElements = Object.assign({}, prevTreeElemntLookup);
        // Delete any tree elements that were set to nul
        Object.keys(treeElementLookup).forEach((key) => {
            if (treeElementLookup[key]) {
                newTreeElements[key] = treeElementLookup[key];
            }
            else if (newTreeElements[key]) {
                delete newTreeElements[key];
            }
        });
        const newScopes = Object.assign({}, prevScopeLookup);
        // Delete any scopes that were set to nul
        Object.keys(scopeLookup).forEach((key) => {
            if (scopeLookup[key]) {
                newScopes[key] = scopeLookup[key];
            }
            else if (newScopes[key]) {
                delete newScopes[key];
            }
        });
        (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.TREE_ELEMENT_LOOKUP, newTreeElements);
        (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.SCOPE_LOOKUP, newScopes);
    };
    // @ts-ignore
    window.setHoveredElement = (parentPort, storyboardId, elementKey) => {
        const driveModeEnabled = !!(0, sessionStorageUtils_1.getSessionStorageItem)('driveModeEnabled', storyboardId);
        if (driveModeEnabled) {
            return;
        }
        const prevHoveredElementKey = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.HOVERED_ELEMENT_KEY);
        if (prevHoveredElementKey === elementKey) {
            return;
        }
        if (elementKey) {
            (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.HOVERED_ELEMENT_KEY, elementKey);
        }
        else {
            (0, sessionStorageUtils_1.removeMemoryStorageItem)(sessionStorageUtils_1.HOVERED_ELEMENT_KEY);
        }
        (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
    };
    // @ts-ignore
    window.setSelectedElement = (parentPort, storyboardId, elementKey) => {
        var _a, _b;
        const prevSelectedElementKey = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.SELECTED_ELEMENT_KEY);
        if (prevSelectedElementKey === elementKey) {
            return;
        }
        if (elementKey) {
            const tempoElement = tempoElement_1.TempoElement.fromKey(elementKey);
            let elementKeyToExtract = elementKey;
            if (tempoElement.isStoryboard(storyboardId)) {
                // Pass back the outerHTML of the top level node
                const topLevelNode = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.CURRENT_NAV_TREE);
                const topLevelElementKey = (_a = topLevelNode === null || topLevelNode === void 0 ? void 0 : topLevelNode.tempoElement) === null || _a === void 0 ? void 0 : _a.getKey();
                if (topLevelElementKey) {
                    elementKeyToExtract = topLevelElementKey;
                }
            }
            // Send back the message just to set the outerHTML only
            parentPort.postMessage({
                id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.SELECTED_ELEMENT_KEY,
                doNotSetElementKey: true,
                outerHTML: (_b = (0, jquery_1.default)(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${elementKeyToExtract}`).get(0)) === null || _b === void 0 ? void 0 : _b.outerHTML,
            });
            (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.SELECTED_ELEMENT_KEY, elementKey);
        }
        else {
            parentPort.postMessage({
                id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.SELECTED_ELEMENT_KEY,
                doNotSetElementKey: true,
                outerHTML: null,
            });
            (0, sessionStorageUtils_1.removeMemoryStorageItem)(sessionStorageUtils_1.SELECTED_ELEMENT_KEY);
        }
        (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
    };
    // @ts-ignore
    window.setMultiselectedElementKeys = (parentPort, storyboardId, elementKeys) => {
        const prevMultiSelectedElementKeys = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.MULTI_SELECTED_ELEMENT_KEYS);
        const prevSet = new Set(prevMultiSelectedElementKeys || []);
        const newSet = new Set(elementKeys || []);
        const setsEqual = prevSet.size === newSet.size &&
            [...prevSet].every((value) => newSet.has(value));
        if (setsEqual) {
            return;
        }
        if (elementKeys) {
            (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.MULTI_SELECTED_ELEMENT_KEYS, elementKeys);
            parentPort.postMessage({
                id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.MULTI_SELECTED_ELEMENT_KEYS,
                doNotSetElementKeys: true,
                outerHTMLs: elementKeys === null || elementKeys === void 0 ? void 0 : elementKeys.map((elementKey) => { var _a; return (_a = (0, jquery_1.default)(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${elementKey}`).get(0)) === null || _a === void 0 ? void 0 : _a.outerHTML; }),
            });
        }
        else {
            (0, sessionStorageUtils_1.removeMemoryStorageItem)(sessionStorageUtils_1.MULTI_SELECTED_ELEMENT_KEYS);
            parentPort.postMessage({
                id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.MULTI_SELECTED_ELEMENT_KEYS,
                doNotSetElementKeys: true,
                outerHTMLs: [],
            });
        }
        (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
    };
    // @ts-ignore
    window.processRulesForSelectedElement = (parentPort, storyboardId, cssElementLookup, selectedElementKey) => {
        (0, cssFunctions_1.processRulesForSelectedElement)(parentPort, cssElementLookup, selectedElementKey);
    };
    // @ts-ignore
    window.setModifiersForSelectedElement = (parentPort, storyboardId, modifiers, selectedElementKey) => {
        (0, cssFunctions_1.setModifiersForSelectedElement)(parentPort, modifiers, selectedElementKey);
    };
    // @ts-ignore
    window.getCssEvals = (parentPort, storyboardId, selectedElementKey) => {
        (0, cssFunctions_1.getCssEvals)(parentPort, selectedElementKey);
    };
    // @ts-ignore
    window.ruleMatchesElement = (parentPort, storyboardId, messageId, rule, selectedElementKey) => {
        (0, cssFunctions_1.ruleMatchesElement)(parentPort, messageId, rule, selectedElementKey);
    };
    // @ts-ignore
    window.getElementClassList = (parentPort, storyboardId, selectedElementKey) => {
        (0, cssFunctions_1.getElementClassList)(parentPort, selectedElementKey);
    };
    // @ts-ignore
    window.applyChangeItemToDocument = (parentPort, storyboardId, changeItem) => __awaiter(void 0, void 0, void 0, function* () {
        const { sendNewNavTree } = (0, changeItemFunctions_1.applyChangeItemToDocument)(parentPort, storyboardId, changeItem);
        // Update the nav tree & outlines
        if (sendNewNavTree) {
            buildAndSendNavTree(parentPort, storyboardId);
        }
        (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
    });
    // @ts-ignore
    window.updateCodebaseIds = (parentPort, storyboardId, prevIdToNewIdMap, newTreeElementLookup, newScopeLookup) => {
        const sendNewNavTree = (0, changeItemFunctions_1.updateCodebaseIds)(parentPort, prevIdToNewIdMap, true);
        if (sendNewNavTree) {
            buildAndSendNavTree(parentPort, storyboardId, newTreeElementLookup, newScopeLookup);
        }
        (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
    };
    // @ts-ignore
    window.dispatchEvent = (parentPort, storyboardId, eventName, eventDetails) => {
        const event = new CustomEvent(eventName, Object.assign({}, eventDetails));
        document.dispatchEvent(event);
    };
    // @ts-ignore
    window.updateOutlines = (parentPort, storyboardId) => {
        (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
    };
    // @ts-ignore
    window.goBack = (parentPort, storyboardId) => {
        if (document.referrer !== '') {
            window.history.back();
        }
    };
    // @ts-ignore
    window.goForward = (parentPort, storyboardId) => {
        window.history.forward();
    };
    // @ts-ignore
    window.refresh = (parentPort, storyboardId) => {
        window.location.reload();
    };
    // @ts-ignore
    window.syntheticMouseOver = (parentPort, storyboardId, coords, dontHoverInsideSelected, selectBottomMostElement) => {
        const target = document.elementFromPoint(coords.x, coords.y);
        // If this is true we don't want to trigger a hover event inside a selected element, instead just set hovering on the selected element
        if (dontHoverInsideSelected) {
            const selectedElementKey = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.SELECTED_ELEMENT_KEY);
            const selectedElement = tempoElement_1.TempoElement.fromKey(selectedElementKey);
            if (!selectedElement.isEmpty()) {
                const selectedDomElement = document.querySelector(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${selectedElementKey}`);
                if (selectedDomElement === null || selectedDomElement === void 0 ? void 0 : selectedDomElement.contains(target)) {
                    onPointerOver({ target: selectedDomElement }, parentPort, storyboardId);
                    return;
                }
            }
        }
        onPointerOver({ target }, parentPort, storyboardId, selectBottomMostElement);
    };
    // @ts-ignore
    window.syntheticMouseMove = (parentPort, storyboardId, syntheticEvent) => {
        const eventWithClient = Object.assign(Object.assign({}, syntheticEvent), { pageX: syntheticEvent.clientX +
                (document.documentElement.scrollLeft || document.body.scrollLeft), pageY: syntheticEvent.clientY +
                (document.documentElement.scrollTop || document.body.scrollTop) });
        onPointerMove(eventWithClient, parentPort, storyboardId);
    };
    // @ts-ignore
    window.syntheticMouseUp = (parentPort, storyboardId, syntheticEvent) => {
        onPointerUp(syntheticEvent, parentPort, storyboardId);
    };
    // @ts-ignore
    window.clearHoveredOutlines = (parentPort, storyboardId) => {
        if ((0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.HOVERED_ELEMENT_KEY)) {
            clearHoveredElements(parentPort, storyboardId);
        }
    };
    // @ts-ignore
    window.setZoomPerc = (parentPort, storyboardId, zoomPerc) => {
        (0, sessionStorageUtils_1.setMemoryStorageItem)('zoomPerc', zoomPerc.toString());
        (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
    };
    // @ts-ignore
    window.setAiContext = (parentPort, storyboardId, aiContext) => {
        (0, sessionStorageUtils_1.setMemoryStorageItem)('aiContext', !!aiContext);
        (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
    };
    // @ts-ignore
    window.tempMoveElement = (parentPort, storyboardId, nodeToMoveElementKey, newIndex) => {
        var _a, _b, _c, _d, _e;
        const elementKeyToNavNode = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.ELEMENT_KEY_TO_NAV_NODE) || {};
        const navNodeToMove = elementKeyToNavNode[nodeToMoveElementKey];
        if (!navNodeToMove) {
            return;
        }
        const nodeToMoveElement = tempoElement_1.TempoElement.fromKey(nodeToMoveElementKey);
        const domElementsToMove = [];
        // In components, there may be multiple elements that need to be moved, the eleemntKeyToLookupList
        // are all the real DOM elements in a component
        // For non-components, the eleemntKeyToLookupList points to a list of itself
        const elementKeyToLookupList = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.ELEMENT_KEY_TO_LOOKUP_LIST) || {};
        const lookupList = elementKeyToLookupList[navNodeToMove.tempoElement.getKey()] || [];
        lookupList.forEach((lookupElementKey) => {
            domElementsToMove.push((0, jquery_1.default)('body').find(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${lookupElementKey}`).get(0));
        });
        const parentDomElement = (_a = domElementsToMove[0]) === null || _a === void 0 ? void 0 : _a.parentElement;
        const parentNavNode = navNodeToMove.parent;
        if (parentDomElement && parentNavNode) {
            const currentIndex = (_b = parentNavNode === null || parentNavNode === void 0 ? void 0 : parentNavNode.children) === null || _b === void 0 ? void 0 : _b.indexOf(navNodeToMove);
            const numChildren = (_c = parentNavNode === null || parentNavNode === void 0 ? void 0 : parentNavNode.children) === null || _c === void 0 ? void 0 : _c.length;
            if (currentIndex !== newIndex) {
                Array.from(parentDomElement.children).forEach((child) => {
                    (0, jquery_1.default)(child).attr(identifierUtils_1.TEMPO_INSTANT_UPDATE, 'true');
                });
                (0, jquery_1.default)(parentDomElement).attr(identifierUtils_1.TEMPO_INSTANT_UPDATE, 'true');
                if (newIndex === numChildren - 1) {
                    domElementsToMove.forEach((element) => {
                        element.parentElement.appendChild(element);
                    });
                }
                else {
                    // If the current index is before the new index then we need to adjust by 1 to account for the shift in indices
                    const beforeNode = currentIndex > newIndex
                        ? parentNavNode === null || parentNavNode === void 0 ? void 0 : parentNavNode.children[newIndex]
                        : parentNavNode === null || parentNavNode === void 0 ? void 0 : parentNavNode.children[newIndex + 1];
                    const lookupListForBefore = elementKeyToLookupList[(_d = beforeNode === null || beforeNode === void 0 ? void 0 : beforeNode.tempoElement) === null || _d === void 0 ? void 0 : _d.getKey()] || [];
                    if (!lookupListForBefore.length) {
                        console.log('Cannot find element to insert before in lookup list');
                        return;
                    }
                    const beforeDomElement = (0, jquery_1.default)('body')
                        .find(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${lookupListForBefore[0]}`)
                        .get(0);
                    if (!beforeDomElement) {
                        console.log('Cannot find element to insert before');
                        return;
                    }
                    domElementsToMove.forEach((element) => {
                        element.parentElement.insertBefore(element, beforeDomElement);
                    });
                }
                // Update the selected element key to the new expected one (note if moving there is no hovered element key)
                // This also assumes the nodeToMoveElementKey is the selected element key
                const elementToMoveSegments = nodeToMoveElement.uniquePath.split('-');
                const newSelectedUniquePath = elementToMoveSegments
                    .slice(0, elementToMoveSegments.length - 1)
                    .join('-') + `-${newIndex}`;
                const newSelectedElementKey = new tempoElement_1.TempoElement(nodeToMoveElement.codebaseId, nodeToMoveElement.storyboardId, newSelectedUniquePath).getKey();
                // Update the nav tree which also sets the element key on all the elements, need to do this before
                // updating the selected element key
                buildAndSendNavTree(parentPort, storyboardId);
                // Codebase ID doesn't change
                parentPort.postMessage({
                    id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.SELECTED_ELEMENT_KEY,
                    elementKey: newSelectedElementKey,
                    outerHTML: (_e = (0, jquery_1.default)(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${newSelectedElementKey}`).get(0)) === null || _e === void 0 ? void 0 : _e.outerHTML,
                });
                (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.SELECTED_ELEMENT_KEY, newSelectedElementKey);
                (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
            }
        }
    };
    // @ts-ignore
    window.tempAddDiv = (parentPort, storyboardId, parentCodebaseId, indexInParent, width, height) => {
        const element = (0, jquery_1.default)(`.${identifierUtils_1.TEMPO_INSTANT_DIV_DRAW_CLASS}`);
        if (element.length) {
            element.css('width', width);
            element.css('height', height);
        }
        else {
            let parent = (0, jquery_1.default)(`.${parentCodebaseId}`);
            if (!parent.length) {
                parent = (0, jquery_1.default)('body');
            }
            parent.each((index, item) => {
                const newElement = (0, jquery_1.default)(`<div class="${identifierUtils_1.TEMPO_INSTANT_DIV_DRAW_CLASS}" ${identifierUtils_1.TEMPO_DELETE_AFTER_INSTANT_UPDATE}="true" ${identifierUtils_1.TEMPO_DELETE_AFTER_REFRESH}="true" ${identifierUtils_1.TEMPO_INSTANT_UPDATE}="true"></div>`);
                const childAtIndex = (0, jquery_1.default)(item).children().eq(indexInParent);
                if (childAtIndex === null || childAtIndex === void 0 ? void 0 : childAtIndex.length) {
                    childAtIndex.before(newElement);
                }
                else {
                    (0, jquery_1.default)(item).append(newElement);
                }
            });
            // Update the nav tree
            buildAndSendNavTree(parentPort, storyboardId);
        }
        (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
    };
    // @ts-ignore
    window.tempMoveToNewParent = (parentPort, storyboardId, indicatorWidth, indicatorHeight, newPositionX, newPositionY, parentElementKey, clear) => {
        (0, jquery_1.default)(`.${identifierUtils_1.TEMPO_MOVE_BETWEEN_PARENTS_OUTLINE}`).remove();
        if (clear) {
            return;
        }
        const newElement = document.createElement('div');
        newElement.classList.add(identifierUtils_1.TEMPO_MOVE_BETWEEN_PARENTS_OUTLINE);
        newElement.setAttribute(identifierUtils_1.TEMPO_INSTANT_UPDATE, 'true'); // Add so it doesn't trigger new nav tree building
        newElement.style.width = indicatorWidth + 'px';
        newElement.style.height = indicatorHeight + 'px';
        newElement.style.left = newPositionX + 'px';
        newElement.style.top = newPositionY + 'px';
        newElement.style.position = 'fixed';
        newElement.style.pointerEvents = 'none';
        newElement.style.zIndex = '2000000004';
        newElement.style.boxSizing = 'border-box';
        newElement.style.cursor = 'default !important';
        newElement.style.backgroundColor = outlineUtils_1.PRIMARY_OUTLINE_COLOUR;
        const body = document.getElementsByTagName('body')[0];
        body.appendChild(newElement);
        const parentDomElement = (0, jquery_1.default)(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${parentElementKey}`).get(0);
        if (parentDomElement) {
            const boundingRect = parentDomElement.getBoundingClientRect();
            const parentOutline = (0, outlineUtils_1.getOutlineElement)(parentPort, outlineUtils_1.OutlineType.PRIMARY, boundingRect.left, boundingRect.top, boundingRect.width, boundingRect.height);
            parentOutline.classList.remove(identifierUtils_1.OUTLINE_CLASS);
            parentOutline.classList.add(identifierUtils_1.TEMPO_MOVE_BETWEEN_PARENTS_OUTLINE);
            parentOutline.setAttribute(identifierUtils_1.TEMPO_INSTANT_UPDATE, 'true'); // Add so it doesn't trigger new nav tree building
            body.appendChild(parentOutline);
        }
    };
    // @ts-ignore
    window.checkIfHydrationError = (parentPort, storyboardId) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        let errorDescr, errorLabel, errorBody, hasError;
        if (window.location.href.includes('framework=VITE')) {
            // @ts-ignore
            const errorPortal = (_a = document.getElementsByTagName('vite-error-overlay')[0]) === null || _a === void 0 ? void 0 : _a.shadowRoot;
            errorDescr = 'A Vite Error Occurred';
            errorLabel =
                (_d = (_c = (_b = errorPortal === null || errorPortal === void 0 ? void 0 : errorPortal.querySelectorAll) === null || _b === void 0 ? void 0 : _b.call(errorPortal, '.file-link')) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.innerHTML;
            errorBody = (_g = (_f = (_e = errorPortal === null || errorPortal === void 0 ? void 0 : errorPortal.querySelectorAll) === null || _e === void 0 ? void 0 : _e.call(errorPortal, '.message')) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.innerHTML;
            hasError = Boolean(errorLabel || errorBody);
        }
        else {
            // @ts-ignore
            const errorPortal = (_h = document.getElementsByTagName('nextjs-portal')[0]) === null || _h === void 0 ? void 0 : _h.shadowRoot;
            errorDescr = (_k = (_j = errorPortal === null || errorPortal === void 0 ? void 0 : errorPortal.getElementById) === null || _j === void 0 ? void 0 : _j.call(errorPortal, 'nextjs__container_errors_desc')) === null || _k === void 0 ? void 0 : _k.innerHTML;
            errorLabel = (_m = (_l = errorPortal === null || errorPortal === void 0 ? void 0 : errorPortal.getElementById) === null || _l === void 0 ? void 0 : _l.call(errorPortal, 'nextjs__container_errors_label')) === null || _m === void 0 ? void 0 : _m.innerHTML;
            errorBody = (_q = (_p = (_o = errorPortal === null || errorPortal === void 0 ? void 0 : errorPortal.querySelectorAll) === null || _o === void 0 ? void 0 : _o.call(errorPortal, '.nextjs-container-errors-body')) === null || _p === void 0 ? void 0 : _p[0]) === null || _q === void 0 ? void 0 : _q.innerHTML;
            hasError = Boolean(errorDescr);
        }
        // Check if the contents of the hydration container contain the text "Hydration failed"
        if (hasError) {
            if (errorDescr === null || errorDescr === void 0 ? void 0 : errorDescr.includes('Hydration failed')) {
                parentPort.postMessage({
                    id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.LATEST_HYDRATION_ERROR_STATUS,
                    status: constantsAndTypes_1.STORYBOARD_HYDRATION_STATUS.ERROR,
                    errorDescr,
                    errorLabel,
                    errorBody,
                });
            }
            else {
                parentPort.postMessage({
                    id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.LATEST_HYDRATION_ERROR_STATUS,
                    status: constantsAndTypes_1.STORYBOARD_HYDRATION_STATUS.OTHER_ERROR,
                    errorDescr,
                    errorLabel,
                    errorBody,
                });
            }
        }
        else {
            parentPort.postMessage({
                id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.LATEST_HYDRATION_ERROR_STATUS,
                status: constantsAndTypes_1.STORYBOARD_HYDRATION_STATUS.NO_ERROR,
            });
        }
    };
    // @ts-ignore
    window.triggerDragStart = (parentPort, storyboardId) => {
        const selectedElementKey = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.SELECTED_ELEMENT_KEY);
        const elementKeyToNavNode = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.ELEMENT_KEY_TO_NAV_NODE) || {};
        // Something has to be selected to trigger a drag start
        if (!selectedElementKey) {
            return;
        }
        const draggedNavNode = elementKeyToNavNode[selectedElementKey];
        const parentDomElement = getParentDomElementForNavNode(draggedNavNode);
        const selectedElement = (0, jquery_1.default)(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${selectedElementKey}`).get(0);
        const mouseDragContext = {
            // Start off screen, this will get updated by onMouseMove
            pageX: -10000,
            pageY: -10000,
            // The difference between where the user clicked and the center of the element
            offsetX: 0,
            offsetY: 0,
            dragging: true,
            selectedParentDisplay: (0, cssFunctions_1.cssEval)(parentDomElement, 'display'),
            selectedParentFlexDirection: (0, cssFunctions_1.cssEval)(parentDomElement, 'flex-direction'),
        };
        (0, sessionStorageUtils_1.setMemoryStorageItem)('mouseDragContext', mouseDragContext);
        // Trigger the drag start event
        parentPort.postMessage({
            id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.DRAG_START_EVENT,
            event: mouseDragContext,
            outerHTML: selectedElement === null || selectedElement === void 0 ? void 0 : selectedElement.outerHTML,
        });
        (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
    };
    // @ts-ignore
    window.triggerDragCancel = (parentPort, storyboardId) => {
        (0, sessionStorageUtils_1.setMemoryStorageItem)('mouseDragContext', null);
        parentPort.postMessage({
            id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.DRAG_CANCEL_EVENT,
            event: {},
        });
        (0, outlineUtils_1.updateOutlines)(parentPort, storyboardId);
    };
    // @ts-ignore
    window.setIsFlushing = (parentPort, storyboardId, isFlushing) => {
        const wasFlushing = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.IS_FLUSHING);
        (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.IS_FLUSHING, isFlushing);
        if (isFlushing && !wasFlushing) {
            onFlushStart();
        }
    };
};
exports.initChannelMessagingFunctions = initChannelMessagingFunctions;
