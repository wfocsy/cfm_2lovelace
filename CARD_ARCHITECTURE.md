# 🎨 CFM Manager Card - Architektúra Terv

**Verzió:** v2.0.0 (FÁZIS 1 KÉSZ ✅)
**Jelenlegi:** v1.0.1 (Teszt kártya - deprecated)
**Következő:** v2.1.0 (Fázis 2: PRE-START UI)

---

## 🎯 CÉL: Production-Ready Lovelace Card

### Követelmények

1. **YAML-mentes működés** - Minden automatikus (07:00 napi mentés)
2. **Dinamikus UI** - Cycle Manager választás dropdown-ból
3. **Többállapotú kártya** - Pre-start → Active → Closed
4. **Automatikus időzítők** - JavaScript-ben (NEM YAML!)
5. **Natív HA entitások** - sensor.manager_X_* használata

---

## 🗂️ FÁJL STRUKTÚRA (Tervezett)

```
HACS/
├── dist/
│   └── cfm-manager-card.js         # Compiled card (production)
├── src/                            # ÚJ - Fejlesztési source fájlok
│   ├── card-main.js                # Fő card osztály
│   ├── card-config.js              # Config editor
│   ├── states/                     # Állapotok
│   │   ├── pre-start-view.js       # "Ciklus Indítás" gomb
│   │   ├── active-cycle-view.js    # Aktív ciklus dashboard
│   │   └── closed-cycle-view.js    # Lezárt ciklus összefoglaló
│   ├── components/                 # UI komponensek
│   │   ├── cycle-start-form.js     # Ciklus indítás form
│   │   ├── daily-data-display.js   # Napi adatok megjelenítés
│   │   ├── shipping-modal.js       # Elszállítás popup
│   │   └── mortality-modal.js      # Elhullás popup
│   ├── services/                   # Backend kommunikáció
│   │   ├── ha-service-caller.js    # HA service call wrapper
│   │   └── scheduler.js            # Automatikus időzítők (07:00)
│   └── styles/
│       └── card-styles.js          # CSS styles
│
├── README.md                       # HACS dokumentáció
├── hacs.json                       # HACS metadata
└── info.md                         # HACS info oldal
```

---

## 🔄 CARD ÁLLAPOTOK (State Machine)

### 1️⃣ PRE-START (Várakozó)

**Feltétel:**
- `sensor.manager_X_cycle_status` = "waiting"
- NINCS aktív ciklus

