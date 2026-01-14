# Vertical Toggle Card

A vertical toggle card for **Lights, Switches, and Fans**.

Press and hold the toggle to open the **Home Assistant more-info popup**.

---

## Badges

[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://hacs.xyz)
[![Minimum Home Assistant Version](https://img.shields.io/badge/Home%20Assistant-2023.6+-blue.svg)](https://www.home-assistant.io/)
[![Restart Required](https://img.shields.io/badge/Restart-Required-red.svg)](#installation)

---

## Features

- Vertical 2:1 ratio toggle
- Works with **light**, **switch**, and **fan** domains
- Press & hold for Home Assistant more-info popup
- Optional name placement (top / bottom / left / none)
- Edge-flush name alignment (no wasted space)
- Uses Home Assistant **computed state icons**
- Fully theme-aware
- Mobile safe
- Editor UI included

---

## Installation

### HACS (Recommended)

Install directly from HACS using the button below:

[![Open your Home Assistant instance and open the repository in HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](
https://my.home-assistant.io/redirect/hacs_repository/?owner=drmogie&repository=vertical-toggle-card&category=dashboard
)

#### Manual HACS steps (optional)
1. Open **HACS**
2. Go to **Frontend**
3. Open the three-dot menu (⋮) → **Custom repositories**
4. Add:
   - **Repository:** `https://github.com/drmogie/vertical-toggle-card`
   - **Category:** `Dashboard`
5. Install **Vertical Toggle Card**

---

### Add the Resource (Required)

After installing with HACS, add the Lovelace resource:

[![Open Home Assistant](https://my.home-assistant.io/badges/open_home_assistant.svg)](
https://my.home-assistant.io/redirect/lovelace_resources/
)

```yaml
resources:
  - url: /local/vertical-toggle-card/vertical-toggle-card.js
    type: module
