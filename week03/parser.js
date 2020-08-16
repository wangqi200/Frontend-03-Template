const css = require("css"); // an npm package to compile css

const EOF = Symbol("EOF"); // EOF: End of File

let currentToken = null;
let currentAttribute = null;
let currentTextNode = null;

let stack = [
    { // Init a stack with the document node.
        type: "document", //In an html file, the "document" node is the root node in the DOM tree parsed from the html file.
        children: []
    }
];

let rules = []; // css rules
function addCSSRules(text) {
    var ast = css.parse(text);
    // console.log(JSON.stringify(ast), null, "    ");
    rules.push(...ast.stylesheet.rules);
}

/**
 * The variable "selector" can be compound selector, or .class selector, or id selector, or tagName selector.
 **/
function match(selector, element) {
    if (!element.attributes || !selector) { // !element.attributes means a text node
        return false;
    }

    // compound selector's definition: <compound-selector> = [ <type-selector>?
    // <subclass-selector>* [ <pseudo-element-selector> <pseudo-class-selector>* ]*
    // ]!
    const compoundSelectorRegex = /\w+((\.\w+))*(\#\w+)|\w+((\.\w+))+(\#\w+)?|(\.\w+){2,}|(\.\w+)+(\#\w+)/;
    if (selector.match(compoundSelectorRegex)) {
        // tagName selector
        const tagnameSelectorRegex = /^(\w+)[\.|\#]*/;
        let tagNameMatches = selector.match(tagnameSelectorRegex);
        if (tagNameMatches) {
            let tagNameSelector = tagNameMatches[1];
            if (element.tagName !== tagNameSelector) {
                return false;
            }
        }

        // class selctors
        const classSelectorRegex = /(\.\w+)/g;
        let classMatchResult = selector.match(classSelectorRegex);
        if (classMatchResult) {
            // classSelectors should be all in elementClasses
            let classSelectors = classMatchResult.map(item => item.replace(".", ""));
            let elementClasses = element
                .attributes
                .filter(item => item.name === "class")
                .map(item => item.value);
            for (let classSelector of classSelectors) {
                if (elementClasses.indexOf(classSelector) === -1) {
                    return false;
                }
            }
        }

        // simple selectors id selctor
        const idSelectorRegex = /(\#\w+)/;
        let idMatchResult = selector.match(idSelectorRegex);
        if (idMatchResult) {
            let idSelector = idMatchResult[1];
            let elementIDs = element
                .attributes
                .filter(item => item.name === "id");
            if (elementIDs & elementIDs[0] === idSelector) {
                return true;
            }
            return false;
        }
        return true;
    }

    if (selector.charAt(0) === "#") {
        // id selector You can only have one ID per element
        let attr = element
            .attributes
            .filter(attr => attr.name === "id")[0];
        if (attr && attr.value === selector.replace("#", "")) {
            return true;
        }
    } else if (selector.charAt(0) === ".") {
        // class selector You can indeed have more than one class in an element
        let attrs = element
            .attributes
            .filter(attr => attr.name === "class");
        if (attrs) {
            let classValues = attrs.map(attr => attr.value);
            if (classValues.indexOf(selector.replace(".", "")) > -1) {
                return true;
            }
        }
    } else {
        // tagName selector
        if (element.tagName === selector) {
            return true;
        }
    }
    return false;
}

function computeSpecifity(selectorParts) {
    let specifity = [0, 0, 0, 0]; // this array is in order of [inline, ID, class, tagName]
    for (let selectorPart of selectorParts) {
        // assume selectorPart is a simple selector
        if (selectorPart.charAt(0) === "#") {
            specifity[1]++;
        } else if (selectorPart.charAt(0) === ".") {
            specifity[2]++;
        } else {
            specifity[3]++;
        }
    }
    return specifity;
}

function compareSpecifity(sp1, sp2) {
    for (let i = 0; i < 4; i++) {
        if (sp1[i] - sp2[i]) {
            return sp1[i] - sp2[i];
        }
    }
    return 0; // if all are equal, use the new one.
}

function computeCSS(element) {
    // console.log("Compute css for Element", element); Example 1, `div p` = Selects
    // all <p> elements inside <div> elements Example 2, `div > p` = Selects all <p>
    // elements where the parent is a <div> element Reference:
    // https://www.w3schools.com/cssref/css_selectors.asp Here, the variable
    // elements means the ancestors of the current element in the DOM tree.
    let elements = stack
        .slice()
        .reverse(); //.slice() means copy, and reverse() means doing the comaprison from inside to outside

    if (!element.computedStyle) {
        element.computedStyle = {}; // To store css info in an element.
    }

    elements = elements.slice(0, elements.length - 1); // excludes "document"

    for (let rule of rules) {
        let selectorParts = rule
            .selectors[0]
            .split(" ")
            .reverse(); // Skip the ", " case. And reverse as the elements
        if (comapreTwoArray(selectorParts, elements, match)===true) {
            // add each declaration (property) to computedStyle
            for (let declaration of rule.declarations) {
                let specifityOfDeclaration = computeSpecifity(selectorParts);
                let property = declaration.property;
                if (!element.computedStyle[property]) {
                    element.computedStyle[property] = {
                        value: declaration.value,
                        specifity: specifityOfDeclaration
                    };
                } else{
                    // add the selector's declaration to computedStyle if the specificity of the selector is higher. 
                    if (compareSpecifity(specifityOfDeclaration, element.computedStyle[property].specifity) >= 0) {
                        element.computedStyle[property].value = value;
                    }
                }
            }
        }
    }
}

/**
 * arrA should be in arrB with arrA's original order, and arrA[0] === arrB[0]
 * @param {*} arrA
 * @param {*} arrB
 */
function comapreTwoArray(arrA, arrB, compareFunc) {
    if (!arrB) {
        return false;
    }
    if (!arrA) {
        throw new Error("arrA should not be empty");
    }
    if (!compareFunc(arrA[0], arrB[0])) {
        return false;
    }
    let aIdx = 1;
    for (let i = 1; i < arrB.length; i++) {
        if (compareFunc(arrA[aIdx], arrB[i])) {
            aIdx++;
        }
    }
    if (aIdx < arrA.length) {
        return false;
    } else {
        return true;
    }
}

function emit(token) {
    let top = stack[stack.length - 1];
    if (token.type === "startTag") {
        let element = {
            type: "element",
            tagName: token.tagName,
            // parent: null,
            children: [],
            attributes: []
        }
        for (let p in token) {
            if (p !== "type" && p !== "tagName") {
                element
                    .attributes
                    .push({name: p, value: token[p]});
            }
        }

        // construct tree by setting parent and children
        top
            .children
            .push(element);
        // element.parent = top; // If we add the parent property here, we can not do
        // JSON.stringify on DOM, as the TypeError "Converting circular structure to
        // JSON" can happen.

        stack.push(element);
        computeCSS(element);

        if (token.isSelfClosing) {
            stack.pop(element);
        }

        currentTextNode = null;
    } else if (token.type === 'endTag') {
        if (top.tagName !== token.tagName) {
            throw new Error("not matched!");
        } else {
            /*****Only deal with <style> tags. It's more complex to handle <link> tags******/
            if (top.tagName === "style") {
                addCSSRules(top.children[0].content); // The top element has a child element whose type is text.
            }

            // Tags match, then pop out the top element.
            stack.pop();
        }
    } else if (token.type === "text") {
        if (currentTextNode === null) {
            currentTextNode = {
                "type": "text",
                "content": ""
            }
            top
                .children
                .push(currentTextNode);
        }
        currentTextNode.content += token.content;
    }
    if (token.type !== "text") {
        // console.log(token);
    }
}

function data(c) { // the initial state in HTML spec
    if (c === "<") {
        return tagOpen;
    } else if (c === EOF) { // how to campare symbol and string?
        emit({type: "EOF"});
        return; // return undefined
    } else {
        emit({type: "text", content: c});
        return data;
    }
}

function tagOpen(c) { //<
    if (c === "/") {
        return endTagOpen;
    } else if (c.match(/^[A-Za-z]$/)) {
        currentToken = {
            type: "startTag", // including normal tags and self-closing tags
            tagName: ""
        }
        return tagName(c);
    } else {
        return;
    }
}

function endTagOpen(c) { //</
    if (c.match(/^[A-Za-z]/)) {
        currentToken = {
            type: "endTag",
            tagName: ""
        }
        return tagName(c);
    } else if (c === ">") {
        // throw exception
    } else if (c === EOF) {
        // throw exception
    } else {
        // throw exception
    }
}

function tagName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c === "/") {
        return selfClosingStartTag;
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += c;
        return tagName;
    } else if (c === ">") {
        emit(currentToken);
        return data;
    } else {
        return tagName;
    }
}

function beforeAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c === ">" || c === "/" || c === EOF) {
        return afterAttributeName(c); //E.g., <div >, reconsume ">" in the after attribute name state.
    } else if (c === "=") {
        // This is an unexpected-equals-sign-before-attribute-name parse error.
    } else {
        currentAttribute = {
            name: "",
            value: ""
        }
        return attributeName(c);
    }
}

