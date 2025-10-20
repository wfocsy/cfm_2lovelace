# CFM Manager Card v2.0.0 - Tesztelési Útmutató

**Verzió:** v2.0.0 (Fázis 1)
**Létrehozva:** 2025-10-20

---

## 🎯 FÁZIS 1 TESZTELÉS

### Elkészült Funkciók

✅ **Card osztály** - `src/card-main.js`
- State machine (PRE-START, ACTIVE, CLOSED, UNKNOWN)
- Sensor beolvasás (hass.states)
- Dinamikus UI renderelés

✅ **Config editor** - `src/card-config.js`
- Manager választás dropdown
- Napi mentés időpont beállítás
- Értesítések be/ki
- Debug mód

✅ **Styles** - `src/styles/card-styles.js`
- Responsive CSS
- Animációk
- Gomb stílusok
- Metric grid

✅ **Production build** - `dist/cfm-manager-card-v2.js`
- Inline styles
- Egyetlen fájl
- Nincs külső dependency

---

## 📋 TESZTELÉSI LÉPÉSEK

### 1. Fájl Telepítés

**Home Assistant környezetben:**

```bash
# 1. Hozd létre a HACS mappát (ha még nincs)
mkdir -p /config/www/community/cfm-manager-card/

# 2. Másold a card fájlt
cp dist/cfm-manager-card-v2.js /config/www/community/cfm-manager-card/

# 3. Ellenőrizd a fájl létezését
ls -lh /config/www/community/cfm-manager-card/
```

### 2. Lovelace Resource Regisztráció

**Beállítások → Dashboards → Resources → Add Resource**

```yaml
URL: /local/community/cfm-manager-card/cfm-manager-card-v2.js
Resource type: JavaScript Module
```

**VAGY konfiguráció fájlban:**

```yaml
# configuration.yaml vagy lovelace YAML mode
lovelace:
  mode: yaml
  resources:
    - url: /local/community/cfm-manager-card/cfm-manager-card-v2.js
      type: module
```

### 3. Kártya Hozzáadása Dashboard-hoz

**Lovelace UI Editor módban:**

1. Dashboard → Edit
2. Add Card
3. Keresd meg: "CFM Manager Card"
4. Konfiguráld:
   - Manager ID: 1 (vagy meglévő manager ID)
   - Napi mentés: 07:00
   - Értesítések: ON
   - Debug: ON (teszteléshez)

**YAML módban:**

```yaml
type: custom:cfm-manager-card
manager_id: 1
daily_save_time: "07:00"
show_notifications: true
show_debug: true
```

---

## 🧪 TESZTELENDŐ FUNKCIÓK

### ✅ 1. State Machine

**Tesztelendő állapotok:**

| Állapot | Sensor Value | Elvárt UI |
|---------|--------------|-----------|
| **PRE-START** | `sensor.manager_1_cycle_status = "waiting"` | "Várakozik ciklus indításra" + Indítás gomb |
| **ACTIVE** | `sensor.manager_1_cycle_status = "active"` | Napi adatok + 3 gomb (Shipping, Mortality, Lezárás) |
| **CLOSED** | `sensor.manager_1_cycle_status = "completed"` | Összefoglaló + Új ciklus gomb |
| **UNKNOWN** | Sensor nem létezik | Hibaüzenet (piros) |

**Tesztelés:**

```bash
# Developer Tools → States → Manuálisan módosítsd:
sensor.manager_1_cycle_status

# Értékek:
- waiting  → PRE-START UI
- active   → ACTIVE UI
- completed → CLOSED UI
- (töröld a sensor-t) → UNKNOWN UI
```

### ✅ 2. Sensor Beolvasás

**Szükséges szenzorok (ACTIVE állapotban):**

```yaml
sensor.manager_1_current_cycle_id      # pl. "MSZ/2025/001"
sensor.manager_1_cycle_day             # pl. 15
sensor.manager_1_current_stock         # pl. 4975
sensor.manager_1_average_weight        # pl. 2450
sensor.manager_1_fcr                   # pl. 1.85
sensor.manager_1_daily_feed_consumed   # pl. 450
sensor.manager_1_total_mortality       # pl. 25
sensor.manager_1_mortality_rate        # pl. 0.5
```

**Tesztelés:**

1. Hozz létre teszt szenzorok a `configuration.yaml`-ban:

```yaml
sensor:
  - platform: template
    sensors:
      manager_1_cycle_status:
        value_template: "active"
        attributes:
          manager_name: "Istálló 1"
          area_name: "istallo_1"
          breed: "Ross 308 vegyesivar"

      manager_1_current_cycle_id:
        value_template: "MSZ/2025/001"

      manager_1_cycle_day:
        value_template: 15

      manager_1_current_stock:
        value_template: 4975

      manager_1_average_weight:
        value_template: 2450

      manager_1_fcr:
        value_template: "1.85"

      manager_1_daily_feed_consumed:
        value_template: 450

      manager_1_total_mortality:
        value_template: 25

      manager_1_mortality_rate:
        value_template: "0.5"
```

