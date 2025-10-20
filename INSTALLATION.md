# CFM Manager Card - Telepítési Útmutató

**Verzió:** 1.0.0
**Utolsó frissítés:** 2025-01-20

---

## 🎯 GYORS TELEPÍTÉS (3 LÉPÉS)

### 1. HACS Telepítés

```
HACS → Frontend → ⋮ (jobb felső sarok) → Custom repositories
```

**Repository URL:** `https://github.com/wfocsy/cfm_lovelace`
**Category:** Lovelace

Kattints: **Add** → **Download** → **Restart HA**

---

### 2. REST Sensors Konfiguráció

Másold be a `configuration.yaml` fájlba:

```yaml
rest:
  - resource: "http://a0d7b954-baromfi-nevelo:8099/api/areas"
    scan_interval: 60
    sensor:
      - name: "CFM Test Connection"
        unique_id: cfm_test_connection
        value_template: "{{ 'online' if value_json else 'offline' }}"

      - name: "CFM Test Areas"
        unique_id: cfm_test_areas
        value_template: >
          {% if value_json.success %}
            {{ value_json.areas | length }} területek
          {% else %}
            Hiba
          {% endif %}

  - resource: "http://a0d7b954-baromfi-nevelo:8099/api/cycle-managers"
    scan_interval: 30
    sensor:
      - name: "CFM Test Cycle Managers"
        unique_id: cfm_test_cycle_managers
        value_template: >
          {% if value_json.success %}
            {{ value_json.cycle_managers | length }} manager
          {% else %}
            Hiba
          {% endif %}

rest_command:
  cfm_test_load_areas:
    url: "http://a0d7b954-baromfi-nevelo:8099/api/areas"
    method: GET
```

**⚠️ FONTOS:** Cseréld le a `a0d7b954-baromfi-nevelo` részt a saját addon slug-oddal!

**Hogyan találd meg az addon URL-t?**
```bash
# SSH terminálban:
ha addons info baromfi_nevelo | grep url
```

**Restart:** Developer Tools → YAML Configuration Reloading → Restart

---

### 3. Kártya Hozzáadása Dashboard-hoz

Dashboard szerkesztő → **Add Card** → **Manual** → Másold be:

```yaml
type: custom:cfm-manager-card
addon_url: "http://a0d7b954-baromfi-nevelo:8099"
title: "CFM Manager - Teszt"
show_debug: true
```

**Mentés** → **Kész!**

---

## ✅ ELLENŐRZÉS

### Lépés 1: REST Sensors

**Developer Tools** → **States** → Keress rá:
- `sensor.cfm_test_connection`
- `sensor.cfm_test_areas`
- `sensor.cfm_test_cycle_managers`

**Elvárt állapot:**
```
sensor.cfm_test_connection: online
sensor.cfm_test_areas: 4 területek
sensor.cfm_test_cycle_managers: 2 manager
```

### Lépés 2: Kártya Megjelenés

A kártyán látnod kell:
- ✅ 1️⃣ Backend Kapcsolat: **online**
- ✅ 2️⃣ Területek API: **X területek**
- ✅ 3️⃣ Cycle Managers: **X manager**
- ✅ Debug szekció (ha `show_debug: true`)

---

## 🔧 HIBAELHÁRÍTÁS

### ❌ Probléma: "unknown" szenzorok

**Megoldás:**
1. Várj 1-2 percet (scan_interval)
2. Ellenőrizd: CFM Manager addon fut?
   - Settings → Add-ons → Baromfi Nevelő Rendszer → Status: **Running**
3. Nézd meg a logokat:
   - Settings → System → Logs → Szűrő: "rest sensor"

---

### ❌ Probléma: "offline" állapot

**Megoldás:**
1. Teszteld az addon URL-t SSH-ból:
   ```bash
   curl http://a0d7b954-baromfi-nevelo:8099/api/areas
   ```
   **Várt válasz:** JSON lista area objektumokkal

2. Ellenőrizd az addon URL formátumát:
   - ✅ Helyes: `http://a0d7b954-baromfi-nevelo:8099`
   - ❌ Helytelen: `http://localhost:8099` (Lovelace-ből nem elérhető!)

3. Próbáld ki az ingress URL-t:
   - Settings → Add-ons → Baromfi Nevelő Rendszer → Open Web UI
   - Böngésző URL-jében nézd meg a címet

---

### ❌ Probléma: Kártya nem jelenik meg a card picker-ben

**Megoldás:**
1. Töröld a böngésző cache-t: **Ctrl+F5** (Windows) / **Cmd+Shift+R** (Mac)
2. Ellenőrizd a Resource betöltését:
   - Settings → Dashboards → Resources
   - Keress: `/hacsfiles/cfm-manager-card/cfm-manager-card.js`
3. Nyisd meg a böngésző konzolt (F12):
   - Keress: `CFM-MANAGER-CARD 1.0.0` log üzenetet
   - Ha nincs, resource nem töltődött be

---

### ❌ Probléma: "Területek Betöltése" gomb nem működik

**Megoldás:**
1. Ellenőrizd a REST command létezését:
   - Developer Tools → Services → Keress: `rest_command.cfm_test_load_areas`
2. Ha hiányzik:
   - Másold be a `rest_command:` részt `configuration.yaml`-be
   - Restart Home Assistant

---

## 📋 ADDON URL TÍPUSOK

| Környezet | URL Formátum | Példa |
|-----------|--------------|-------|
| **HAOS (Ingress)** | `http://<slug>:8099` | `http://a0d7b954-baromfi-nevelo:8099` |
| **Docker** | `http://<container-name>:8099` | `http://baromfi-nevelo:8099` |
| **Localhost** | `http://localhost:8099` | ⚠️ NEM működik Lovelace-ből! |

**Ajánlott:** Ingress URL (addon slug alapján)

---

## 🚀 KÖVETKEZŐ LÉPÉSEK

Ha a teszt kártya működik:
1. ✅ Backend-frontend kommunikáció validálva
2. → Teljes kártyák implementálása (Kártya 1-5)
3. → Ciklus indítás form
4. → Aktív ciklus megjelenítés
5. → Shipping/Mortality modalok

Részletek: [LOVELACE_CARDS_TODO.md](https://github.com/wfocsy/CFM_Manager/blob/main/LOVELACE_CARDS_TODO.md)

---

## 💬 TÁMOGATÁS

- **GitHub Issues:** [Report a bug](https://github.com/wfocsy/cfm_lovelace/issues)
- **Discussions:** [Ask a question](https://github.com/wfocsy/cfm_lovelace/discussions)
- **Main Project:** [CFM Manager Add-on](https://github.com/wfocsy/CFM_Manager)

---

**Sikeres telepítést!** 🎉
