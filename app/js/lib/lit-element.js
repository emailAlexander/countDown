const supportsAdoptingStyleSheets = 'adoptedStyleSheets' in Document.prototype && 'replace' in CSSStyleSheet.prototype;
const constructionToken = Symbol();
class CSSResult {
    constructor(cssText, safeToken) {
        if (safeToken !== constructionToken) {
            throw new Error('CSSResult is not constructable. Use `unsafeCSS` or `css` instead.');
        }
        this.cssText = cssText;
    }
    get styleSheet() {
        if (this._styleSheet === undefined) {
            if (supportsAdoptingStyleSheets) {
                this._styleSheet = new CSSStyleSheet();
                this._styleSheet.replaceSync(this.cssText);
            }
            else {
                this._styleSheet = null;
            }
        }
        return this._styleSheet;
    }
    toString() {
        return this.cssText;
    }
}
const unsafeCSS = value => {
    return new CSSResult(String(value), constructionToken);
};
const textFromCSSResult = value => {
    if (value instanceof CSSResult) {
        return value.cssText;
    }
    else {
        throw new Error(`Value passed to 'css' function must be a 'css' function result: ${value}. Use 'unsafeCSS' to pass non-literal values, but
            take care to ensure page security.`);
    }
};
const css = (strings, ...values) => {
    const cssText = values.reduce((acc, v, idx) => acc + textFromCSSResult(v) + strings[idx + 1], strings[0]);
    return new CSSResult(cssText, constructionToken);
};
var cssTag = {
    supportsAdoptingStyleSheets: supportsAdoptingStyleSheets,
    CSSResult: CSSResult,
    unsafeCSS: unsafeCSS,
    css: css
};
const legacyCustomElement = (tagName, clazz) => {
    window.customElements.define(tagName, clazz);
    return clazz;
};
const standardCustomElement = (tagName, descriptor) => {
    const { kind, elements } = descriptor;
    return {
        kind,
        elements,
        finisher(clazz) {
            window.customElements.define(tagName, clazz);
        }
    };
};
const customElement = tagName => classOrDescriptor => typeof classOrDescriptor === 'function' ? legacyCustomElement(tagName, classOrDescriptor) : standardCustomElement(tagName, classOrDescriptor);
const standardProperty = (options, element) => {
    if (element.kind === 'method' && element.descriptor && !('value' in element.descriptor)) {
        return Object.assign({}, element, {
            finisher(clazz) {
                clazz.createProperty(element.key, options);
            }
        });
    }
    else {
        return {
            kind: 'field',
            key: Symbol(),
            placement: 'own',
            descriptor: {},
            initializer() {
                if (typeof element.initializer === 'function') {
                    this[element.key] = element.initializer.call(this);
                }
            },
            finisher(clazz) {
                clazz.createProperty(element.key, options);
            }
        };
    }
};
const legacyProperty = (options, proto, name) => {
    proto.constructor.createProperty(name, options);
};
function property(options) {
    return (protoOrDescriptor, name) => name !== undefined ? legacyProperty(options, protoOrDescriptor, name) : standardProperty(options, protoOrDescriptor);
}
function query(selector) {
    return (protoOrDescriptor, name) => {
        const descriptor = {
            get() {
                return this.renderRoot.querySelector(selector);
            },
            enumerable: true,
            configurable: true
        };
        return name !== undefined ? legacyQuery(descriptor, protoOrDescriptor, name) : standardQuery(descriptor, protoOrDescriptor);
    };
}
function queryAll(selector) {
    return (protoOrDescriptor, name) => {
        const descriptor = {
            get() {
                return this.renderRoot.querySelectorAll(selector);
            },
            enumerable: true,
            configurable: true
        };
        return name !== undefined ? legacyQuery(descriptor, protoOrDescriptor, name) : standardQuery(descriptor, protoOrDescriptor);
    };
}
const legacyQuery = (descriptor, proto, name) => {
    Object.defineProperty(proto, name, descriptor);
};
const standardQuery = (descriptor, element) => ({
    kind: 'method',
    placement: 'prototype',
    key: element.key,
    descriptor
});
const standardEventOptions = (options, element) => {
    return Object.assign({}, element, {
        finisher(clazz) {
            Object.assign(clazz.prototype[element.key], options);
        }
    });
};
const legacyEventOptions = (options, proto, name) => {
    Object.assign(proto[name], options);
};
const eventOptions = options => (protoOrDescriptor, name) => name !== undefined ? legacyEventOptions(options, protoOrDescriptor, name) : standardEventOptions(options, protoOrDescriptor);
var decorators = {
    customElement: customElement,
    property: property,
    query: query,
    queryAll: queryAll,
    eventOptions: eventOptions
};
window.JSCompiler_renameProperty = (prop, _obj) => prop;
const defaultConverter = {
    toAttribute(value, type) {
        switch (type) {
            case Boolean:
                return value ? '' : null;
            case Object:
            case Array:
                return value == null ? value : JSON.stringify(value);
        }
        return value;
    },
    fromAttribute(value, type) {
        switch (type) {
            case Boolean:
                return value !== null;
            case Number:
                return value === null ? null : Number(value);
            case Object:
            case Array:
                return JSON.parse(value);
        }
        return value;
    }
};
const notEqual = (value, old) => {
    return old !== value && (old === old || value === value);
};
const defaultPropertyDeclaration = {
    attribute: true,
    type: String,
    converter: defaultConverter,
    reflect: false,
    hasChanged: notEqual
};
const microtaskPromise = Promise.resolve(true);
const STATE_HAS_UPDATED = 1;
const STATE_UPDATE_REQUESTED = 1 << 2;
const STATE_IS_REFLECTING_TO_ATTRIBUTE = 1 << 3;
const STATE_IS_REFLECTING_TO_PROPERTY = 1 << 4;
const STATE_HAS_CONNECTED = 1 << 5;
class UpdatingElement extends HTMLElement {
    constructor() {
        super();
        this._updateState = 0;
        this._instanceProperties = undefined;
        this._updatePromise = microtaskPromise;
        this._hasConnectedResolver = undefined;
        this._changedProperties = new Map();
        this._reflectingProperties = undefined;
        this.initialize();
    }
    static get observedAttributes() {
        this.finalize();
        const attributes = [];
        this._classProperties.forEach((v, p) => {
            const attr = this._attributeNameForProperty(p, v);
            if (attr !== undefined) {
                this._attributeToPropertyMap.set(attr, p);
                attributes.push(attr);
            }
        });
        return attributes;
    }
    static _ensureClassProperties() {
        if (!this.hasOwnProperty(JSCompiler_renameProperty('_classProperties', this))) {
            this._classProperties = new Map();
            const superProperties = Object.getPrototypeOf(this)._classProperties;
            if (superProperties !== undefined) {
                superProperties.forEach((v, k) => this._classProperties.set(k, v));
            }
        }
    }
    static createProperty(name, options = defaultPropertyDeclaration) {
        this._ensureClassProperties();
        this._classProperties.set(name, options);
        if (options.noAccessor || this.prototype.hasOwnProperty(name)) {
            return;
        }
        const key = typeof name === 'symbol' ? Symbol() : `__${name}`;
        Object.defineProperty(this.prototype, name, {
            get() {
                return this[key];
            },
            set(value) {
                const oldValue = this[name];
                this[key] = value;
                this._requestUpdate(name, oldValue);
            },
            configurable: true,
            enumerable: true
        });
    }
    static finalize() {
        if (this.hasOwnProperty(JSCompiler_renameProperty('finalized', this)) && this.finalized) {
            return;
        }
        const superCtor = Object.getPrototypeOf(this);
        if (typeof superCtor.finalize === 'function') {
            superCtor.finalize();
        }
        this.finalized = true;
        this._ensureClassProperties();
        this._attributeToPropertyMap = new Map();
        if (this.hasOwnProperty(JSCompiler_renameProperty('properties', this))) {
            const props = this.properties;
            const propKeys = [...Object.getOwnPropertyNames(props), ...(typeof Object.getOwnPropertySymbols === 'function' ? Object.getOwnPropertySymbols(props) : [])];
            for (const p of propKeys) {
                this.createProperty(p, props[p]);
            }
        }
    }
    static _attributeNameForProperty(name, options) {
        const attribute = options.attribute;
        return attribute === false ? undefined : typeof attribute === 'string' ? attribute : typeof name === 'string' ? name.toLowerCase() : undefined;
    }
    static _valueHasChanged(value, old, hasChanged = notEqual) {
        return hasChanged(value, old);
    }
    static _propertyValueFromAttribute(value, options) {
        const type = options.type;
        const converter = options.converter || defaultConverter;
        const fromAttribute = typeof converter === 'function' ? converter : converter.fromAttribute;
        return fromAttribute ? fromAttribute(value, type) : value;
    }
    static _propertyValueToAttribute(value, options) {
        if (options.reflect === undefined) {
            return;
        }
        const type = options.type;
        const converter = options.converter;
        const toAttribute = converter && converter.toAttribute || defaultConverter.toAttribute;
        return toAttribute(value, type);
    }
    initialize() {
        this._saveInstanceProperties();
        this._requestUpdate();
    }
    _saveInstanceProperties() {
        this.constructor._classProperties.forEach((_v, p) => {
            if (this.hasOwnProperty(p)) {
                const value = this[p];
                delete this[p];
                if (!this._instanceProperties) {
                    this._instanceProperties = new Map();
                }
                this._instanceProperties.set(p, value);
            }
        });
    }
    _applyInstanceProperties() {
        this._instanceProperties.forEach((v, p) => this[p] = v);
        this._instanceProperties = undefined;
    }
    connectedCallback() {
        this._updateState = this._updateState | STATE_HAS_CONNECTED;
        if (this._hasConnectedResolver) {
            this._hasConnectedResolver();
            this._hasConnectedResolver = undefined;
        }
    }
    disconnectedCallback() { }
    attributeChangedCallback(name, old, value) {
        if (old !== value) {
            this._attributeToProperty(name, value);
        }
    }
    _propertyToAttribute(name, value, options = defaultPropertyDeclaration) {
        const ctor = this.constructor;
        const attr = ctor._attributeNameForProperty(name, options);
        if (attr !== undefined) {
            const attrValue = ctor._propertyValueToAttribute(value, options);
            if (attrValue === undefined) {
                return;
            }
            this._updateState = this._updateState | STATE_IS_REFLECTING_TO_ATTRIBUTE;
            if (attrValue == null) {
                this.removeAttribute(attr);
            }
            else {
                this.setAttribute(attr, attrValue);
            }
            this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_ATTRIBUTE;
        }
    }
    _attributeToProperty(name, value) {
        if (this._updateState & STATE_IS_REFLECTING_TO_ATTRIBUTE) {
            return;
        }
        const ctor = this.constructor;
        const propName = ctor._attributeToPropertyMap.get(name);
        if (propName !== undefined) {
            const options = ctor._classProperties.get(propName) || defaultPropertyDeclaration;
            this._updateState = this._updateState | STATE_IS_REFLECTING_TO_PROPERTY;
            this[propName] =
                ctor._propertyValueFromAttribute(value, options);
            this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_PROPERTY;
        }
    }
    _requestUpdate(name, oldValue) {
        let shouldRequestUpdate = true;
        if (name !== undefined) {
            const ctor = this.constructor;
            const options = ctor._classProperties.get(name) || defaultPropertyDeclaration;
            if (ctor._valueHasChanged(this[name], oldValue, options.hasChanged)) {
                if (!this._changedProperties.has(name)) {
                    this._changedProperties.set(name, oldValue);
                }
                if (options.reflect === true && !(this._updateState & STATE_IS_REFLECTING_TO_PROPERTY)) {
                    if (this._reflectingProperties === undefined) {
                        this._reflectingProperties = new Map();
                    }
                    this._reflectingProperties.set(name, options);
                }
            }
            else {
                shouldRequestUpdate = false;
            }
        }
        if (!this._hasRequestedUpdate && shouldRequestUpdate) {
            this._enqueueUpdate();
        }
    }
    requestUpdate(name, oldValue) {
        this._requestUpdate(name, oldValue);
        return this.updateComplete;
    }
    async _enqueueUpdate() {
        this._updateState = this._updateState | STATE_UPDATE_REQUESTED;
        let resolve;
        let reject;
        const previousUpdatePromise = this._updatePromise;
        this._updatePromise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        try {
            await previousUpdatePromise;
        }
        catch (e) { }
        if (!this._hasConnected) {
            await new Promise(res => this._hasConnectedResolver = res);
        }
        try {
            const result = this.performUpdate();
            if (result != null) {
                await result;
            }
        }
        catch (e) {
            reject(e);
        }
        resolve(!this._hasRequestedUpdate);
    }
    get _hasConnected() {
        return this._updateState & STATE_HAS_CONNECTED;
    }
    get _hasRequestedUpdate() {
        return this._updateState & STATE_UPDATE_REQUESTED;
    }
    get hasUpdated() {
        return this._updateState & STATE_HAS_UPDATED;
    }
    performUpdate() {
        if (this._instanceProperties) {
            this._applyInstanceProperties();
        }
        let shouldUpdate = false;
        const changedProperties = this._changedProperties;
        try {
            shouldUpdate = this.shouldUpdate(changedProperties);
            if (shouldUpdate) {
                this.update(changedProperties);
            }
        }
        catch (e) {
            shouldUpdate = false;
            throw e;
        }
        finally {
            this._markUpdated();
        }
        if (shouldUpdate) {
            if (!(this._updateState & STATE_HAS_UPDATED)) {
                this._updateState = this._updateState | STATE_HAS_UPDATED;
                this.firstUpdated(changedProperties);
            }
            this.updated(changedProperties);
        }
    }
    _markUpdated() {
        this._changedProperties = new Map();
        this._updateState = this._updateState & ~STATE_UPDATE_REQUESTED;
    }
    get updateComplete() {
        return this._updatePromise;
    }
    shouldUpdate(_changedProperties) {
        return true;
    }
    update(_changedProperties) {
        if (this._reflectingProperties !== undefined && this._reflectingProperties.size > 0) {
            this._reflectingProperties.forEach((v, k) => this._propertyToAttribute(k, this[k], v));
            this._reflectingProperties = undefined;
        }
    }
    updated(_changedProperties) { }
    firstUpdated(_changedProperties) { }
}
UpdatingElement.finalized = true;
var updatingElement = {
    defaultConverter: defaultConverter,
    notEqual: notEqual,
    UpdatingElement: UpdatingElement
};
const directives = new WeakMap();
const directive = f => (...args) => {
    const d = f(...args);
    directives.set(d, true);
    return d;
};
const isDirective = o => {
    return typeof o === 'function' && directives.has(o);
};
var directive$1 = {
    directive: directive,
    isDirective: isDirective
};
const isCEPolyfill = window.customElements !== undefined && window.customElements.polyfillWrapFlushCallback !== undefined;
const reparentNodes = (container, start, end = null, before = null) => {
    let node = start;
    while (node !== end) {
        const n = node.nextSibling;
        container.insertBefore(node, before);
        node = n;
    }
};
const removeNodes = (container, startNode, endNode = null) => {
    let node = startNode;
    while (node !== endNode) {
        const n = node.nextSibling;
        container.removeChild(node);
        node = n;
    }
};
var dom = {
    isCEPolyfill: isCEPolyfill,
    reparentNodes: reparentNodes,
    removeNodes: removeNodes
};
const noChange = {};
const nothing = {};
var part = {
    noChange: noChange,
    nothing: nothing
};
const marker = `{{lit-${String(Math.random()).slice(2)}}}`;
const nodeMarker = `<!--${marker}-->`;
const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
const boundAttributeSuffix = '$lit$';
class Template {
    constructor(result, element) {
        this.parts = [];
        this.element = element;
        let index = -1;
        let partIndex = 0;
        const nodesToRemove = [];
        const _prepareTemplate = template => {
            const content = template.content;
            const walker = document.createTreeWalker(content, 133, null, false);
            let lastPartIndex = 0;
            while (walker.nextNode()) {
                index++;
                const node = walker.currentNode;
                if (node.nodeType === 1) {
                    if (node.hasAttributes()) {
                        const attributes = node.attributes;
                        let count = 0;
                        for (let i = 0; i < attributes.length; i++) {
                            if (attributes[i].value.indexOf(marker) >= 0) {
                                count++;
                            }
                        }
                        while (count-- > 0) {
                            const stringForPart = result.strings[partIndex];
                            const name = lastAttributeNameRegex.exec(stringForPart)[2];
                            const attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
                            const attributeValue = node.getAttribute(attributeLookupName);
                            const strings = attributeValue.split(markerRegex);
                            this.parts.push({
                                type: 'attribute',
                                index,
                                name,
                                strings
                            });
                            node.removeAttribute(attributeLookupName);
                            partIndex += strings.length - 1;
                        }
                    }
                    if (node.tagName === 'TEMPLATE') {
                        _prepareTemplate(node);
                    }
                }
                else if (node.nodeType === 3) {
                    const data = node.data;
                    if (data.indexOf(marker) >= 0) {
                        const parent = node.parentNode;
                        const strings = data.split(markerRegex);
                        const lastIndex = strings.length - 1;
                        for (let i = 0; i < lastIndex; i++) {
                            parent.insertBefore(strings[i] === '' ? createMarker() : document.createTextNode(strings[i]), node);
                            this.parts.push({
                                type: 'node',
                                index: ++index
                            });
                        }
                        if (strings[lastIndex] === '') {
                            parent.insertBefore(createMarker(), node);
                            nodesToRemove.push(node);
                        }
                        else {
                            node.data = strings[lastIndex];
                        }
                        partIndex += lastIndex;
                    }
                }
                else if (node.nodeType === 8) {
                    if (node.data === marker) {
                        const parent = node.parentNode;
                        if (node.previousSibling === null || index === lastPartIndex) {
                            index++;
                            parent.insertBefore(createMarker(), node);
                        }
                        lastPartIndex = index;
                        this.parts.push({
                            type: 'node',
                            index
                        });
                        if (node.nextSibling === null) {
                            node.data = '';
                        }
                        else {
                            nodesToRemove.push(node);
                            index--;
                        }
                        partIndex++;
                    }
                    else {
                        let i = -1;
                        while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
                            this.parts.push({
                                type: 'node',
                                index: -1
                            });
                        }
                    }
                }
            }
        };
        _prepareTemplate(element);
        for (const n of nodesToRemove) {
            n.parentNode.removeChild(n);
        }
    }
}
const isTemplatePartActive = part => part.index !== -1;
const createMarker = () => document.createComment('');
const lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;
var template = {
    marker: marker,
    nodeMarker: nodeMarker,
    markerRegex: markerRegex,
    boundAttributeSuffix: boundAttributeSuffix,
    Template: Template,
    isTemplatePartActive: isTemplatePartActive,
    createMarker: createMarker,
    lastAttributeNameRegex: lastAttributeNameRegex
};
class TemplateInstance {
    constructor(template, processor, options) {
        this._parts = [];
        this.template = template;
        this.processor = processor;
        this.options = options;
    }
    update(values) {
        let i = 0;
        for (const part of this._parts) {
            if (part !== undefined) {
                part.setValue(values[i]);
            }
            i++;
        }
        for (const part of this._parts) {
            if (part !== undefined) {
                part.commit();
            }
        }
    }
    _clone() {
        const fragment = isCEPolyfill ? this.template.element.content.cloneNode(true) : document.importNode(this.template.element.content, true);
        const parts = this.template.parts;
        let partIndex = 0;
        let nodeIndex = 0;
        const _prepareInstance = fragment => {
            const walker = document.createTreeWalker(fragment, 133, null, false);
            let node = walker.nextNode();
            while (partIndex < parts.length && node !== null) {
                const part = parts[partIndex];
                if (!isTemplatePartActive(part)) {
                    this._parts.push(undefined);
                    partIndex++;
                }
                else if (nodeIndex === part.index) {
                    if (part.type === 'node') {
                        const part = this.processor.handleTextExpression(this.options);
                        part.insertAfterNode(node.previousSibling);
                        this._parts.push(part);
                    }
                    else {
                        this._parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
                    }
                    partIndex++;
                }
                else {
                    nodeIndex++;
                    if (node.nodeName === 'TEMPLATE') {
                        _prepareInstance(node.content);
                    }
                    node = walker.nextNode();
                }
            }
        };
        _prepareInstance(fragment);
        if (isCEPolyfill) {
            document.adoptNode(fragment);
            customElements.upgrade(fragment);
        }
        return fragment;
    }
}
var templateInstance = {
    TemplateInstance: TemplateInstance
};
class TemplateResult {
    constructor(strings, values, type, processor) {
        this.strings = strings;
        this.values = values;
        this.type = type;
        this.processor = processor;
    }
    getHTML() {
        const endIndex = this.strings.length - 1;
        let html = '';
        for (let i = 0; i < endIndex; i++) {
            const s = this.strings[i];
            const match = lastAttributeNameRegex.exec(s);
            if (match) {
                html += s.substr(0, match.index) + match[1] + match[2] + boundAttributeSuffix + match[3] + marker;
            }
            else {
                html += s + nodeMarker;
            }
        }
        return html + this.strings[endIndex];
    }
    getTemplateElement() {
        const template = document.createElement('template');
        template.innerHTML = this.getHTML();
        return template;
    }
}
class SVGTemplateResult extends TemplateResult {
    getHTML() {
        return `<svg>${super.getHTML()}</svg>`;
    }
    getTemplateElement() {
        const template = super.getTemplateElement();
        const content = template.content;
        const svgElement = content.firstChild;
        content.removeChild(svgElement);
        reparentNodes(content, svgElement.firstChild);
        return template;
    }
}
var templateResult = {
    TemplateResult: TemplateResult,
    SVGTemplateResult: SVGTemplateResult
};
const isPrimitive = value => {
    return value === null || !(typeof value === 'object' || typeof value === 'function');
};
class AttributeCommitter {
    constructor(element, name, strings) {
        this.dirty = true;
        this.element = element;
        this.name = name;
        this.strings = strings;
        this.parts = [];
        for (let i = 0; i < strings.length - 1; i++) {
            this.parts[i] = this._createPart();
        }
    }
    _createPart() {
        return new AttributePart(this);
    }
    _getValue() {
        const strings = this.strings;
        const l = strings.length - 1;
        let text = '';
        for (let i = 0; i < l; i++) {
            text += strings[i];
            const part = this.parts[i];
            if (part !== undefined) {
                const v = part.value;
                if (v != null && (Array.isArray(v) ||
                    typeof v !== 'string' && v[Symbol.iterator])) {
                    for (const t of v) {
                        text += typeof t === 'string' ? t : String(t);
                    }
                }
                else {
                    text += typeof v === 'string' ? v : String(v);
                }
            }
        }
        text += strings[l];
        return text;
    }
    commit() {
        if (this.dirty) {
            this.dirty = false;
            this.element.setAttribute(this.name, this._getValue());
        }
    }
}
class AttributePart {
    constructor(comitter) {
        this.value = undefined;
        this.committer = comitter;
    }
    setValue(value) {
        if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
            this.value = value;
            if (!isDirective(value)) {
                this.committer.dirty = true;
            }
        }
    }
    commit() {
        while (isDirective(this.value)) {
            const directive = this.value;
            this.value = noChange;
            directive(this);
        }
        if (this.value === noChange) {
            return;
        }
        this.committer.commit();
    }
}
class NodePart {
    constructor(options) {
        this.value = undefined;
        this._pendingValue = undefined;
        this.options = options;
    }
    appendInto(container) {
        this.startNode = container.appendChild(createMarker());
        this.endNode = container.appendChild(createMarker());
    }
    insertAfterNode(ref) {
        this.startNode = ref;
        this.endNode = ref.nextSibling;
    }
    appendIntoPart(part) {
        part._insert(this.startNode = createMarker());
        part._insert(this.endNode = createMarker());
    }
    insertAfterPart(ref) {
        ref._insert(this.startNode = createMarker());
        this.endNode = ref.endNode;
        ref.endNode = this.startNode;
    }
    setValue(value) {
        this._pendingValue = value;
    }
    commit() {
        while (isDirective(this._pendingValue)) {
            const directive = this._pendingValue;
            this._pendingValue = noChange;
            directive(this);
        }
        const value = this._pendingValue;
        if (value === noChange) {
            return;
        }
        if (isPrimitive(value)) {
            if (value !== this.value) {
                this._commitText(value);
            }
        }
        else if (value instanceof TemplateResult) {
            this._commitTemplateResult(value);
        }
        else if (value instanceof Node) {
            this._commitNode(value);
        }
        else if (Array.isArray(value) ||
            value[Symbol.iterator]) {
            this._commitIterable(value);
        }
        else if (value === nothing) {
            this.value = nothing;
            this.clear();
        }
        else {
            this._commitText(value);
        }
    }
    _insert(node) {
        this.endNode.parentNode.insertBefore(node, this.endNode);
    }
    _commitNode(value) {
        if (this.value === value) {
            return;
        }
        this.clear();
        this._insert(value);
        this.value = value;
    }
    _commitText(value) {
        const node = this.startNode.nextSibling;
        value = value == null ? '' : value;
        if (node === this.endNode.previousSibling && node.nodeType === 3) {
            node.data = value;
        }
        else {
            this._commitNode(document.createTextNode(typeof value === 'string' ? value : String(value)));
        }
        this.value = value;
    }
    _commitTemplateResult(value) {
        const template = this.options.templateFactory(value);
        if (this.value instanceof TemplateInstance && this.value.template === template) {
            this.value.update(value.values);
        }
        else {
            const instance = new TemplateInstance(template, value.processor, this.options);
            const fragment = instance._clone();
            instance.update(value.values);
            this._commitNode(fragment);
            this.value = instance;
        }
    }
    _commitIterable(value) {
        if (!Array.isArray(this.value)) {
            this.value = [];
            this.clear();
        }
        const itemParts = this.value;
        let partIndex = 0;
        let itemPart;
        for (const item of value) {
            itemPart = itemParts[partIndex];
            if (itemPart === undefined) {
                itemPart = new NodePart(this.options);
                itemParts.push(itemPart);
                if (partIndex === 0) {
                    itemPart.appendIntoPart(this);
                }
                else {
                    itemPart.insertAfterPart(itemParts[partIndex - 1]);
                }
            }
            itemPart.setValue(item);
            itemPart.commit();
            partIndex++;
        }
        if (partIndex < itemParts.length) {
            itemParts.length = partIndex;
            this.clear(itemPart && itemPart.endNode);
        }
    }
    clear(startNode = this.startNode) {
        removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
    }
}
class BooleanAttributePart {
    constructor(element, name, strings) {
        this.value = undefined;
        this._pendingValue = undefined;
        if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
            throw new Error('Boolean attributes can only contain a single expression');
        }
        this.element = element;
        this.name = name;
        this.strings = strings;
    }
    setValue(value) {
        this._pendingValue = value;
    }
    commit() {
        while (isDirective(this._pendingValue)) {
            const directive = this._pendingValue;
            this._pendingValue = noChange;
            directive(this);
        }
        if (this._pendingValue === noChange) {
            return;
        }
        const value = !!this._pendingValue;
        if (this.value !== value) {
            if (value) {
                this.element.setAttribute(this.name, '');
            }
            else {
                this.element.removeAttribute(this.name);
            }
        }
        this.value = value;
        this._pendingValue = noChange;
    }
}
class PropertyCommitter extends AttributeCommitter {
    constructor(element, name, strings) {
        super(element, name, strings);
        this.single = strings.length === 2 && strings[0] === '' && strings[1] === '';
    }
    _createPart() {
        return new PropertyPart(this);
    }
    _getValue() {
        if (this.single) {
            return this.parts[0].value;
        }
        return super._getValue();
    }
    commit() {
        if (this.dirty) {
            this.dirty = false;
            this.element[this.name] = this._getValue();
        }
    }
}
class PropertyPart extends AttributePart {
}
let eventOptionsSupported = false;
try {
    const options = {
        get capture() {
            eventOptionsSupported = true;
            return false;
        }
    };
    window.addEventListener('test', options, options);
    window.removeEventListener('test', options, options);
}
catch (_e) { }
class EventPart {
    constructor(element, eventName, eventContext) {
        this.value = undefined;
        this._pendingValue = undefined;
        this.element = element;
        this.eventName = eventName;
        this.eventContext = eventContext;
        this._boundHandleEvent = e => this.handleEvent(e);
    }
    setValue(value) {
        this._pendingValue = value;
    }
    commit() {
        while (isDirective(this._pendingValue)) {
            const directive = this._pendingValue;
            this._pendingValue = noChange;
            directive(this);
        }
        if (this._pendingValue === noChange) {
            return;
        }
        const newListener = this._pendingValue;
        const oldListener = this.value;
        const shouldRemoveListener = newListener == null || oldListener != null && (newListener.capture !== oldListener.capture || newListener.once !== oldListener.once || newListener.passive !== oldListener.passive);
        const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);
        if (shouldRemoveListener) {
            this.element.removeEventListener(this.eventName, this._boundHandleEvent, this._options);
        }
        if (shouldAddListener) {
            this._options = getOptions(newListener);
            this.element.addEventListener(this.eventName, this._boundHandleEvent, this._options);
        }
        this.value = newListener;
        this._pendingValue = noChange;
    }
    handleEvent(event) {
        if (typeof this.value === 'function') {
            this.value.call(this.eventContext || this.element, event);
        }
        else {
            this.value.handleEvent(event);
        }
    }
}
const getOptions = o => o && (eventOptionsSupported ? {
    capture: o.capture,
    passive: o.passive,
    once: o.once
} : o.capture);
var parts = {
    isPrimitive: isPrimitive,
    AttributeCommitter: AttributeCommitter,
    AttributePart: AttributePart,
    NodePart: NodePart,
    BooleanAttributePart: BooleanAttributePart,
    PropertyCommitter: PropertyCommitter,
    PropertyPart: PropertyPart,
    EventPart: EventPart
};
class DefaultTemplateProcessor {
    handleAttributeExpressions(element, name, strings, options) {
        const prefix = name[0];
        if (prefix === '.') {
            const comitter = new PropertyCommitter(element, name.slice(1), strings);
            return comitter.parts;
        }
        if (prefix === '@') {
            return [new EventPart(element, name.slice(1), options.eventContext)];
        }
        if (prefix === '?') {
            return [new BooleanAttributePart(element, name.slice(1), strings)];
        }
        const comitter = new AttributeCommitter(element, name, strings);
        return comitter.parts;
    }
    handleTextExpression(options) {
        return new NodePart(options);
    }
}
const defaultTemplateProcessor = new DefaultTemplateProcessor();
var defaultTemplateProcessor$1 = {
    DefaultTemplateProcessor: DefaultTemplateProcessor,
    defaultTemplateProcessor: defaultTemplateProcessor
};
function templateFactory(result) {
    let templateCache = templateCaches.get(result.type);
    if (templateCache === undefined) {
        templateCache = {
            stringsArray: new WeakMap(),
            keyString: new Map()
        };
        templateCaches.set(result.type, templateCache);
    }
    let template = templateCache.stringsArray.get(result.strings);
    if (template !== undefined) {
        return template;
    }
    const key = result.strings.join(marker);
    template = templateCache.keyString.get(key);
    if (template === undefined) {
        template = new Template(result, result.getTemplateElement());
        templateCache.keyString.set(key, template);
    }
    templateCache.stringsArray.set(result.strings, template);
    return template;
}
const templateCaches = new Map();
var templateFactory$1 = {
    templateFactory: templateFactory,
    templateCaches: templateCaches
};
const parts$1 = new WeakMap();
const render = (result, container, options) => {
    let part = parts$1.get(container);
    if (part === undefined) {
        removeNodes(container, container.firstChild);
        parts$1.set(container, part = new NodePart(Object.assign({
            templateFactory
        }, options)));
        part.appendInto(container);
    }
    part.setValue(result);
    part.commit();
};
var render$1 = {
    parts: parts$1,
    render: render
};
(window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.0.0');
const html = (strings, ...values) => new TemplateResult(strings, values, 'html', defaultTemplateProcessor);
const svg = (strings, ...values) => new SVGTemplateResult(strings, values, 'svg', defaultTemplateProcessor);
var litHtml = {
    html: html,
    svg: svg,
    DefaultTemplateProcessor: DefaultTemplateProcessor,
    defaultTemplateProcessor: defaultTemplateProcessor,
    directive: directive,
    isDirective: isDirective,
    removeNodes: removeNodes,
    reparentNodes: reparentNodes,
    noChange: noChange,
    nothing: nothing,
    AttributeCommitter: AttributeCommitter,
    AttributePart: AttributePart,
    BooleanAttributePart: BooleanAttributePart,
    EventPart: EventPart,
    isPrimitive: isPrimitive,
    NodePart: NodePart,
    PropertyCommitter: PropertyCommitter,
    PropertyPart: PropertyPart,
    parts: parts$1,
    render: render,
    templateCaches: templateCaches,
    templateFactory: templateFactory,
    TemplateInstance: TemplateInstance,
    SVGTemplateResult: SVGTemplateResult,
    TemplateResult: TemplateResult,
    createMarker: createMarker,
    isTemplatePartActive: isTemplatePartActive,
    Template: Template
};
const walkerNodeFilter = 133;
function removeNodesFromTemplate(template, nodesToRemove) {
    const { element: { content }, parts } = template;
    const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
    let partIndex = nextActiveIndexInTemplateParts(parts);
    let part = parts[partIndex];
    let nodeIndex = -1;
    let removeCount = 0;
    const nodesToRemoveInTemplate = [];
    let currentRemovingNode = null;
    while (walker.nextNode()) {
        nodeIndex++;
        const node = walker.currentNode;
        if (node.previousSibling === currentRemovingNode) {
            currentRemovingNode = null;
        }
        if (nodesToRemove.has(node)) {
            nodesToRemoveInTemplate.push(node);
            if (currentRemovingNode === null) {
                currentRemovingNode = node;
            }
        }
        if (currentRemovingNode !== null) {
            removeCount++;
        }
        while (part !== undefined && part.index === nodeIndex) {
            part.index = currentRemovingNode !== null ? -1 : part.index - removeCount;
            partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
            part = parts[partIndex];
        }
    }
    nodesToRemoveInTemplate.forEach(n => n.parentNode.removeChild(n));
}
const countNodes = node => {
    let count = node.nodeType === 11
        ? 0 : 1;
    const walker = document.createTreeWalker(node, walkerNodeFilter, null, false);
    while (walker.nextNode()) {
        count++;
    }
    return count;
};
const nextActiveIndexInTemplateParts = (parts, startIndex = -1) => {
    for (let i = startIndex + 1; i < parts.length; i++) {
        const part = parts[i];
        if (isTemplatePartActive(part)) {
            return i;
        }
    }
    return -1;
};
function insertNodeIntoTemplate(template, node, refNode = null) {
    const { element: { content }, parts } = template;
    if (refNode === null || refNode === undefined) {
        content.appendChild(node);
        return;
    }
    const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
    let partIndex = nextActiveIndexInTemplateParts(parts);
    let insertCount = 0;
    let walkerIndex = -1;
    while (walker.nextNode()) {
        walkerIndex++;
        const walkerNode = walker.currentNode;
        if (walkerNode === refNode) {
            insertCount = countNodes(node);
            refNode.parentNode.insertBefore(node, refNode);
        }
        while (partIndex !== -1 && parts[partIndex].index === walkerIndex) {
            if (insertCount > 0) {
                while (partIndex !== -1) {
                    parts[partIndex].index += insertCount;
                    partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
                }
                return;
            }
            partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
        }
    }
}
var modifyTemplate = {
    removeNodesFromTemplate: removeNodesFromTemplate,
    insertNodeIntoTemplate: insertNodeIntoTemplate
};
const getTemplateCacheKey = (type, scopeName) => `${type}--${scopeName}`;
let compatibleShadyCSSVersion = true;
if (typeof window.ShadyCSS === 'undefined') {
    compatibleShadyCSSVersion = false;
}
else if (typeof window.ShadyCSS.prepareTemplateDom === 'undefined') {
    console.warn(`Incompatible ShadyCSS version detected.` + `Please update to at least @webcomponents/webcomponentsjs@2.0.2 and` + `@webcomponents/shadycss@1.3.1.`);
    compatibleShadyCSSVersion = false;
}
const shadyTemplateFactory = scopeName => result => {
    const cacheKey = getTemplateCacheKey(result.type, scopeName);
    let templateCache = templateCaches.get(cacheKey);
    if (templateCache === undefined) {
        templateCache = {
            stringsArray: new WeakMap(),
            keyString: new Map()
        };
        templateCaches.set(cacheKey, templateCache);
    }
    let template = templateCache.stringsArray.get(result.strings);
    if (template !== undefined) {
        return template;
    }
    const key = result.strings.join(marker);
    template = templateCache.keyString.get(key);
    if (template === undefined) {
        const element = result.getTemplateElement();
        if (compatibleShadyCSSVersion) {
            window.ShadyCSS.prepareTemplateDom(element, scopeName);
        }
        template = new Template(result, element);
        templateCache.keyString.set(key, template);
    }
    templateCache.stringsArray.set(result.strings, template);
    return template;
};
const TEMPLATE_TYPES = ['html', 'svg'];
const removeStylesFromLitTemplates = scopeName => {
    TEMPLATE_TYPES.forEach(type => {
        const templates = templateCaches.get(getTemplateCacheKey(type, scopeName));
        if (templates !== undefined) {
            templates.keyString.forEach(template => {
                const { element: { content } } = template;
                const styles = new Set();
                Array.from(content.querySelectorAll('style')).forEach(s => {
                    styles.add(s);
                });
                removeNodesFromTemplate(template, styles);
            });
        }
    });
};
const shadyRenderSet = new Set();
const prepareTemplateStyles = (renderedDOM, template, scopeName) => {
    shadyRenderSet.add(scopeName);
    const styles = renderedDOM.querySelectorAll('style');
    if (styles.length === 0) {
        window.ShadyCSS.prepareTemplateStyles(template.element, scopeName);
        return;
    }
    const condensedStyle = document.createElement('style');
    for (let i = 0; i < styles.length; i++) {
        const style = styles[i];
        style.parentNode.removeChild(style);
        condensedStyle.textContent += style.textContent;
    }
    removeStylesFromLitTemplates(scopeName);
    insertNodeIntoTemplate(template, condensedStyle, template.element.content.firstChild);
    window.ShadyCSS.prepareTemplateStyles(template.element, scopeName);
    if (window.ShadyCSS.nativeShadow) {
        const style = template.element.content.querySelector('style');
        renderedDOM.insertBefore(style.cloneNode(true), renderedDOM.firstChild);
    }
    else {
        template.element.content.insertBefore(condensedStyle, template.element.content.firstChild);
        const removes = new Set();
        removes.add(condensedStyle);
        removeNodesFromTemplate(template, removes);
    }
};
const render$2 = (result, container, options) => {
    const scopeName = options.scopeName;
    const hasRendered = parts$1.has(container);
    const needsScoping = container instanceof ShadowRoot && compatibleShadyCSSVersion && result instanceof TemplateResult;
    const firstScopeRender = needsScoping && !shadyRenderSet.has(scopeName);
    const renderContainer = firstScopeRender ? document.createDocumentFragment() : container;
    render(result, renderContainer, Object.assign({
        templateFactory: shadyTemplateFactory(scopeName)
    }, options));
    if (firstScopeRender) {
        const part = parts$1.get(renderContainer);
        parts$1.delete(renderContainer);
        if (part.value instanceof TemplateInstance) {
            prepareTemplateStyles(renderContainer, part.value.template, scopeName);
        }
        removeNodes(container, container.firstChild);
        container.appendChild(renderContainer);
        parts$1.set(container, part);
    }
    if (!hasRendered && needsScoping) {
        window.ShadyCSS.styleElement(container.host);
    }
};
var shadyRender = {
    render: render$2,
    html: html,
    svg: svg,
    TemplateResult: TemplateResult
};
(window['litElementVersions'] || (window['litElementVersions'] = [])).push('2.0.1');
function arrayFlat(styles, result = []) {
    for (let i = 0, length = styles.length; i < length; i++) {
        const value = styles[i];
        if (Array.isArray(value)) {
            arrayFlat(value, result);
        }
        else {
            result.push(value);
        }
    }
    return result;
}
const flattenStyles = styles => styles.flat ? styles.flat(Infinity) : arrayFlat(styles);
class LitElement extends UpdatingElement {
    static finalize() {
        super.finalize();
        this._styles = this.hasOwnProperty(JSCompiler_renameProperty('styles', this)) ? this._getUniqueStyles() : this._styles || [];
    }
    static _getUniqueStyles() {
        const userStyles = this.styles;
        const styles = [];
        if (Array.isArray(userStyles)) {
            const flatStyles = flattenStyles(userStyles);
            const styleSet = flatStyles.reduceRight((set, s) => {
                set.add(s);
                return set;
            }, new Set());
            styleSet.forEach(v => styles.unshift(v));
        }
        else if (userStyles) {
            styles.push(userStyles);
        }
        return styles;
    }
    initialize() {
        super.initialize();
        this.renderRoot = this.createRenderRoot();
        if (window.ShadowRoot && this.renderRoot instanceof window.ShadowRoot) {
            this.adoptStyles();
        }
    }
    createRenderRoot() {
        return this.attachShadow({
            mode: 'open'
        });
    }
    adoptStyles() {
        const styles = this.constructor._styles;
        if (styles.length === 0) {
            return;
        }
        if (window.ShadyCSS !== undefined && !window.ShadyCSS.nativeShadow) {
            window.ShadyCSS.ScopingShim.prepareAdoptedCssText(styles.map(s => s.cssText), this.localName);
        }
        else if (supportsAdoptingStyleSheets) {
            this.renderRoot.adoptedStyleSheets = styles.map(s => s.styleSheet);
        }
        else {
            this._needsShimAdoptedStyleSheets = true;
        }
    }
    connectedCallback() {
        super.connectedCallback();
        if (this.hasUpdated && window.ShadyCSS !== undefined) {
            window.ShadyCSS.styleElement(this);
        }
    }
    update(changedProperties) {
        super.update(changedProperties);
        const templateResult = this.render();
        if (templateResult instanceof TemplateResult) {
            this.constructor.render(templateResult, this.renderRoot, {
                scopeName: this.localName,
                eventContext: this
            });
        }
        if (this._needsShimAdoptedStyleSheets) {
            this._needsShimAdoptedStyleSheets = false;
            this.constructor._styles.forEach(s => {
                const style = document.createElement('style');
                style.textContent = s.cssText;
                this.renderRoot.appendChild(style);
            });
        }
    }
    render() { }
}
LitElement.finalized = true;
LitElement.render = render$2;
var litElement = {
    LitElement: LitElement,
    defaultConverter: defaultConverter,
    notEqual: notEqual,
    UpdatingElement: UpdatingElement,
    customElement: customElement,
    property: property,
    query: query,
    queryAll: queryAll,
    eventOptions: eventOptions,
    html: html,
    svg: svg,
    TemplateResult: TemplateResult,
    SVGTemplateResult: SVGTemplateResult,
    supportsAdoptingStyleSheets: supportsAdoptingStyleSheets,
    CSSResult: CSSResult,
    unsafeCSS: unsafeCSS,
    css: css
};
export { cssTag as $cssTag, decorators as $decorators, defaultTemplateProcessor$1 as $defaultTemplateProcessor, directive$1 as $directive, dom as $dom, litElement as $litElement, litHtml as $litHtml, modifyTemplate as $modifyTemplate, part as $part, parts as $parts, render$1 as $render, shadyRender as $shadyRender, template as $template, templateFactory$1 as $templateFactory, templateInstance as $templateInstance, templateResult as $templateResult, updatingElement as $updatingElement, AttributeCommitter, AttributeCommitter as AttributeCommitter$1, AttributePart, AttributePart as AttributePart$1, BooleanAttributePart, BooleanAttributePart as BooleanAttributePart$1, CSSResult, CSSResult as CSSResult$1, DefaultTemplateProcessor, DefaultTemplateProcessor as DefaultTemplateProcessor$1, EventPart, EventPart as EventPart$1, LitElement, NodePart, NodePart as NodePart$1, PropertyCommitter, PropertyCommitter as PropertyCommitter$1, PropertyPart, PropertyPart as PropertyPart$1, SVGTemplateResult, SVGTemplateResult as SVGTemplateResult$1, SVGTemplateResult as SVGTemplateResult$2, Template, Template as Template$1, TemplateInstance, TemplateInstance as TemplateInstance$1, TemplateResult, TemplateResult as TemplateResult$1, TemplateResult as TemplateResult$2, TemplateResult as TemplateResult$3, UpdatingElement, UpdatingElement as UpdatingElement$1, boundAttributeSuffix, createMarker, createMarker as createMarker$1, css, css as css$1, customElement, customElement as customElement$1, defaultConverter, defaultConverter as defaultConverter$1, defaultTemplateProcessor, defaultTemplateProcessor as defaultTemplateProcessor$1, directive, directive as directive$1, eventOptions, eventOptions as eventOptions$1, html, html as html$1, html as html$2, insertNodeIntoTemplate, isCEPolyfill, isDirective, isDirective as isDirective$1, isPrimitive, isPrimitive as isPrimitive$1, isTemplatePartActive, isTemplatePartActive as isTemplatePartActive$1, lastAttributeNameRegex, marker, markerRegex, noChange, noChange as noChange$1, nodeMarker, notEqual, notEqual as notEqual$1, nothing, nothing as nothing$1, parts$1 as parts, parts$1, property, property as property$1, query, query as query$1, queryAll, queryAll as queryAll$1, removeNodes, removeNodes as removeNodes$1, removeNodesFromTemplate, render, render$2 as render$1, render as render$2, reparentNodes, reparentNodes as reparentNodes$1, supportsAdoptingStyleSheets, supportsAdoptingStyleSheets as supportsAdoptingStyleSheets$1, svg, svg as svg$1, svg as svg$2, templateCaches, templateCaches as templateCaches$1, templateFactory, templateFactory as templateFactory$1, unsafeCSS, unsafeCSS as unsafeCSS$1 };
