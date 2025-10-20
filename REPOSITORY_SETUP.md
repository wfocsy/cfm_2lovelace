# CFM Manager Card - GitHub Repository Setup Guide

**Új repository létrehozása GitHub-on HACS custom card telepítéséhez**

---

## 📂 REPOSITORY STRUKTÚRA

```
cfm-manager-card/
├── dist/
│   └── cfm-manager-card.js       # Custom card JavaScript kód
├── screenshots/
│   ├── main-view.png             # Kártya screenshot (később)
│   ├── debug-view.png            # Debug nézet screenshot (később)
│   └── README.md                 # Screenshot útmutató
├── .gitignore                    # Git ignore fájl
├── hacs.json                     # HACS metadata
├── info.md                       # HACS info oldal
├── INSTALLATION.md               # Telepítési útmutató (magyar)
├── LICENSE                       # MIT License
├── README.md                     # Repository főoldal
└── release.json                  # Release metadata
```

---

## 🚀 GYORS SETUP (5 LÉPÉS)

### 1. GitHub Repository Létrehozása

1. Menj: https://github.com/new
2. **Repository name:** `cfm-manager-card`
3. **Description:** `Custom Lovelace card for CFM Manager Home Assistant Add-on`
4. **Public** (HACS csak public repo-kat támogat!)
5. ✅ Add a README file: **NE** jelöld be (mi hozzuk létre)
6. ✅ Add .gitignore: **NE** jelöld be
7. ✅ Choose a license: **MIT License**
8. Kattints: **Create repository**

---

### 2. HACS Mappa Feltöltése GitHub-ra

**Terminálban (HACS mappában):**

```bash
# Lépj be a HACS mappába
cd /path/to/CFM_Manager/HACS

# Git inicializálás
git init

# Fájlok hozzáadása
git add .

# Első commit
git commit -m "Initial release v1.0.0

- Custom Lovelace card for CFM Manager
- Backend connection test
- Areas API integration
- Cycle Managers display
- Debug information
- HACS compatible

🤖 Generated with Claude Code"

# Remote hozzáadása (CSERÉLD LE A USERNAME-T!)
git remote add origin https://github.com/wfocsy/cfm_lovelace.git

# Branch átnevezése (ha szükséges)
git branch -M main

# Push GitHub-ra
git push -u origin main
```

---

### 3. GitHub Release Létrehozása (HACS követelmény!)

**GitHub Web UI:**

1. Repository oldalon: **Releases** → **Create a new release**
2. **Tag version:** `v1.0.0`
3. **Release title:** `v1.0.0 - Initial Release`
4. **Description:**

```markdown
## 🎉 Initial Release

Custom Lovelace card for **CFM Manager** (Baromfi Nevelő Rendszer) Home Assistant Add-on.

### Features
- 📡 Backend connection test
- 🏠 Areas API integration
- 📊 Cycle Managers display
- 🔍 Debug information section
- 🎨 Native HA theme support
- ⚡ REST API communication

### Installation

#### HACS (Recommended)
1. HACS → Frontend → ⋮ → Custom repositories
2. Add: `https://github.com/wfocsy/cfm_lovelace`
3. Category: Lovelace
4. Download → Restart HA

See [INSTALLATION.md](INSTALLATION.md) for detailed steps.

### Requirements
- Home Assistant 2024.1.0+
- CFM Manager Add-on installed
- REST sensors configured

### Documentation
- [README.md](README.md) - Full documentation
- [INSTALLATION.md](INSTALLATION.md) - Installation guide

---

**Full Changelog:** https://github.com/wfocsy/cfm_lovelace/commits/v1.0.0
```

5. ✅ **Set as the latest release**
6. Kattints: **Publish release**

---

### 4. HACS Validálás

**Ellenőrizd, hogy HACS felismeri-e a repository-t:**

GitHub repository oldalon nézd meg:
- ✅ `hacs.json` fájl létezik a root-ban
- ✅ `dist/cfm-manager-card.js` fájl létezik
- ✅ `info.md` fájl létezik
- ✅ `README.md` fájl létezik
- ✅ Van legalább 1 release (v1.0.0)
- ✅ Repository **public**

---

### 5. HACS Telepítés Home Assistant-ban

**Home Assistant UI:**

1. **HACS** → **Frontend**
2. **⋮** (jobb felső sarok) → **Custom repositories**
3. **Repository URL:** `https://github.com/wfocsy/cfm_lovelace`
4. **Category:** Lovelace
5. Kattints: **Add**
6. Keress: **CFM Manager Card**
7. Kattints: **Download**
8. Restart Home Assistant

