"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNodeOutline = exports.updateOutlines = exports.clearAllOutlines = exports.getOutlineElement = exports.OutlineType = exports.PRIMARY_COMPONENT_OUTLINE_COLOR = exports.SECONDARY_OUTLINE_COLOUR = exports.PRIMARY_OUTLINE_COLOUR = void 0;
const identifierUtils_1 = require("./identifierUtils");
const sessionStorageUtils_1 = require("./sessionStorageUtils");
// @ts-ignore
const jquery_1 = __importDefault(require("jquery"));
const tempoElement_1 = require("./tempoElement");
const editTextUtils_1 = require("./editTextUtils");
const constantsAndTypes_1 = require("./constantsAndTypes");
exports.PRIMARY_OUTLINE_COLOUR = '#4597F7';
exports.SECONDARY_OUTLINE_COLOUR = '#4597F7';
exports.PRIMARY_COMPONENT_OUTLINE_COLOR = '#6183e4';
var OutlineType;
(function (OutlineType) {
    OutlineType[OutlineType["PRIMARY"] = 0] = "PRIMARY";
    OutlineType[OutlineType["SECONDARY"] = 1] = "SECONDARY";
    OutlineType[OutlineType["CHILD"] = 2] = "CHILD";
    OutlineType[OutlineType["MOVE"] = 3] = "MOVE";
})(OutlineType || (exports.OutlineType = OutlineType = {}));
/**
 * Returns a context-based palette of colours to use for the outlines.
 */
