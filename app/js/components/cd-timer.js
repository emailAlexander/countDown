var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css, customElement, property } from '../lib/lit-element.js';
import { Utils } from '../utils.js';
let TimerView = class TimerView extends LitElement {
    constructor() {
        super();
        this.input = "";
        this.addEventListener('keydown', this._onInput);
    }
    updated() {
        if (this._isRunning(false)) {
            let time;
            if (this.timer.start == this.timer.end) {
                time = new Date().getTime() - this.timer.start;
            }
            else {
                time = this.timer.end - new Date().getTime();
            }
            this.time = Utils.convertTime(time);
            if (this.handler === undefined) {
                this.handler = setInterval(this._updateTime, 50, this);
            }
        }
        else {
            if (this.handler !== undefined) {
                clearInterval(this.handler);
                this.handler = undefined;
            }
            let time = (this.timer.pause === undefined) ? this.timer.time : this.timer.pause;
            this.time = Utils.convertTime(Math.abs(time));
        }
    }
    _updateTime(element) {
        element.requestUpdate();
    }
    _isRunning(orPaused = true) {
        if (orPaused) {
            return this.timer.end !== undefined || this.timer.pause !== undefined;
        }
        return this.timer.end !== undefined;
    }
    _onStart() {
        this.input = "";
        this.dispatchEvent(new CustomEvent('start', { detail: this.timer }));
        this._updateTime(this);
    }
    _onStop() {
        this.dispatchEvent(new CustomEvent('stop', { detail: this.timer }));
        this._updateTime(this);
    }
    _onDelete() {
        this.dispatchEvent(new CustomEvent('delete', { detail: this.timer }));
    }
    _onBadge() {
        this.dispatchEvent(new CustomEvent('badge', { detail: this.timer }));
    }
    _onNote(e) {
        this.timer.note = e.target.value;
        this.dispatchEvent(new CustomEvent('update', { detail: this.timer }));
    }
    _onMore() {
        this.timer.options = !this.timer.options;
        this.requestUpdate();
        this.dispatchEvent(new CustomEvent('update', { detail: this.timer }));
    }
    _onNotification() {
        this.timer.notification = !this.timer.notification;
        this.dispatchEvent(new CustomEvent('update', { detail: this.timer }));
        this.requestUpdate();
    }
    _onSound() {
        this.dispatchEvent(new CustomEvent('options.sound', { detail: this.timer }));
        this.requestUpdate();
    }
    _onVolume() {
        this.dispatchEvent(new CustomEvent('options.volume', { detail: this.timer }));
        this.requestUpdate();
    }
    _onInput(e) {
        if (e.path[0].localName == "input") {
            return;
        }
        if (e.keyCode == 13) {
            this._onStart();
        }
        if (e.keyCode == 37) {
            this._onStop();
        }
        if (this._isRunning()) {
            return;
        }
        if (e.keyCode == 8) {
            this.input = this.input.substr(0, this.input.length - 1);
            this.timer.time = Utils.parseTime(this.input);
            this.time = Utils.convertTime(this.timer.time);
        }
        let c = String.fromCharCode((96 <= e.keyCode && e.keyCode <= 105) ? e.keyCode - 48 : e.keyCode);
        let is_valid_char = (/([0-9]|n|½)/g).test(c);
        let is_valid_input = (/^\d{0,4}n?\d{0,2}n?\d{0,2}n?\d{0,2}$/).test(this.input + c);
        if (!is_valid_input || !is_valid_char) {
            return;
        }
        this.input += c;
        this.timer.time = Utils.parseTime(this.input);
        this.time = Utils.convertTime(this.timer.time);
    }
    _onWheelInput(e) {
        if (this._isRunning()) {
            return;
        }
        var ms = 0;
        if (155 <= e.x && e.x <= 180)
            ms = 1000;
        if (125 <= e.x && e.x <= 150)
            ms = 60000;
        if (90 <= e.x && e.x <= 115)
            ms = 3600000;
        if (45 <= e.x && e.x <= 85)
            ms = 86400000;
        let new_time = this.timer.time + (e.deltaY / -100) * ms;
        if (new_time >= 0) {
            this.timer.time = new_time;
            this.time = Utils.convertTime(new_time);
        }
    }
    render() {
        let play = html `<svg width="28" height="28" viewBox="0 0 48 48">
    <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm-4 29V15l12 9-12 9z" /></svg>`;
        let pause = html `<svg width="28" height="28" viewBox="0 0 48 48">
    <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm-2 28h-4V16h4v16zm8 0h-4V16h4v16z" /></svg>`;
        let badgeOn = html `<svg @click=${this._onBadge} width="18" height="18" viewBox="0 0 48 48">
    <path d="M34 6H14c-2.21 0-3.98 1.79-3.98 4L10 42l14-6 14 6V10c0-2.21-1.79-4-4-4z" /></svg>`;
        let badgeOff = html `<svg @click=${this._onBadge} width="18" height="18" viewBox="0 0 48 48">
    <<path d="M34 6H14c-2.21 0-3.98 1.79-3.98 4L10 42l14-6 14 6V10c0-2.21-1.79-4-4-4zm0 30l-10-4.35L14 36V10h20v26z" /></svg>`;
        let soundOn = html `<svg viewBox="0 0 48 48">
    <path d="M6 18v12h8l10 10V8L14 18H6zm27 6c0-3.53-2.04-6.58-5-8.05v16.11c2.96-1.48 5-4.53 5-8.06zM28 6.46v4.13c5.78 1.72 10 7.07 10 13.41s-4.22 11.69-10 13.41v4.13c8.01-1.82 14-8.97 14-17.54S36.01 8.28 28 6.46z" /></svg>`;
        let soundOff = html `<svg viewBox="0 0 48 48">
    <path d="M33 24c0-3.53-2.04-6.58-5-8.05v4.42l4.91 4.91c.06-.42.09-.85.09-1.28zm5 0c0 1.88-.41 3.65-1.08 5.28l3.03 3.03C41.25 29.82 42 27 42 24c0-8.56-5.99-15.72-14-17.54v4.13c5.78 1.72 10 7.07 10 13.41zM8.55 6L6 8.55 15.45 18H6v12h8l10 10V26.55l8.51 8.51c-1.34 1.03-2.85 1.86-4.51 2.36v4.13c2.75-.63 5.26-1.89 7.37-3.62L39.45 42 42 39.45l-18-18L8.55 6zM24 8l-4.18 4.18L24 16.36V8z" /></svg>`;
        let notificationOn = html `<svg viewBox="0 0 48 48">
    <path d="M24 44c2.21 0 4-1.79 4-4h-8c0 2.21 1.79 4 4 4zm12-12V22c0-6.15-3.27-11.28-9-12.64V8c0-1.66-1.34-3-3-3s-3 1.34-3 3v1.36c-5.73 1.36-9 6.49-9 12.64v10l-4 4v2h32v-2l-4-4z" /></svg>`;
        let notificationOff = html `<svg viewBox="0 0 48 48">
    <path d="M40 37.39L15.68 12.3l-5.13-5.29L8 9.55l5.6 5.6.01.01C12.56 17.14 12 19.48 12 22v10l-4 4v2h27.46l4 4L42 39.45l-2-2.06zM24 44c2.21 0 4-1.79 4-4h-8c0 2.21 1.79 4 4 4zm12-14.64V22c0-6.15-3.27-11.28-9-12.64V8c0-1.66-1.34-3-3-3s-3 1.34-3 3v1.36c-.29.07-.57.15-.85.24-.21.07-.41.14-.61.22 0 0-.01 0-.01.01-.01 0-.02.01-.03.01-.46.18-.91.39-1.35.62-.01 0-.02.01-.03.01L36 29.36z" /></svg>`;
        return html `
        <span class="time" @mousewheel=${this._onWheelInput}>${this.time}</span>
        <div class="controls">
            <div class="play" @click=${this._onStart}>${this._isRunning(false) ? pause : play}</div>
            <div class="stop ${this._isRunning() ? "" : " hide"}" @click=${this._onStop}><svg width="22" height="22" viewBox="0 0 48 48">
                    <path d="M12 12h24v24H12z" /></svg></div>
            <div class="badge">${this.badge ? badgeOn : badgeOff}</div>
        </div>
        <svg @click=${this._onMore} class="more" width="22" height="22" viewBox="0 0 48 48">
            <path d="M12 20c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm24 0c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-12 0c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" /></svg>
        <div class="options ${this.timer.options ? " show" : " hide"}">
            <!-- <svg viewBox="0 0 48 48">
                                <path d="M38 38H10V10h14V6H10c-2.21 0-4 1.79-4 4v28c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4V24h-4v14zM28 6v4h7.17L15.51 29.66l2.83 2.83L38 12.83V20h4V6H28z" /></svg> -->
            <svg @click=${this._onSound} viewBox="0 0 48 48">
                <path d="M24 6v18.55c-.94-.33-1.94-.55-3-.55-4.97 0-9 4.03-9 9s4.03 9 9 9c4.63 0 8.4-3.51 8.9-8h.1V12h8V6H24z" /></svg>
            <span class="sound">${this.timer.sound}</span>
            <span @click=${this._onVolume}>${this.timer.volume > 0.01 ? soundOn : soundOff}</span>
            <span class="volume" style="height:${this.timer.volume * 15}px"></span>
            <span @click=${this._onNotification}>${this.timer.notification ? notificationOn : notificationOff}</span>
            <svg @click=${this._onDelete} viewBox="0 0 48 48">
                <path d="M12 38c0 2.21 1.79 4 4 4h16c2.21 0 4-1.79 4-4V14H12v24zM38 8h-7l-2-2H19l-2 2h-7v4h28V8z" /></svg>
        </div>
        <div class="note ${this.timer.options ? " hide" : "show"}">
            <input tabindex="-1" @change=${this._onNote} value=${this.timer.note} />
        </div>
    `;
    }
};
TimerView.styles = css `
    :host {
        display: block;
        user-select: none;
        outline: none;
        background: var(--default-primary-color);
        color: var(--text-primary-color);
        filter: drop-shadow(0px -1px 6px rgba(0, 0, 0, 0.5 ));
        height: 70px;
        overflow: hidden;
    }
    :host(:focus) {
        background: var(--dark-primary-color);
    }

    .badge{
        top: -3px;
        right: 2px;
        position: absolute;
    }

    .play{
        position: absolute;
        right: 15%;
        top: 50%;
        transform: translate(0, -70%)
    }

    .stop{
        transition: 0.3s;
        position: absolute;
        right: 6%;
        top: 50%;
        transform: translate(0, -65%) scale(1);
    }

    .controls .hide {
        transform: translate(-20px, -75%) scale(0);
    }

    .more{
        transition: 0.3s;
        position: absolute;
        left: -25px;
        bottom: 15px;
    }

    :host(:hover) .more{
        transition: 0.3s;
        left: 0px;
    }

    .time {
        text-align: right;
        user-select: none;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 2em;
        font-size-adjust: initial;
        right: 30%;
        top: 50%;
        display: inline;
        position: absolute;
        width: 100%;
        transform: translate(0 , -80%);
    }
    svg {
        cursor: pointer;
        fill:var(--accent-color);
        filter: drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.3 ));
    }
    svg:active{
        transition: 0.2s;
        transform: translateY(1px);
    }

    .hide{
        transform: translate(0px, 25px);
    }

    .options {
        transition: 0.3s;
        position: absolute;
        bottom: 0px;
        width: 100%;
        text-align: center;
    }

    .options svg {
        width: 18px;
        height: 18px;
        margin: 0px 5px;
    }

    .options .sound {
        margin-left: -12px;
        color: var(--accent-color);
    }

    .options .volume {
        transition: height 0.3s;
        background: var(--accent-color);
        width: 3px;
        height: 15px;
        position: absolute;
        margin-left: -9px;
        bottom: 4px;
    }

    .note {
        transition: 0.3s;
        position: absolute;
        bottom: 0px;
        width: 100%;
    }

    input {
        outline: none;
        background-color: rgba(0,0,0,0.1);
        text-overflow: ellipsis;
        color: var(--text-primary-color);
        border: none;
        width: 100%;
        text-indent: 3px;
    }
    `;
__decorate([
    property()
], TimerView.prototype, "selected", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], TimerView.prototype, "badge", void 0);
__decorate([
    property()
], TimerView.prototype, "options", void 0);
__decorate([
    property()
], TimerView.prototype, "timer", void 0);
__decorate([
    property()
], TimerView.prototype, "input", void 0);
__decorate([
    property()
], TimerView.prototype, "time", void 0);
TimerView = __decorate([
    customElement('cd-timer')
], TimerView);
export { TimerView };