**UI:**
```
┌─────────────────────────────────────┐
│  [MANAGER NÉV] - Ciklus Kezelő     │
├─────────────────────────────────────┤
│                                     │
│  Státusz: Várakozik ciklus indításra│
│                                     │
│  ┌───────────────────────────────┐ │
│  │   🐔 CIKLUS INDÍTÁS           │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Funkciók:**
- Gomb: "Ciklus Indítás" → Form megjelenítés (Fázis 2)
- Form mezők:
  - Betelepített darabszám (input)
  - Telepítés dátuma (date picker)
  - Fajta választás (dropdown: Ross 308, Cobb 500, stb.)
  - Fajta variáns (dropdown: vegyesivar, hím, nőstény)
- Service call: `cfm_manager.start_cycle` (manager_id, initial_count, start_date, breed)
- Validáció: minimum 100 db, jövőbeli dátum tiltása

---

### 2️⃣ ACTIVE CYCLE (Futó Ciklus)

**Feltétel:**
- `sensor.manager_X_cycle_status` = "active"
- Van aktív ciklus

**UI Fő Kártya:**
```
┌─────────────────────────────────────┐
│  [MANAGER NÉV] - [CYCLE_ID]        │
├─────────────────────────────────────┤
│  Kor: [X] nap  │  Állomány: [Y] db │
│  Fajta: [BREED NAME + VARIANT]     │
├─────────────────────────────────────┤
│                                     │
│  Súly: [SENSOR WEIGHT]             │
│  FCR: [CALCULATED FCR]             │
│  Takarmány: [FEED CONSUMED]        │
│  Elhullás: [MORTALITY COUNT]       │
│                                     │
├─────────────────────────────────────┤
│  🚚 Elszállítás  💀 Elhullás        │
│  📊 Ciklus Lezárás                  │
│                                     │
│  ⏰ Következő mentés: holnap 07:00 │
└─────────────────────────────────────┘
```

**Megjelenített Adatok:**
- **Kor:** `sensor.manager_X_cycle_age` (napok száma)
- **Állomány:** `sensor.manager_X_current_stock` (jelenlegi darabszám)
- **Fajta:** `sensor.manager_X_breed_name` + variáns
- **Súly:** [ENTITÁS KÉSŐBB KIVÁLASZTVA] - átlagsúly gramm
- **FCR:** `sensor.manager_X_fcr` (halmozott takarmány / súlygyarapodás)
- **Takarmány:** [ENTITÁS KÉSŐBB KIVÁLASZTVA] - napi fogyasztás kg
- **Elhullás:** `sensor.manager_X_total_mortality` (halmozott elhullás db + %)

**Gombok:**
1. **🚚 Elszállítás** → Modal megnyitás (Fázis 3)
   - Input: Darabszám (max: jelenlegi állomány)
   - Input: Átlagsúly (opcionális)
   - Service: `cfm_manager.record_shipping`

2. **💀 Elhullás** → Modal megnyitás (Fázis 3)
   - Input: Darabszám
   - Input: Ok (dropdown: betegség, hirtelen pusztulás, sérülés, stb.)
   - Service: `cfm_manager.record_mortality`

3. **📊 Ciklus Lezárás** → Megerősítő dialog (Fázis 3)
   - Figyelmeztetés: "Biztosan lezárod? Ez visszavonhatatlan!"
   - Service: `cfm_manager.close_cycle`

**Automatikus Funkciók (Fázis 4):**
- **Napi mentés (07:00):**
  - Beolvassa: [SÚLY ENTITÁS]
  - Beolvassa: [SILÓ ENTITÁS] (előző/jelenlegi siló súly)
  - Számítja: feed_consumed = előző_siló - jelenlegi_siló
  - Service call: `cfm_manager.record_daily_data`
  - Notification: "Napi adat mentve (MSZ/2025/001, 15. nap)!"

**Real-time Frissítés:**
- Sensor poll: 30 másodperc (vagy HA event subscription)
- Dinamikus FCR/állomány frissítés elszállítás/elhullás után

---

### 3️⃣ CLOSED CYCLE (Lezárt)

**Feltétel:**
- `sensor.manager_X_cycle_status` = "completed"
- Ciklus lezárva

**UI:**
```
┌─────────────────────────────────────┐
│  [MANAGER NÉV] - [CYCLE_ID]        │
│  ✅ Lezárt ciklus                   │
├─────────────────────────────────────┤
│  Időtartam: [X] nap                 │
│  Végső állomány: [Y] db             │
│  Végső súly: [Z] g                  │
│  Végső FCR: [FCR]                   │
│  Elszállítás: [SHIPPED] db          │
│  Elhullás: [DEAD] db ([%])         │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   🐔 ÚJ CIKLUS INDÍTÁS        │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Megjelenített Adatok:**
- **Időtartam:** `sensor.manager_X_cycle_duration` (napok)
- **Végső állomány:** `sensor.manager_X_final_stock`
- **Végső súly:** `sensor.manager_X_final_weight`
- **Végső FCR:** `sensor.manager_X_final_fcr`
- **Elszállítás:** `sensor.manager_X_total_shipped`
- **Elhullás:** `sensor.manager_X_total_mortality` (db + %)

**Funkciók:**
- Gomb: "Új Ciklus Indítás" → Visszaállás PRE-START állapotra
- Service call: `cfm_manager.reset_manager` (manager_id)

---

## 🛠️ IMPLEMENTÁCIÓ TERV

### Fázis 1: Card Alapok (v2.0.0) ✅ KÉSZ

