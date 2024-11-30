"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconstructChangeLedgerClass = exports.UnknownChange = exports.RedoChange = exports.UndoChange = exports.EditTextChange = exports.RemoveClassChange = exports.AddClassChange = exports.ChangeTagChange = exports.DuplicateChange = exports.WrapDivChange = exports.ChangePropChange = exports.RemoveJsxChange = exports.MoveJsxChange = exports.AddJsxChange = exports.StylingChange = exports.ChangeLedgerItem = exports.CHANGE_TYPES_WITH_INSTANT_UNDO = exports.ChangeType = exports.StylingFramework = void 0;
const tempoElement_1 = require("./tempoElement");
const uuid_1 = require("uuid");
// Matches the file in tempo-devtools
var StylingFramework;
(function (StylingFramework) {
    StylingFramework["INLINE"] = "Inline";
    StylingFramework["CSS"] = "CSS";
    StylingFramework["TAILWIND"] = "Tailwind";
})(StylingFramework || (exports.StylingFramework = StylingFramework = {}));
var ChangeType;
(function (ChangeType) {
    ChangeType["STYLING"] = "STYLING";
    ChangeType["ADD_JSX"] = "ADD_JSX";
    ChangeType["MOVE_JSX"] = "MOVE_JSX";
    ChangeType["REMOVE_JSX"] = "REMOVE_JSX";
    ChangeType["CHANGE_PROP"] = "CHANGE_PROP";
    ChangeType["ADD_CLASS"] = "ADD_CLASS";
    ChangeType["REMOVE_CLASS"] = "REMOVE_CLASS";
    ChangeType["EDIT_TEXT"] = "EDIT_TEXT";
    ChangeType["WRAP_DIV"] = "WRAP_DIV";
    ChangeType["CHANGE_TAG"] = "CHANGE_TAG";
    ChangeType["DUPLICATE"] = "DUPLICATE";
    ChangeType["UNDO"] = "UNDO";
    ChangeType["REDO"] = "REDO";
    ChangeType["UNKNOWN"] = "UNKNOWN";
})(ChangeType || (exports.ChangeType = ChangeType = {}));
// Make sure to match this in both tempo-devtools & ** tempo-api ** (in the undo/redo file)
exports.CHANGE_TYPES_WITH_INSTANT_UNDO = [
    ChangeType.REMOVE_JSX,
    ChangeType.ADD_CLASS,
    ChangeType.STYLING,
];
class ChangeLedgerItem {
    constructor(type, changeName, changeFields, id) {
        this.prevIdToNewIdMap = {};
        this.id = id || (0, uuid_1.v4)();
        this.type = type;
        this.changeFields = changeFields;
        this.changeName = changeName;
        this._consumed = false;
        this._failed = false;
        this._instantUpdateSent = false;
        this._instantUpdateFinished = false;
        this._instantUpdateSuccessful = false;
        this._sendInstantUpdate = true;
        this.canInstantUpdateWhileFlushing = false;
        this._apiPromise = new Promise((resolve, reject) => {
            this._resolveApi = resolve;
            this._rejectApi = reject;
        });
    }
    resolveApi(data) {
        var _a;
        (_a = this._resolveApi) === null || _a === void 0 ? void 0 : _a.call(this, data);
    }
    rejectApi(reason) {
        var _a;
        if (this._apiRejectionAdded) {
            (_a = this._rejectApi) === null || _a === void 0 ? void 0 : _a.call(this, reason);
        }
    }
    needsToSendInstantUpdate() {
        return !this._instantUpdateSent && this._sendInstantUpdate;
    }
    markInstantUpdateSent() {
        this._instantUpdateSent = true;
    }
    markInstantUpdateFinished(instantUpdateData, instantUpdateSuccessful) {
        this._instantUpdateFinished = true;
        this._instantUpdateSuccessful = instantUpdateSuccessful;
        this._instantUpdateData = instantUpdateData;
    }
    getInstantUpdateData() {
        return this._instantUpdateData;
    }
    wasInstantUpdateSuccessful() {
        return this._instantUpdateSuccessful;
    }
    isInstantUpdateFinished() {
        return this._instantUpdateFinished;
    }
    markProcessedSucceeded() {
        this._consumed = true;
    }
    markProcessedFailed() {
        this._failed = true;
        this._consumed = true;
    }
    isFailed() {
        return this._failed;
    }
    needToProcessChange() {
        return !this._consumed;
    }
    onApiResolve(onFulfilled) {
        return this._apiPromise.then(onFulfilled);
    }
    onApiReject(onRejected) {
        this._apiRejectionAdded = true;
        return this._apiPromise.catch(onRejected);
    }
    doNotSendInstantUpdate() {
        this._sendInstantUpdate = false;
    }
    // For selecting/deslecting new elements after instant updates
    clearSelectedElementsAfterInstantUpdate() {
        this.elementKeyToSelectAfterInstantUpdate = null;
        this.elementKeysToMultiselectAfterInstantUpdate = null;
    }
    setSelectedElementsAfterInstantUpdate(selectedElementKey, multiselectedElementKeys) {
        this.elementKeyToSelectAfterInstantUpdate = selectedElementKey;
        this.elementKeysToMultiselectAfterInstantUpdate = multiselectedElementKeys;
    }
    clearSelectedElementsAfterUndoInstantUpdate() {
        this.elementKeyToSelectAfterUndoInstantUpdate = null;
        this.elementKeysToMultiselectAfterUndoInstantUpdate = null;
    }
    setSelectedElementsAfterUndoInstantUpdate(selectedElementKey, multiselectedElementKeys) {
        this.elementKeyToSelectAfterUndoInstantUpdate = selectedElementKey;
        this.elementKeysToMultiselectAfterUndoInstantUpdate =
            multiselectedElementKeys;
    }
    getElementKeyToSelectAfterInstantUpdate() {
        return this.elementKeyToSelectAfterInstantUpdate;
    }
    getElementKeysToMultiselectAfterInstantUpdate() {
        return this.elementKeysToMultiselectAfterInstantUpdate;
    }
    getElementKeyToSelectAfterUndoInstantUpdate() {
        return this.elementKeyToSelectAfterUndoInstantUpdate;
    }
    getElementKeysToMultiselectAfterUndoInstantUpdate() {
        return this.elementKeysToMultiselectAfterUndoInstantUpdate;
    }
    applyAllCodebaseIdChanges(prevIdToNewIdMap) {
        var _a, _b;
        const getNewKey = (prevKey) => {
            if (!prevKey) {
                return null;
            }
            const tempoElement = tempoElement_1.TempoElement.fromKey(prevKey);
            const codebaseId = tempoElement.codebaseId;
            const newCodebaseId = prevIdToNewIdMap[codebaseId];
            if (newCodebaseId) {
                return new tempoElement_1.TempoElement(newCodebaseId, tempoElement.storyboardId, tempoElement.uniquePath).getKey();
            }
            return null;
        };
        /*
         * Instant update fields
         */
        if (this.elementKeyToSelectAfterInstantUpdate) {
            const newElementKey = getNewKey(this.elementKeyToSelectAfterInstantUpdate);
            this.elementKeyToSelectAfterInstantUpdate =
                newElementKey || this.elementKeyToSelectAfterInstantUpdate;
        }
        if (this.elementKeysToMultiselectAfterInstantUpdate) {
            this.elementKeysToMultiselectAfterInstantUpdate =
                (_a = this.elementKeysToMultiselectAfterInstantUpdate) === null || _a === void 0 ? void 0 : _a.map((key) => {
                    const newKey = getNewKey(key);
                    return newKey || key;
                });
        }
        /*
         * Undo instant update fields
         */
        if (this.elementKeyToSelectAfterUndoInstantUpdate) {
            const newElementKey = getNewKey(this.elementKeyToSelectAfterUndoInstantUpdate);
            this.elementKeyToSelectAfterUndoInstantUpdate =
                newElementKey || this.elementKeyToSelectAfterUndoInstantUpdate;
        }
        if (this.elementKeysToMultiselectAfterUndoInstantUpdate) {
            this.elementKeysToMultiselectAfterUndoInstantUpdate =
                (_b = this.elementKeysToMultiselectAfterUndoInstantUpdate) === null || _b === void 0 ? void 0 : _b.map((key) => {
                    const newKey = getNewKey(key);
                    return newKey || key;
                });
        }
        this.applyCodebaseIdChanges(prevIdToNewIdMap);
    }
}
exports.ChangeLedgerItem = ChangeLedgerItem;
class StylingChange extends ChangeLedgerItem {
    constructor(changeFields, id) {
        super(ChangeType.STYLING, 'Styling', changeFields, id);
        // Allow instant updates while flushing
        this.canInstantUpdateWhileFlushing = true;
    }
    prepareApiRequest(canvasId, treeElementLookup, activeCanvas) {
        const { codebaseId, stylingChanges, stylingFramework, modifiers, customProperties, } = this.changeFields;
        return {
            urlPath: `canvases/${canvasId}/parseAndMutate/mutate/styling`,
            body: {
                reactElement: treeElementLookup[codebaseId],
                styling: stylingChanges,
                stylingFramework,
                modifiers,
                customProperties,
            },
        };
    }
    applyCodebaseIdChanges(prevIdToNewIdMap) {
        const newCodebaseId = prevIdToNewIdMap[this.changeFields.codebaseId];
        if (newCodebaseId) {
            this.changeFields.codebaseId = newCodebaseId;
        }
    }
}
exports.StylingChange = StylingChange;
class AddJsxChange extends ChangeLedgerItem {
    constructor(changeFields, id) {
        super(ChangeType.ADD_JSX, 'Add Element', changeFields, id);
    }
    prepareApiRequest(canvasId, treeElementLookup, activeCanvas) {
        const { codebaseIdToAddTo, beforeCodebaseId, afterCodebaseId, addCodebaseId, addNativeTag, fileContentsToSourceFrom, fileContentsSourceFilename, propsToSet, deletedStoryboardId, htmlForInstantUpdate, } = this.changeFields;
        const body = {
            destinationElement: treeElementLookup[codebaseIdToAddTo],
            beforeElement: treeElementLookup[beforeCodebaseId || ''],
            afterElement: treeElementLookup[afterCodebaseId || ''],
            newElement: {},
            canvasId: activeCanvas.id,
            deletedStoryboardId,
            fileContentsToSourceFrom,
            fileContentsSourceFilename,
        };
        if (addCodebaseId) {
            body.newElement = Object.assign({}, treeElementLookup[addCodebaseId]);
        }
        else if (addNativeTag) {
            body.newElement['type'] = 'native';
            body.newElement['nativeTag'] = addNativeTag;
            body.newElement['componentName'] = addNativeTag;
        }
        if (propsToSet) {
            body.newElement['propsToSet'] = propsToSet;
        }
        if (!Object.keys(body.newElement).length) {
            delete body.newElement;
        }
        const hasInstantUpdate = Boolean(htmlForInstantUpdate);
        body['hasInstantUpdate'] = hasInstantUpdate;
        return {
            urlPath: `canvases/${canvasId}/parseAndMutate/mutate/addJsxElement`,
            body,
            // Only show the success message if we do not have instant updates
            successToastMessage: hasInstantUpdate ? undefined : 'Successfully added',
        };
    }
    applyCodebaseIdChanges(prevIdToNewIdMap) {
        const fieldsToApply = [
            'codebaseIdToAddTo',
            'beforeCodebaseId',
            'afterCodebaseId',
            'addCodebaseId',
        ];
        fieldsToApply.forEach((field) => {
            // @ts-ignore
            const newCodebaseId = prevIdToNewIdMap[this.changeFields[field]];
            if (newCodebaseId) {
                // @ts-ignore
                this.changeFields[field] = newCodebaseId;
            }
        });
    }
}
exports.AddJsxChange = AddJsxChange;
class MoveJsxChange extends ChangeLedgerItem {
    constructor(changeFields, id) {
        super(ChangeType.MOVE_JSX, 'Move Element', changeFields, id);
    }
    prepareApiRequest(canvasId, treeElementLookup, activeCanvas) {
        const { codebaseIdToMoveTo, codebaseIdToMove, afterCodebaseId, beforeCodebaseId, expectedCurrentParentCodebaseId, } = this.changeFields;
        return {
            urlPath: `canvases/${canvasId}/parseAndMutate/mutate/moveJsxElement`,
            body: {
                elementToMove: treeElementLookup[codebaseIdToMove],
                newContainerElement: treeElementLookup[codebaseIdToMoveTo],
                afterElement: treeElementLookup[afterCodebaseId || ''],
                beforeElement: treeElementLookup[beforeCodebaseId || ''],
                expectedCurrentParent: treeElementLookup[expectedCurrentParentCodebaseId || ''],
            },
        };
    }
    applyCodebaseIdChanges(prevIdToNewIdMap) {
        const fieldsToApply = [
            'codebaseIdToMoveTo',
            'codebaseIdToMove',
            'afterCodebaseId',
            'beforeCodebaseId',
            'expectedCurrentParentCodebaseId',
        ];
        fieldsToApply.forEach((field) => {
            // @ts-ignore
            const newCodebaseId = prevIdToNewIdMap[this.changeFields[field]];
            if (newCodebaseId) {
                // @ts-ignore
                this.changeFields[field] = newCodebaseId;
            }
        });
    }
}
exports.MoveJsxChange = MoveJsxChange;
class RemoveJsxChange extends ChangeLedgerItem {
    constructor(changeFields, id) {
        // Deduplicate the codebaseIdsToRemove
        changeFields.codebaseIdsToRemove = Array.from(new Set(changeFields.codebaseIdsToRemove));
        super(ChangeType.REMOVE_JSX, 'Delete Element', changeFields, id);
    }
    prepareApiRequest(canvasId, treeElementLookup, activeCanvas) {
        const { codebaseIdsToRemove } = this.changeFields;
        return {
            urlPath: `canvases/${canvasId}/parseAndMutate/mutate/removeJsxElement`,
            body: {
                elementsToRemove: codebaseIdsToRemove
                    .map((codebaseId) => treeElementLookup[codebaseId])
                    .filter((element) => element),
            },
        };
    }
    applyCodebaseIdChanges(prevIdToNewIdMap) {
        this.changeFields.codebaseIdsToRemove =
            this.changeFields.codebaseIdsToRemove.map((codebaseId) => {
                const newCodebaseId = prevIdToNewIdMap[codebaseId];
                if (newCodebaseId) {
                    return newCodebaseId;
                }
                return codebaseId;
            });
    }
}
exports.RemoveJsxChange = RemoveJsxChange;
class ChangePropChange extends ChangeLedgerItem {
    constructor(changeFields, id) {
        super(ChangeType.CHANGE_PROP, 'Change Prop', changeFields, id);
    }
    prepareApiRequest(canvasId, treeElementLookup, activeCanvas) {
        const { codebaseIdToChange, propName, propValue } = this.changeFields;
        return {
            urlPath: `canvases/${canvasId}/parseAndMutate/mutate/changePropValue`,
            body: {
                elementToModify: treeElementLookup[codebaseIdToChange],
                propName,
                propValue,
            },
            successToastMessage: 'Prop changed',
        };
    }
    applyCodebaseIdChanges(prevIdToNewIdMap) {
        const newCodebaseId = prevIdToNewIdMap[this.changeFields.codebaseIdToChange];
        if (newCodebaseId) {
            this.changeFields.codebaseIdToChange = newCodebaseId;
        }
    }
}
exports.ChangePropChange = ChangePropChange;
class WrapDivChange extends ChangeLedgerItem {
    constructor(changeFields, id) {
        // Deduplicate the codebaseIdsToWrap
        changeFields.codebaseIdsToWrap = Array.from(new Set(changeFields.codebaseIdsToWrap));
        super(ChangeType.WRAP_DIV, 'Wrap In Div', changeFields, id);
    }
    prepareApiRequest(canvasId, treeElementLookup, activeCanvas) {
        const { codebaseIdsToWrap } = this.changeFields;
        return {
            urlPath: `canvases/${canvasId}/parseAndMutate/mutate/wrapInDiv`,
            body: {
                reactElements: codebaseIdsToWrap.map((codebaseId) => treeElementLookup[codebaseId]),
            },
        };
    }
    applyCodebaseIdChanges(prevIdToNewIdMap) {
        this.changeFields.codebaseIdsToWrap =
            this.changeFields.codebaseIdsToWrap.map((codebaseId) => {
                const newCodebaseId = prevIdToNewIdMap[codebaseId];
                if (newCodebaseId) {
                    return newCodebaseId;
                }
                return codebaseId;
            });
    }
}
exports.WrapDivChange = WrapDivChange;
class DuplicateChange extends ChangeLedgerItem {
    constructor(changeFields, id) {
        // Deduplicate the codebaseIdsToDuplicate
        changeFields.codebaseIdsToDuplicate = Array.from(new Set(changeFields.codebaseIdsToDuplicate));
        super(ChangeType.DUPLICATE, 'Duplicate', changeFields, id);
    }
    prepareApiRequest(canvasId, treeElementLookup, activeCanvas) {
        const { codebaseIdsToDuplicate } = this.changeFields;
        return {
            urlPath: `canvases/${canvasId}/parseAndMutate/mutate/duplicate`,
            body: {
                reactElements: codebaseIdsToDuplicate.map((codebaseId) => treeElementLookup[codebaseId]),
            },
        };
    }
    applyCodebaseIdChanges(prevIdToNewIdMap) {
        this.changeFields.codebaseIdsToDuplicate =
            this.changeFields.codebaseIdsToDuplicate.map((codebaseId) => {
                const newCodebaseId = prevIdToNewIdMap[codebaseId];
                if (newCodebaseId) {
                    return newCodebaseId;
                }
                return codebaseId;
            });
    }
}
exports.DuplicateChange = DuplicateChange;
class ChangeTagChange extends ChangeLedgerItem {
    constructor(changeFields, id) {
        super(ChangeType.CHANGE_TAG, 'Change Tag Name', changeFields, id);
    }
    prepareApiRequest(canvasId, treeElementLookup, activeCanvas) {
        const { codebaseIdToChange, newTagName } = this.changeFields;
        return {
            urlPath: `canvases/${canvasId}/parseAndMutate/mutate/changeElementTag`,
            body: {
                elementToModify: treeElementLookup[codebaseIdToChange],
                newTag: newTagName,
            },
        };
    }
    applyCodebaseIdChanges(prevIdToNewIdMap) {
        const newCodebaseId = prevIdToNewIdMap[this.changeFields.codebaseIdToChange];
        if (newCodebaseId) {
            this.changeFields.codebaseIdToChange = newCodebaseId;
        }
    }
}
exports.ChangeTagChange = ChangeTagChange;
class AddClassChange extends ChangeLedgerItem {
    constructor(changeFields, id) {
        super(ChangeType.ADD_CLASS, 'Add Class', changeFields, id);
        this.canInstantUpdateWhileFlushing = true;
    }
    prepareApiRequest(canvasId, treeElementLookup, activeCanvas) {
        const { codebaseIdToAddClass, className, addingTailwindClass, modifiers, customProperties, } = this.changeFields;
        return {
            urlPath: `canvases/${canvasId}/parseAndMutate/mutate/addClass`,
            body: {
                reactElement: treeElementLookup[codebaseIdToAddClass],
                className,
                stylingFramework: addingTailwindClass
                    ? StylingFramework.TAILWIND
                    : null,
                modifiers,
                customProperties,
            },
        };
    }
    applyCodebaseIdChanges(prevIdToNewIdMap) {
        const newCodebaseId = prevIdToNewIdMap[this.changeFields.codebaseIdToAddClass];
        if (newCodebaseId) {
            this.changeFields.codebaseIdToAddClass = newCodebaseId;
        }
    }
}
exports.AddClassChange = AddClassChange;
class RemoveClassChange extends ChangeLedgerItem {
    constructor(changeFields, id) {
        super(ChangeType.REMOVE_CLASS, 'Remove Class', changeFields, id);
    }
    prepareApiRequest(canvasId, treeElementLookup, activeCanvas) {
        const { codebaseIdToRemoveClass, className } = this.changeFields;
        return {
            urlPath: `canvases/${canvasId}/parseAndMutate/mutate/removeClass`,
            body: {
                reactElement: treeElementLookup[codebaseIdToRemoveClass],
                className,
            },
        };
    }
    applyCodebaseIdChanges(prevIdToNewIdMap) {
        const newCodebaseId = prevIdToNewIdMap[this.changeFields.codebaseIdToRemoveClass];
        if (newCodebaseId) {
            this.changeFields.codebaseIdToRemoveClass = newCodebaseId;
        }
    }
}
exports.RemoveClassChange = RemoveClassChange;
class EditTextChange extends ChangeLedgerItem {
    constructor(changeFields, id) {
        super(ChangeType.EDIT_TEXT, 'Edit Text', changeFields, id);
    }
    prepareApiRequest(canvasId, treeElementLookup, activeCanvas) {
        const { codebaseIdToEditText, newText, oldText } = this.changeFields;
        return {
            urlPath: `canvases/${canvasId}/parseAndMutate/mutate/editText`,
            body: {
                element: treeElementLookup[codebaseIdToEditText],
                newText,
                oldText,
            },
        };
    }
    applyCodebaseIdChanges(prevIdToNewIdMap) {
        const newCodebaseId = prevIdToNewIdMap[this.changeFields.codebaseIdToEditText];
        if (newCodebaseId) {
            this.changeFields.codebaseIdToEditText = newCodebaseId;
        }
    }
}
exports.EditTextChange = EditTextChange;
class UndoChange extends ChangeLedgerItem {
    constructor(changeFields, id) {
        var _a;
        super(ChangeType.UNDO, 'Undo', changeFields, id);
        if ((_a = changeFields.changeToUndo) === null || _a === void 0 ? void 0 : _a.canInstantUpdateWhileFlushing) {
            this.canInstantUpdateWhileFlushing = true;
        }
    }
    prepareApiRequest(canvasId, treeElementLookup, activeCanvas) {
        const { changeToUndo } = this.changeFields;
        return {
            urlPath: `canvases/${canvasId}/parseAndMutate/activities/undoChangeToFiles`,
            body: {
                latestUuid: changeToUndo.activityId,
            },
        };
    }
    applyCodebaseIdChanges(prevIdToNewIdMap) {
        // Do nothing
    }
}
exports.UndoChange = UndoChange;
class RedoChange extends ChangeLedgerItem {
    constructor(changeFields, id) {
        var _a;
        super(ChangeType.REDO, 'Redo', changeFields, id);
        if ((_a = changeFields.changeToRedo) === null || _a === void 0 ? void 0 : _a.canInstantUpdateWhileFlushing) {
            this.canInstantUpdateWhileFlushing = true;
        }
    }
    prepareApiRequest(canvasId, treeElementLookup, activeCanvas) {
        const { changeToRedo } = this.changeFields;
        return {
            urlPath: `canvases/${canvasId}/parseAndMutate/activities/redoChangeToFiles`,
            body: {
                changeToRedoId: changeToRedo.activityId,
            },
        };
    }
    applyCodebaseIdChanges(prevIdToNewIdMap) {
        // Do nothing
    }
}
exports.RedoChange = RedoChange;
class UnknownChange extends ChangeLedgerItem {
    constructor(changeFields, id) {
        super(ChangeType.UNKNOWN, '', changeFields, id);
        // Do not process unknown changes
        this.markProcessedSucceeded();
        this.doNotSendInstantUpdate();
    }
    prepareApiRequest(canvasId, treeElementLookup, activeCanvas) {
        throw Error('Unsupported operation');
        // For typing
        return {
            urlPath: ``,
            body: {},
        };
    }
    applyCodebaseIdChanges(prevIdToNewIdMap) {
        // Do nothing
    }
}
exports.UnknownChange = UnknownChange;
/**
 * When serializing a change ledger item to a plain JS object, the class functions
 * are lost. This recreates the change item that was lost
 */
