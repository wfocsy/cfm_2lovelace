# CFM Manager Card - Source Files

**Verzió:** v2.0.0 (Fázis 1)

---

## 📂 Fájlok

### `card-main.js` (579 sor)
**Fő card osztály** - `CfmManagerCard`

**Funkciók:**
- State machine (PRE-START, ACTIVE, CLOSED, UNKNOWN)
- Sensor beolvasás (`hass.states`)
- Dinamikus UI renderelés
- Event handlers (placeholder)

**Metódusok:**
- `setConfig(config)` - Konfiguráció beállítás
- `set hass(hass)` - HA objektum fogadás
- `_updateState()` - State machine logika
- `_getSensorValue(entity_id)` - Sensor érték lekérés
- `_render()` - UI renderelés
- `_renderPreStart()`, `_renderActiveCycle()`, `_renderClosedCycle()`, `_renderUnknown()`
- `_handleStartCycle()`, `_handleShipping()`, `_handleMortality()`, `_handleCloseCycle()`

---

### `card-config.js` (355 sor)
**Config editor osztály** - `CfmManagerCardEditor`

**Funkciók:**
- Manager választás dropdown
- Napi mentés időpont (time input)
- Értesítések be/ki (checkbox)
- Debug mód (checkbox)

**Metódusok:**
- `setConfig(config)` - Konfiguráció beállítás
- `set hass(hass)` - HA objektum fogadás
- `_getAvailableManagers()` - Manager lista lekérés
- `_render()` - Config UI renderelés
- `_attachEventListeners()` - Event listener-ek csatolás
- `_updateConfig(key, value)` - Konfiguráció frissítés

---

### `styles/card-styles.js` (459 sor)
**CSS styles**

**Exported functions:**
- `getCardStyles()` - Card CSS
- `getConfigStyles()` - Config editor CSS

**Stílusok:**
- Responsive grid (metrics, info rows)
- Button styles (primary, secondary, danger)
- Status badges (waiting, completed, error)
- Animations (fadeIn, hover effects)
- Mobile responsiveness (< 600px)

---

## 🔨 Build Process

**Moduláris fejlesztés:**
```
src/
├── card-main.js         (579 sor)
├── card-config.js       (355 sor)
└── styles/
    └── card-styles.js   (459 sor)
────────────────────────────────
ÖSSZESEN:                1393 sor
```

**Production build:**
```bash
# Manuális concat (egyszerűbb mint rollup/webpack)
dist/cfm-manager-card-v2.js  (917 sor)
```

**Build eredmény:**
- Inline styles (nem külső CSS)
- Egyetlen fájl (nincs dependency)
- Minimális méret (~38KB)

---

## 🚀 Használat

### Development
```javascript
// Import modules (ha támogatott)
import { CfmManagerCard } from './src/card-main.js';
import { CfmManagerCardEditor } from './src/card-config.js';
```

### Production
```html
<!-- Csak egyetlen fájl szükséges -->
<script src="/local/community/cfm-manager-card/cfm-manager-card-v2.js"></script>
```

---

## 📋 TODO (Következő fázisok)

### Fázis 2: PRE-START UI
- [ ] `components/cycle-start-form.js` - Ciklus indítás form
- [ ] Service call: `cfm_manager.start_cycle`
- [ ] Validációk

### Fázis 3: ACTIVE CYCLE UI
- [ ] `components/shipping-modal.js` - Elszállítás popup
- [ ] `components/mortality-modal.js` - Elhullás popup
- [ ] Service calls (shipping, mortality, close_cycle)

### Fázis 4: Automatikus Időzítő
- [ ] `services/scheduler.js` - Napi időzítő (07:00)
- [ ] `services/ha-service-caller.js` - HA service wrapper
- [ ] Push notification

### Fázis 5: Build & Deploy
- [ ] Rollup/Webpack konfiguráció
- [ ] Minification
- [ ] HACS release

---

**Státusz:** Fázis 1 KÉSZ ✅
**Következő:** Fázis 2 (PRE-START UI)
