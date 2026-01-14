# Vertical Toggle Card

A vertical toggle card for **Lights, Switches, and Fans**.

Press and hold the toggle to open the **more-info-card popup**.

---

## Features

- Vertical 2:1 ratio toggle
- Works with **light**, **switch**, and **fan** domains
- Press & hold for Home Assistant more-info popup
- Optional name placement (top / bottom / left / none)
- Fully theme-aware
- Mobile safe
- Editor UI included

---

## Installation

### HACS (Recommended)

1. Open **HACS**
2. Go to **Frontend**
3. Click the three dots → **Custom repositories**
4. Add this repository URL
   - Category: **Frontend**
5. Install **Vertical Toggle Card**
6. Restart Home Assistant

### Manual Installation

1. Copy the files from `/dist` into:
   ```
   config/www/vertical-toggle-card/
   ```
2. Add the resource:
   ```yaml
   resources:
     - url: /local/vertical-toggle-card/vertical-toggle-card.js
       type: module
   ```
3. Restart Home Assistant

---

## Usage

```yaml
type: custom:vertical-toggle-card
entity: light.living_room
```

---

## Configuration Options

| Option | Default | Description |
|------|--------|-------------|
| `entity` | required | Light, switch, or fan entity |
| `name` | null | Optional display name |
| `name_align` | none | none / top / bottom / left |
| `icon` | null | Custom icon (mdi:*) |
| `icon_size` | 80px | Icon size |
| `track_width` | 110px | Toggle width |
| `toggle_gap` | 5px | Gap between toggle and thumb |

---

## Notes

- If `name_align` is set to `none`, the name is hidden.
- Leaving `name` empty uses the entity's friendly name.

---

## Support

Please open an issue on GitHub for bugs or feature requests.

