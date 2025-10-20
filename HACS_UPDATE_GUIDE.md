# HACS Frissítési Útmutató - CFM Manager Card v2.0.0

**Probléma:** HACS nem látja az új v2.0.0 verziót?
**Megoldás:** Cache tisztítás + manuális frissítés

---

## ✅ GITHUB ÁLLAPOT (KÉSZ)

**Repository:** https://github.com/wfocsy/cfm_lovelace
**Latest commit:** `4e74942` (HACS: cfm-manager-card.js frissítve v2.0.0-ra)
**Latest tag:** `v2.0.0`

**Fájlok:**
- ✅ `dist/cfm-manager-card.js` (25KB) - **HACS fő fájl**
- ✅ `dist/cfm-manager-card-v2.js` (25KB) - alias
- ✅ `dist/cfm-manager-card-v1.js` (8.3KB) - v1.0.x backup
- ✅ `release.json` (version: "2.0.0")
- ✅ `hacs.json` (filename: "cfm-manager-card.js")

---

## 🔧 HACS FRISSÍTÉS LÉPÉSEK

### 1. HACS Cache Tisztítás

**HACS cache újratöltése:**

```bash
# Módszer 1: Home Assistant restart (legegyszerűbb)
Settings → System → Restart Home Assistant

# Módszer 2: HACS repository frissítés
HACS → Frontend → CFM Manager Card → ⋮ (három pont) → Redownload

# Módszer 3: HACS integráció újratöltés
Developer Tools → YAML → HACS → Reload
```

### 2. HACS Repository Ellenőrzés

**Ellenőrizd, hogy HACS látja-e az új verziót:**

1. HACS → Frontend
2. Keresd meg: "CFM Manager Card"
3. Kattints rá
4. Ellenőrizd a verziószámot: **v2.0.0**

**Ha nem látszik:**
- Várj 5-10 percet (GitHub cache)
- Próbáld újra a cache tisztítást
- Ellenőrizd a GitHub repository-t: https://github.com/wfocsy/cfm_lovelace/releases

### 3. Frissítés Telepítése

**Ha HACS látja az új verziót:**

```
HACS → Frontend → CFM Manager Card → Update
```

**Ha HACS NEM látja (manuális telepítés):**

```bash
# 1. Töltsd le a fájlt GitHub-ról
wget https://github.com/wfocsy/cfm_lovelace/raw/main/dist/cfm-manager-card.js \
  -O /config/www/community/cfm-manager-card/cfm-manager-card.js

# 2. Home Assistant restart
Settings → System → Restart Home Assistant
```

### 4. Lovelace Resource Frissítés

**Ellenőrizd a resource URL-t:**

```
Settings → Dashboards → Resources
```

**Helyes URL:**
```
/local/community/cfm-manager-card/cfm-manager-card.js
```

**Ha más URL van:**
- Töröld a régi resource-ot
- Adj hozzá új resource-ot a helyes URL-lel

### 5. Browser Cache Tisztítás

**Fontos! A böngésző is cache-eli a JavaScript fájlokat:**

```
1. Nyisd meg a Dashboard-ot
2. Nyomd meg: Ctrl+Shift+R (Windows/Linux) vagy Cmd+Shift+R (Mac)
3. Vagy: Ctrl+F5 (hard reload)
```

**Chrome DevTools módszer:**
```
1. F12 (DevTools megnyitása)
2. Jobb klikk a Reload gombra
3. "Empty Cache and Hard Reload"
```

### 6. Ellenőrzés

**Működik az új verzió?**

1. Dashboard → Edit
2. Add Card → Custom: CFM Manager Card
3. Config:
   ```yaml
   type: custom:cfm-manager-card
   manager_id: 1
   daily_save_time: "07:00"
   show_debug: true
   ```
4. Ellenőrizd a böngésző konzolt (F12):
   ```
   [CFM Card] v2.0.0 - Card Main loaded successfully
    CFM Manager Card v2.0.0  Loaded successfully
   ```

**Ha látod ezt a konzolban → SIKER! ✅**

---

## 🐛 HIBAELHÁRÍTÁS

