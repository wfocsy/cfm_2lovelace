# CFM Manager Card

Custom Lovelace card for **CFM Manager** (Baromfi Nevelő Rendszer) Home Assistant Add-on.

## Features

- 📡 **Backend Connection Test** - Check addon connectivity
- 🏠 **Areas API Integration** - Display Home Assistant areas
- 📊 **Cycle Managers Display** - Show configured cycle managers
- 🔍 **Debug Information** - Built-in troubleshooting tools

## Installation

### HACS (Recommended)

1. Open **HACS** in Home Assistant
2. Click on **Frontend**
3. Click the **+** button
4. Search for **CFM Manager Card**
5. Click **Install**
6. Restart Home Assistant

### Manual Installation

1. Download `cfm-manager-card.js` from the [latest release](https://github.com/wfocsy/cfm_lovelace/releases)
2. Copy it to `/config/www/community/cfm-manager-card/`
3. Add the resource in Lovelace:
   - Settings → Dashboards → Resources → Add Resource
   - URL: `/hacsfiles/cfm-manager-card/cfm-manager-card.js`
   - Type: JavaScript Module

## Configuration

### Prerequisites

**IMPORTANT:** This card requires REST sensors to be configured first!

Add this to your `configuration.yaml`:

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

**Note:** Replace `a0d7b954-baromfi-nevelo` with your addon slug if different.

### Basic Card Configuration

```yaml
type: custom:cfm-manager-card
addon_url: "http://a0d7b954-baromfi-nevelo:8099"
title: "CFM Manager - Teszt"
show_debug: true
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `addon_url` | string | **required** | CFM Manager addon URL |
| `title` | string | `CFM Manager - Teszt Kártya` | Card title |
| `show_debug` | boolean | `true` | Show debug section |

## Troubleshooting

### Card shows "unknown" states

1. Check REST sensors in **Developer Tools → States**
2. Verify addon URL is correct (ingress URL, not localhost)
3. Wait 1-2 minutes for sensors to initialize
4. Check Home Assistant logs for REST sensor errors

### "Területek Betöltése" button doesn't work

1. Verify `rest_command.cfm_test_load_areas` exists in configuration.yaml
2. Restart Home Assistant after adding REST commands
3. Check Services tab: `rest_command.cfm_test_load_areas` should be listed

### Addon URL Options (HAOS)

- **Ingress URL (RECOMMENDED):** `http://a0d7b954-baromfi-nevelo:8099`
- **Localhost (won't work from Lovelace):** `http://localhost:8099`
- **Supervisor API (alternative):** `http://supervisor/addons/self`

## Screenshots

*Coming soon*

## Related Projects

- [CFM Manager Add-on](https://github.com/wfocsy/CFM_Manager) - Main backend addon
- [CFM Manager Documentation](https://github.com/wfocsy/CFM_Manager/blob/main/LOVELACE_CARDS_TODO.md)

## License

MIT License - See LICENSE file for details

## Support

- [Report Issues](https://github.com/wfocsy/cfm_lovelace/issues)
- [Discussion Forum](https://github.com/wfocsy/cfm_lovelace/discussions)
