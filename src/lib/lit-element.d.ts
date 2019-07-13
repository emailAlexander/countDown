declare const supportsAdoptingStyleSheets: boolean;
declare class CSSResult {
    constructor(cssText: any, safeToken: any);
    readonly styleSheet: any;
    toString(): any;
}
declare const unsafeCSS: (value: any) => CSSResult;
declare const css: (strings: any, ...values: any[]) => CSSResult;
declare var cssTag: {
    supportsAdoptingStyleSheets: boolean;
    CSSResult: typeof CSSResult;
    unsafeCSS: (value: any) => CSSResult;
    css: (strings: any, ...values: any[]) => CSSResult;
};
declare const customElement: (tagName: any) => (classOrDescriptor: any) => any;
declare function property(options?: any): (protoOrDescriptor: any, name: any) => any;
declare function query(selector: any): (protoOrDescriptor: any, name: any) => void | {
    kind: string;
    placement: string;
    key: any;
    descriptor: any;
};
declare function queryAll(selector: any): (protoOrDescriptor: any, name: any) => void | {
    kind: string;
    placement: string;
    key: any;
    descriptor: any;
};
declare const eventOptions: (options: any) => (protoOrDescriptor: any, name: any) => any;
declare var decorators: {
    customElement: (tagName: any) => (classOrDescriptor: any) => any;
    property: typeof property;
    query: typeof query;
    queryAll: typeof queryAll;
    eventOptions: (options: any) => (protoOrDescriptor: any, name: any) => any;
};
declare const defaultConverter: {
    toAttribute(value: any, type: any): any;
    fromAttribute(value: any, type: any): any;
};
declare const notEqual: (value: any, old: any) => boolean;
declare class UpdatingElement extends HTMLElement {
    constructor();
    static readonly observedAttributes: any[];
    static _ensureClassProperties(): void;
    static createProperty(name: any, options?: {
        attribute: boolean;
        type: StringConstructor;
        converter: {
            toAttribute(value: any, type: any): any;
            fromAttribute(value: any, type: any): any;
        };
        reflect: boolean;
        hasChanged: (value: any, old: any) => boolean;
    }): void;
    static finalize(): void;
    static _attributeNameForProperty(name: any, options: any): string;
    static _valueHasChanged(value: any, old: any, hasChanged?: (value: any, old: any) => boolean): boolean;
    static _propertyValueFromAttribute(value: any, options: any): any;
    static _propertyValueToAttribute(value: any, options: any): any;
    initialize(): void;
    _saveInstanceProperties(): void;
    _applyInstanceProperties(): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: any, old: any, value: any): void;
    _propertyToAttribute(name: any, value: any, options?: {
        attribute: boolean;
        type: StringConstructor;
        converter: {
            toAttribute(value: any, type: any): any;
            fromAttribute(value: any, type: any): any;
        };
        reflect: boolean;
        hasChanged: (value: any, old: any) => boolean;
    }): void;
    _attributeToProperty(name: any, value: any): void;
    _requestUpdate(name: any, oldValue: any): void;
    requestUpdate(name?: any, oldValue?: any): any;
    _enqueueUpdate(): Promise<void>;
    readonly _hasConnected: number;
    readonly _hasRequestedUpdate: number;
    readonly hasUpdated: number;
    performUpdate(): void;
    _markUpdated(): void;
    readonly updateComplete: any;
    shouldUpdate(_changedProperties: any): boolean;
    update(_changedProperties: any): void;
    updated(_changedProperties: any): void;
    firstUpdated(_changedProperties: any): void;
}
declare var updatingElement: {
    defaultConverter: {
        toAttribute(value: any, type: any): any;
        fromAttribute(value: any, type: any): any;
    };
    notEqual: (value: any, old: any) => boolean;
    UpdatingElement: typeof UpdatingElement;
};
declare const directive: (f: any) => (...args: any[]) => any;
declare const isDirective: (o: any) => boolean;
declare var directive$1: {
    directive: (f: any) => (...args: any[]) => any;
    isDirective: (o: any) => boolean;
};
declare const isCEPolyfill: boolean;
declare const reparentNodes: (container: any, start: any, end?: any, before?: any) => void;
declare const removeNodes: (container: any, startNode: any, endNode?: any) => void;
declare var dom: {
    isCEPolyfill: boolean;
    reparentNodes: (container: any, start: any, end?: any, before?: any) => void;
    removeNodes: (container: any, startNode: any, endNode?: any) => void;
};
declare const noChange: {};
declare const nothing: {};
declare var part: {
    noChange: {};
    nothing: {};
};
declare const marker: string;
declare const nodeMarker: string;
declare const markerRegex: RegExp;
declare const boundAttributeSuffix = "$lit$";
declare class Template {
    constructor(result: any, element: any);
}
declare const isTemplatePartActive: (part: any) => boolean;
declare const createMarker: () => Comment;
declare const lastAttributeNameRegex: RegExp;
declare var template: {
    marker: string;
    nodeMarker: string;
    markerRegex: RegExp;
    boundAttributeSuffix: string;
    Template: typeof Template;
    isTemplatePartActive: (part: any) => boolean;
    createMarker: () => Comment;
    lastAttributeNameRegex: RegExp;
};
declare class TemplateInstance {
    constructor(template: any, processor: any, options: any);
    update(values: any): void;
    _clone(): any;
}
declare var templateInstance: {
    TemplateInstance: typeof TemplateInstance;
};
declare class TemplateResult {
    constructor(strings: any, values: any, type: any, processor: any);
    getHTML(): string;
    getTemplateElement(): HTMLTemplateElement;
}
declare class SVGTemplateResult extends TemplateResult {
    getHTML(): string;
    getTemplateElement(): HTMLTemplateElement;
}
declare var templateResult: {
    TemplateResult: typeof TemplateResult;
    SVGTemplateResult: typeof SVGTemplateResult;
};
declare const isPrimitive: (value: any) => boolean;
declare class AttributeCommitter {
    constructor(element: any, name: any, strings: any);
    _createPart(): AttributePart;
    _getValue(): string;
    commit(): void;
}
declare class AttributePart {
    constructor(comitter: any);
    setValue(value: any): void;
    commit(): void;
}
declare class NodePart {
    constructor(options: any);
    appendInto(container: any): void;
    insertAfterNode(ref: any): void;
    appendIntoPart(part: any): void;
    insertAfterPart(ref: any): void;
    setValue(value: any): void;
    commit(): void;
    _insert(node: any): void;
    _commitNode(value: any): void;
    _commitText(value: any): void;
    _commitTemplateResult(value: any): void;
    _commitIterable(value: any): void;
    clear(startNode?: any): void;
}
declare class BooleanAttributePart {
    constructor(element: any, name: any, strings: any);
    setValue(value: any): void;
    commit(): void;
}
declare class PropertyCommitter extends AttributeCommitter {
    constructor(element: any, name: any, strings: any);
    _createPart(): PropertyPart;
    _getValue(): any;
    commit(): void;
}
declare class PropertyPart extends AttributePart {
}
declare class EventPart {
    constructor(element: any, eventName: any, eventContext: any);
    setValue(value: any): void;
    commit(): void;
    handleEvent(event: any): void;
}
declare var parts: {
    isPrimitive: (value: any) => boolean;
    AttributeCommitter: typeof AttributeCommitter;
    AttributePart: typeof AttributePart;
    NodePart: typeof NodePart;
    BooleanAttributePart: typeof BooleanAttributePart;
    PropertyCommitter: typeof PropertyCommitter;
    PropertyPart: typeof PropertyPart;
    EventPart: typeof EventPart;
};
declare class DefaultTemplateProcessor {
    handleAttributeExpressions(element: any, name: any, strings: any, options: any): any;
    handleTextExpression(options: any): NodePart;
}
declare const defaultTemplateProcessor: DefaultTemplateProcessor;
declare var defaultTemplateProcessor$1: {
    DefaultTemplateProcessor: typeof DefaultTemplateProcessor;
    defaultTemplateProcessor: DefaultTemplateProcessor;
};
declare function templateFactory(result: any): any;
declare const templateCaches: Map<any, any>;
declare var templateFactory$1: {
    templateFactory: typeof templateFactory;
    templateCaches: Map<any, any>;
};
declare const parts$1: WeakMap<object, any>;
declare const render: (result: any, container: any, options: any) => void;
declare var render$1: {
    parts: WeakMap<object, any>;
    render: (result: any, container: any, options: any) => void;
};
declare const html: (strings: any, ...values: any[]) => TemplateResult;
declare const svg: (strings: any, ...values: any[]) => SVGTemplateResult;
declare var litHtml: {
    html: (strings: any, ...values: any[]) => TemplateResult;
    svg: (strings: any, ...values: any[]) => SVGTemplateResult;
    DefaultTemplateProcessor: typeof DefaultTemplateProcessor;
    defaultTemplateProcessor: DefaultTemplateProcessor;
    directive: (f: any) => (...args: any[]) => any;
    isDirective: (o: any) => boolean;
    removeNodes: (container: any, startNode: any, endNode?: any) => void;
    reparentNodes: (container: any, start: any, end?: any, before?: any) => void;
    noChange: {};
    nothing: {};
    AttributeCommitter: typeof AttributeCommitter;
    AttributePart: typeof AttributePart;
    BooleanAttributePart: typeof BooleanAttributePart;
    EventPart: typeof EventPart;
    isPrimitive: (value: any) => boolean;
    NodePart: typeof NodePart;
    PropertyCommitter: typeof PropertyCommitter;
    PropertyPart: typeof PropertyPart;
    parts: WeakMap<object, any>;
    render: (result: any, container: any, options: any) => void;
    templateCaches: Map<any, any>;
    templateFactory: typeof templateFactory;
    TemplateInstance: typeof TemplateInstance;
    SVGTemplateResult: typeof SVGTemplateResult;
    TemplateResult: typeof TemplateResult;
    createMarker: () => Comment;
    isTemplatePartActive: (part: any) => boolean;
    Template: typeof Template;
};
declare function removeNodesFromTemplate(template: any, nodesToRemove: any): void;
declare function insertNodeIntoTemplate(template: any, node: any, refNode?: any): void;
declare var modifyTemplate: {
    removeNodesFromTemplate: typeof removeNodesFromTemplate;
    insertNodeIntoTemplate: typeof insertNodeIntoTemplate;
};
declare const render$2: (result: any, container: any, options: any) => void;
declare var shadyRender: {
    render: (result: any, container: any, options: any) => void;
    html: (strings: any, ...values: any[]) => TemplateResult;
    svg: (strings: any, ...values: any[]) => SVGTemplateResult;
    TemplateResult: typeof TemplateResult;
};
declare class LitElement extends UpdatingElement {
    static finalize(): void;
    static _getUniqueStyles(): any[];
    initialize(): void;
    createRenderRoot(): ShadowRoot;
    adoptStyles(): void;
    connectedCallback(): void;
    update(changedProperties: any): void;
    render(): void;
}
declare var litElement: {
    LitElement: typeof LitElement;
    defaultConverter: {
        toAttribute(value: any, type: any): any;
        fromAttribute(value: any, type: any): any;
    };
    notEqual: (value: any, old: any) => boolean;
    UpdatingElement: typeof UpdatingElement;
    customElement: (tagName: any) => (classOrDescriptor: any) => any;
    property: typeof property;
    query: typeof query;
    queryAll: typeof queryAll;
    eventOptions: (options: any) => (protoOrDescriptor: any, name: any) => any;
    html: (strings: any, ...values: any[]) => TemplateResult;
    svg: (strings: any, ...values: any[]) => SVGTemplateResult;
    TemplateResult: typeof TemplateResult;
    SVGTemplateResult: typeof SVGTemplateResult;
    supportsAdoptingStyleSheets: boolean;
    CSSResult: typeof CSSResult;
    unsafeCSS: (value: any) => CSSResult;
    css: (strings: any, ...values: any[]) => CSSResult;
};
export { cssTag as $cssTag, decorators as $decorators, defaultTemplateProcessor$1 as $defaultTemplateProcessor, directive$1 as $directive, dom as $dom, litElement as $litElement, litHtml as $litHtml, modifyTemplate as $modifyTemplate, part as $part, parts as $parts, render$1 as $render, shadyRender as $shadyRender, template as $template, templateFactory$1 as $templateFactory, templateInstance as $templateInstance, templateResult as $templateResult, updatingElement as $updatingElement, AttributeCommitter, AttributeCommitter as AttributeCommitter$1, AttributePart, AttributePart as AttributePart$1, BooleanAttributePart, BooleanAttributePart as BooleanAttributePart$1, CSSResult, CSSResult as CSSResult$1, DefaultTemplateProcessor, DefaultTemplateProcessor as DefaultTemplateProcessor$1, EventPart, EventPart as EventPart$1, LitElement, NodePart, NodePart as NodePart$1, PropertyCommitter, PropertyCommitter as PropertyCommitter$1, PropertyPart, PropertyPart as PropertyPart$1, SVGTemplateResult, SVGTemplateResult as SVGTemplateResult$1, SVGTemplateResult as SVGTemplateResult$2, Template, Template as Template$1, TemplateInstance, TemplateInstance as TemplateInstance$1, TemplateResult, TemplateResult as TemplateResult$1, TemplateResult as TemplateResult$2, TemplateResult as TemplateResult$3, UpdatingElement, UpdatingElement as UpdatingElement$1, boundAttributeSuffix, createMarker, createMarker as createMarker$1, css, css as css$1, customElement, customElement as customElement$1, defaultConverter, defaultConverter as defaultConverter$1, defaultTemplateProcessor, defaultTemplateProcessor as defaultTemplateProcessor$1, directive, directive as directive$1, eventOptions, eventOptions as eventOptions$1, html, html as html$1, html as html$2, insertNodeIntoTemplate, isCEPolyfill, isDirective, isDirective as isDirective$1, isPrimitive, isPrimitive as isPrimitive$1, isTemplatePartActive, isTemplatePartActive as isTemplatePartActive$1, lastAttributeNameRegex, marker, markerRegex, noChange, noChange as noChange$1, nodeMarker, notEqual, notEqual as notEqual$1, nothing, nothing as nothing$1, parts$1 as parts, parts$1, property, property as property$1, query, query as query$1, queryAll, queryAll as queryAll$1, removeNodes, removeNodes as removeNodes$1, removeNodesFromTemplate, render, render$2 as render$1, render as render$2, reparentNodes, reparentNodes as reparentNodes$1, supportsAdoptingStyleSheets, supportsAdoptingStyleSheets as supportsAdoptingStyleSheets$1, svg, svg as svg$1, svg as svg$2, templateCaches, templateCaches as templateCaches$1, templateFactory, templateFactory as templateFactory$1, unsafeCSS, unsafeCSS as unsafeCSS$1 };