const reconstructChangeLedgerClass = (plainJsObject) => {
    if (!plainJsObject || !plainJsObject.type) {
        return null;
    }
    const changeType = plainJsObject.type;
    const changeFields = plainJsObject.changeFields;
    const id = plainJsObject.id;
    const getChangeForType = () => {
        switch (changeType) {
            case ChangeType.STYLING:
                return new StylingChange(changeFields, id);
            case ChangeType.ADD_JSX:
                return new AddJsxChange(changeFields, id);
            case ChangeType.REMOVE_JSX:
                return new RemoveJsxChange(changeFields, id);
            case ChangeType.MOVE_JSX:
                return new MoveJsxChange(changeFields, id);
            case ChangeType.CHANGE_PROP:
                return new ChangePropChange(changeFields, id);
            case ChangeType.ADD_CLASS:
                return new AddClassChange(changeFields, id);
            case ChangeType.REMOVE_CLASS:
                return new RemoveClassChange(changeFields, id);
            case ChangeType.WRAP_DIV:
                return new WrapDivChange(changeFields, id);
            case ChangeType.CHANGE_TAG:
                return new ChangeTagChange(changeFields, id);
            case ChangeType.DUPLICATE:
                return new DuplicateChange(changeFields, id);
            case ChangeType.EDIT_TEXT:
                return new EditTextChange(changeFields, id);
            case ChangeType.UNDO:
                changeFields.changeToUndo = (0, exports.reconstructChangeLedgerClass)(changeFields.changeToUndo);
                return new UndoChange(changeFields, id);
            case ChangeType.REDO:
                changeFields.changeToRedo = (0, exports.reconstructChangeLedgerClass)(changeFields.changeToRedo);
                return new RedoChange(changeFields, id);
            case ChangeType.UNKNOWN:
                return new UnknownChange(changeFields, id);
            default:
                throw new Error(`Unknown change type: ${changeType}`);
        }
    };
    // Set all the other fields on the change object
    const change = getChangeForType();
    Object.keys(plainJsObject).forEach((key) => {
        if (['type', 'changeFields', 'id'].includes(key)) {
            return;
        }
        // @ts-ignore
        change[key] = plainJsObject[key];
    });
    return change;
};
exports.reconstructChangeLedgerClass = reconstructChangeLedgerClass;
