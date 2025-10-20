# CFM Manager Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)

Lovelace custom card a CFM Manager baromfi nevelési rendszerhez.

## Funkciók

**v2.2.0 - Phase 3: ACTIVE CYCLE Modals**

- ✅ **State Machine:** PRE-START → ACTIVE → CLOSED állapotok
- ✅ **Cycle Start Form:** Teljes ciklus indítás (settled_count, feed prices, stb.)
- ✅ **Shipping Modal:** 🚚 Elszállítás rögzítés (darabszám, átlagsúly, megjegyzés)
- ✅ **Mortality Modal:** 💀 Elhullás rögzítés (darabszám, dátum)
- ✅ **Close Cycle:** 📊 Ciklus lezárás megerősítő (indok)
- ✅ **Backend API:** REST API integráció
- ✅ **Responsive UI:** Mobile + Desktop layout
- ✅ **Notifications:** HA persistent_notification support

## Telepítés

### HACS (Custom Repository)

1. HACS → Frontend → ⋮ → Custom repositories
2. Repository: `https://github.com/wfocsy/cfm_2lovelace`
3. Category: `Lovelace`
4. Add → Download

### Manuális

1. Töltsd le: `dist/cfm-manager-card.js`
2. Másold: `/config/www/cfm-manager-card.js`
3. Dashboard → Resources → Add Resource
   - URL: `/local/cfm-manager-card.js`
   - Type: `JavaScript Module`

## Használat

```yaml
type: custom:cfm-manager-card
manager_id: 1
daily_save_time: '07:00'
show_notifications: true
show_debug: false
```

## Konfiguráció

| Paraméter | Típus | Alapértelmezett | Leírás |
|-----------|-------|----------------|--------|
| `manager_id` | number | **kötelező** | CycleManager ID |
| `daily_save_time` | string | `07:00` | Napi mentés időpontja |
| `show_notifications` | boolean | `true` | HA értesítések |
| `show_debug` | boolean | `false` | Debug log |

## Changelog

### v2.2.0 (2025-10-20)

**Phase 3: ACTIVE CYCLE Modals**
- ✅ Shipping Modal - Elszállítás rögzítés
- ✅ Mortality Modal - Elhullás rögzítés
- ✅ Close Cycle Confirmation
- ✅ Backend API integration
- ✅ Modal animations & validation

### v2.1.0 (2025-10-20)

**Phase 2: Cycle Start Form**
- ✅ PRE-START form toggle
- ✅ Full cycle start form
- ✅ Backend API integration
- ✅ Form validation

### v2.0.0 (2025-10-20)

**Phase 1: Card Basics**
- ✅ State machine
- ✅ Sensor integration
- ✅ Config editor

## Követelmények

- Home Assistant >= 2024.1.0
- CFM Manager Add-on
- Konfigurált CycleManager entitások

## Support

- GitHub: https://github.com/wfocsy/cfm_2lovelace/issues
- Main Project: https://github.com/wfocsy/cfm_manager

---

**Made with ❤️ for poultry farmers using Home Assistant**
