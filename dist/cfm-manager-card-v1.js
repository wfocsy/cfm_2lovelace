/**
 * CFM Manager Card - Custom Lovelace Card for HACS
 *
 * Version: 1.0.1
 * Description: Test card for CFM Manager Home Assistant Add-on
 * Repository: https://github.com/wfocsy/cfm-manager-card
 * Author: wfocsy
 *
 * Features:
 * - Backend connection test
 * - Areas API integration
 * - Cycle Managers display
 * - Debug information
 */

class CFMManagerCard extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
  }

  setConfig(config) {
    if (!config.addon_url) {
      throw new Error('You need to define addon_url in the card configuration');
    }
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getCardSize() {
    return 6;
  }

  render() {
    if (!this._config || !this._hass) {
      return;
    }

    const addonUrl = this._config.addon_url;
    const title = this._config.title || 'CFM Manager - Teszt Kártya';
    const showDebug = this._config.show_debug !== false;

    // Get sensor states
    const connectionSensor = this._hass.states['sensor.cfm_test_connection'];
    const areasSensor = this._hass.states['sensor.cfm_test_areas'];
    const managersSensor = this._hass.states['sensor.cfm_test_cycle_managers'];

    const connectionState = connectionSensor ? connectionSensor.state : 'unknown';
    const areasState = areasSensor ? areasSensor.state : 'unknown';
    const managersState = managersSensor ? managersSensor.state : 'unknown';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        ha-card {
          padding: 16px;
        }

        .card-header {
          font-size: 24px;
          font-weight: 500;
          margin-bottom: 16px;
          color: var(--primary-text-color);
        }

        .test-section {
          margin-bottom: 24px;
          padding: 12px;
          background: var(--secondary-background-color);
          border-radius: 8px;
        }

        .test-section-title {
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .test-section-title ha-icon {
          --mdi-icon-size: 24px;
        }

        .sensor-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid var(--divider-color);
        }

        .sensor-row:last-child {
          border-bottom: none;
        }

        .sensor-name {
          font-weight: 500;
          color: var(--primary-text-color);
        }

        .sensor-state {
          padding: 4px 12px;
          border-radius: 12px;
          font-weight: 500;
        }

        .sensor-state.online {
          background: var(--success-color);
          color: white;
        }

        .sensor-state.offline {
          background: var(--error-color);
          color: white;
        }

        .sensor-state.unknown {
          background: var(--warning-color);
          color: white;
        }

        .button-row {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        button {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 8px;
          background: var(--primary-color);
          color: var(--text-primary-color);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        button:hover {
          opacity: 0.8;
        }

        button:active {
          opacity: 0.6;
        }

        .debug-section {
          margin-top: 24px;
          padding: 12px;
          background: var(--code-editor-background-color, #1e1e1e);
          border-radius: 8px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: var(--code-editor-text-color, #d4d4d4);
          overflow-x: auto;
        }

        .debug-section code {
          display: block;
          white-space: pre;
        }

        .status-icon {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 8px;
        }

        .status-icon.online {
          background: var(--success-color);
        }

        .status-icon.offline {
          background: var(--error-color);
        }

        .status-icon.unknown {
          background: var(--warning-color);
        }
      </style>

      <ha-card>
        <div class="card-header">
          <span class="status-icon ${connectionState}"></span>
          ${title}
        </div>

        <!-- Test Section 1: Backend Connection -->
        <div class="test-section">
          <div class="test-section-title">
            <ha-icon icon="mdi:server-network"></ha-icon>
            1️⃣ Backend Kapcsolat
          </div>
          <div class="sensor-row">
            <span class="sensor-name">Backend Állapot</span>
            <span class="sensor-state ${connectionState}">${connectionState}</span>
          </div>
        </div>

        <!-- Test Section 2: Areas API -->
        <div class="test-section">
          <div class="test-section-title">
            <ha-icon icon="mdi:home-group"></ha-icon>
            2️⃣ Területek API
          </div>
          <div class="sensor-row">
            <span class="sensor-name">Területek</span>
            <span class="sensor-state ${areasState === 'unknown' ? 'unknown' : 'online'}">${areasState}</span>
          </div>
          <div class="button-row">
            <button class="load-areas-btn">
              Területek Betöltése
            </button>
          </div>
        </div>

        <!-- Test Section 3: Cycle Managers -->
        <div class="test-section">
          <div class="test-section-title">
            <ha-icon icon="mdi:folder-account"></ha-icon>
            3️⃣ Cycle Managers
          </div>
          <div class="sensor-row">
            <span class="sensor-name">Managers</span>
            <span class="sensor-state ${managersState === 'unknown' ? 'unknown' : 'online'}">${managersState}</span>
          </div>
        </div>

        ${showDebug ? `
        <!-- Debug Section -->
        <div class="debug-section">
          <code>🔍 Debug Információ

Backend URL: ${addonUrl}

Szenzorok:
- sensor.cfm_test_connection: ${connectionState}
- sensor.cfm_test_areas: ${areasState}
- sensor.cfm_test_cycle_managers: ${managersState}

Konfiguráció:
${JSON.stringify(this._config, null, 2)}

Hibaelhárítás:
1. Ellenőrizd: Developer Tools → States
2. Nézd meg a sensor attribútumokat
3. Ha "offline", ellenőrizd az addon URL-t
4. Ha "unknown", várj 1 percet (scan_interval)</code>
        </div>
        ` : ''}
      </ha-card>
    `;

    // Add click event listeners after rendering
    this._attachEventListeners();
  }

  _attachEventListeners() {
    const loadAreasBtn = this.shadowRoot.querySelector('.load-areas-btn');
    if (loadAreasBtn) {
      loadAreasBtn.addEventListener('click', () => {
        this._loadAreas();
      });
    }
  }

  _loadAreas() {
    if (!this._hass) return;

    this._hass.callService('rest_command', 'cfm_test_load_areas', {})
      .then(() => {
        this._showNotification('Területek betöltése sikeres', 'success');
      })
      .catch(err => {
        this._showNotification('Hiba: ' + err.message, 'error');
      });
  }

  _showNotification(message, type) {
    const event = new Event('hass-notification', {
      bubbles: true,
      composed: true,
      detail: { message, type }
    });
    this.dispatchEvent(event);
  }

  static getStubConfig() {
    return {
      addon_url: 'http://a0d7b954-baromfi-nevelo:8099',
      title: 'CFM Manager - Teszt Kártya',
      show_debug: true
    };
  }
}

// Register the custom card
customElements.define('cfm-manager-card', CFMManagerCard);

// Register with card picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'cfm-manager-card',
  name: 'CFM Manager Card',
  description: 'Test card for CFM Manager Add-on',
  preview: false,
  documentationURL: 'https://github.com/wfocsy/cfm-manager-card',
});

console.info(
  '%c CFM-MANAGER-CARD %c 1.0.1 ',
  'color: white; background: #4CAF50; font-weight: 700;',
  'color: #4CAF50; background: white; font-weight: 700;'
);
