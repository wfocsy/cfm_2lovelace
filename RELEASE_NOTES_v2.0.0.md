# CFM Manager Card v2.0.0 - Fázis 1: Card Alapok

**Production-Ready Lovelace Card!** 🎉

---

## ✨ Új Funkciók

### State Machine (4 állapot)
- **PRE-START** - Várakozó állapot ("Ciklus Indítás" gomb)
- **ACTIVE** - Futó ciklus (napi dashboard + műveletek)
- **CLOSED** - Lezárt ciklus (összefoglaló + új ciklus indítás)
- **UNKNOWN** - Hibás konfiguráció (hibaüzenet)

### Sensor Integráció
- 9 sensor automatikus beolvasása
- Valós idejű adatok megjelenítése
- Sensor attribute-ok támogatása (manager_name, area_name, breed)

### Config Editor
- Manager választás dropdown
- Napi mentés időpont beállítás
- Értesítések be/ki kapcsoló
- Debug mód

### UI/UX
- Responsive design (mobile + desktop)
- Animációk (fadeIn, hover effektek)
- Modern színsémák (primary, secondary, danger)
- 3 állapot szerinti dinamikus layout

---

## 📦 Fájlok

### Production Build
- `dist/cfm-manager-card.js` (25KB) - **HACS fő fájl**

### Source (fejlesztéshez)
- `src/card-main.js` (579 sor)
- `src/card-config.js` (355 sor)
- `src/styles/card-styles.js` (459 sor)

---

## 📚 Dokumentáció

- **QUICK_START.md** - 5 perces gyors telepítési útmutató
- **TEST_SENSORS.yaml** - Template sensor példák
- **TESTING_GUIDE.md** - Részletes tesztelési útmutató
- **HACS_UPDATE_GUIDE.md** - HACS frissítési útmutató
- **PHASE1_SUMMARY.md** - Teljes összefoglaló

---

## 🚀 Telepítés

### HACS-en keresztül (ajánlott)

1. HACS → Frontend → CFM Manager Card → Update
2. Restart Home Assistant
3. Ctrl+Shift+R (browser cache clear)

### Manuálisan

```bash
wget https://github.com/wfocsy/cfm_lovelace/releases/download/v2.0.0/cfm-manager-card.js \
  -O /config/www/community/cfm_lovelace/cfm-manager-card.js
```

---

## 🧪 Gyors Teszt

### 1. Teszt Sensor (configuration.yaml)

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
          breed: "Ross 308"
```

### 2. Restart Home Assistant

### 3. Kártya Hozzáadása

```yaml
type: custom:cfm-manager-card
manager_id: 1
daily_save_time: "07:00"
show_debug: true
```

### 4. Állapot Váltás Tesztelés

```
Developer Tools → States → sensor.manager_1_cycle_status
State: waiting → active → completed
```

---

## 🔧 Követelmények

- **Home Assistant:** 2024.1.0+
- **Browser:** Modern böngésző (Chrome, Firefox, Safari, Edge)
- **Szenzorok:** `sensor.manager_X_cycle_status` (kötelező)

---

## 📊 Statisztikák

| Kategória | Érték |
|-----------|-------|
| **Kód sorok** | 1393 sor (source) |
| **Production méret** | 25KB |
| **Fájlok** | 7 db |
| **State machine állapotok** | 4 db |
| **Sensor típusok** | 9 db |
| **Config mezők** | 4 db |

---

## 🐛 Ismert Problémák

### "Sensor not found" hiba

**Megoldás:** Hozz létre teszt szenzorok - lásd `TEST_SENSORS.yaml`

### HACS nem látja v2.0.0-t

**Megoldás:**
1. Várj 10 percet (GitHub cache)
2. Settings → System → Restart Home Assistant
3. HACS → Frontend → CFM Manager Card → Redownload

### Browser cache

**Megoldás:** Ctrl+Shift+R (hard reload)

---

## 🚧 Következő Fázisok

### Fázis 2: PRE-START UI (v2.1.0)
- Ciklus indítás form
- Service call: `cfm_manager.start_cycle`
- Validációk

### Fázis 3: ACTIVE CYCLE UI (v2.2.0)
- Elszállítás modal
- Elhullás modal
- Ciklus lezárás confirm

### Fázis 4: Automatikus Időzítő (v2.3.0)
- Napi időzítő (07:00)
- Automatikus sensor beolvasás
- Push notification

---

## 🏆 Breaking Changes

- **v1.0.x deprecated** - Használd a v2.0.0-t
- Config formátum változatlan (kompatibilis)
- Sensor névkonvenció változatlan

---

## 🙏 Köszönet

Fejlesztve: **Claude Code** 🤖
Projekt: **CFM Manager - Baromfi Nevelő Rendszer**

---

**GitHub:** https://github.com/wfocsy/cfm_lovelace
**Dokumentáció:** https://github.com/wfocsy/cfm_lovelace/blob/main/QUICK_START.md
**Issues:** https://github.com/wfocsy/cfm_lovelace/issues

🎉 **Élvezd a v2.0.0-t!**
