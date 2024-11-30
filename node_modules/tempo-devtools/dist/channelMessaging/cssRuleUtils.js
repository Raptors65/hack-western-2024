"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.camelToSnakeCase = exports.isCssSelectorValid = exports.getAllClassesFromSelector = exports.canRemoveCssClassFromElement = exports.canApplyCssRuleToElement = void 0;
const cssFunctions_1 = require("./cssFunctions");
const canApplyCssRuleToElement = (cssRule, element) => {
    var _a;
    try {
        if (!element) {
            return false;
        }
        if (!(0, exports.isCssSelectorValid)(cssRule)) {
            return false;
        }
        if (element.matches(cssRule)) {
            return false;
        }
        const parsedCssRule = (0, cssFunctions_1.parse)(cssRule);
        let lastRule = parsedCssRule;
        while (lastRule.nestedRule) {
            lastRule = lastRule.nestedRule;
        }
        const addedClasses = [];
        const classes = new Set(element.classList);
        (_a = lastRule.items) === null || _a === void 0 ? void 0 : _a.forEach((item) => {
            if (item.type === 'ClassName') {
                const cls = item.name;
                if (!classes.has(cls)) {
                    element.classList.add(cls);
                    addedClasses.push(cls);
                }
            }
        });
        const canApply = element.matches(cssRule);
        addedClasses.forEach((cls) => {
            element.classList.remove(cls);
        });
        return canApply;
    }
    catch (e) {
        console.error(e);
        return false;
    }
};
exports.canApplyCssRuleToElement = canApplyCssRuleToElement;
const canRemoveCssClassFromElement = (cssRule, element) => {
    var _a;
    try {
        if (!(0, exports.isCssSelectorValid)(cssRule)) {
            return false;
        }
        if (!element.matches(cssRule)) {
            return false;
        }
        const parsedCssRule = (0, cssFunctions_1.parse)(cssRule);
        let lastRule = parsedCssRule;
        while (lastRule.nestedRule) {
            lastRule = lastRule.nestedRule;
        }
        const removedClasses = [];
        const classes = new Set(element.classList);
        (_a = lastRule.items) === null || _a === void 0 ? void 0 : _a.forEach((item) => {
            if (item.type === 'ClassName') {
                const cls = item.name;
                if (!classes.has(cls)) {
                    return;
                }
                element.classList.remove(cls);
                removedClasses.push(cls);
            }
        });
        const canRemove = !element.matches(cssRule);
        removedClasses.forEach((cls) => {
            element.classList.add(cls);
        });
        return canRemove;
    }
    catch (e) {
        console.error(e);
        return false;
    }
};
exports.canRemoveCssClassFromElement = canRemoveCssClassFromElement;
const getAllClassesFromSelector = (cssSelector) => {
    try {
        if (!(0, exports.isCssSelectorValid)(cssSelector)) {
            return new Set();
        }
        const parsedCssRule = (0, cssFunctions_1.parse)(cssSelector);
        let traverseRule = parsedCssRule;
        const allClasses = new Set();
        while (traverseRule) {
            const items = traverseRule.items || [];
            items.forEach((item) => {
                if (item.type === 'ClassName') {
                    allClasses.add(item.name);
                }
            });
            traverseRule = traverseRule.nestedRule;
        }
        return allClasses;
    }
    catch (e) {
        console.log('Failed to parse classes from selector ' + cssSelector + ', ' + e);
        return new Set();
    }
};
exports.getAllClassesFromSelector = getAllClassesFromSelector;
const queryCheck = (s) => document.createDocumentFragment().querySelector(s);
const isCssSelectorValid = (cssSelector) => {
    try {
        queryCheck(cssSelector);
        const parsedCssRule = (0, cssFunctions_1.parse)(cssSelector);
        return true;
    }
    catch (e) {
        return false;
    }
};
exports.isCssSelectorValid = isCssSelectorValid;
const camelToSnakeCase = (str) => {
    if (!str)
        return str;
    return (str.charAt(0).toLowerCase() +
        str.substring(1).replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`));
};
exports.camelToSnakeCase = camelToSnakeCase;
