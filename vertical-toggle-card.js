import { LitElement, html, css } from "https://unpkg.com/lit@2.8.0/index.js?module";

const VERSION = "2026.1.5";

class VerticalToggleCard extends LitElement {
  static properties = {
    hass: {},
    config: {}
  };

  constructor() {
    super();
    this._holdTimer = null;
    this._held = false;
  }

  setConfig(config) {
    if (!config?.entity) throw new Error("You need to define an entity");

    this.config = {
      entity: config.entity,

      // name
      name: config.name ?? null,
      name_align: config.name_align ?? "none", // none | top | bottom | left | right

      // icon
      icon: config.icon ?? null,
      hide_icon: config.hide_icon ?? false,
      icon_size: config.icon_size ?? "40px",

      // layout
      track_width: config.track_width ?? "120px",
      toggle_gap: config.toggle_gap ?? "4px",
      track_radius: config.track_radius ?? "26px",
      thumb_radius: config.thumb_radius ?? "22px",

      // hold
      hold_duration: Number(config.hold_duration ?? 800),

      // optional color overrides
      on_color: config.on_color ?? null,
      off_color: config.off_color ?? null,
      unavailable_color: config.unavailable_color ?? null,
      unknown_color: config.unknown_color ?? null
    };
  }

  get stateObj() {
    return this.hass?.states?.[this.config.entity] ?? null;
  }

  get _domain() {
    return (this.config.entity || "").split(".")[0] || "";
  }

  get _isOn() {
    return this.stateObj?.state === "on";
  }

  /* ================= NAME ================= */

  _getName() {
    if (!this.stateObj) return "";
    return this.config.name ?? this.stateObj.attributes?.friendly_name ?? "";
  }

  _renderName() {
    if (this.config.name_align === "none") return "";

    const name = this._getName();
    if (!name) return "";

    const align = this.config.name_align;

    return html`
      <div class="name-box ${align}">
        <div class="name-viewport">
          <div class="name-inner">
            <span class="name-text" title="${name}">${name}</span>
          </div>
        </div>
      </div>
    `;
  }

  /* ================= COLORS ================= */

  _getActiveColor() {
    if (!this.stateObj) return "var(--state-active-color)";

    const state = this.stateObj.state;
    const domain = this._domain;

    if (state === "on" && this.config.on_color) return this.config.on_color;
    if (state === "off" && this.config.off_color) return this.config.off_color;
    if (state === "unavailable" && this.config.unavailable_color)
      return this.config.unavailable_color;
    if (state === "unknown" && this.config.unknown_color)
      return this.config.unknown_color;

    if (state === "unavailable") return "var(--error-color)";
    if (state === "unknown") return "var(--warning-color)";
    if (state !== "on") return "var(--state-inactive-color)";

    if (domain === "fan") return "var(--info-color)";
    if (domain === "switch") return "var(--success-color)";
    if (domain === "light") return "var(--state-active-color)";

    return "var(--state-active-color)";
  }

  _getIconColor() {
    if (!this.stateObj) return "var(--secondary-text-color)";

    const attrs = this.stateObj.attributes || {};
    const isOn = this._isOn;

    if (!isOn) return "var(--secondary-text-color)";

    if (this._domain === "light") {
      if (attrs.rgb_color) {
        const [r, g, b] = attrs.rgb_color;
        return `rgb(${r}, ${g}, ${b})`;
      }
      if (attrs.hs_color) {
        const [h, s] = attrs.hs_color;
        return `hsl(${h}, ${s}%, 50%)`;
      }
    }

    return "var(--primary-text-color)";
  }

  _getIcon() {
    if (this.config.icon) return this.config.icon;
    if (this.stateObj?.attributes?.icon) return this.stateObj.attributes.icon;

    const d = this._domain;
    if (d === "light") return "mdi:lightbulb";
    if (d === "fan") return "mdi:fan";
    if (d === "switch") return "mdi:toggle-switch";
    return "mdi:power";
  }

  /* ================= ACTIONS ================= */

  _toggle() {
    if (!this.hass || !this.stateObj) return;

    const entityId = this.config.entity;
    const domain = this._domain;

    const service =
      domain === "fan"
        ? "toggle"
        : this._isOn
        ? "turn_off"
        : "turn_on";

    this.hass.callService(domain, service, { entity_id: entityId });
  }

