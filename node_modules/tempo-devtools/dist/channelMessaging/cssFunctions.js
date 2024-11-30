"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ruleMatchesElement = exports.getElementClassList = exports.getCssEvals = exports.cssEval = exports.processRulesForSelectedElement = exports.setModifiersForSelectedElement = exports.parse = void 0;
// @ts-ignore
const jquery_1 = __importDefault(require("jquery"));
const identifierUtils_1 = require("./identifierUtils");
const cssRuleUtils_1 = require("./cssRuleUtils");
const constantsAndTypes_1 = require("./constantsAndTypes");
const uuid_1 = require("uuid");
const specificity_1 = require("specificity");
const tempoElement_1 = require("./tempoElement");
const css_selector_parser_1 = require("css-selector-parser");
const sessionStorageUtils_1 = require("./sessionStorageUtils");
const navTreeUtils_1 = require("./navTreeUtils");
exports.parse = (0, css_selector_parser_1.createParser)({
    syntax: {
        baseSyntax: 'latest',
        pseudoClasses: {
            unknown: 'accept',
            definitions: {
                Selector: ['has'],
            },
        },
        pseudoElements: {
            unknown: 'accept',
        },
        combinators: ['>', '+', '~'],
        attributes: {
            operators: ['^=', '$=', '*=', '~='],
        },
        classNames: true,
        namespace: {
            wildcard: true,
        },
        tag: {
            wildcard: true,
        },
    },
    substitutes: true,
});
const addCSSRule = (styleSheet, selector, rules, index) => {
    try {
        if (styleSheet.insertRule) {
            styleSheet.insertRule(`${selector} { ${rules} }`, index);
        }
        else {
            styleSheet.addRule(selector, rules, index);
        }
    }
    catch (e) {
        console.log('Error adding rule: ', e);
    }
};
/**
 * This method filters and process media query rules for responsive modifiers to extract Tailwind responsive classes.
 * A Tailwind responsive modifiers takes the form:
 *
 *   {sm,md,lg...}:className
 *
 * which is represented as:
 *
 * @media (min-width: 640px) {
 *    .sm\:className {
 *     ...
 *   }
 * }
 *
 * This is why we need to filter for media query rules with min-width and then extract the class name.
 * @param rule
 * @returns
 */
const processMediaQueryRulesForResponsiveModifiers = (rule) => {
    let rules = [];
    if (rule instanceof CSSMediaRule) {
        // Loop through each CSSRule within the CSSMediaRule
        for (let innerRule of rule.cssRules) {
            // Check for min-width in media queries and that it is a style rule
            if (rule.media.mediaText.includes('min-width') &&
                innerRule instanceof CSSStyleRule) {
                const parsedIsSelector = (0, exports.parse)(innerRule.selectorText);
                if (parsedIsSelector.type !== 'Selector') {
                    continue;
                }
                const lastRule = parsedIsSelector.rules[0];
                const classNames = lastRule.items.filter((item) => item.type === 'ClassName').map((item) => item.name);
                if (classNames.length !== 1) {
                    continue;
                }
                // Extract Tailwind responsive modifiers
                rules.push({
                    class: classNames[0],
                    pseudos: extractTailwindPrefixes(classNames[0]),
                    cssText: innerRule.style.cssText,
                    style: innerRule.style,
                });
            }
        }
    }
    return rules;
};
/**
 * Since Tailwind CSS responsive modifiers are not CSS pseudo classes, we need to extract them from the class name.
 * We use a regex to match the responsive prefixes and return them as a set.
 * @param selectorText
 * @returns Set[prefixes]
 */