**Feladatok:**
- [x] `src/card-main.js` - Fő card osztály
- [x] `src/card-config.js` - Config editor (Manager választás)
- [x] State machine implementálás (3 állapot)
- [x] Sensor értékek beolvasása (hass.states)
- [x] `dist/cfm-manager-card-v2.js` - Production build

**Megvalósítva:** 2025-10-20
**Fájlok:**
- `src/card-main.js` (CfmManagerCard osztály)
- `src/card-config.js` (CfmManagerCardEditor osztály)
- `src/styles/card-styles.js` (CSS styles)
- `dist/cfm-manager-card-v2.js` (Production - 1 fájl, inline styles)

---

### Fázis 2: PRE-START UI (v2.1.0) ⏳ KÖVETKEZIK

**Feladatok:**
- [ ] "Ciklus Indítás" gomb megjelenítése (PRE-START állapotban)
- [ ] Form modal implementálása (kattintásra megnyílik)
- [ ] Form mezők:
  - [ ] Betelepített darabszám (number input, min: 100)
  - [ ] Telepítés dátuma (date picker, max: ma)
  - [ ] Fajta választás (dropdown - backend API: `GET /api/breed-standards/breeds`)
  - [ ] Fajta variáns (dropdown - backend API: `GET /api/breed-standards/breeds/{name}`)
- [ ] Validációk:
  - [ ] Darabszám >= 100
  - [ ] Dátum <= mai nap
  - [ ] Kötelező mezők ellenőrzése
- [ ] Service call implementálása:
  ```javascript
  this.hass.callService('cfm_manager', 'start_cycle', {
    manager_id: this.config.manager_id,
    initial_count: parseInt(formData.count),
    start_date: formData.date,
    breed: formData.breed,
    variant: formData.variant
  });
  ```
- [ ] Sikeres indítás után: Form bezárása + Card frissítés (ACTIVE állapot)
- [ ] Hibaüzenet megjelenítése sikertelen indítás esetén

**Időigény:** 2-3 óra

**Megjegyzés:**
- Fajtalistát dinamikusan töltjük a backend API-ból (`/api/breed-standards/breeds`)
- Variánsok breed kiválasztása után töltődnek (`/api/breed-standards/breeds/{name}`)

---

### Fázis 3: ACTIVE CYCLE UI - Modalok (v2.2.0)

**Feladatok:**

#### 3.1 Elszállítás Modal
- [ ] "🚚 Elszállítás" gomb megjelenítése (ACTIVE állapotban)
- [ ] Modal popup implementálása
- [ ] Form mezők:
  - [ ] Darabszám (number input, max: `sensor.manager_X_current_stock`)
  - [ ] Átlagsúly (number input, opcionális - gramm)
- [ ] Validációk:
  - [ ] Darabszám > 0 ÉS <= jelenlegi állomány
  - [ ] Átlagsúly > 0 (ha megadva)
- [ ] Service call:
  ```javascript
  this.hass.callService('cfm_manager', 'record_shipping', {
    cycle_id: this.cycleId,
    count: parseInt(formData.count),
    average_weight: formData.weight ? parseInt(formData.weight) : null
  });
  ```
- [ ] Sikeres mentés után: Modal bezárása + Card frissítés (állomány csökken)

#### 3.2 Elhullás Modal
- [ ] "💀 Elhullás" gomb megjelenítése (ACTIVE állapotban)
- [ ] Modal popup implementálása
- [ ] Form mezők:
  - [ ] Darabszám (number input, max: `sensor.manager_X_current_stock`)
  - [ ] Ok (dropdown: "Betegség", "Hirtelen pusztulás", "Sérülés", "Egyéb")
- [ ] Validációk:
  - [ ] Darabszám > 0 ÉS <= jelenlegi állomány
- [ ] Service call:
  ```javascript
  this.hass.callService('cfm_manager', 'record_mortality', {
    cycle_id: this.cycleId,
    count: parseInt(formData.count),
    reason: formData.reason
  });
  ```
- [ ] Sikeres mentés után: Modal bezárása + Card frissítés (állomány csökken, mortality nő)