const colours = () => {
    const aiContextSelection = (0, sessionStorageUtils_1.getMemoryStorageItem)('aiContext');
    if (aiContextSelection) {
        return {
            primary: '#6858f5',
            secondary: '#6858f5',
            component: '#5246C2',
        };
    }
    return {
        primary: exports.PRIMARY_OUTLINE_COLOUR,
        secondary: exports.SECONDARY_OUTLINE_COLOUR,
        component: exports.PRIMARY_COMPONENT_OUTLINE_COLOR,
    };
};
const getDashedBackgroundImage = (strokeColor, dashWidth, dashGap) => {
    return `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='${strokeColor.replace('#', '%23')}' stroke-width='${dashWidth}' stroke-dasharray='1%2c ${dashGap}' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`;
};
const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const getPencilSVG = () => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`;
};
const getEditTextButtonNode = (parentPort, bgColor, elementKey) => {
    const el = document.createElement('div');
    const textEl = document.createElement('div');
    textEl.innerText = 'Edit Dynamic Text';
    textEl.classList.add(identifierUtils_1.EDIT_TEXT_BUTTON);
    textEl.classList.add(identifierUtils_1.OUTLINE_CLASS);
    // First append the pencil SVG
    const pencilSVG = document.createElement('div');
    pencilSVG.innerHTML = getPencilSVG();
    pencilSVG.style.width = '22px';
    pencilSVG.style.height = '22px';
    pencilSVG.classList.add(identifierUtils_1.EDIT_TEXT_BUTTON);
    pencilSVG.classList.add(identifierUtils_1.OUTLINE_CLASS);
    el.appendChild(pencilSVG);
    el.appendChild(textEl);
    el.classList.add(identifierUtils_1.OUTLINE_CLASS);
    el.classList.add(identifierUtils_1.EDIT_TEXT_BUTTON);
    el.style.color = 'white';
    el.style.cursor = 'pointer';
    el.style.backgroundColor = bgColor;
    el.style.padding = '4px 12px 4px 12px';
    el.style.borderRadius = '8px';
    el.style.fontSize = '20px';
    el.style.pointerEvents = 'auto';
    el.style.display = 'flex';
    el.style.flexDirection = 'row';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.gap = '8px';
    // When clicking, trigger an open in editor action
    el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        parentPort.postMessage({
            id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.EDIT_DYNAMIC_TEXT,
            elementKey,
        });
    });
    el.addEventListener('pointerup', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
    return el;
};
const getOutlineElement = (parentPort, type, pageLeft, pageTop, width, height, selected, tagName, isComponent, elementKey) => {
    const palette = colours();
    const left = pageLeft;
    const top = pageTop;
    const zoomPerc = (0, sessionStorageUtils_1.getMemoryStorageItem)('zoomPerc');
    const zoomMultiplier = zoomPerc ? 1 / Number(zoomPerc) : 1;
    const newElement = document.createElement('div');
    newElement.classList.add(identifierUtils_1.OUTLINE_CLASS);
    if (type === OutlineType.CHILD || type === OutlineType.MOVE) {
        const dashThickness = 5 * zoomMultiplier;
        newElement.style.backgroundImage = getDashedBackgroundImage(isComponent ? palette.component : palette.primary, Math.max(1, Math.round(dashThickness)), Math.max(3, Math.round(dashThickness * 3)));
    }
    else {
        const thickness = type === OutlineType.SECONDARY
            ? 0.5 * zoomMultiplier
            : 1 * zoomMultiplier;
        if (thickness >= 0.5) {
            newElement.style.outline = `${thickness}px solid ${type === OutlineType.SECONDARY
                ? palette.secondary
                : isComponent
                    ? palette.component
                    : palette.primary}`;
        }
        newElement.style.border = `${thickness >= 0.5 ? thickness : thickness * 2}px solid ${type === OutlineType.SECONDARY
            ? palette.secondary
            : isComponent
                ? palette.component
                : palette.primary}`;
    }
    newElement.style.position = 'fixed';
    newElement.style.pointerEvents = 'none';
    switch (type) {
        case OutlineType.PRIMARY:
            newElement.style.zIndex = '2000000002';
            break;
        case OutlineType.SECONDARY:
            newElement.style.zIndex = '2000000001';
            break;
        case OutlineType.CHILD:
            newElement.style.zIndex = '2000000000';
            break;
        case OutlineType.MOVE:
            newElement.style.zIndex = '2000000003';
            break;
    }
    newElement.style.boxSizing = 'border-box';
    newElement.style.left = left + 'px';
    newElement.style.top = top + 'px';
    newElement.style.width = width + 'px';
    newElement.style.height = height + 'px';
    newElement.style.cursor = 'default !important';
    const limitedZoomMultiplier = Math.min(2, zoomMultiplier);
    if (type === OutlineType.PRIMARY && selected) {
        // Draw the size of the element underneath
        const sizeElement = document.createElement('div');
        newElement.appendChild(sizeElement);
        sizeElement.classList.add(identifierUtils_1.OUTLINE_CLASS);
        sizeElement.innerHTML = `${Math.round(width)} x ${Math.round(height)}`;
        sizeElement.style.color = 'white';
        sizeElement.style.backgroundColor = isComponent
            ? palette.component
            : palette.primary;
        sizeElement.style.padding = '4px 12px 4px 12px';
        sizeElement.style.height = '38px';
        sizeElement.style.borderRadius = '8px';
        sizeElement.style.position = 'absolute';
        sizeElement.style.left = `calc(${width}px / 2)`;
        sizeElement.style.fontSize = '20px';
        sizeElement.style.whiteSpace = 'nowrap';
        // After 22 it starts to merge into the border
        // 52 is the size of the element (38px) + double the size of the gap between the border and the element (7px)
        const bottomValue = -Math.max(22, 45 + (52 * limitedZoomMultiplier - 52) / 2);
        sizeElement.style.bottom = `${bottomValue}px`;
        sizeElement.style.transform = `scale(${limitedZoomMultiplier}) translateX(${-50 / limitedZoomMultiplier}%)`;
    }
    if (selected && tagName) {
        const topControlsWrapper = document.createElement('div');
        newElement.appendChild(topControlsWrapper);
        topControlsWrapper.style.display = 'flex';
        topControlsWrapper.style.width = width / limitedZoomMultiplier + 'px';
        topControlsWrapper.style.justifyContent = 'space-between';
        topControlsWrapper.style.flexDirection = 'row';
        topControlsWrapper.style.gap = '4px';
        topControlsWrapper.style.position = 'absolute';
        topControlsWrapper.style.left = `0px`;
        topControlsWrapper.style.transform = `scale(${limitedZoomMultiplier}) translateX(${50 - 50 / limitedZoomMultiplier}%) translateY(${-70 - 50 / limitedZoomMultiplier}%)`;
        // Draw the tagname above
        const tagNameElement = document.createElement('div');
        topControlsWrapper.appendChild(tagNameElement);
        tagNameElement.classList.add(identifierUtils_1.OUTLINE_CLASS);
        tagNameElement.innerHTML = tagName
            ? isComponent
                ? capitalizeFirstLetter(tagName)
                : tagName.toLowerCase()
            : '';
        tagNameElement.style.color = 'white';
        tagNameElement.style.backgroundColor = isComponent
            ? palette.component
            : palette.primary;
        tagNameElement.style.padding = '4px 12px 4px 12px';
        tagNameElement.style.height = '38px';
        tagNameElement.style.borderRadius = '8px';
        tagNameElement.style.fontSize = '20px';
        // If this node has direct static text inside of it, but is not editable, show the edit text
        // dynamically button
        if (type === OutlineType.PRIMARY) {
            const matchingNode = (0, jquery_1.default)(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${elementKey}`).get(0);
            const tempoElement = tempoElement_1.TempoElement.fromKey(elementKey || '');
            if ((0, editTextUtils_1.hasTextContents)(matchingNode) && !(0, editTextUtils_1.canEditText)(tempoElement)) {
                const newNode = getEditTextButtonNode(parentPort, isComponent ? palette.component : palette.primary, elementKey);
                topControlsWrapper.appendChild(newNode);
            }
        }
    }
    // TODO: Add in when we add resizing in the canvas
    // if (primary && selected) {
    //   for (let top = 1; top >= 0; top -= 1) {
    //     for (let left = 1; left >= 0; left -= 1) {
    //       const cornerElement = document.createElement("div");
    //       newElement.appendChild(cornerElement);
    //       cornerElement.classList.add(OUTLINE_CLASS);
    //       cornerElement.style.position = "absolute";
    //       cornerElement.style.width = Math.max(14 * zoomMultiplier, 1) + "px";
    //       cornerElement.style.height = Math.max(14 * zoomMultiplier, 1) + "px";
    //       cornerElement.style.backgroundColor = "white";
    //       cornerElement.style.cursor = "pointer";
    //       cornerElement.style.zIndex = "2000000002";
    //       if (top) {
    //         cornerElement.style.top = Math.min(-7 * zoomMultiplier, -0.5) + "px";
    //       } else {
    //         cornerElement.style.bottom = Math.min(-7 * zoomMultiplier, -0.5) + "px";
    //       }
    //       if (left) {
    //         cornerElement.style.left = Math.min(-8 * zoomMultiplier, -0.5) + "px";
    //       } else {
    //         cornerElement.style.right = Math.min(-8 * zoomMultiplier, -0.5) + "px";
    //       }
    //       cornerElement.style.outline = 2 * zoomMultiplier + "px solid " + PRIMARY_OUTLINE_COLOUR;
    //       cornerElement.style.pointerEvents = "auto";
    //     }
    //   }
    // }
    return newElement;
};
exports.getOutlineElement = getOutlineElement;
const clearAllOutlines = () => {
    (0, jquery_1.default)(`.${identifierUtils_1.OUTLINE_CLASS}`).remove();
};
exports.clearAllOutlines = clearAllOutlines;
/**
 * Creates all the necessary outlines for the hovered and selected elements
 * @returns
 */
