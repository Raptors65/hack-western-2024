"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TempoElement = void 0;
// Matches the interface in tempo web
const STORYBOARD_TOP_CONSTANT = 'STORYBOARD-TOP-CONSTANT';
/**
 * Used to uniquely identify an element in the DOM or a component in the nav tree.
 *
 * Created when building the nav tree
 */
class TempoElement {
    /**
     * If codebase ID is undefined then it doesn't exist in our codebase, but is still a valid lookup
     */
    constructor(codebaseId, storyboardId, uniquePath) {
        if (codebaseId && /[^0-9a-zA-Z-_]/.test(codebaseId)) {
            throw new Error('Codebase ID contains invalid chars :' + codebaseId);
        }
        if (storyboardId && /[^0-9a-zA-Z-_]/.test(storyboardId)) {
            throw new Error('Storyboard ID contains invalid chars :' + codebaseId);
        }
        this.codebaseId = codebaseId || '';
        this.storyboardId = storyboardId;
        this.uniquePath = uniquePath;
        this.cachedKey = null;
    }
    isEqual(other) {
        return (this.codebaseId === other.codebaseId &&
            this.storyboardId === other.storyboardId &&
            this.uniquePath === other.uniquePath);
    }
    getKey() {
        if (this.cachedKey) {
            return this.cachedKey;
        }
        // Also start it with TE_ since it has to start with a name
        this.cachedKey = `TE_${this.codebaseId}_${this.storyboardId}_${this.uniquePath}`;
        return this.cachedKey;
    }
    /**
     * Note, codebase ID is allowed to be empty but not the storyboard ID or unique path
     */
    isEmpty() {
        if (this.storyboardId && this.uniquePath) {
            return false;
        }
        return true;
    }
    static fromKey(key) {
        if (!key) {
            return TempoElement.empty();
        }
        // Account for the TE_ prefix
        const [_, codebaseId, storyboardId, uniquePath] = key.split('_');
        if (!storyboardId || !uniquePath) {
            return TempoElement.empty();
        }
        return new TempoElement(codebaseId, storyboardId, uniquePath);
    }
    static fromOtherElement(other) {
        return new TempoElement(other.codebaseId, other.storyboardId, other.uniquePath);
    }
    static empty() {
        return new TempoElement('', '', '');
    }
    /**
     * Returns a tempo element that can be used to represent the storyboard itself
     */
    static forStoryboard(storyboardId) {
        return new TempoElement(STORYBOARD_TOP_CONSTANT, storyboardId, '0');
    }
    /**
     * If the storyboardId is passed in it checks if it is equal to this particular storyboard
     */
    isStoryboard(storyboardId) {
        return (this.codebaseId === STORYBOARD_TOP_CONSTANT &&
            (!storyboardId || this.storyboardId === storyboardId));
    }
    /**
     * @returns if this element is inside a storyboard and known in the codebase
     */
    isKnownElement() {
        return (!this.isEmpty() &&
            Boolean(this.codebaseId) &&
            this.codebaseId !== STORYBOARD_TOP_CONSTANT);
    }
    isParentOf(other) {
        if (!other) {
            return false;
        }
        if (this.isStoryboard()) {
            return (this.storyboardId === other.storyboardId &&
                this.uniquePath !== other.uniquePath);
        }
        return (this.storyboardId === other.storyboardId &&
            this.uniquePath !== other.uniquePath &&
            Boolean(this.uniquePath) &&
            Boolean(other.uniquePath) &&
            other.uniquePath.startsWith(this.uniquePath));
    }
    isSiblingOf(other) {
        if (!other || !this.uniquePath || !other.uniquePath) {
            return false;
        }
        if (this.isEqual(other)) {
            return false;
        }
        if (this.isStoryboard()) {
            return other.isStoryboard();
        }
        const pathUntilLastSegment = this.uniquePath
            .split('-')
            .slice(0, -1)
            .join('-');
        const otherPathUntilLastSegment = other.uniquePath
            .split('-')
            .slice(0, -1)
            .join('-');
        return (this.storyboardId === other.storyboardId &&
            this.uniquePath !== other.uniquePath &&
            Boolean(pathUntilLastSegment) &&
            Boolean(otherPathUntilLastSegment) &&
            pathUntilLastSegment === otherPathUntilLastSegment);
    }
}
exports.TempoElement = TempoElement;