---

## 📝 HACS.JSON MAGYARÁZAT

```json
{
  "name": "CFM Manager Card",              // HACS-ben megjelenő név
  "content_in_root": false,                // Fájlok a dist/ mappában vannak
  "filename": "cfm-manager-card.js",       // Fő JavaScript fájl neve
  "render_readme": true,                   // README.md renderelés HACS-ben
  "homeassistant": "2024.1.0"              // Minimális HA verzió
}
```

**KRITIKUS:** `content_in_root: false` → HACS a `dist/` mappában keresi a fájlokat!

---

## 🔄 FRISSÍTÉS WORKFLOW (Jövőbeli Release-ek)

### Új verzió kiadása:

```bash
# 1. Kód módosítása
vim dist/cfm-manager-card.js

# 2. Verzió bump (fájl elején)
# Version: 1.0.0 → 1.1.0

# 3. Commit
git add .
git commit -m "feat: Add new feature X

Version: 1.1.0"

# 4. Tag létrehozása
git tag v1.1.0

# 5. Push
git push origin main
git push origin v1.1.0

# 6. GitHub Release létrehozása
# GitHub UI: Releases → Create new release
```

**HACS automatikusan észreveszi az új release-t!**

---

## ⚠️ GYAKORI HIBÁK ÉS MEGOLDÁSOK

### Hiba: "HACS nem találja a repository-t"

**Megoldás:**
- Ellenőrizd: Repository **public**?
- Ellenőrizd: Van `hacs.json` a root-ban?
- Ellenőrizd: Van legalább 1 release?

---

### Hiba: "Resource not found after installation"

**Megoldás:**
- Ellenőrizd: `content_in_root: false` a `hacs.json`-ben?
- Ellenőrizd: `dist/cfm-manager-card.js` létezik?
- Restart HA, böngésző cache törlése (Ctrl+F5)

---

### Hiba: "Card not showing in card picker"

**Megoldás:**
1. Böngésző konzol (F12) → Keress: `CFM-MANAGER-CARD 1.0.0`
2. Ha nincs log → Resource nem töltődött be
3. Settings → Dashboards → Resources → Ellenőrizd:
   - `/hacsfiles/cfm-manager-card/cfm-manager-card.js` létezik
4. Töröld a resource-t és add hozzá újra
5. Restart HA + böngésző cache törlése

---

## 📊 REPOSITORY ÁLLAPOT ELLENŐRZÉS

```bash
# GitHub API lekérdezés (opcionális)
curl -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/wfocsy/cfm_lovelace

# Elvárt válasz:
# - "name": "cfm-manager-card"
# - "description": "..."
# - "visibility": "public"
# - "default_branch": "main"
```

---

## 🎯 KÖVETKEZŐ LÉPÉSEK A SETUP UTÁN

1. ✅ Repository feltöltve GitHub-ra
2. ✅ Release létrehozva (v1.0.0)
3. ✅ HACS telepítés tesztelve
4. → Screenshot-ok készítése (main-view.png, debug-view.png)
5. → README.md screenshot linkek frissítése
6. → Community showcase (ha akarsz)

---

## 📚 HASZNOS LINKEK

- **HACS Documentation:** https://hacs.xyz/docs/publish/start
- **HACS Plugin Category:** https://hacs.xyz/docs/publish/plugin
- **GitHub Releases Guide:** https://docs.github.com/en/repositories/releasing-projects-on-github

---

## 💡 TIPPEK

1. **Public Repository:** HACS csak public repository-kat támogat
2. **Release kötelező:** Legalább 1 release kell (v1.0.0)
3. **Semantic Versioning:** Használj SemVer formátumot (v1.0.0, v1.1.0, v2.0.0)
4. **Changelog:** Mindig írj changelog-ot a release description-be
5. **Screenshots:** Adj hozzá képeket a README-hez (nagyobb letöltési számok)

---

**Sikeres repository setup-ot!** 🚀
