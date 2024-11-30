"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.teardownEditableText = exports.setupEditableText = exports.getEditingInfo = exports.currentlyEditing = exports.hasTextContents = exports.canEditText = void 0;
const identifierUtils_1 = require("./identifierUtils");
const sessionStorageUtils_1 = require("./sessionStorageUtils");
const constantsAndTypes_1 = require("./constantsAndTypes");
const jquery_1 = __importDefault(require("jquery"));
/**
 * Evaluates if the element's text can be edited in place.
 *
 * @param element
 */
const canEditText = (element) => {
    const treeElements = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.TREE_ELEMENT_LOOKUP) || {};
    const treeElement = treeElements[element.codebaseId];
    if (!treeElement) {
        return false;
    }
    return treeElement.staticTextContents;
};
exports.canEditText = canEditText;
/**
 * Returns if the node has text contents in the DOM
 */
const hasTextContents = (node) => {
    if (!node) {
        return false;
    }
    let hasText = false;
    let hasNonText = false;
    node.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
            hasText = true;
            return;
        }
        hasNonText = true;
    });
    return hasText && !hasNonText;
};
exports.hasTextContents = hasTextContents;
const currentlyEditing = () => {
    const item = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.TEXT_EDIT);
    return item !== null && item !== undefined;
};
exports.currentlyEditing = currentlyEditing;
const markAsEditing = (info) => {
    (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.TEXT_EDIT, info);
};
const getEditingInfo = () => {
    return (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.TEXT_EDIT);
};
exports.getEditingInfo = getEditingInfo;
const clearEditingInfo = () => {
    (0, sessionStorageUtils_1.setMemoryStorageItem)(sessionStorageUtils_1.TEXT_EDIT, null);
};
/**
 * Takes an element and registers it as an editable text element.
 * Mutates the DOM to make the element editable.
 */
const setupEditableText = (element, parentPort, storyboardId) => {
    const classToSearchFor = `.${identifierUtils_1.ELEMENT_KEY_PREFIX}${element.getKey()}`;
    const domElement = (0, jquery_1.default)(classToSearchFor).get(0);
    if (!domElement) {
        return;
    }
    const originalText = (0, jquery_1.default)(domElement).text();
    markAsEditing({
        key: element.getKey(),
        originalText,
    });
    parentPort.postMessage({
        id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.START_EDITING_TEXT,
        data: {
            key: element.getKey(),
            oldText: originalText,
        },
    });
    (0, jquery_1.default)(domElement).attr('contenteditable', 'plaintext-only').trigger('focus');
    // Apply styling directly
    (0, jquery_1.default)(domElement).css({
        cursor: 'text',
        outline: 'none',
        border: 'none',
    });
    (0, jquery_1.default)(domElement).on('blur', () => (0, exports.teardownEditableText)(parentPort, storyboardId));
};
exports.setupEditableText = setupEditableText;
/**
 * Used to mark the completion of the editable text process.
 * Reverts the DOM to its original state.
 * Sends a message to the housing frame with updated text, if necessary.
 *
 */
const teardownEditableText = (parentPort, storyboardId) => {
    var _a;
    const editingInfo = (0, exports.getEditingInfo)();
    if (!(0, exports.currentlyEditing)()) {
        return;
    }
    clearEditingInfo();
    if (!editingInfo) {
        return;
    }
    const classToSearchFor = `.${identifierUtils_1.ELEMENT_KEY_PREFIX}${editingInfo.key}`;
    const domElement = (0, jquery_1.default)(classToSearchFor).get(0);
    if (!domElement) {
        return;
    }
    const updatedText = (0, jquery_1.default)(domElement).text();
    parentPort.postMessage({
        id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.EDITED_TEXT,
        data: {
            key: editingInfo.key,
            newText: updatedText,
            oldText: editingInfo.originalText,
        },
    });
    // Clear any selection
    (_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.removeAllRanges();
    // Cleanup
    (0, jquery_1.default)(domElement).removeAttr('contenteditable').off('blur').css({
        cursor: '',
        outline: '',
        border: '',
    });
    clearEditingInfo();
};
exports.teardownEditableText = teardownEditableText;
