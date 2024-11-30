"use strict";
// Code taken and adapted from the resq library: https://github.com/baruchvlz/resq
Object.defineProperty(exports, "__esModule", { value: true });
exports.findElementInTree = exports.getElementName = exports.clearLookupsFromTree = exports.buildTreeLookupMap = exports.removeUniqueLoookupFromReactTreeNode = exports.addUniqueLoookupToReactTreeNode = exports.getUniqueLoookupFromReactTreeNode = exports.getDomElementForReactNode = exports.buildNodeTree = exports.getRootReactElement = exports.findReactInstance = void 0;
const identifierUtils_1 = require("./identifierUtils");
const uuid_1 = require("uuid");
/**
 * Taken from https://github.com/baruchvlz/resq/blob/master/src/utils.js
 * but improved to work with all versions of react
 */
const findReactInstance = (element) => {
    if (element.hasOwnProperty('_reactRootContainer')) {
        if (element._reactRootContainer._internalRoot) {
            return element._reactRootContainer._internalRoot.current;
        }
        else {
            return element._reactRootContainer.current;
        }
    }
    const instanceId = Object.keys(element).find((key) => key.startsWith('__reactInternalInstance') ||
        key.startsWith('__reactFiber') ||
        key.startsWith('__reactContainer'));
    if (instanceId) {
        return element[instanceId];
    }
};
exports.findReactInstance = findReactInstance;
//Returns true if it is a DOM element
function isElement(o) {
    return typeof HTMLElement === 'object'
        ? o instanceof HTMLElement //DOM2
        : o &&
            typeof o === 'object' &&
            o !== null &&
            o.nodeType === 1 &&
            typeof o.nodeName === 'string';
}
const getRootReactElement = () => {
    var _a;
    let rootSelector = '#root';
    if (!document.querySelector(rootSelector)) {
        rootSelector = '#__next';
    }
    const root = document.querySelector(rootSelector);
    let findInstance = null;
    if (root) {
        findInstance = (0, exports.findReactInstance)(root);
    }
    else {
        // hacky fallback; if there's no root element so we grab the first one we find
        document
            .getElementsByTagName('body')[0]
            .childNodes.forEach((childNode) => {
            if (findInstance) {
                return;
            }
            if (childNode.tagName !== 'DIV') {
                return;
            }
            findInstance = (0, exports.findReactInstance)(childNode);
        });
    }
    // June 12 2024 fix:
    // Sometimes the react tree only loads correctly in the "alternate slot"
    // Replace the current tree with the alternate tree if that is the case
    if (findInstance && !findInstance.child && ((_a = findInstance.alternate) === null || _a === void 0 ? void 0 : _a.child)) {
        findInstance = findInstance.alternate;
    }
    return findInstance;
};
exports.getRootReactElement = getRootReactElement;
const removeChildrenFromProps = (props) => {
    // if the props is a string, we can assume that it's just the text inside a html element
    if (!props || typeof props === 'string') {
        return props;
    }
    const returnProps = Object.assign({}, props);
    delete returnProps.children;
    return returnProps;
};
const getElementState = (elementState) => {
    if (!elementState) {
        return undefined;
    }
    const { baseState } = elementState;
    if (baseState) {
        return baseState;
    }
    return elementState;
};
const buildNodeTree = (element, parentTreeNode) => {
    var _a, _b;
    let tree = { children: [] };
    tree.element = element;
    tree.parent = parentTreeNode;
    if (!element) {
        return tree;
    }
    tree.name = (0, exports.getElementName)(element.type);
    if (typeof tree.name !== 'string') {
        tree.name = (_b = (_a = tree.name) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    tree.props = removeChildrenFromProps(element.memoizedProps);
    tree.state = getElementState(element.memoizedState);
    let { child } = element;
    if (child) {
        tree.children.push(child);
        while (child.sibling) {
            tree.children.push(child.sibling);
            child = child.sibling;
        }
    }
    tree.children = tree.children.map((child) => (0, exports.buildNodeTree)(child, tree));
    return tree;
};
exports.buildNodeTree = buildNodeTree;
const getDomElementForReactNode = (node) => {
    var _a, _b;
    let stateNode = (_a = node === null || node === void 0 ? void 0 : node.element) === null || _a === void 0 ? void 0 : _a.stateNode;
    if (stateNode && ((_b = stateNode === null || stateNode === void 0 ? void 0 : stateNode.constructor) === null || _b === void 0 ? void 0 : _b.name) === 'FiberRootNode') {
        stateNode = stateNode.containerInfo;
    }
    if (isElement(stateNode)) {
        return stateNode;
    }
    return null;
};
exports.getDomElementForReactNode = getDomElementForReactNode;
const getUniqueLoookupFromReactTreeNode = (node) => {
    const stateNode = (0, exports.getDomElementForReactNode)(node);
    if (stateNode) {
        return (0, identifierUtils_1.getUniqueLookupFromNode)(stateNode);
    }
    return null;
};
exports.getUniqueLoookupFromReactTreeNode = getUniqueLoookupFromReactTreeNode;
const addUniqueLoookupToReactTreeNode = (node, uniqueLookup) => {
    const stateNode = (0, exports.getDomElementForReactNode)(node);
    if (stateNode) {
        (0, identifierUtils_1.addUniqueLookupAsClass)(stateNode, uniqueLookup);
        return true;
    }
    return false;
};
exports.addUniqueLoookupToReactTreeNode = addUniqueLoookupToReactTreeNode;
const removeUniqueLoookupFromReactTreeNode = (node) => {
    const stateNode = (0, exports.getDomElementForReactNode)(node);
    if (stateNode) {
        (0, identifierUtils_1.removeUniqueLookupFromNode)(stateNode);
        return true;
    }
    return false;
};
exports.removeUniqueLoookupFromReactTreeNode = removeUniqueLoookupFromReactTreeNode;
/**
 * Builds a lookup map with generated uuids that are added to the HTML elements under the hood as classes.
 * Make sure to clear the lookups from the tree after you are done with it.
 * @param tree
 * @param map
 */
const buildTreeLookupMap = (tree, map) => {
    const newUniqueLookup = (0, uuid_1.v4)();
    const added = (0, exports.addUniqueLoookupToReactTreeNode)(tree, newUniqueLookup);
    if (added) {
        map[newUniqueLookup] = tree;
    }
    tree.children.forEach((child) => {
        (0, exports.buildTreeLookupMap)(child, map);
    });
};
exports.buildTreeLookupMap = buildTreeLookupMap;
/**
 * Build tree lookup map adds a class name for lookups, we want to remove these after the tree is built
 * @param tree
 */
const clearLookupsFromTree = (tree) => {
    (0, exports.removeUniqueLoookupFromReactTreeNode)(tree);
    tree.children.forEach((child) => {
        (0, exports.clearLookupsFromTree)(child);
    });
};
exports.clearLookupsFromTree = clearLookupsFromTree;
const isFunction = (type) => {
    return typeof type === 'function';
};
const isObject = (type) => {
    return typeof type === 'object';
};
const getElementName = (type) => {
    var _a;
    if (!type) {
        return type;
    }
    if (isFunction(type) || isObject(type)) {
        if (type.displayName) {
            if (isFunction(type.displayName)) {
                return type.displayName();
            }
            else {
                return type.displayName;
            }
        }
        if (type.name) {
            if (isFunction(type.name)) {
                return type.name();
            }
            else {
                return type.name;
            }
        }
        if ((_a = type.render) === null || _a === void 0 ? void 0 : _a.name) {
            return type.render.name;
        }
        return null;
    }
    return type;
};
exports.getElementName = getElementName;
/**
 * @param tree
 * @param searchFn
 * @param firstOnly if set, returns only the first element in a breadth-firth search
 * @returns
 */
const findElementInTree = (tree, searchFn, firstOnly) => {
    let searchQueue = [tree];
    const foundNodes = [];
    while (searchQueue.length > 0) {
        const node = searchQueue.shift();
        if (searchFn(node)) {
            foundNodes.push(node);
            if (firstOnly) {
                break;
            }
        }
        searchQueue = searchQueue.concat(node.children || []);
    }
    return foundNodes;
};
exports.findElementInTree = findElementInTree;