#### 3.3 Ciklus Lezárás Dialog
- [ ] "📊 Ciklus Lezárás" gomb megjelenítése (ACTIVE állapotban)
- [ ] Megerősítő dialog implementálása:
  - Cím: "Ciklus lezárása"
  - Üzenet: "Biztosan lezárod a ciklust? Ez a művelet visszavonhatatlan!"
  - Gombok: "Mégse" | "Lezárás"
- [ ] Service call (csak "Lezárás" gombra):
  ```javascript
  this.hass.callService('cfm_manager', 'close_cycle', {
    cycle_id: this.cycleId
  });
  ```
- [ ] Sikeres lezárás után: Card frissítés (CLOSED állapot)

**Időigény:** 3-4 óra

---

### Fázis 4: Automatikus Időzítő (v2.3.0)

**Feladatok:**
- [ ] Napi időzítő implementálása (07:00 default, config-ban testreszabható)
- [ ] Időzítő indítása card betöltésekor (csak ACTIVE állapotnál)
- [ ] Sensor értékek beolvasása trigger időpontban:
  - [ ] Súly sensor: [CONFIG-BAN MEGADOTT ENTITÁS]
  - [ ] Siló sensor: [CONFIG-BAN MEGADOTT ENTITÁS]
  - [ ] Előző napi siló súly lekérése (history API vagy mentett érték)
- [ ] Takarmány fogyasztás számítása:
  ```javascript
  const feedConsumed = previousSiloWeight - currentSiloWeight;
  ```
- [ ] Service call:
  ```javascript
  this.hass.callService('cfm_manager', 'record_daily_data', {
    cycle_id: this.cycleId,
    date: new Date().toISOString().split('T')[0],
    average_weight: weightSensor.state,
    feed_consumed: feedConsumed
  });
  ```
- [ ] Sikeres mentés után: Push notification megjelenítése
  ```javascript
  this.hass.callService('notify', 'persistent_notification', {
    title: 'CFM Manager',
    message: `Napi adat mentve (${this.cycleId}, ${this.cycleAge}. nap)!`
  });
  ```
- [ ] Következő mentés időpontjának megjelenítése a kártyán:
  ```
  ⏰ Következő mentés: holnap 07:00
  ```

**Scheduler logika:**
```javascript
class DailyScheduler {
  constructor(hass, config, cycleId) {
    this.hass = hass;
    this.config = config;
    this.cycleId = cycleId;
    this.timerId = null;
  }

  start() {
    const targetHour = this.config.daily_save_time || "07:00";
    const [hour, minute] = targetHour.split(':').map(Number);

    const now = new Date();
    const target = new Date();
    target.setHours(hour, minute, 0, 0);

    // Ha már elmúlt ma, akkor holnapra ütemezzük
    if (now > target) {
      target.setDate(target.getDate() + 1);
    }

    const timeout = target - now;

    this.timerId = setTimeout(() => {
      this.recordDailyData();
      this.start(); // Újraindítjuk a következő napra
    }, timeout);
  }

  stop() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  async recordDailyData() {
    try {
      // Szenzorok beolvasása
      const weightEntity = this.config.weight_entity_id;
      const siloEntity = this.config.silo_entity_id;

      const weight = this.hass.states[weightEntity]?.state;
      const currentSilo = this.hass.states[siloEntity]?.state;

      // Előző napi siló súly (localStorage vagy History API)
      const previousSilo = localStorage.getItem(`cfm_silo_${this.cycleId}`) || 0;
      const feedConsumed = parseFloat(previousSilo) - parseFloat(currentSilo);

      // Service call
      await this.hass.callService('cfm_manager', 'record_daily_data', {
        cycle_id: this.cycleId,
        date: new Date().toISOString().split('T')[0],
        average_weight: parseFloat(weight),
        feed_consumed: feedConsumed
      });

      // Siló súly mentése holnapra
      localStorage.setItem(`cfm_silo_${this.cycleId}`, currentSilo);

      // Notification
      this.showNotification();
    } catch (error) {
      console.error('Daily data save failed:', error);
    }
  }

  showNotification() {
    const cycleAge = this.getCycleAge(); // Sensor-ból
    this.hass.callService('notify', 'persistent_notification', {
      title: 'CFM Manager - Napi Adat',
      message: `Adatok sikeresen mentve (${this.cycleId}, ${cycleAge}. nap)!`
    });
  }

  getCycleAge() {
    const ageEntity = `sensor.manager_${this.config.manager_id}_cycle_age`;
    return this.hass.states[ageEntity]?.state || 0;
  }
}
```

