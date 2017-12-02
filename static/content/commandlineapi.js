"use strict";

function $ (selector, startNode = document) {
    return startNode.querySelector(selector);
}

function $$ (selector, startNode = document) {
    return [...startNode.querySelectorAll(selector)];
}

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