### Probléma 1: "Ismeretlen állapot" hibaüzenet

**Ok:** Nincs `sensor.manager_X_cycle_status`

**Megoldás:**
```yaml
# configuration.yaml
sensor:
  - platform: template
    sensors:
      manager_1_cycle_status:
        value_template: "waiting"
        attributes:
          manager_name: "Istálló 1"
          area_name: "istallo_1"
          breed: "Ross 308"
```

### Probléma 2: Kártya nem jelenik meg

**Ellenőrizd a JavaScript konzolt (F12):**

```javascript
// Sikeres betöltés:
✅ [CFM Card] v2.0.0 loaded successfully

// Hiba:
❌ Failed to load resource: net::ERR_FILE_NOT_FOUND
❌ Uncaught SyntaxError: ...
```

**Megoldás:**
1. Ellenőrizd a fájl létezését:
   ```bash
   ls -lh /config/www/community/cfm-manager-card/
   ```
2. Helyes méret: **~25KB**
3. Hard reload: Ctrl+Shift+R

### Probléma 3: HACS nem látja a repository-t

**Ellenőrizd a GitHub repository állapotát:**

```bash
# Parancssorból:
curl -s https://api.github.com/repos/wfocsy/cfm_lovelace/releases/latest | grep tag_name

# Elvárt kimenet:
"tag_name": "v2.0.0",
```

**Ha nem v2.0.0:**
- Várj 5-10 percet (GitHub cache)
- Ellenőrizd: https://github.com/wfocsy/cfm_lovelace/tags

### Probléma 4: "v1.0.x deprecated" warning

**Ez NORMÁLIS!** Az új verzió (v2.0.0) felülírta a régit.

**Ellenőrzés:**
```bash
# Fájlméret ellenőrzése:
ls -lh /config/www/community/cfm-manager-card/cfm-manager-card.js

# Elvárt méret: 25KB (v2.0.0)
# Régi méret: 8.3KB (v1.0.x)
```

**Ha 8.3KB:**
- Manuális telepítés (lásd fent)
- HACS cache tisztítás

---

## 📊 VERZIÓ ELLENŐRZÉS

### JavaScript Konzol (F12)

**v2.0.0 sikeresen betöltve:**
```javascript
 CFM Manager Card v2.0.0  Loaded successfully
[CFM Card] v2.0.0 - Card Main loaded successfully
[CFM Card] v2.0.0 - Config Editor loaded successfully
```

**v1.0.x régi verzió:**
```javascript
CFM Manager Card v1.0.1 loaded
```

### Fájlméret

| Verzió | Fájlméret | Státusz |
|--------|-----------|---------|
| v1.0.x | 8.3KB | Deprecated |
| v2.0.0 | 25KB | Current ✅ |

### Browser DevTools Network Tab

1. F12 → Network tab
2. Szűrő: `cfm-manager-card.js`
3. Reload (Ctrl+R)
4. Ellenőrizd a méret oszlopot: **25KB** = v2.0.0 ✅

---

## ✅ SIKERES FRISSÍTÉS CHECKLIST

- [ ] HACS látja a v2.0.0 verziót
- [ ] Fájl letöltve (`/config/www/community/cfm-manager-card/`)
- [ ] Fájlméret: 25KB
- [ ] Lovelace resource URL helyes
- [ ] Browser cache tisztítva (Ctrl+Shift+R)
- [ ] Konzol mutatja: "v2.0.0 loaded successfully"
- [ ] Kártya megjelenik a Dashboard-on
- [ ] Config editor működik
- [ ] State machine működik (debug mode)

---

## 🚀 KÖVETKEZŐ LÉPÉSEK

**Ha minden működik:**

1. **Tesztelés:** Lásd [TESTING_GUIDE.md](TESTING_GUIDE.md)
2. **Dokumentáció:** Lásd [PHASE1_SUMMARY.md](PHASE1_SUMMARY.md)
3. **Fázis 2:** Ciklus indítás form implementálás

---

**Verzió:** v2.0.0
**Utolsó frissítés:** 2025-10-20
**GitHub:** https://github.com/wfocsy/cfm_lovelace
**HACS kompatibilis:** ✅
