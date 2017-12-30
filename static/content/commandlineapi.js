"use strict";

/**
 * @param {string} selector
 * @param {NodeSelector} [startNode]
 * @returns {Element | null}
 */
function $ (selector, startNode = document) {
    return startNode.querySelector(selector);
}

/**
 * @param {string} selector
 * @param {NodeSelector} [startNode]
 * @returns {Element[]}
 */
function $$ (selector, startNode = document) {
    return [...startNode.querySelectorAll(selector)];
}

/**
 * @param {string} xpath
 * @param {Node} [startNode]
 * @returns {number | string | boolean | Node[] | Node}
 */
function $x (xpath, startNode = document) {
    const result = document.evaluate(xpath, startNode, null, XPathResult.ANY_TYPE, null);
    switch (result.resultType) {
        case XPathResult.NUMBER_TYPE:
            return result.numberValue;
        case XPathResult.STRING_TYPE:
            return result.stringValue;
        case XPathResult.BOOLEAN_TYPE:
            return result.booleanValue;
        case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
        case XPathResult.ORDERED_NODE_ITERATOR_TYPE:
            var nodes = [];
            var node;
            while ((node = result.iterateNext()) !== null) {
                nodes.push(node);
            }
            return nodes;
        case XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE:
        case XPathResult.ORDERED_NODE_SNAPSHOT_TYPE:
            var nodes = [];
            for (var i = 0; i < result.snapshotLength; i++) {
                nodes.push(result.snapshotItem(i));
            }
            return nodes;
        case XPathResult.ANY_UNORDERED_NODE_TYPE:
        case XPathResult.FIRST_ORDERED_NODE_TYPE:
            return result.singleNodeValue;
        default:
            throw new Error("Invalid XPathResult type " + result.resultType);
    }
}

/**
 * @param {string} cssText
 * @returns {HTMLStyleElement}
 */
function GM_addStyle (cssText) {
    const style = document.createElement("style");
    style.textContent = cssText;
    document.documentElement.appendChild(style);
    return style;
}