function attributeName(c) {
    if (c.match(/^[\t\n\f ]$/) || c === ">" || c === "/" || c === EOF) {
        return afterAttributeName(c);
    } else if (c === "=") {
        return beforeAttributeValue;
    } else if (c === "\u0000") { //\u0000?
    } else if (c === '"' || c === "'" || c === "<") {}
    {
        currentAttribute.name += c;
        return attributeName;
    }
}

function beforeAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) { //ignore the white spaces
        return beforeAttributeValue; //ignore the white spaces
    } else if (c === "\"") {
        return doubleQuotedAttributeValue;
    } else if (c === "\'") {
        return singleQuotedAttributeValue;
    } else if (c === ">") {} else {
        return unquotedAttributeValue(c);
    }
}

function doubleQuotedAttributeValue(c) {
    if (c === "\"") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (c === "\u0000") {} else if (c === EOF) {} else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}

function singleQuotedAttributeValue(c) {
    if (c === "\'") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (c === "\u0000") {} else if (c === EOF) {} else {
        currentAttribute.value += c;
        return singleQuotedAttributeValue;
    }
}

function afterQuotedAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c === "/") {
        return selfClosingStartTag;
    } else if (c === ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else {
        // This is a missing-whitespace-between-attributes parse error. Reconsume in the
        // before attribute name state. E.g., <div id="a"x=...
        return beforeAttributeName(c);
    }
}

function unquotedAttributeValue(c) { // e.g., <html maaa=a >. The last "a" is the unquotedAttributeValue
    if (c.match(/^[\t\n\f ]$/)) {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    } else if (c === "/") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return selfClosingStartTag;
    } else if (c === ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c === "\u0000") {} else if (c === EOF) {} else {
        currentAttribute.value += c;
        return unquotedAttributeValue;
    }
}

function afterAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return afterAttributeName;
    } else if (c === "/") {
        return selfClosingStartTag;
    } else if (c === "=") {
        return beforeAttributeValue;
    } else if (c === ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c === EOF) {} else {
        currentAttribute = {
            name: "",
            value: ""
        }
        return attributeName(c);
    }
}

function selfClosingStartTag(c) {
    if (c === ">") {
        currentToken.isSelfClosing = true;
        emit(currentToken);
        return data;
    } else if (c === EOF) {
        // throw exception
    } else {
        // throw exception
    }
}

module.exports.parseHTML = function parseHTML(html) { // module.exports?
    let state = data;
    for (let c of html) {
        state = state(c);
    }
    state(EOF); // force the State Machine to stop here.
    return stack[0];
}