**Config bővítés (Fázis 5):**
```yaml
type: custom:cfm-manager-card
manager_id: 1
daily_save_time: "07:00"           # Testreszabható időpont
weight_entity_id: sensor.bird_scale_weight  # Súly sensor (user választ)
silo_entity_id: sensor.silo_weight_1       # Siló sensor (user választ)
show_notifications: true           # Értesítések be/ki
```

**Időigény:** 3-4 óra

---

### Fázis 5: Config Editor Bővítés (v2.4.0)

**Feladatok:**
- [ ] Config Editor UI bővítése (már létezik `card-config.js`-ben)
- [ ] Manager ID választás (dropdown) ✅ MÁR KÉSZ (v2.0.0)
- [ ] ÚJ mezők hozzáadása:
  - [ ] **Napi mentés időpont** (time picker, default: "07:00")
  - [ ] **Súly sensor** (entity picker - csak sensor.* típusú entitások)
  - [ ] **Siló sensor** (entity picker - csak sensor.* típusú entitások)
  - [ ] **Értesítések** (toggle switch, default: true)
  - [ ] **Debug mód** (toggle switch, default: false)

**Config Editor UI:**
```
┌─────────────────────────────────────┐
│  CFM Manager Card - Beállítások    │
├─────────────────────────────────────┤
│  Manager ID: [dropdown: 1, 2, 3...] │
│                                     │
│  Napi mentés időpont: [07:00] ⏰   │
│                                     │
│  Súly sensor: [entity picker] 🐔   │
│  Siló sensor: [entity picker] 🌾   │
│                                     │
│  Értesítések: [x] BE               │
│  Debug mód:   [ ] KI               │
└─────────────────────────────────────┘
```

**Config objektum (YAML):**
```yaml
type: custom:cfm-manager-card
manager_id: 1                            # REQUIRED
daily_save_time: "07:00"                 # Testreszabható (HH:MM formátum)
weight_entity_id: sensor.bird_scale_avg  # User választja (entity picker)
silo_entity_id: sensor.silo_weight_1     # User választja (entity picker)
show_notifications: true                 # Értesítések be/ki
show_debug: false                        # Debug console.log-ok be/ki
```

