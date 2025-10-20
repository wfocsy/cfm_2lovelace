# GitHub Release Létrehozása - v2.0.0

**HACS a GitHub Releases-t használja, NEM a tag-eket!**

---

## 🎯 PROBLÉMA

```
HACS → Frontend → CFM Manager Card
Verzió: V1.0.1  ← RÉGI!
```

**Ok:** v2.0.0 **tag** létezik, de **Release** NEM!

---

## ✅ MEGOLDÁS: GitHub Release Létrehozása

### 1️⃣ Nyisd meg a GitHub Repository-t

```
https://github.com/wfocsy/cfm_lovelace
```

### 2️⃣ Menj a Releases oldalra

```
GitHub → wfocsy/cfm_lovelace → Releases (jobb oldali menü)
```

**Vagy közvetlenül:**
```
https://github.com/wfocsy/cfm_lovelace/releases
```

### 3️⃣ Új Release Létrehozása

**Kattints a gombra:**
```
[Draft a new release]
```

### 4️⃣ Release Adatok Kitöltése

#### **Choose a tag:**
```
v2.0.0  ← Dropdown-ból válaszd ki (már létezik!)
```

#### **Release title:**
```
v2.0.0 - Fázis 1: Card Alapok
```

#### **Release notes (másold be a /tmp/release_body.md tartalmat):**

```markdown
# CFM Manager Card v2.0.0 - Fázis 1: Card Alapok

**Production-Ready Lovelace Card!** 🎉

## ✨ Új Funkciók

- **State Machine** (PRE-START, ACTIVE, CLOSED, UNKNOWN)
- **9 sensor integráció** (valós idejű adatok)
- **Config Editor** (manager választás, időzítő, debug)
- **Responsive UI** (mobile + desktop, animációk)

## 📦 Telepítés

**HACS-en keresztül:**
1. HACS → Frontend → CFM Manager Card → Update
2. Restart Home Assistant
3. Browser: Ctrl+Shift+R

**Manuálisan:**
```bash
wget https://github.com/wfocsy/cfm_lovelace/raw/main/dist/cfm-manager-card.js \
  -O /config/www/community/cfm_lovelace/cfm-manager-card.js
```

## 🧪 Gyors Teszt

1. **Sensor létrehozás** (configuration.yaml):
```yaml
sensor:
  - platform: template
    sensors:
      manager_1_cycle_status:
        value_template: "waiting"
        attributes:
          manager_name: "Istálló 1"
```

2. **Kártya hozzáadás**:
```yaml
type: custom:cfm-manager-card
manager_id: 1
show_debug: true
```

## 📚 Dokumentáció

- [Gyors Start Útmutató](https://github.com/wfocsy/cfm_lovelace/blob/main/QUICK_START.md)
- [Teszt Szenzorok](https://github.com/wfocsy/cfm_lovelace/blob/main/TEST_SENSORS.yaml)
- [Tesztelési Útmutató](https://github.com/wfocsy/cfm_lovelace/blob/main/TESTING_GUIDE.md)
- [Fázis 1 Összefoglaló](https://github.com/wfocsy/cfm_lovelace/blob/main/PHASE1_SUMMARY.md)

## 🚧 Következő Fázisok

- **v2.1.0** - Ciklus indítás form
- **v2.2.0** - Elszállítás/Elhullás modalok
- **v2.3.0** - Automatikus időzítő (07:00 napi mentés)

**Teljes Release Notes:** [RELEASE_NOTES_v2.0.0.md](https://github.com/wfocsy/cfm_lovelace/blob/main/RELEASE_NOTES_v2.0.0.md)

🎉 **Élvezd a v2.0.0-t!**
```

#### **Beállítások:**

- [ ] ❌ **Set as a pre-release** (NE pipáld be! Ez production!)
- [x] ✅ **Set as the latest release** (Pipáld be!)

### 5️⃣ Publish Release

**Kattints a gombra:**
```
[Publish release]
```

---

## ✅ ELLENŐRZÉS

### 1️⃣ GitHub Releases oldal

```
https://github.com/wfocsy/cfm_lovelace/releases
```

**Látni fogod:**
```
v2.0.0 - Fázis 1: Card Alapok  ← Latest ✅
V1.0.1 - Bugfix Release        ← Pre-release
v1.0.0 - Initial Release
```

### 2️⃣ GitHub API ellenőrzés

```bash
curl -s https://api.github.com/repos/wfocsy/cfm_lovelace/releases/latest | grep tag_name

# Elvárt kimenet:
"tag_name": "v2.0.0",
```

### 3️⃣ HACS frissítés (10 perc múlva)

**Várj 5-10 percet** (GitHub cache)

**Majd:**
```
1. Settings → System → Restart Home Assistant
2. HACS → Frontend → CFM Manager Card
3. Verzió: v2.0.0 ✅
```

---

## 🚀 HACS FRISSÍTÉS UTÁN

### Automatikus (ajánlott)

```
HACS → Frontend → CFM Manager Card → [Update]
```

### Manuális (ha HACS nem látja)

```bash
# 1. Töltsd le a fájlt
wget https://github.com/wfocsy/cfm_lovelace/raw/main/dist/cfm-manager-card.js \
  -O /config/www/community/cfm_lovelace/cfm-manager-card.js

# 2. Ellenőrizd a méretet
ls -lh /config/www/community/cfm_lovelace/cfm-manager-card.js
# Elvárt: 25KB

# 3. Restart HA
# 4. Browser: Ctrl+Shift+R
```

---

## 🐛 HIBAELHÁRÍTÁS

### HACS továbbra is V1.0.1-et mutat

**Várj 10 percet + Restart HA**

**Ha még mindig nem működik:**
1. HACS → Frontend → CFM Manager Card → ⋮ (három pont)
2. **Redownload**
3. Restart HA

### GitHub Release nem jelenik meg

**Ellenőrizd:**
- Tag létezik? `git tag -l` → v2.0.0 ✅
- Pre-release NINCS bepipálva? ✅
- "Set as latest" BE van pipálva? ✅

### Assets hiányoznak a Release-ből

**Ez NORMÁLIS!** A HACS a `dist/cfm-manager-card.js` fájlt használja a repository-ból, NEM a release asset-ekből!

---

## 📋 CHECKLIST

- [ ] GitHub → Releases → Draft a new release
- [ ] Tag: v2.0.0 (kiválasztva)
- [ ] Title: "v2.0.0 - Fázis 1: Card Alapok"
- [ ] Release notes: Bemásolva
- [ ] Pre-release: ❌ NEM pipálva
- [ ] Latest release: ✅ Bepipálva
- [ ] Publish release: Klikkelve
- [ ] GitHub Releases oldalon látható: v2.0.0 Latest
- [ ] Várj 10 percet
- [ ] Restart Home Assistant
- [ ] HACS mutatja: v2.0.0 ✅

---

**Ha kész, jelezd és folytatjuk a tesztelést!** 🚀
