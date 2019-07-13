import { LitElement, html, css, customElement, property } from '../lib/lit-element.js';

@customElement('cd-header')
export class CountDownHeader extends LitElement {

    static styles = css`
    :host {
        display: block;
        background: var(--dark-primary-color);
        color: var(--light-primary-color);
        font-family: Arial, sans-serif;
        user-select: none;
        padding: 3px;
    }
    #logo {
        position: absolute;
        top: 11px;
        font-size: 18px;
        right: 3px;
    }

    svg {
        cursor: pointer;
        width: 18px;
        height: 18px;
        filter: drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.3 ));
        fill:var(--accent-color);
    }
    svg:active{
        transition: 0.2s;
        transform: translateY(1px);
    }
    `;

    _onAdd() {
        this.dispatchEvent(new CustomEvent('add'));
    }

    _onHelp() {
        window.open("https://chrome.google.com/webstore/detail/countdown/fefdcjabloofphhfcinhfbinmehfcojm/details?hl=en");
    }

    _onOptions() {
        this.dispatchEvent(new CustomEvent('options'));
    }

    render() {
        return html`
            <svg @click=${this._onAdd} viewBox="0 0 48 48">
                <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm10 22h-8v8h-4v-8h-8v-4h8v-8h4v8h8v4z" /></svg>
            <svg @click=${this._onHelp} viewBox="0 0 48 48">
                <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm2 34h-4v-4h4v4zm4.13-15.49l-1.79 1.84C26.9 25.79 26 27 26 30h-4v-1c0-2.21.9-4.21 2.34-5.66l2.49-2.52C27.55 20.1 28 19.1 28 18c0-2.21-1.79-4-4-4s-4 1.79-4 4h-4c0-4.42 3.58-8 8-8s8 3.58 8 8c0 1.76-.71 3.35-1.87 4.51z" /></svg>
            <svg @click=${this._onOptions} viewBox="0 0 48 48">
                <path d="M24 6C14.06 6 6 14.06 6 24s8.06 18 18 18c1.66 0 3-1.34 3-3 0-.78-.29-1.48-.78-2.01-.47-.53-.75-1.22-.75-1.99 0-1.66 1.34-3 3-3H32c5.52 0 10-4.48 10-10 0-8.84-8.06-16-18-16zM13 24c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm6-8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm10 0c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm6 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>
            <span id="logo">count<b>Down</b></span>
            `;
    }
}