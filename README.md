# CFM Manager Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![GitHub release](https://img.shields.io/github/release/wfocsy/cfm_lovelace.svg)](https://github.com/wfocsy/cfm_lovelace/releases)
[![License](https://img.shields.io/github/license/wfocsy/cfm_lovelace.svg)](LICENSE)

Custom Lovelace card for **CFM Manager** (Baromfi Nevelő Rendszer) Home Assistant Add-on.

![CFM Manager Card Screenshot](screenshots/cfm-manager-card.png)

---

## 📋 Features

- 📡 **Backend Connection Test** - Real-time addon connectivity monitoring
- 🏠 **Areas API Integration** - Display and interact with Home Assistant areas
- 📊 **Cycle Managers Display** - Show configured cycle managers with status
- 🔍 **Debug Information** - Built-in troubleshooting and diagnostic tools
- 🎨 **Native HA Styling** - Automatically matches your Home Assistant theme
- ⚡ **REST API Communication** - Direct communication with CFM Manager backend

---

## 📦 Installation

### Method 1: HACS (Recommended)

1. Open **HACS** in Home Assistant
2. Click on **Frontend**
3. Click the **⋮** menu (top right) → **Custom repositories**
4. Add repository URL: `https://github.com/wfocsy/cfm_lovelace`
5. Category: **Lovelace**
6. Click **Add**
7. Search for **CFM Manager Card**
8. Click **Download**
9. Restart Home Assistant

### Method 2: Manual Installation

1. Download `cfm-manager-card.js` from the [latest release](https://github.com/wfocsy/cfm_lovelace/releases)
2. Create directory: `/config/www/community/cfm-manager-card/`
3. Copy `cfm-manager-card.js` to this directory
4. Add resource to Lovelace:
   - **Settings** → **Dashboards** → **Resources** → **Add Resource**
   - URL: `/hacsfiles/cfm-manager-card/cfm-manager-card.js`
   - Type: **JavaScript Module**
5. Restart Home Assistant

---

## ⚙️ Configuration

### Step 1: Configure REST Sensors (Required)

Add this to your `configuration.yaml`:

```yaml
rest:
  # Backend Connection Test
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

  # Cycle Managers API
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

**⚠️ IMPORTANT:** Replace `a0d7b954-baromfi-nevelo` with your actual addon slug!

**Find your addon URL:**
1. SSH to Home Assistant
2. Run: `ha addons info baromfi_nevelo | grep url`
3. Or use ingress URL: `http://<addon-slug>:8099`

### Step 2: Restart Home Assistant

**Developer Tools** → **YAML Configuration Reloading** → **Restart**

Wait 1-2 minutes for sensors to initialize.

### Step 3: Verify Sensors

**Developer Tools** → **States** → Search for:
- `sensor.cfm_test_connection`
- `sensor.cfm_test_areas`
- `sensor.cfm_test_cycle_managers`

Expected states:
- ✅ `sensor.cfm_test_connection` → **"online"**
- ✅ `sensor.cfm_test_areas` → **"X területek"**
- ✅ `sensor.cfm_test_cycle_managers` → **"X manager"**

### Step 4: Add Card to Dashboard

**Edit Dashboard** → **Add Card** → **Manual** → Paste:

```yaml
type: custom:cfm-manager-card
addon_url: "http://a0d7b954-baromfi-nevelo:8099"
title: "CFM Manager - Teszt"
show_debug: true
```

---

## 🎛️ Card Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `type` | string | ✅ | - | Must be `custom:cfm-manager-card` |
| `addon_url` | string | ✅ | - | CFM Manager addon URL (ingress) |
| `title` | string | ❌ | `CFM Manager - Teszt Kártya` | Card title |
| `show_debug` | boolean | ❌ | `true` | Show debug information section |

### Example Configurations

#### Minimal Configuration
```yaml
type: custom:cfm-manager-card
addon_url: "http://a0d7b954-baromfi-nevelo:8099"
```

#### Full Configuration
```yaml
type: custom:cfm-manager-card
addon_url: "http://a0d7b954-baromfi-nevelo:8099"
title: "🐔 Baromfi Nevelő - Rendszer Teszt"
show_debug: false
```

---

## 🔧 Troubleshooting

### Issue: Card shows "unknown" for all sensors

**Solution:**
1. Check **Developer Tools** → **States**
2. Verify `sensor.cfm_test_*` entities exist
3. If missing:
   - Check `configuration.yaml` for typos
   - Restart Home Assistant
   - Wait 1-2 minutes for sensors to initialize

### Issue: Sensors show "offline" or "Hiba"

**Solution:**
1. Verify CFM Manager addon is running:
   - **Settings** → **Add-ons** → **Baromfi Nevelő Rendszer** → Status: **Running**
2. Check addon URL:
   - SSH: `curl http://a0d7b954-baromfi-nevelo:8099/api/areas`
   - Expected response: JSON with areas list
3. Check Home Assistant logs:
   - **Settings** → **System** → **Logs**
   - Search for "rest sensor" errors

### Issue: "Területek Betöltése" button does nothing

**Solution:**
1. Verify REST command exists:
   - **Developer Tools** → **Services** → Search: `rest_command.cfm_test_load_areas`
2. If missing:
   - Add `rest_command` section to `configuration.yaml` (see Step 1)
   - Restart Home Assistant

### Issue: Card not showing in card picker

**Solution:**
1. Clear browser cache (Ctrl+F5)
2. Verify resource is loaded:
   - **Settings** → **Dashboards** → **Resources**
   - Check `/hacsfiles/cfm-manager-card/cfm-manager-card.js` exists
3. Check browser console for errors (F12)

---

## 🌐 Addon URL Configuration (HAOS)

The `addon_url` depends on your Home Assistant installation:

| Environment | URL Format | Example |
|-------------|------------|---------|
| **HAOS (Ingress)** | `http://<addon-slug>:8099` | `http://a0d7b954-baromfi-nevelo:8099` |
| **Docker** | `http://<container-name>:8099` | `http://baromfi-nevelo:8099` |
| **Localhost (Terminal only)** | `http://localhost:8099` | ⚠️ Won't work from Lovelace |
| **Supervisor API** | `http://supervisor/addons/self` | Alternative approach |

**Finding your slug:**
```bash
# SSH to Home Assistant
ha addons info baromfi_nevelo | grep slug
```

---

## 📸 Screenshots

### Main Card View
![Main View](screenshots/main-view.png)

### Debug Information
![Debug View](screenshots/debug-view.png)

---

## 🔗 Related Projects

- **[CFM Manager Add-on](https://github.com/wfocsy/CFM_Manager)** - Main backend addon for poultry cycle management
- **[Lovelace Cards TODO](https://github.com/wfocsy/CFM_Manager/blob/main/LOVELACE_CARDS_TODO.md)** - Full card implementation roadmap

---

## 📝 Changelog

### Version 2.1.0 (2025-10-20)

**Phase 2: Cycle Start Form**
- ✅ PRE-START state form toggle
- ✅ Full cycle start form (settled_count, settlement_date, feed prices)
- ✅ Backend API integration (POST /api/cycle-management/managers/{id}/start-cycle)
- ✅ Form validation (required fields)
- ✅ HA notification support
- ✅ Auto state refresh after cycle start
- ✅ Responsive form layout (mobile + desktop)

### Version 2.0.0 (2025-10-20)

**Phase 1: Card Basics**
- ✅ State machine (PRE-START, ACTIVE, CLOSED, UNKNOWN)
- ✅ 9 sensor integration
- ✅ Config editor
- ✅ Responsive UI
- ✅ Debug mode

### Version 1.0.0 (2025-01-20)

**Initial Release:**
- ✅ Backend connection test
- ✅ Areas API integration
- ✅ Cycle Managers display
- ✅ Debug information section
- ✅ HACS compatibility
- ✅ Native HA theme support

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m "Add new feature"`
4. Push to branch: `git push origin feature/new-feature`
5. Open a Pull Request

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 💬 Support

- **Issues:** [GitHub Issues](https://github.com/wfocsy/cfm_lovelace/issues)
- **Discussions:** [GitHub Discussions](https://github.com/wfocsy/cfm_lovelace/discussions)
- **Main Project:** [CFM Manager Add-on](https://github.com/wfocsy/CFM_Manager)

---

## 🙏 Acknowledgments

- Built for **Home Assistant** community
- Powered by **HACS** (Home Assistant Community Store)
- Developed with **Claude Code** AI assistance

---

**Made with ❤️ for poultry farmers using Home Assistant**