  _moreInfo() {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId: this.config.entity },
        bubbles: true,
        composed: true
      })
    );
  }

  _onPointerDown() {
    this._held = false;
    clearTimeout(this._holdTimer);

    const holdMs = Number(this.config.hold_duration) || 800;
    this._holdTimer = setTimeout(() => {
      this._held = true;
      this._moreInfo();
    }, holdMs);
  }

  _onPointerUp() {
    clearTimeout(this._holdTimer);
    if (!this._held) this._toggle();
  }

  _onPointerLeave() {
    clearTimeout(this._holdTimer);
  }

  /* ================= RENDER ================= */

  render() {
    if (!this.stateObj) return html``;

    const align = this.config.name_align;
    const nameFirst = align === "top" || align === "left";

    const activeColor = this._getActiveColor();
    const iconColor = this._getIconColor();
    const isOn = this._isOn;

    const cardVars = `
      --track-width:${this.config.track_width};
      --toggle-gap:${this.config.toggle_gap};
      --track-radius:${this.config.track_radius};
      --thumb-radius:${this.config.thumb_radius};
      --icon-size:${this.config.icon_size};
      --active-color:${activeColor};
    `;

    return html`
      <ha-card class="root" style="${cardVars}">
        <div class="center">
          <div class="unit ${align}">
            ${nameFirst ? this._renderName() : ""}

            <div
              class="switch"
              @pointerdown=${this._onPointerDown.bind(this)}
              @pointerup=${this._onPointerUp.bind(this)}
              @pointerleave=${this._onPointerLeave.bind(this)}
              @contextmenu=${(e) => {
                e.preventDefault();
                this._moreInfo();
              }}
            >
              <div class="track ${isOn ? "on" : ""}">
                <div class="thumb ${isOn ? "on" : "off"}">
                  ${this.config.hide_icon
                    ? ""
                    : html`<ha-icon
                        icon="${this._getIcon()}"
                        style="color:${iconColor}"
                      ></ha-icon>`}
                </div>
              </div>
            </div>

            ${!nameFirst ? this._renderName() : ""}
          </div>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    :host {
      --card-pad: 12px;
      --name-height: 36px;
      --unit-gap: 6px;
      --side-name-width: 36px;
    }

    ha-card.root {
      padding: var(--card-pad);
      box-sizing: border-box;

      max-height: calc(
        (var(--track-width) * 2) +
        var(--name-height) +
        var(--unit-gap) +
        (var(--card-pad) * 2)
      );

      max-width: calc(
        var(--track-width) +
        var(--side-name-width) +
        var(--unit-gap) +
        (var(--card-pad) * 2)
      );
    }

    .center {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .unit {
      display: inline-flex;
      justify-content: center;
      gap: var(--unit-gap);
      align-items: center;
    }

    .unit.none {
      flex-direction: column;
    }

    .unit.top,
    .unit.bottom {
      flex-direction: column;
      width: 100%;
      min-width: var(--track-width);
    }

    .unit.left,
    .unit.right {
      flex-direction: row;
      height: 100%;
      min-height: calc(var(--track-width) * 2);
    }

    .switch {
      touch-action: manipulation;
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    .track {
      width: var(--track-width);
      height: calc(var(--track-width) * 2);
      padding: var(--toggle-gap);
      border-radius: var(--track-radius);
      position: relative;
      background: var(--state-inactive-color);
      box-sizing: border-box;
      overflow: hidden;
    }

    .track.on {
      background: color-mix(in srgb, var(--active-color) 20%, transparent);
    }

    .thumb {
      position: absolute;
      left: var(--toggle-gap);
      right: var(--toggle-gap);
      height: calc(50% - (var(--toggle-gap) * 1.25));
      border-radius: var(--thumb-radius);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--disabled-text-color);
      transition: top 0.25s ease, bottom 0.25s ease, background 0.25s ease;
    }

    .thumb.on {
      top: var(--toggle-gap);
      background: var(--active-color);
    }

    .thumb.off {
      bottom: var(--toggle-gap);
    }

    ha-icon {
      --mdc-icon-size: var(--icon-size);
    }

    /* ===== name ===== */

    .name-box {
      background: var(--ha-card-background, var(--card-background-color));
      box-shadow: inset 0 0 0 1px var(--divider-color);
      border-radius: 12px;
      overflow: hidden;
      box-sizing: border-box;
    }

    .name-box.top,
    .name-box.bottom {
      width: 100%;
      min-width: var(--track-width);
      height: var(--name-height);
    }

    .name-box.left,
    .name-box.right {
      width: var(--side-name-width);
      height: calc(var(--track-width) * 2);
    }

    .name-viewport {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      box-sizing: border-box;
    }

    .name-inner {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .name-text {
      white-space: nowrap;
      font-size: 0.78rem;
      font-weight: 500;
      color: var(--primary-text-color);
      line-height: 1;
    }

    /* rotation (text only, safe) */
    .name-box.right .name-inner {
      writing-mode: vertical-rl;
      text-orientation: mixed;
    }

    .name-box.left .name-inner {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      transform: rotate(180deg);
      transform-origin: center;
    }
  `;

  /* ───────── EDITOR HOOK (SAFE) ───────── */
  static async getConfigElement() {
    await import("./vertical-toggle-card-editor.js");
    return document.createElement("vertical-toggle-card-editor");
  }

  static getStubConfig() {
    return { type: "custom:vertical-toggle-card", entity: "" };
  }
}

customElements.define("vertical-toggle-card", VerticalToggleCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "vertical-toggle-card",
  name: "Vertical Toggle Card",
  description: "Vertical toggle for Lights, Switches, and Fans. Press and hold toggle for more-info-card popup"
});

console.info(
  `%cVERTICAL-TOGGLE-CARD ${VERSION} LOADED`,
  "color:#03a9f4;font-weight:bold"
);
