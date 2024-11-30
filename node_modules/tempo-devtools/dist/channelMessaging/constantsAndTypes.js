"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STORYBOARD_HYDRATION_STATUS = exports.SELECT_OR_HOVER_STORYBOARD = exports.DELETE_STYLE_CONSTANT = exports.FIXED_IFRAME_MESSAGE_IDS = exports.INHERITABLE_CSS_PROPS = exports.CSS_VALUES_TO_COLLECT_FOR_PARENT = exports.CSS_VALUES_TO_COLLECT = void 0;
exports.CSS_VALUES_TO_COLLECT = new Set([
    'display',
    'flex-direction',
    'flex-grow',
    'flex-shrink',
    'font-family',
    'align-items',
    'justify-content',
    'column-gap',
    'row-gap',
    'flex-wrap',
    'align-content',
    'overflow',
    'text-align',
    'width',
    'max-width',
    'min-width',
    'height',
    'max-height',
    'min-height',
    'font-size',
    'line-height',
    'padding',
    'padding-top',
    'padding-left',
    'padding-right',
    'padding-bottom',
    'margin',
    'margin-top',
    'margin-left',
    'margin-right',
    'margin-bottom',
    'border-radius',
    'font-family',
    'font-weight',
    'object-fit',
    'background-clip',
    'border-left-style',
    'border-top-style',
    'border-right-style',
    'border-bottom-style',
    'border-left-width',
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-color',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'background-color',
    'color',
    'transform',
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius',
    'letter-spacing',
    'opacity',
    'font-style',
    'text-decoration-line',
    'top',
    'left',
    'right',
    'bottom',
    'position',
    'background-image',
]);
exports.CSS_VALUES_TO_COLLECT_FOR_PARENT = new Set([
    'display',
    'flex-direction',
]);
// Taken from https://web.dev/learn/css/inheritance/
exports.INHERITABLE_CSS_PROPS = {
    azimuth: true,
    'border-collapse': true,
    'border-spacing': true,
    'caption-side': true,
    color: true,
    cursor: true,
    direction: true,
    'empty-cells': true,
    'font-family': true,
    'font-size': true,
    'font-style': true,
    'font-variant': true,
    'font-weight': true,
    font: true,
    'letter-spacing': true,
    'line-height': true,
    'list-style-image': true,
    'list-style-position': true,
    'list-style-type': true,
    'list-style': true,
    orphans: true,
    quotes: true,
    'text-align': true,
    'text-indent': true,
    'text-transform': true,
    visibility: true,
    'white-space': true,
    widows: true,
    'word-spacing': true,
};
// Matches the interface on the frontend
var FIXED_IFRAME_MESSAGE_IDS;
(function (FIXED_IFRAME_MESSAGE_IDS) {
    FIXED_IFRAME_MESSAGE_IDS["HOVERED_ELEMENT_KEY"] = "HOVERED_ELEMENT_KEY";
    FIXED_IFRAME_MESSAGE_IDS["SELECTED_ELEMENT_KEY"] = "SELECTED_ELEMENT_KEY";
    FIXED_IFRAME_MESSAGE_IDS["MULTI_SELECTED_ELEMENT_KEYS"] = "MULTI_SELECTED_ELEMENT_KEYS";
    FIXED_IFRAME_MESSAGE_IDS["CONTEXT_REQUESTED"] = "CONTEXT_REQUESTED";
    FIXED_IFRAME_MESSAGE_IDS["WHEEL_EVENT"] = "WHEEL_EVENT";
    FIXED_IFRAME_MESSAGE_IDS["NAV_TREE"] = "NAV_TREE";
    FIXED_IFRAME_MESSAGE_IDS["PROCESSED_CSS_RULES_FOR_ELEMENT"] = "PROCESSED_CSS_RULES_FOR_ELEMENT";
    FIXED_IFRAME_MESSAGE_IDS["CSS_EVALS_FOR_ELEMENT"] = "CSS_EVALS_FOR_ELEMENT";
    FIXED_IFRAME_MESSAGE_IDS["ELEMENT_CLASS_LIST"] = "ELEMENT_CLASS_LIST";
    FIXED_IFRAME_MESSAGE_IDS["KEY_DOWN_EVENT"] = "KEY_DOWN_EVENT";
    FIXED_IFRAME_MESSAGE_IDS["KEY_UP_EVENT"] = "KEY_UP_EVENT";
    FIXED_IFRAME_MESSAGE_IDS["MOUSE_MOVE_EVENT"] = "MOUSE_MOVE_EVENT";
    FIXED_IFRAME_MESSAGE_IDS["DRAG_START_EVENT"] = "DRAG_START_EVENT";
    FIXED_IFRAME_MESSAGE_IDS["DRAG_END_EVENT"] = "DRAG_END_EVENT";
    FIXED_IFRAME_MESSAGE_IDS["DRAG_CANCEL_EVENT"] = "DRAG_CANCEL_EVENT";
    FIXED_IFRAME_MESSAGE_IDS["LATEST_HREF"] = "LATEST_HREF";
    FIXED_IFRAME_MESSAGE_IDS["LATEST_HYDRATION_ERROR_STATUS"] = "LATEST_HYDRATION_ERROR_STATUS";
    FIXED_IFRAME_MESSAGE_IDS["START_EDITING_TEXT"] = "START_EDITING_TEXT";
    FIXED_IFRAME_MESSAGE_IDS["EDITED_TEXT"] = "EDITED_TEXT";
    FIXED_IFRAME_MESSAGE_IDS["INSTANT_UPDATE_DONE"] = "INSTANT_UPDATE_DONE";
    FIXED_IFRAME_MESSAGE_IDS["EDIT_DYNAMIC_TEXT"] = "EDIT_DYNAMIC_TEXT";
})(FIXED_IFRAME_MESSAGE_IDS || (exports.FIXED_IFRAME_MESSAGE_IDS = FIXED_IFRAME_MESSAGE_IDS = {}));
exports.DELETE_STYLE_CONSTANT = null;
exports.SELECT_OR_HOVER_STORYBOARD = 'SELECT_OR_HOVER_STORYBOARD';
var STORYBOARD_HYDRATION_STATUS;
(function (STORYBOARD_HYDRATION_STATUS) {
    STORYBOARD_HYDRATION_STATUS["OTHER_ERROR"] = "other_error";
    STORYBOARD_HYDRATION_STATUS["ERROR"] = "error";
    STORYBOARD_HYDRATION_STATUS["NO_ERROR"] = "no_error";
})(STORYBOARD_HYDRATION_STATUS || (exports.STORYBOARD_HYDRATION_STATUS = STORYBOARD_HYDRATION_STATUS = {}));
