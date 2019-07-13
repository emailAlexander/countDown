import { LitElement, html, css, customElement, property, render } from '../lib/lit-element.js';
import './cd-timer.js';
import "./cd-header.js";
import { Theme } from '../theme.js';

@customElement('count-down')
export class CountDownView extends LitElement {
  countDown: CountDown;

  preselected: number;

  @property()
  selected: number = 0;

  @property()
  timers: Array<TimerModel>;

  constructor() {
    super();

    let element = this;
    chrome.runtime.getBackgroundPage(function (cd) {
      element.countDown = cd.countDown;
      element.timers = element.countDown.Timers;
    });

    chrome.storage.sync.get(function (Data) {
      if (Data.themeIndex !== undefined) {
        Theme.Set(Data.themeIndex);
      }
    });
  }

  updated() {
    this.selected = ((this.selected % this.timers.length) + this.timers.length) % this.timers.length;
    let timer = this.timers[this.selected];
    const timerElement = this.shadowRoot.querySelector<HTMLElement>('#t' + timer.id);
    timerElement.focus();
  }

  _onStart(e: CustomEvent<TimerModel>) {
    this.countDown.startTimer(e.detail);
  }

  _onStop(e: CustomEvent<TimerModel>) {
    this.countDown.stopTimer(e.detail);
  }

  _onDelete(e: CustomEvent<TimerModel>) {
    this._removeTimer(e.detail);
  }

  _onUpdate(e: CustomEvent<TimerModel>) {
    this.countDown.updateTimer(e.detail);
  }

  _onAdd(e: CustomEvent) {
    this.countDown.createTimer();
    this.selected = this.timers.length - 1;
  }

  _onOptions(e: CustomEvent) {
    Theme.Change();
  }

  _onBadge(e: CustomEvent<TimerModel>) {
    this.countDown.setBadgeTimer(e.detail);
    this.requestUpdate();
  }

  _onSound(e: CustomEvent<TimerModel>) {
    e.detail.sound += 1;
    if (e.detail.sound > this.countDown.sounds.length) { e.detail.sound = 1; }
    this.countDown.updateTimer(e.detail);
  }

  _onVolume(e: CustomEvent<TimerModel>) {
    e.detail.volume -= 0.2;
    if (e.detail.volume < 0) { e.detail.volume = 1; }
    this.countDown.updateTimer(e.detail);
  }

  _onInput(e: KeyboardEvent) {

    // Block if focus on input
    if ((<any>e).path[0].localName == "input") {
      console.trace(e);
      if (e.keyCode == 13) {
        if (this.selected != this.preselected) {
          this.selected = this.preselected;
        }
        else {
          this.requestUpdate();
        }
      }

      return;
    }

    // Up
    if (e.keyCode == 38) {
      this.selected--;
    }

    // Down
    if (e.keyCode == 40) {
      this.selected++;
    }

    // Add
    if (e.keyCode == 45) {
      this.countDown.createTimer()
      this.selected = this.timers.length - 1;
    }

    // Remove
    if (e.keyCode == 46) {
      this._removeTimer(this.timers[this.selected]);
    }
  }

  _onSelect(e: MouseEvent, index: number) {
    // Block if focus on input
    if ((<any>e).path[0].localName == "input") {
      this.preselected = index;
      return;
    }

    this.selected = index;
  }

  _removeTimer(timer: TimerModel) {
    this.countDown.removeTimer(timer);
    if (this.selected == this.timers.length) {
      this.selected--;
    }
    else {
      this.requestUpdate();
    }
  }

  render() {
    if (!this.countDown) {
      return html`Something is not right :/`;
    }

    return html`
    <div tabindex="-1" @keydown=${this._onInput}>
      <cd-header @add=${this._onAdd} @options=${this._onOptions}></cd-header>
      ${this.timers.map((timer, index) => html`
      <cd-timer ?selected=${this.selected == index} ?badge=${this.countDown.badgeTimer == timer} tabindex="-1" id="t${timer.id}"
        .timer=${timer} @click=${function (e) { this._onSelect(e, index) }} @start=${this._onStart} @stop=${this._onStop}
        @delete=${this._onDelete} @update=${this._onUpdate} @badge=${this._onBadge} @options.sound=${this._onSound}
        @options.volume=${this._onVolume}></cd-timer>`)}
    </div>
    `;
  }
}