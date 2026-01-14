import { LitElement, html, css } from "https://unpkg.com/lit@2.8.0/index.js?module";

class VerticalToggleCardEditor extends LitElement {
  static properties = {
    hass: {},
    _config: {}
  };

  setConfig(config) {
    // Default name_align to "none"
    this._config = { name_align: "none", ...config };
  }

  /* ---------- helpers ---------- */

  _fire() {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true
      })
    );
  }

  _set(key, value) {
    const normalized = value === "" || value === undefined ? null : value;
    this._config = { ...this._config, [key]: normalized };
    this._fire();
  }

  _getEventValue(ev) {
    return ev?.detail?.value ?? ev?.target?.value ?? "";
  }

  _getIconSizeNumber() {
    const raw = this._config?.icon_size;
    if (raw == null) return 80;
    const n = parseInt(String(raw).replace("px", ""), 10);
    return Number.isFinite(n) ? n : 80;
  }

  _setIconSizeFromNumber(n) {
    if (!Number.isFinite(n)) return;
    const clamped = Math.min(200, Math.max(10, n));
    this._set("icon_size", `${clamped}px`);
  }

  _renderEntityPicker() {
    const entity = this._config?.entity ?? "";
    const hasEntityPicker = !!customElements.get("ha-entity-picker");

    if (hasEntityPicker) {
      return html`
        <ha-entity-picker
          class="full"
          label="Entity"
          .hass=${this.hass}
          .value=${entity}
          .configValue=${"entity"}
          .includeDomains=${["light", "switch", "fan"]}
          allow-custom-entity
          @value-changed=${(e) => this._set("entity", this._getEventValue(e))}
        ></ha-entity-picker>
      `;
    }

    // Fallback (rare)
    return html`
      <ha-textfield
        class="full"
        label="Entity"
        placeholder="light.kitchen / switch.garage / fan.bedroom"
        .value=${entity}
        @input=${(e) => this._set("entity", e.target.value)}
      ></ha-textfield>
    `;
  }

  _renderIconPicker() {
    const iconValue = this._config?.icon ?? "";
    const hasIconPicker = !!customElements.get("ha-icon-picker");

    if (hasIconPicker) {
      return html`
        <ha-icon-picker
          .hass=${this.hass}
          .value=${iconValue}
          @value-changed=${(e) => this._set("icon", this._getEventValue(e))}
        ></ha-icon-picker>
      `;
    }

    return html`
      <ha-textfield
        placeholder="mdi:fan"
        .value=${iconValue}
        @input=${(e) => this._set("icon", e.target.value)}
      ></ha-textfield>
    `;
  }

  _onAlignChange(e) {
    const value = this._getEventValue(e);
    const allowed = new Set(["none", "top", "bottom", "left"]);
    if (!allowed.has(value)) return;
    this._set("name_align", value);
  }

  /* ---------- render ---------- */

  render() {
    if (!this.hass) return html``;

    const name = this._config?.name ?? "";
    const align = this._config?.name_align ?? "none";

    return html`
      <div class="wrap">
        <!-- Entity -->
        ${this._renderEntityPicker()}

        <div class="sep"></div>

        <!-- Name -->
        <ha-textfield
          class="full"
          label="Name (optional)"
          placeholder="(blank = entity friendly_name)"
          .value=${name}
          @input=${(e) => this._set("name", e.target.value)}
        ></ha-textfield>

        <div class="sep"></div>

        <!-- Text Align -->
        <div class="block">
          <div class="label">Text align</div>
          <div class="radioRow">
            <ha-formfield label="None">
              <ha-radio
                name="name_align"
                value="none"
                .checked=${align === "none"}
                @change=${this._onAlignChange.bind(this)}
              ></ha-radio>
            </ha-formfield>

            <ha-formfield label="Top">
              <ha-radio
                name="name_align"
                value="top"
                .checked=${align === "top"}
                @change=${this._onAlignChange.bind(this)}
              ></ha-radio>
            </ha-formfield>

            <ha-formfield label="Bottom">
              <ha-radio
                name="name_align"
                value="bottom"
                .checked=${align === "bottom"}
                @change=${this._onAlignChange.bind(this)}
              ></ha-radio>
            </ha-formfield>

            <ha-formfield label="Left">
              <ha-radio
                name="name_align"
                value="left"
                .checked=${align === "left"}
                @change=${this._onAlignChange.bind(this)}
              ></ha-radio>
            </ha-formfield>
          </div>
        </div>

        <div class="sep"></div>

        <!-- Icon row: label | picker | size (single line) -->
        <div class="iconRow">
          <div class="iconRowLabel">Icon</div>

          <div class="iconPicker">
            ${this._renderIconPicker()}
          </div>

          <div class="iconSize">
            <ha-textfield
              label="Size (px)"
              type="number"
              inputmode="numeric"
              min="10"
              max="200"
              .value=${String(this._getIconSizeNumber())}
              @input=${(e) => {
                const n = parseInt(e.target.value, 10);
                if (!Number.isFinite(n)) return;
                this._setIconSizeFromNumber(n);
              }}
            ></ha-textfield>
          </div>
        </div>

        <!-- Centered hint under icon line -->
        <div class="iconHint">
          Icon size is saved as <code>px</code> automatically (e.g. <code>80px</code>).
        </div>
      </div>
    `;
  }

  static styles = css`
    .wrap {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .full {
      width: 100%;
      display: block;
    }

    .sep {
      height: 1px;
      background: var(--divider-color);
      opacity: 0.8;
      width: 100%;
      margin: 2px 0;
    }

    .label {
      font-size: 0.9rem;
      opacity: 0.9;
      white-space: nowrap;
    }

    .block {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .radioRow {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    /* Icon row: label | picker | size */
    .iconRow {
      display: grid;
      grid-template-columns: auto 13fr 5fr; /* ~65% / 25% */
      gap: 12px;
      align-items: center;
    }

    .iconRowLabel {
      font-size: 0.9rem;
      opacity: 0.9;
      white-space: nowrap;
    }

    .iconPicker,
    .iconSize {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .iconHint {
      text-align: center;
      font-size: 0.8rem;
      opacity: 0.7;
      line-height: 1.2;
    }

    code {
      font-family: monospace;
    }

    @media (max-width: 520px) {
      .iconRow {
        grid-template-columns: 1fr;
      }
      .iconRowLabel {
        margin-bottom: -6px;
      }
    }
  `;
}

customElements.define("vertical-toggle-card-editor", VerticalToggleCardEditor);