2. Restart Home Assistant
3. Ellenőrizd a kártyán megjelenő értékeket

### ✅ 3. Config Editor

**Tesztelendő mezők:**

1. **Manager dropdown:**
   - Látszódik-e a lista?
   - Kiválasztható-e manager?
   - Frissül-e a kártya?

2. **Napi mentés időpont:**
   - Módosítható-e az idő?
   - Megjelenik-e a kártyán?

3. **Checkboxok:**
   - Értesítések kapcsoló működik?
   - Debug mód kapcsoló működik?

4. **Hibaüzenet:**
   - Ha nincs manager → "Nem található Cycle Manager" warning

### ✅ 4. Gombok (Fázis 1: csak placeholder)

**Tesztelendő:**

| Gomb | Elvárt viselkedés (Fázis 1) |
|------|----------------------------|
| **Ciklus Indítás** | Alert: "Ciklus indítás - Implementálva lesz Fázis 2-ben" |
| **Elszállítás** | Alert: "Elszállítás rögzítés - Implementálva lesz Fázis 3-ban" |
| **Elhullás** | Alert: "Elhullás rögzítés - Implementálva lesz Fázis 3-ban" |
| **Ciklus Lezárás** | Confirm dialog + Alert |
| **Új Ciklus Indítás** | Alert (CLOSED állapotban) |

### ✅ 5. Responsive Design

**Tesztelendő képernyőméretek:**

- 📱 Mobile (< 600px) → metrics egysoros, gombok nagyok
- 💻 Desktop (> 600px) → metrics 2-4 oszlopos grid

**Tesztelés:**

1. Browser DevTools → Responsive mode
2. Próbáld ki 320px, 768px, 1024px szélesség mellett

### ✅ 6. Debug Mód

**Tesztelés:**

1. Kapcsold BE a debug módot (config editor)
2. Nyisd meg a böngésző konzolt (F12)
3. Ellenőrizd a logokat:

```
[CFM Card] State: ACTIVE, Status: active
[CFM Card] v2.0.0 - Card Main loaded successfully
 CFM Manager Card v2.0.0  Loaded successfully
```

---

## 🐛 HIBAELHÁRÍTÁS

### Probléma 1: Kártya nem jelenik meg

**Megoldás:**

1. Ellenőrizd a JavaScript konzolt (F12)
2. Frissítsd az oldalt (Ctrl+F5 - hard reload)
3. Ellenőrizd a resource URL-t:
   ```
   /local/community/cfm-manager-card/cfm-manager-card-v2.js
   ```
4. Ellenőrizd a fájl létezését:
   ```bash
   ls -lh /config/www/community/cfm-manager-card/
   ```

### Probléma 2: "Ismeretlen állapot" hibaüzenet

**Megoldás:**

1. Ellenőrizd, hogy létezik-e a sensor:
   ```
   sensor.manager_1_cycle_status
   ```
2. Developer Tools → States → Keresd meg a sensor-t
3. Ha nincs → hozd létre (lásd fent template sensor példa)

### Probléma 3: Config editor üres

**Megoldás:**

1. Nincs még Cycle Manager létrehozva
2. Hozz létre legalább 1 manager-t a Setup felületen
3. Publikálj sensor-okat (CFM Manager backend)

### Probléma 4: Értékek nem frissülnek

**Megoldás:**

1. Ellenőrizd a sensor frissítési gyakoriságot
2. HA automatikusan frissíti a kártyákat (30s poll)
3. Manuális frissítés: Dashboard → Refresh

---

## 📊 TESZT CHECKLIST

**Fázis 1 Acceptance Criteria:**

- [ ] ✅ Kártya betöltődik hibák nélkül
- [ ] ✅ State machine működik (4 állapot)
- [ ] ✅ Sensor értékek beolvasása működik
- [ ] ✅ Config editor működik (manager választás)
- [ ] ✅ UI responsive (mobile + desktop)
- [ ] ✅ Gombok működnek (placeholder alert-ek)
- [ ] ✅ Debug mód működik (konzol log-ok)
- [ ] ✅ Nincs JavaScript error a konzolban

---

## 🚀 KÖVETKEZŐ LÉPÉSEK (Fázis 2)

**Ha minden teszt átment:**

1. ✅ Fázis 1 KÉSZ
2. 📋 Fázis 2: PRE-START UI
   - Ciklus indítás form implementálás
   - Service call: `cfm_manager.start_cycle`
   - Validációk (min értékek)

**Tesztelési útmutató Fázis 2-höz:**
- `TESTING_GUIDE_PHASE2.md` (később)

---

**Verzió:** v2.0.0 (Fázis 1)
**Utolsó frissítés:** 2025-10-20
**Státusz:** Tesztelésre kész ✅