const updateOutlines = (parentPort, storyboardId) => {
    (0, exports.clearAllOutlines)();
    const driveModeEnabled = !!(0, sessionStorageUtils_1.getSessionStorageItem)('driveModeEnabled', storyboardId);
    if (driveModeEnabled) {
        return;
    }
    const hoveredElementKey = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.HOVERED_ELEMENT_KEY);
    const selectedElementKey = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.SELECTED_ELEMENT_KEY);
    const multiselectedElementKeys = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.MULTI_SELECTED_ELEMENT_KEYS);
    const selectedElement = tempoElement_1.TempoElement.fromKey(selectedElementKey);
    const body = document.getElementsByTagName('body')[0];
    const elementKeyToNavNode = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.ELEMENT_KEY_TO_NAV_NODE) || {};
    const getBoundingBoxForElementKey = (elementKey) => {
        var _a, _b;
        const navNode = elementKeyToNavNode[elementKey];
        // Try to get the bounding box directly from the DOM, but fall back to the one cached
        // at Nav Tree build time
        const boundingBoxToUse = (_b = (_a = (0, jquery_1.default)('body')
            .find(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${elementKey}`)
            .get(0)) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect) === null || _b === void 0 ? void 0 : _b.call(_a);
        if (boundingBoxToUse) {
            return {
                left: boundingBoxToUse.left,
                top: boundingBoxToUse.top,
                width: boundingBoxToUse.width,
                height: boundingBoxToUse.height,
            };
        }
        if (navNode === null || navNode === void 0 ? void 0 : navNode.pageBoundingBox) {
            return {
                left: navNode.pageBoundingBox.pageX,
                top: navNode.pageBoundingBox.pageY,
                width: navNode.pageBoundingBox.width,
                height: navNode.pageBoundingBox.height,
            };
        }
        return null;
    };
    const createOutlinesForElementKey = (elementKey, selected, isChild, outlineChildren) => {
        var _a, _b;
        const navNode = elementKeyToNavNode[elementKey];
        if (!navNode) {
            return;
        }
        const tagNameToUse = navNode === null || navNode === void 0 ? void 0 : navNode.name;
        const boundingBox = getBoundingBoxForElementKey(elementKey);
        if (boundingBox) {
            body.appendChild((0, exports.getOutlineElement)(parentPort, isChild ? OutlineType.CHILD : OutlineType.PRIMARY, boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height, selected, tagNameToUse, navNode === null || navNode === void 0 ? void 0 : navNode.isComponent, elementKey));
            const mouseDragData = (0, sessionStorageUtils_1.getMemoryStorageItem)('mouseDragContext');
            const mousePosData = (0, sessionStorageUtils_1.getMemoryStorageItem)('mousePos');
            if (selected && (mouseDragData === null || mouseDragData === void 0 ? void 0 : mouseDragData.dragging) && mousePosData) {
                body.appendChild((0, exports.getOutlineElement)(parentPort, OutlineType.MOVE, mousePosData.pageX - boundingBox.width / 2 + mouseDragData.offsetX, mousePosData.pageY - boundingBox.height / 2 + mouseDragData.offsetY, boundingBox.width, boundingBox.height, undefined, undefined, navNode === null || navNode === void 0 ? void 0 : navNode.isComponent, elementKey));
            }
        }
        if (outlineChildren) {
            (_b = (_a = navNode === null || navNode === void 0 ? void 0 : navNode.children) === null || _a === void 0 ? void 0 : _a.forEach) === null || _b === void 0 ? void 0 : _b.call(_a, (child) => {
                createOutlinesForElementKey(child.tempoElement.getKey(), false, true, false);
            });
        }
    };
    if (hoveredElementKey) {
        createOutlinesForElementKey(hoveredElementKey, false, false, true);
    }
    if (multiselectedElementKeys === null || multiselectedElementKeys === void 0 ? void 0 : multiselectedElementKeys.length) {
        let fullBoundingBox = getBoundingBoxForElementKey(multiselectedElementKeys[0]);
        multiselectedElementKeys.slice(1).forEach((elementKey) => {
            const boundingRect = getBoundingBoxForElementKey(elementKey);
            if (boundingRect) {
                if (fullBoundingBox) {
                    const prevRight = fullBoundingBox.left + fullBoundingBox.width;
                    const prevBottom = fullBoundingBox.top + fullBoundingBox.height;
                    fullBoundingBox.left = Math.min(fullBoundingBox.left, boundingRect.left);
                    fullBoundingBox.top = Math.min(fullBoundingBox.top, boundingRect.top);
                    const right = Math.max(prevRight, boundingRect.left + boundingRect.width);
                    const bottom = Math.max(prevBottom, boundingRect.top + boundingRect.height);
                    fullBoundingBox.width = right - fullBoundingBox.left;
                    fullBoundingBox.height = bottom - fullBoundingBox.top;
                }
                else {
                    fullBoundingBox = boundingRect;
                }
            }
        });
        if (fullBoundingBox) {
            body.appendChild((0, exports.getOutlineElement)(parentPort, OutlineType.PRIMARY, fullBoundingBox.left, fullBoundingBox.top, fullBoundingBox.width, fullBoundingBox.height, true, `${multiselectedElementKeys.length} Elements`, false));
        }
        multiselectedElementKeys.forEach((elementKey) => {
            createOutlinesForElementKey(elementKey, false, false, false);
        });
    }
    else if (selectedElementKey) {
        createOutlinesForElementKey(selectedElementKey, true, false, false);
    }
    // Create outlines
    (0, jquery_1.default)(`.${identifierUtils_1.TEMPO_INSTANT_DIV_DRAW_CLASS}`).each((index, item) => {
        const boundingRect = item.getBoundingClientRect();
        body.appendChild((0, exports.getOutlineElement)(parentPort, OutlineType.PRIMARY, boundingRect.left, boundingRect.top, boundingRect.width, boundingRect.height));
    });
    (0, jquery_1.default)(`*[${identifierUtils_1.TEMPO_OUTLINE_UNTIL_REFESH}=true]`).each((index, item) => {
        const boundingRect = item.getBoundingClientRect();
        body.appendChild((0, exports.getOutlineElement)(parentPort, OutlineType.PRIMARY, boundingRect.left, boundingRect.top, boundingRect.width, boundingRect.height));
    });
    // Create secondary outlines for all matching IDs in the codebase for the clicked element
    if (selectedElement === null || selectedElement === void 0 ? void 0 : selectedElement.codebaseId) {
        (0, jquery_1.default)('body')
            .find(`.${selectedElement === null || selectedElement === void 0 ? void 0 : selectedElement.codebaseId}`)
            .not(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${selectedElementKey}`)
            .not(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${hoveredElementKey}`)
            .each((index, item) => {
            const boundingRect = item.getBoundingClientRect();
            body.appendChild((0, exports.getOutlineElement)(parentPort, OutlineType.SECONDARY, boundingRect.left, boundingRect.top, boundingRect.width, boundingRect.height));
        });
    }
};
exports.updateOutlines = updateOutlines;
const isNodeOutline = (node) => {
    if (!(node === null || node === void 0 ? void 0 : node.classList)) {
        return false;
    }
    let isOutline = false;
    node.classList.forEach((cls) => {
        if (cls === identifierUtils_1.OUTLINE_CLASS) {
            isOutline = true;
        }
    });
    return isOutline;
};
exports.isNodeOutline = isNodeOutline;