const extractTailwindPrefixes = (selectorText) => {
    // This regex matches classes with responsive prefixes that might be preceded by a period or another colon
    const prefixRegex = /(?:\b|(?<=[:.]))(sm|md|lg|xl|2xl)\\?:[\w-]+/g;
    const matches = selectorText.match(prefixRegex) || [];
    const prefixes = matches.map((match) => {
        // Find the index of the colon or escaped colon
        const index = match.indexOf(match.includes('\\:') ? '\\:' : ':');
        return match.substring(0, index);
    });
    return [...new Set(prefixes)]; // Remove duplicates
};
/**
 * Tailwind CSS dark mode classes (< 3.4.1) are specified using the `:is` pseudo selector and take the form
 *   :is(.dark .dark:bg-red-200)
 * This is to support the behaviour that dark mode classes are applied to the element when the dark class is present in the parent.
 *
 * TODO: We should support the new Tailwind CSS dark mode classes in 3.4.1 and above which are specified using the `@media (prefers-color-scheme: dark)` media query.
 * @param isSelectorString
 * @returns
 */
const processIsSelectorForDarkMode = (isSelector) => {
    if (isSelector.type !== 'Selector') {
        return;
    }
    const firstRule = isSelector.rules[0];
    const classNames = firstRule.items.filter((item) => item.type === 'ClassName').map((item) => item.name);
    if (classNames.length === 0 || classNames[0] !== 'dark') {
        return;
    }
    const nestedRule = firstRule.nestedRule;
    if (!nestedRule) {
        return;
    }
    let darkModeClasses = [];
    const nestedClassNames = nestedRule.items.filter((item) => item.type === 'ClassName').map((item) => item.name);
    if (nestedClassNames.length > 1) {
        console.log('Skipping is selector with multiple classes', firstRule);
        return;
    }
    darkModeClasses.push({
        class: nestedClassNames[0],
        pseudos: [
            'dark',
            ...nestedRule.items.filter((item) => item.type === 'PseudoClass').map((p) => p.name),
        ],
    });
    return darkModeClasses;
};
const setModifiersForSelectedElement = (parentPort, modifiers, selectedElementKey) => {
    // Remove all existing force classes from entire document
    const allElements = document.querySelectorAll('[class*="tempo-force-"]');
    allElements.forEach((element) => {
        const classes = Array.from(element.classList);
        classes.forEach((cls) => {
            if (cls.startsWith('tempo-force-')) {
                element.classList.remove(cls);
            }
        });
    });
    const selectedElement = tempoElement_1.TempoElement.fromKey(selectedElementKey);
    if (selectedElement.isEmpty()) {
        return;
    }
    const selectedDomElement = (0, jquery_1.default)(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${selectedElement.getKey()}`).get(0);
    if (!selectedDomElement) {
        return;
    }
    modifiers.forEach((modifier) => {
        selectedDomElement.classList.add('tempo-force-' + modifier);
    });
};
exports.setModifiersForSelectedElement = setModifiersForSelectedElement;
const processRulesForSelectedElement = (parentPort, cssElementLookup, selectedElementKey) => {
    var _a, _b, _c, _d, _e;
    // TODO: this whole function is slow, fix
    if (!cssElementLookup) {
        return;
    }
    const selectedElement = tempoElement_1.TempoElement.fromKey(selectedElementKey);
    if (selectedElement.isEmpty()) {
        return;
    }
    const selectedDomElement = (0, jquery_1.default)(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${selectedElement.getKey()}`).get(0);
    const multiSelectedElementKeys = (0, sessionStorageUtils_1.getMemoryStorageItem)(sessionStorageUtils_1.MULTI_SELECTED_ELEMENT_KEYS) || [];
    /**
     * If there's no selected DOM element yet, it implies the nav tree isn't built yet.
     * We register a callback to defer the processing of the rules until the nav tree is built.
     */
    if (!selectedDomElement) {
        (0, navTreeUtils_1.addNavTreeBuiltCallback)({
            callbackFn: () => {
                (0, exports.processRulesForSelectedElement)(parentPort, cssElementLookup, selectedElementKey);
            },
            state: {
                selectedElementKey: selectedElementKey,
                multiSelectedElementKeys: multiSelectedElementKeys,
            },
        });
        return;
    }
    const newProcessedCssRules = [];
    const extractedKnownClasses = new Set();
    const knownSelectors = new Set();
    // First get the inline style of the element
    const inlineStyleRule = {
        filename: '',
        selector: 'element.style',
        source: {},
        styles: {},
        applied: true,
        codebaseId: 'element.style',
        removable: false,
        allowChanges: true,
    };
    for (let i = 0; i < ((_a = selectedDomElement === null || selectedDomElement === void 0 ? void 0 : selectedDomElement.style) === null || _a === void 0 ? void 0 : _a.length) || 0; i++) {
        const cssName = selectedDomElement.style[i];
        // @ts-ignore
        inlineStyleRule.styles[cssName] = selectedDomElement.style[cssName];
    }
    newProcessedCssRules.push(inlineStyleRule);
    // Only check the inline-styles of the parent once
    let checkedInlineStylesOfParent = false;
    const directMatchCssRules = [];
    const otherCssRules = [];
    Object.keys(cssElementLookup).forEach((codebaseId) => {
        var _a;
        const cssRule = cssElementLookup[codebaseId];
        knownSelectors.add(cssRule.selector);
        if (!(0, cssRuleUtils_1.isCssSelectorValid)(cssRule.selector)) {
            return;
        }
        (0, cssRuleUtils_1.getAllClassesFromSelector)(cssRule.selector).forEach((cls) => {
            extractedKnownClasses.add(cls);
        });
        // First check if a rule directly matches
        if ((0, cssRuleUtils_1.isCssSelectorValid)(cssRule.selector) &&
            (selectedDomElement === null || selectedDomElement === void 0 ? void 0 : selectedDomElement.matches(cssRule.selector))) {
            directMatchCssRules.push(Object.assign(Object.assign({}, cssRule), { applied: true, allowChanges: true, removable: (0, cssRuleUtils_1.canRemoveCssClassFromElement)(cssRule.selector, selectedDomElement) }));
            return;
        }
        // In order to make the parentElement.style selector unique
        let parentElementIndex = 0;
        // Then check the parents if it's a rule with properties that are inherited
        let parentDomElement = selectedDomElement === null || selectedDomElement === void 0 ? void 0 : selectedDomElement.parentElement;
        const inheritedStyles = {};
        while (parentDomElement) {
            // Inline styles are prioritized over rule based styles
            if (!checkedInlineStylesOfParent) {
                const inlineStyleOfParent = {};
                for (let i = 0; i < ((_a = parentDomElement === null || parentDomElement === void 0 ? void 0 : parentDomElement.style) === null || _a === void 0 ? void 0 : _a.length) || 0; i++) {
                    const cssName = parentDomElement.style[i];
                    if (constantsAndTypes_1.INHERITABLE_CSS_PROPS[cssName]) {
                        inlineStyleOfParent[cssName] = parentDomElement.style[cssName];
                    }
                }
                if (Object.keys(inlineStyleOfParent).length !== 0) {
                    otherCssRules.push({
                        filename: '',
                        // TODO: make this unique
                        selector: `parentElement${parentElementIndex}.style`,
                        inherited: true,
                        source: {},
                        styles: inlineStyleOfParent,
                        applied: true,
                        codebaseId: `parentElement${parentElementIndex}.style`,
                        removable: false,
                        allowChanges: false,
                    });
                }
            }
            // Css defined styles
            if ((0, cssRuleUtils_1.isCssSelectorValid)(cssRule.selector) &&
                !(parentDomElement === null || parentDomElement === void 0 ? void 0 : parentDomElement.matches(cssRule.selector))) {
                parentDomElement = parentDomElement.parentElement;
                continue;
            }
            Object.keys((cssRule === null || cssRule === void 0 ? void 0 : cssRule.styles) || {}).forEach((cssName) => {
                // Prioritize inherited styles that are further down the tree
                if (constantsAndTypes_1.INHERITABLE_CSS_PROPS[cssName] &&
                    inheritedStyles[cssName] !== null) {
                    inheritedStyles[cssName] = cssRule.styles[cssName];
                }
            });
            parentDomElement = parentDomElement.parentElement;
            parentElementIndex += 1;
        }
        // Check once across all css rules
        checkedInlineStylesOfParent = true;
        // Just because a css rule is inherited doesn't mean it can't be eligible to apply,
        // so do not return after appending this rule
        if (Object.keys(inheritedStyles).length !== 0) {
            otherCssRules.push(Object.assign(Object.assign({}, cssRule), { inherited: true, styles: inheritedStyles, applied: true, removable: false, allowChanges: false }));
        }
        // Finally check if it's a rule that can be applied if clases are changed
        otherCssRules.push(Object.assign(Object.assign({}, cssRule), { applied: false, allowChanges: false, eligibleToApply: (0, cssRuleUtils_1.canApplyCssRuleToElement)(cssRule.selector, selectedDomElement) }));
    });
    const mainStyleSheet = document.styleSheets[0];
    // Add any rules not previously added that are available in the stylesheets as read-only
    for (let i = 0; i < document.styleSheets.length; i += 1) {
        const sheet = document.styleSheets[i];
        let rules = null;
        try {
            rules = sheet.cssRules;
        }
        catch (e) {
            console.log(e);
            try {
                rules = sheet.rules;
            }
            catch (e) {
                console.log(e);
            }
        }
        if (!rules) {
            continue;
        }
        for (let j = 0; j < rules.length; j += 1) {
            const rule = rules[j];
            /**
             * Handle Tailwind CSS responsive modifiers
             */
            const responsiveModifiers = processMediaQueryRulesForResponsiveModifiers(rule);
            if (responsiveModifiers.length > 0) {
                for (let k = 0; k < responsiveModifiers.length; k++) {
                    const modifier = responsiveModifiers[k];
                    if (!(selectedDomElement === null || selectedDomElement === void 0 ? void 0 : selectedDomElement.matches('.' + CSS.escape(modifier.class)))) {
                        continue;
                    }
                    const styling = {};
                    for (let l = 0; l < ((_b = modifier === null || modifier === void 0 ? void 0 : modifier.style) === null || _b === void 0 ? void 0 : _b.length) || 0; l += 1) {
                        const cssName = modifier === null || modifier === void 0 ? void 0 : modifier.style[l];
                        // @ts-ignore;
                        styling[cssName] = modifier === null || modifier === void 0 ? void 0 : modifier.style[cssName];
                    }
                    const ruleToPush = {
                        filename: undefined,
                        selector: CSS.escape('.' + modifier.class),
                        classParsed: modifier.class,
                        source: {},
                        styles: styling,
                        applied: true,
                        modifiers: Object.assign({}, modifier.pseudos.reduce((acc, pseudo) => {
                            acc[pseudo] = true;
                            return acc;
                        }, {})),
                        // Generate a random codebase ID to use for selection
                        // Note: this ID is shown as a backup in the overridden tooltip
                        codebaseId: `${modifier.class} ${(0, uuid_1.v4)().toString()}`,
                        removable: false,
                        allowChanges: false,
                        cssText: modifier.cssText,
                    };
                    directMatchCssRules.push(ruleToPush);
                }
            }
            if (!rule.selectorText) {
                continue;
            }
            if (knownSelectors.has(rule.selectorText)) {
                continue;
            }
            const parsedCssRule = (0, exports.parse)(rule.selectorText);
            if (parsedCssRule.type !== 'Selector') {
                continue;
            }
            const firstRule = parsedCssRule.rules[0];
            if (!firstRule) {
                continue;
            }
            /**
             * This is a special case for the `:is` pseudo selector, which is how Tailwind specifies dark mode classes.
             */
            const classNames = firstRule.items.filter((item) => item.type === 'ClassName').map((item) => item.name);
            const pseudos = firstRule.items.filter((item) => item.type === 'PseudoClass');
            // TODO: Add support for https://github.com/tailwindlabs/tailwindcss/pull/13379 (~3.4.4)
            if (classNames.length === 0 &&
                pseudos.length === 1 &&
                pseudos[0].name === 'is') {
                const pseudo = pseudos[0];
                if (pseudo && ((_c = pseudo.argument) === null || _c === void 0 ? void 0 : _c.type) === 'Selector') {
                    const darkModeClasses = processIsSelectorForDarkMode(pseudo.argument);
                    if (darkModeClasses) {
                        for (const darkModeClass of darkModeClasses) {
                            if (!(selectedDomElement === null || selectedDomElement === void 0 ? void 0 : selectedDomElement.matches('.' + CSS.escape(darkModeClass.class)))) {
                                continue;
                            }
                            const styling = {};
                            for (let k = 0; k < ((_d = rule === null || rule === void 0 ? void 0 : rule.style) === null || _d === void 0 ? void 0 : _d.length) || 0; k += 1) {
                                const cssName = rule.style[k];
                                styling[cssName] = rule.style[cssName];
                            }
                            const ruleToPush = {
                                filename: undefined,
                                selector: CSS.escape('.' + darkModeClass.class),
                                classParsed: darkModeClass.class,
                                source: {},
                                styles: styling,
                                applied: true,
                                modifiers: Object.assign({}, darkModeClass.pseudos.reduce((acc, pseudo) => {
                                    acc[pseudo] = true;
                                    return acc;
                                }, {})),
                                // Generate a random codebase ID to use for selection
                                // Note: this ID is shown as a backup in the overridden tooltip
                                codebaseId: `${rule.selectorText} ${(0, uuid_1.v4)().toString()}`,
                                removable: false,
                                allowChanges: false,
                                cssText: rule.style.cssText,
                            };
                            directMatchCssRules.push(ruleToPush);
                        }
                    }
                }
            }
            if (classNames.length === 0 || classNames.length > 1) {
                continue;
            }
            const cls = classNames[0];
            const pseudoClasses = firstRule.items.filter((item) => item.type === 'PseudoClass').map((p) => p.name);
            try {
                if (selectedDomElement === null || selectedDomElement === void 0 ? void 0 : selectedDomElement.matches('.' + CSS.escape(cls))) {
                    const styling = {};
                    for (let k = 0; k < ((_e = rule === null || rule === void 0 ? void 0 : rule.style) === null || _e === void 0 ? void 0 : _e.length) || 0; k += 1) {
                        const cssName = rule.style[k];
                        styling[cssName] = rule.style[cssName];
                    }
                    directMatchCssRules.push({
                        filename: undefined,
                        selector: rule.selectorText,
                        classParsed: cls,
                        source: {},
                        styles: styling,
                        applied: true,
                        modifiers: Object.assign({}, pseudoClasses.reduce((acc, pseudo) => {
                            acc[pseudo.name] = true;
                            return acc;
                        }, {})),
                        // Generate a random codebase ID to use for selection
                        // Note: this ID is shown as a backup in the overridden tooltip
                        codebaseId: `${rule.selectorText} ${(0, uuid_1.v4)().toString()}`,
                        removable: false,
                        allowChanges: false,
                        cssText: rule.style.cssText,
                    });
                }
                else {
                    // console.log("NO MATCH", cls)
                }
            }
            catch (e) {
                // console.error(e);
            }
        }
    }
    // For each direct match rule, check if it has modifiers and create a new rule for each modifier.
    for (let i = 0; i < directMatchCssRules.length; i++) {
        const currentRule = directMatchCssRules[i];
        if (!currentRule.modifiers) {
            continue;
        }
        const rulePseudos = Object.keys(currentRule.modifiers);
        if (rulePseudos.length < 1) {
            continue;
        }
        const cls = currentRule.classParsed;
        if (!cls) {
            continue;
        }
        const cssText = currentRule.cssText;
        if (!cssText) {
            continue;
        }
        // Create a new custom css rule for ones that have pseudo selectors.
        // Use the parseClass as the selector and add `tempo-force-[pseudo]` for each pseudo selector
        const pseudoSelector = rulePseudos
            .map((pseudo) => '.tempo-force-' + pseudo)
            .join('');
        const newSelector = '.' + CSS.escape(cls) + pseudoSelector;
        const newRules = cssText;
        // // Inject new rule into the stylesheet
        addCSSRule(mainStyleSheet, newSelector, newRules, mainStyleSheet.cssRules.length);
    }
    const newList = newProcessedCssRules
        .concat(directMatchCssRules.sort((a, b) => {
        try {
            return -(0, specificity_1.compare)(a.selector, b.selector);
        }
        catch (_a) {
            // Put the invalid elements at the end
            let aValid = true;
            try {
                (0, specificity_1.compare)(a.selector, 'body');
            }
            catch (e) {
                aValid = false;
            }
            let bValid = true;
            try {
                (0, specificity_1.compare)(b.selector, 'body');
            }
            catch (e) {
                bValid = false;
            }
            if (aValid && !bValid) {
                return -1;
            }
            if (!aValid && bValid) {
                return 1;
            }
            return 0;
        }
    }))
        .concat(otherCssRules);
    parentPort.postMessage({
        id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.PROCESSED_CSS_RULES_FOR_ELEMENT,
        processedCssRules: newList,
    });
};
exports.processRulesForSelectedElement = processRulesForSelectedElement;
const cssEval = (element, property) => {
    return window.getComputedStyle(element, null).getPropertyValue(property);
};
exports.cssEval = cssEval;
const getCssEvals = (parentPort, selectedElementKey) => {
    let cssEvals = {};
    const selectdElement = tempoElement_1.TempoElement.fromKey(selectedElementKey);
    if (selectdElement.isEmpty()) {
        return;
    }
    const selectedDomElement = (0, jquery_1.default)(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${selectdElement.getKey()}`).get(0);
    if (!selectedDomElement) {
        return;
    }
    constantsAndTypes_1.CSS_VALUES_TO_COLLECT.forEach((cssName) => {
        cssEvals[cssName] = (0, exports.cssEval)(selectedDomElement, cssName);
    });
    const parentCssEvals = {};
    const parentElement = selectedDomElement.parentElement;
    if (parentElement) {
        constantsAndTypes_1.CSS_VALUES_TO_COLLECT_FOR_PARENT.forEach((cssName) => {
            parentCssEvals[cssName] = (0, exports.cssEval)(selectedDomElement.parentElement, cssName);
        });
        // Use jQuery to check if 'dark' class is in any ancestor of the parent element
        let darkEnabledInParent = (0, jquery_1.default)(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${selectdElement.getKey()}`).closest('.dark')
            .length > 0;
        parentCssEvals['darkEnabledInParent'] = darkEnabledInParent;
    }
    cssEvals['parent'] = parentCssEvals;
    parentPort.postMessage({
        id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.CSS_EVALS_FOR_ELEMENT,
        cssEvals,
    });
};
exports.getCssEvals = getCssEvals;
const getElementClassList = (parentPort, selectedElementKey) => {
    const selectdElement = tempoElement_1.TempoElement.fromKey(selectedElementKey);
    if (selectdElement.isEmpty()) {
        return;
    }
    const selectedDomElement = (0, jquery_1.default)(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${selectdElement.getKey()}`).get(0);
    if (!selectedDomElement) {
        return;
    }
    parentPort.postMessage({
        id: constantsAndTypes_1.FIXED_IFRAME_MESSAGE_IDS.ELEMENT_CLASS_LIST,
        classList: Array.from(selectedDomElement.classList),
    });
};
exports.getElementClassList = getElementClassList;
const ruleMatchesElement = (parentPort, messageId, rule, selectedElementKey) => {
    if (!rule) {
        return;
    }
    const selectdElement = tempoElement_1.TempoElement.fromKey(selectedElementKey);
    if (selectdElement.isEmpty()) {
        return;
    }
    const selectedDomElement = (0, jquery_1.default)(`.${identifierUtils_1.ELEMENT_KEY_PREFIX}${selectdElement.getKey()}`).get(0);
    if (!selectedDomElement) {
        return;
    }
    parentPort.postMessage({
        id: messageId,
        matches: selectedDomElement === null || selectedDomElement === void 0 ? void 0 : selectedDomElement.matches(rule),
    });
};
exports.ruleMatchesElement = ruleMatchesElement;
