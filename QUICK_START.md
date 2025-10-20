# 🚀 CFM Manager Card v2.0.0 - GYORS START

**5 perc alatt működő kártya!**

---

## ⚡ LÉPÉSEK

### 1️⃣ Teszt Szenzorok Létrehozása (2 perc)

**configuration.yaml-ba add hozzá:**

```yaml
sensor:
  - platform: template
    sensors:
      manager_1_cycle_status:
        friendly_name: "Manager 1 Cycle Status"
        value_template: "waiting"
        attributes:
          manager_name: "Istálló 1"
          area_name: "istallo_1"
          breed: "Ross 308 vegyesivar"

      manager_1_current_cycle_id:
        value_template: "MSZ/2025/001"

      manager_1_cycle_day:
        value_template: "15"
        unit_of_measurement: "nap"

      manager_1_current_stock:
        value_template: "4975"
        unit_of_measurement: "db"

      manager_1_average_weight:
        value_template: "2450"
        unit_of_measurement: "g"

      manager_1_fcr:
        value_template: "1.85"

      manager_1_daily_feed_consumed:
        value_template: "450"
        unit_of_measurement: "kg"

      manager_1_total_mortality:
        value_template: "25"
        unit_of_measurement: "db"

      manager_1_mortality_rate:
        value_template: "0.5"
        unit_of_measurement: "%"
```

**VAGY használd a teljes példát:**
- Lásd: [TEST_SENSORS.yaml](TEST_SENSORS.yaml)

---

### 2️⃣ Home Assistant Restart (1 perc)

```
Settings → System → Restart Home Assistant
```

**Várj 1-2 percet a restart-ra.**

---

### 3️⃣ Szenzorok Ellenőrzése (30 sec)

```
Developer Tools → States
```

**Keress rá:** `sensor.manager_1`

**Elvárt eredmény:**
```
✅ sensor.manager_1_cycle_status
✅ sensor.manager_1_current_cycle_id
✅ sensor.manager_1_cycle_day
✅ sensor.manager_1_current_stock
... stb.
```

**Ha NEM látod:**
- Ellenőrizd a configuration.yaml szintaxist
- Developer Tools → YAML → Check Configuration
- Restart újra

---

### 4️⃣ Kártya Hozzáadása (1 perc)

**Dashboard → Edit → Add Card**

**Típus:** Manual (YAML módban)

```yaml
type: custom:cfm-manager-card
manager_id: 1
daily_save_time: "07:00"
show_notifications: true
show_debug: true
```

**Vagy:** UI módban keress rá "CFM Manager Card"

---

### 5️⃣ Működés Ellenőrzése (1 perc)

**F12 (DevTools) → Console**

**Elvárt kimenet:**
```javascript
✅ CFM Manager Card v2.0.0  Loaded successfully
✅ [CFM Card] v2.0.0 - Card Main loaded successfully
✅ [CFM Card] State: PRE-START, Status: waiting
```

**Kártyán látható:**
```
┌─────────────────────────────────────┐
│  Istálló 1                          │
├─────────────────────────────────────┤
│  Várakozik ciklus indításra         │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   🐔 CIKLUS INDÍTÁS           │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🧪 ÁLLAPOT TESZTELÉS

### PRE-START → ACTIVE

**Developer Tools → States → sensor.manager_1_cycle_status → Set State**

```
State: active
```

**Elvárt kártya:**
```
┌─────────────────────────────────────┐
│  Istálló 1 - MSZ/2025/001          │
├─────────────────────────────────────┤
│  Kor: 15 nap  │  Állomány: 4975 db │
│  Fajta: Ross 308 vegyesivar         │
├─────────────────────────────────────┤
│  Súly: 2450g     FCR: 1.85         │
│  Takarmány: 450kg/nap               │
│  Elhullás: 25 db (0.5%)            │
├─────────────────────────────────────┤
│  🚚 Elszállítás  💀 Elhullás        │
│  📊 Ciklus Lezárás                  │
│  ⏰ Következő mentés: holnap 07:00 │
└─────────────────────────────────────┘
```

### ACTIVE → CLOSED

**Developer Tools → States → sensor.manager_1_cycle_status → Set State**

```
State: completed
```

**Elvárt kártya:**
```
┌─────────────────────────────────────┐
│  Istálló 1 - MSZ/2025/001          │
│  ✅ Lezárt ciklus                   │
├─────────────────────────────────────┤
│  Időtartam: 42 nap                  │
│  Végső állomány: 4500 db            │
│  Végső súly: 3200g                  │
│  ...                                │
│  ┌───────────────────────────────┐ │
│  │   🐔 ÚJ CIKLUS INDÍTÁS        │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🐛 HIBAELHÁRÍTÁS

### Hiba: "Sensor not found: sensor.manager_1_cycle_status"

**Megoldás:**
1. Ellenőrizd: Developer Tools → States
2. Ha nincs sensor → configuration.yaml frissítés
3. Restart Home Assistant

### Hiba: "Ismeretlen állapot"

**Megoldás:**
1. Sensor létezik, de a `value_template` rossz érték
2. Helyes értékek: `waiting`, `active`, `completed`
3. Developer Tools → States → Set State: `waiting`

### Hiba: Kártya üres/nem jelenik meg

**Megoldás:**
1. Browser cache: Ctrl+Shift+R
2. F12 → Console → Ellenőrizd a hibákat
3. Resource URL ellenőrzés: Settings → Dashboards → Resources

### Hiba: "this.config.entities is not iterable"

**Ez NEM a CFM kártya hibája!**
- Ez egy másik kártya hibája (timer-bar-card)
- Ignoráld, a CFM kártya működik

---

## ✅ SIKERES START CHECKLIST

- [ ] Szenzorok létrehozva (configuration.yaml)
- [ ] Home Assistant restart
- [ ] Szenzorok láthatók (Developer Tools → States)
- [ ] Kártya hozzáadva Dashboard-hoz
- [ ] Konzol mutatja: "v2.0.0 loaded successfully"
- [ ] Kártya megjelenik (PRE-START állapot)
- [ ] State változtatás működik (waiting → active → completed)

---

## 🚀 KÖVETKEZŐ LÉPÉSEK

**Ha minden működik:**

1. **Állapot tesztelés:** Váltogasd a sensor értékét (waiting/active/completed)
2. **Debug mód:** Figyeld a konzol log-okat
3. **Gombok tesztelés:** Kattints a gombokra (placeholder alert-ek)
4. **Responsive tesztelés:** Mobilon is nézd meg (DevTools → Responsive)

**Részletes tesztelés:**
- Lásd: [TESTING_GUIDE.md](TESTING_GUIDE.md)

**Dokumentáció:**
- Lásd: [PHASE1_SUMMARY.md](PHASE1_SUMMARY.md)

---

**Verzió:** v2.0.0
**Időigény:** 5 perc
**Státusz:** Production ready ✅

🎉 **Élvezd a kártyát!**