**Entity Picker Implementáció:**
```javascript
// card-config.js bővítése
static get properties() {
  return {
    hass: {},
    config: {}
  };
}

render() {
  return html`
    <div class="card-config">
      <!-- Manager ID dropdown (már létezik) -->
      <ha-select
        label="Manager ID"
        .value="${this.config.manager_id}"
        @selected="${this._managerChanged}">
        ${this.getManagerOptions()}
      </ha-select>

      <!-- ÚJ: Napi mentés időpont -->
      <ha-textfield
        type="time"
        label="Napi mentés időpont"
        .value="${this.config.daily_save_time || '07:00'}"
        @change="${this._timeChanged}">
      </ha-textfield>

      <!-- ÚJ: Súly sensor -->
      <ha-entity-picker
        label="Súly sensor (átlagsúly mérés)"
        .hass="${this.hass}"
        .value="${this.config.weight_entity_id}"
        .includeDomains="${['sensor']}"
        @value-changed="${this._weightEntityChanged}">
      </ha-entity-picker>

      <!-- ÚJ: Siló sensor -->
      <ha-entity-picker
        label="Siló sensor (takarmány súly)"
        .hass="${this.hass}"
        .value="${this.config.silo_entity_id}"
        .includeDomains="${['sensor']}"
        @value-changed="${this._siloEntityChanged}">
      </ha-entity-picker>

      <!-- ÚJ: Értesítések toggle -->
      <ha-switch
        .checked="${this.config.show_notifications !== false}"
        @change="${this._notificationToggled}">
        Értesítések engedélyezése
      </ha-switch>

      <!-- ÚJ: Debug toggle -->
      <ha-switch
        .checked="${this.config.show_debug === true}"
        @change="${this._debugToggled}">
        Debug mód
      </ha-switch>
    </div>
  `;
}

_timeChanged(ev) {
  this._updateConfig({ daily_save_time: ev.target.value });
}

_weightEntityChanged(ev) {
  this._updateConfig({ weight_entity_id: ev.detail.value });
}

_siloEntityChanged(ev) {
  this._updateConfig({ silo_entity_id: ev.detail.value });
}

_notificationToggled(ev) {
  this._updateConfig({ show_notifications: ev.target.checked });
}

_debugToggled(ev) {
  this._updateConfig({ show_debug: ev.target.checked });
}

_updateConfig(updates) {
  this.config = { ...this.config, ...updates };
  const event = new CustomEvent('config-changed', {
    detail: { config: this.config },
    bubbles: true,
    composed: true
  });
  this.dispatchEvent(event);
}
```

**Időigény:** 2-3 óra

---

### Fázis 6: Build & HACS Deploy (v2.5.0)

**Feladatok:**
- [ ] Build script (rollup.js vagy webpack)
- [ ] Source fájlok összecsomagolása → dist/cfm-manager-card.js
- [ ] Minification (production build)
- [ ] HACS release (GitHub tag)

**Időigény:** 1 óra

---

## 📦 ÖSSZEFOGLALÓ

### Fázisok Időigénye
| Fázis | Verzió | Funkció | Időigény | Státusz |
|-------|--------|---------|----------|---------|
| 1 | v2.0.0 | Card alapok, state machine | 3 óra | ✅ KÉSZ |
| 2 | v2.1.0 | PRE-START UI, ciklus indítás form | 2-3 óra | ⏳ KÖVETKEZIK |
| 3 | v2.2.0 | ACTIVE UI, modalok (elszállítás, elhullás, lezárás) | 3-4 óra | 📋 TODO |
| 4 | v2.3.0 | Automatikus időzítő (napi mentés) | 3-4 óra | 📋 TODO |
| 5 | v2.4.0 | Config editor bővítés (entity pickers) | 2-3 óra | 📋 TODO |
| 6 | v2.5.0 | Build & HACS deploy | 1 óra | 📋 TODO |

**Összes időigény:** 14-18 óra

### Végeredmény Funkciók
- ✅ Production-ready Lovelace card
- ✅ YAML-mentes működés (automatikus napi mentés 07:00)
- ✅ Dinamikus UI (3 állapot: PRE-START → ACTIVE → CLOSED)
- ✅ Natív HA entitások használata (szenzorok beolvasása)
- ✅ Teljes ciklus kezelés (indítás, elszállítás, elhullás, lezárás)
- ✅ Konfiguráció Lovelace UI-ban (entity pickers, időpont, értesítések)

---

## 🔧 TECHNIKAI RÉSZLETEK

### Service Calls (CFM Manager Backend)
A card az alábbi Home Assistant service-eket hívja:

1. **Ciklus indítás:**
   ```yaml
   service: cfm_manager.start_cycle
   data:
     manager_id: 1
     initial_count: 5000
     start_date: "2025-10-20"
     breed: "Ross 308"
     variant: "vegyesivar"
   ```

2. **Napi adat mentés:**
   ```yaml
   service: cfm_manager.record_daily_data
   data:
     cycle_id: "MSZ/2025/001"
     date: "2025-10-21"
     average_weight: 2450
     feed_consumed: 450
   ```

3. **Elszállítás:**
   ```yaml
   service: cfm_manager.record_shipping
   data:
     cycle_id: "MSZ/2025/001"
     count: 500
     average_weight: 3200
   ```

