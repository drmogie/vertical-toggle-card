## Vertical Toggle Card

A clean vertical toggle card for **Lights, Switches, and Fans**.

Designed for dashboards that need compact, touch-friendly controls with a modern vertical layout.

### Highlights

- Vertical 2:1 toggle design
- Press and hold for Home Assistant more-info popup
- Optional name positioning
- Theme-aware colors
- Mobile friendly
- Built-in editor UI

This card is distributed as a **HACS Frontend integration**.

# Vertical Toggle Card

A lightweight Home Assistant custom card providing a clean vertical toggle with
simple YAML configuration and touch-friendly interaction.

---

## Configuration

### Required

#### entity

The Home Assistant entity to control.

```yaml
entity: switch.example
```

---

## General Options

---

### name

Overrides the displayed name text.

Type: string  
Default: entity friendly name

```yaml
name: Bathroom Fan
```

---

### name_align

Controls text alignment for the name label.

Type: string  
Default: none

Allowed values:
- none
- left
- center
- right

```yaml
name_align: center
```

---

### icon

Overrides the icon shown on the toggle.

Type: string  
Default: entity icon

```yaml
icon: mdi:fan
```

---

### icon_size

Sets the icon size in pixels.

Type: number  
Default: 24

```yaml
icon_size: 28
```

---

### show_name

Controls whether the name label is displayed.

Type: boolean  
Default: true

```yaml
show_name: false
```

When disabled, only the toggle and icon are shown.

---

### track_width

Controls the width of the toggle track.

Type: number  
Default: 28

```yaml
track_width: 32
```

---

### hold_duration

Duration required to trigger a hold interaction.

Type: number  
Default: 500 (milliseconds)

```yaml
hold_duration: 800
```

Increasing this value helps prevent accidental activation on touch devices.

---

## Examples

---

### Basic usage

```yaml
type: custom:vertical-toggle-card
entity: switch.example
```

---

### Custom name with centered alignment

```yaml
type: custom:vertical-toggle-card
entity: fan.bathroom
name: Bathroom Fan
name_align: center
```

---

### Icon-only toggle

```yaml
type: custom:vertical-toggle-card
entity: light.vanity
show_name: false
icon: mdi:lightbulb
icon_size: 30
```

---

### Wider track and longer hold duration

```yaml
type: custom:vertical-toggle-card
entity: switch.garage
track_width: 36
hold_duration: 1000
```

---

## Notes

- All options are optional unless otherwise stated.
- Unspecified options fall back to Home Assistant defaults.
- hold_duration only applies if hold behavior is enabled in the card.
