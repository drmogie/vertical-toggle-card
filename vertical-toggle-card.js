import { LitElement, html, css } from "https://unpkg.com/lit@2.8.0/index.js?module";

const VERSION = "2026.1.7";

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
    // Allow empty entity (no throw). Render placeholder until entity is selected.
    const entity = (config?.entity ?? "").trim();

    this.config = {
      entity,

      // name
      name: config?.name ?? null,
      name_align: config?.name_align ?? "none", // none | top | bottom | left | right

      // icon
      icon: config?.icon ?? null, // if set, always use this icon
      hide_icon: config?.hide_icon ?? false,
      icon_size: config?.icon_size ?? "40px",

      // layout
      track_width: config?.track_width ?? "120px",
      toggle_gap: config?.toggle_gap ?? "4px",
      track_radius: config?.track_radius ?? "26px",
      thumb_radius: config?.thumb_radius ?? "22px",

      // hold
      hold_duration: Number(config?.hold_duration ?? 800),

      // optional color overrides
      on_color: config?.on_color ?? null,
      off_color: config?.off_color ?? null,
      unavailable_color: config?.unavailable_color ?? null,
      unknown_color: config?.unknown_color ?? null
    };
  }

  get stateObj() {
    const id = (this.config?.entity ?? "").trim();
    if (!id) return null;
    return this.hass?.states?.[id] ?? null;
  }

  get _domain() {
    return (this.config.entity || "").split(".")[0] || "";
  }

  get _isOn() {
    return this.stateObj?.state === "on";
  }

  get _hasEntity() {
    return !!(this.config?.entity && this.config.entity.trim().length);
  }

  /* ================= NAME ================= */

  _getName() {
    if (!this._hasEntity) return this.config.name ?? "Select entity";
    if (!this.stateObj) return this.config.name ?? "";
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
    if (!this._hasEntity) return "var(--warning-color)";
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
    if (!this._hasEntity || !this.stateObj) return "var(--secondary-text-color)";

    const attrs = this.stateObj.attributes || {};
    if (!this._isOn) return "var(--secondary-text-color)";

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

  /* ================= ICON ================= */

  _renderIcon(iconColor) {
    if (this.config.hide_icon) return "";

    // User override
    if (this.config.icon) {
      return html`
        <ha-icon
          icon="${this.config.icon}"
          style="color:${iconColor}"
        ></ha-icon>
      `;
    }

    // Placeholder
    if (!this._hasEntity) {
      return html`
        <ha-icon
          icon="mdi:help-circle-outline"
          style="color:${iconColor}"
        ></ha-icon>
      `;
    }

    // Use HA computed state icon (matches core & button-card behavior)
    if (customElements.get("ha-state-icon") && this.stateObj) {
      return html`
        <ha-state-icon
          .hass=${this.hass}
          .stateObj=${this.stateObj}
          style="color:${iconColor}"
        ></ha-state-icon>
      `;
    }

    // Fallback
    if (this.stateObj?.attributes?.icon) {
      return html`
        <ha-icon
          icon="${this.stateObj.attributes.icon}"
          style="color:${iconColor}"
        ></ha-icon>
      `;
    }

    const d = this._domain;
    const fallback =
      d === "light"
        ? "mdi:lightbulb"
        : d === "fan"
        ? "mdi:fan"
        : d === "switch"
        ? "mdi:toggle-switch"
        : "mdi:power";

    return html`
      <ha-icon icon="${fallback}" style="color:${iconColor}"></ha-icon>
    `;
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
    if (!this._hasEntity) return;

    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId: this.config.entity },
        bubbles: true,
        composed: true
      })
    );
  }

  _onPointerDown() {
    if (!this.stateObj) return;

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
    if (!this.stateObj) return;
    if (!this._held) this._toggle();
  }

  _onPointerLeave() {
    clearTimeout(this._holdTimer);
  }

  /* ================= RENDER ================= */

  render() {
    const align = this.config?.name_align ?? "none";
    const nameFirst = align === "top" || align === "left";

    const activeColor = this._getActiveColor();
    const iconColor = this._getIconColor();
    const isOn = this._isOn;

    // Edge-flush padding with micro-inset
    const padL = align === "left" ? "2px" : "var(--card-pad)";
    const padR = align === "right" ? "2px" : "var(--card-pad)";
    const padT = align === "top" ? "1px" : "var(--card-pad)";
    const padB = align === "bottom" ? "2px" : "var(--card-pad)";

    const cardVars = `
      --track-width:${this.config.track_width};
      --toggle-gap:${this.config.toggle_gap};
      --track-radius:${this.config.track_radius};
      --thumb-radius:${this.config.thumb_radius};
      --icon-size:${this.config.icon_size};
      --active-color:${activeColor};

      --pad-l:${padL};
      --pad-r:${padR};
      --pad-t:${padT};
      --pad-b:${padB};
    `;

    const placeholder = !this._hasEntity || !this.stateObj;

    return html`
      <ha-card class="root ${placeholder ? "placeholder" : ""}" style="${cardVars}">
        <div class="center">
          <div class="unit ${align}">
            ${nameFirst ? this._renderName() : ""}

            <div
              class="switch ${placeholder ? "disabled" : ""}"
              @pointerdown=${this._onPointerDown.bind(this)}
              @pointerup=${this._onPointerUp.bind(this)}
              @pointerleave=${this._onPointerLeave.bind(this)}
              @contextmenu=${(e) => {
                e.preventDefault();
                this._moreInfo();
              }}
            >
              <div class="track ${isOn ? "on" : ""} ${placeholder ? "unknown" : ""}">
                <div class="thumb ${isOn ? "on" : "off"} ${placeholder ? "unknown" : ""}">
                  ${this._renderIcon(iconColor)}
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
      padding-top: var(--pad-t, var(--card-pad));
      padding-bottom: var(--pad-b, var(--card-pad));
      padding-left: var(--pad-l, var(--card-pad));
      padding-right: var(--pad-r, var(--card-pad));
      box-sizing: border-box;

      width: fit-content;
      max-width: 100%;
      overflow: visible;

      max-height: calc(
        (var(--track-width) * 2) +
        var(--name-height) +
        var(--unit-gap) +
        (var(--card-pad) * 2)
      );

      max-inline-size: calc(
        var(--track-width) +
        var(--side-name-width) +
        var(--unit-gap) +
        var(--pad-l, var(--card-pad)) +
        var(--pad-r, var(--card-pad))
      );
    }

    .center {
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: visible;
    }

    .unit {
      display: inline-flex;
      justify-content: center;
      gap: var(--unit-gap);
      align-items: center;
      width: max-content;
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

    .switch.disabled {
      cursor: default;
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

    .track.unknown {
      background: color-mix(
        in srgb,
        var(--warning-color) 18%,
        var(--state-inactive-color)
      );
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

    .thumb.unknown {
      background: color-mix(
        in srgb,
        var(--warning-color) 28%,
        var(--disabled-text-color)
      );
    }

    ha-icon,
    ha-state-icon {
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
  description:
    "Vertical toggle for Lights, Switches, and Fans. Press and hold toggle for more-info-card popup"
});

console.info(
  `%cVERTICAL-TOGGLE-CARD ${VERSION} LOADED`,
  "color:#03a9f4;font-weight:bold"
);
