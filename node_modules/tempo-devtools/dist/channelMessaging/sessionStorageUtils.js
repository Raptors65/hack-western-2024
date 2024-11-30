"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSessionStorageItem = exports.setSessionStorageItem = exports.getSessionStorageItem = exports.removeMemoryStorageItem = exports.setMemoryStorageItem = exports.getMemoryStorageItem = exports.CURRENT_NAV_TREE = exports.ELEMENT_KEY_TO_NAV_NODE = exports.ELEMENT_KEY_TO_LOOKUP_LIST = exports.NAV_TREE_CALLBACKS = exports.IS_FLUSHING = exports.HOT_RELOADING = exports.TEXT_EDIT = exports.HOVERED_ELEMENT_KEY = exports.MULTI_SELECTED_ELEMENT_KEYS = exports.SELECTED_ELEMENT_KEY = exports.SAVED_STORYBOARD_COMPONENT_FILENAME = exports.ORIGINAL_STORYBOARD_URL = exports.STORYBOARD_TYPE = exports.STORYBOARD_COMPONENT = exports.SCOPE_LOOKUP = exports.TREE_ELEMENT_LOOKUP = void 0;
// Memory Storage Objects
exports.TREE_ELEMENT_LOOKUP = 'TREE_ELEMENT_LOOKUP';
exports.SCOPE_LOOKUP = 'SCOPE_LOOKUP';
exports.STORYBOARD_COMPONENT = 'STORYBOARD_COMPONENT';
exports.STORYBOARD_TYPE = 'STORYBOARD_TYPE';
exports.ORIGINAL_STORYBOARD_URL = 'ORIGINAL_STORYBOARD_URL';
exports.SAVED_STORYBOARD_COMPONENT_FILENAME = 'SAVED_STORYBOARD_COMPONENT_FILENAME';
exports.SELECTED_ELEMENT_KEY = 'SELECTED_ELEMENT_KEY';
exports.MULTI_SELECTED_ELEMENT_KEYS = 'MULTI_SELECTED_ELEMENT_KEYS';
exports.HOVERED_ELEMENT_KEY = 'HOVERED_ELEMENT_KEY';
exports.TEXT_EDIT = 'TEXT_EDIT';
exports.HOT_RELOADING = 'HOT_RELOADING';
exports.IS_FLUSHING = 'IS_FLUSHING';
exports.NAV_TREE_CALLBACKS = 'NAV_TREE_CALLBACKS';
// Generated when creating the nav tree, used for outlines
exports.ELEMENT_KEY_TO_LOOKUP_LIST = 'ELEMENT_KEY_TO_LOOKUP_LIST';
exports.ELEMENT_KEY_TO_NAV_NODE = 'ELEMENT_KEY_TO_NAV_NODE';
exports.CURRENT_NAV_TREE = 'CURRENT_NAV_TREE';
const inMemoryStorage = {};
const getMemoryStorageItem = (key) => {
    return inMemoryStorage[key];
};
exports.getMemoryStorageItem = getMemoryStorageItem;
const setMemoryStorageItem = (key, value) => {
    inMemoryStorage[key] = value;
    if (!value) {
        delete inMemoryStorage[key];
    }
};
exports.setMemoryStorageItem = setMemoryStorageItem;
const removeMemoryStorageItem = (key) => {
    delete inMemoryStorage[key];
};
exports.removeMemoryStorageItem = removeMemoryStorageItem;
const getSessionStorageItem = (key, storyboardId) => {
    return sessionStorage.getItem(`${storyboardId}_${key}`);
};
exports.getSessionStorageItem = getSessionStorageItem;
const setSessionStorageItem = (key, value, storyboardId) => {
    if (!value) {
        (0, exports.removeSessionStorageItem)(key, storyboardId);
        return;
    }
    sessionStorage.setItem(`${storyboardId}_${key}`, value);
};
exports.setSessionStorageItem = setSessionStorageItem;
const removeSessionStorageItem = (key, storyboardId) => {
    sessionStorage.removeItem(`${storyboardId}_${key}`);
};
exports.removeSessionStorageItem = removeSessionStorageItem;