4. **Elhullás:**
   ```yaml
   service: cfm_manager.record_mortality
   data:
     cycle_id: "MSZ/2025/001"
     count: 25
     reason: "Betegség"
   ```

5. **Ciklus lezárás:**
   ```yaml
   service: cfm_manager.close_cycle
   data:
     cycle_id: "MSZ/2025/001"
   ```

6. **Manager reset (új ciklus indításhoz):**
   ```yaml
   service: cfm_manager.reset_manager
   data:
     manager_id: 1
   ```

### Sensor Entitások (Backend által publikált)
A card az alábbi szenzorokból olvassa az adatokat:

**Ciklus Státusz Szenzorok:**
- `sensor.manager_X_cycle_status` - "waiting" | "active" | "completed"
- `sensor.manager_X_cycle_id` - pl. "MSZ/2025/001"
- `sensor.manager_X_cycle_age` - napok száma (int)

**Állomány Szenzorok:**
- `sensor.manager_X_current_stock` - jelenlegi darabszám
- `sensor.manager_X_initial_stock` - kezdő darabszám
- `sensor.manager_X_total_shipped` - összes elszállított (db)
- `sensor.manager_X_total_mortality` - összes elhullás (db + %)

**Teljesítmény Szenzorok:**
- `sensor.manager_X_fcr` - halmozott FCR (feed conversion ratio)
- `sensor.manager_X_breed_name` - fajta neve
- `sensor.manager_X_final_weight` - végső átlagsúly (lezárt ciklusnál)
- `sensor.manager_X_cycle_duration` - időtartam napokban (lezárt ciklusnál)
- `sensor.manager_X_final_fcr` - végső FCR (lezárt ciklusnál)

**User által választott szenzorok (config-ban megadva):**
- `config.weight_entity_id` - átlagsúly mérés (pl. `sensor.bird_scale_avg`)
- `config.silo_entity_id` - siló súlymérő (pl. `sensor.silo_weight_1`)

---

## 🚀 KÖVETKEZŐ LÉPÉS: Fázis 2

**Fázis 2 (v2.1.0):** PRE-START UI - Ciklus Indítás Form

**Feladatok:**
1. "Ciklus Indítás" gomb hozzáadása PRE-START állapothoz
2. Modal form implementálása (betelepített db, dátum, fajta, variáns)
3. Fajta lista API hívás (`/api/breed-standards/breeds`)
4. Service call: `cfm_manager.start_cycle`
5. Form validációk (min 100 db, max mai dátum)
6. Sikeres indítás után card frissítés (ACTIVE állapot)

**Elkezdés:**
```bash
# Nyisd meg a fájlokat:
- HACS/CARD_ARCHITECTURE.md (ez a fájl)
- HACS/src/card-main.js (card osztály)
- HACS/src/card-config.js (config editor)

# Kezdd el a Fázis 2-t:
- Új modal komponens létrehozása
- Form UI implementálása
- API integráció (breed lista)
```

---

**Verzió:** v2.0.0 (Fázis 1 KÉSZ ✅)
**Utolsó frissítés:** 2025-10-20
**Állapot:**
- ✅ Fázis 1 befejezve (Card alapok, state machine, config editor)
- ⏳ Fázis 2 következik (PRE-START UI, ciklus indítás form)

**Tesztelés (v2.0.0):**
1. Másold a `dist/cfm-manager-card-v2.js` fájlt HA-ba (`www/community/cfm-manager-card/`)
2. Adj hozzá kártyát Lovelace-ben: `type: custom:cfm-manager-card`, `manager_id: 1`
3. Ellenőrizd a state machine működését (PRE-START/ACTIVE/CLOSED)
4. Config editor működik-e (Manager ID választás)

**Entitások kiválasztása:**
- A konkrét sensor entitásokat a user választja ki a Config Editor-ban (Fázis 5)
- Entity picker dropdown listázza az összes `sensor.*` entitást
- A card a config-ban megadott entitásokat használja a napi mentéshez
