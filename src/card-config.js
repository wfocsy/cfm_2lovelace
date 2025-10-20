/**
 * CFM Manager Card - Config Editor
 *
 * Version: v2.0.0
 * Config UI for Lovelace Card Editor
 */

class CfmManagerCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
  }

  /**
   * Set card configuration
   * @param {Object} config - Card configuration
   */
  setConfig(config) {
    this._config = config || {};
    this._render();
  }

  /**
   * HA passes hass object to editor
   * @param {Object} hass - Home Assistant object
   */
  set hass(hass) {
    this._hass = hass;
  }

  /**
   * Get all available cycle managers from sensors
   * @returns {Array} - Array of manager objects
   */
  _getAvailableManagers() {
    if (!this._hass) return [];

    const managers = [];
    const states = this._hass.states;

    // Find all manager sensors (sensor.manager_X_cycle_status)
    Object.keys(states).forEach(entity_id => {
      const match = entity_id.match(/^sensor\.manager_(\d+)_cycle_status$/);
      if (match) {
        const managerId = parseInt(match[1]);
        const entity = states[entity_id];
        const managerName = entity.attributes?.manager_name || `Manager ${managerId}`;
        const areaName = entity.attributes?.area_name || 'N/A';

        managers.push({
          id: managerId,
          name: managerName,
          area: areaName,
          entity_id: entity_id
        });
      }
    });

    // Sort by ID
    managers.sort((a, b) => a.id - b.id);

    return managers;
  }

  /**
   * Render config editor
   */
  _render() {
    if (!this.shadowRoot) return;

    const managers = this._getAvailableManagers();

    this.shadowRoot.innerHTML = `
      <style>
        ${this._getStyles()}
      </style>

      <div class="config-editor">
        <div class="config-header">
          <h3>CFM Manager Card</h3>
        </div>

        <div class="config-section">
          <label class="config-label">
            Melyik manager-t jelenítse meg ez a kártya?
            <span class="required">*</span>
          </label>

          ${managers.length > 0 ? `
            <select
              class="config-input"
              id="manager-select"
              .value="${this._config.manager_id || ''}"
            >
              <option value="">-- Válassz --</option>
              ${managers.map(m => `
                <option
                  value="${m.id}"
                  ${this._config.manager_id === m.id ? 'selected' : ''}
                >
                  ${m.name} (${m.area})
                </option>
              `).join('')}
            </select>
          ` : `
            <div class="warning-box">
              Nincs elérhető Cycle Manager sensor.<br>
              Ellenőrizd: sensor.manager_*_cycle_status létezik?
            </div>
          `}
        </div>

        <div class="config-section">
          <label class="config-label">
            Napi mentés időpont
          </label>

          <input
            type="time"
            class="config-input"
            id="daily-save-time"
            .value="${this._config.daily_save_time || '07:00'}"
          />

          <small class="help-text">
            Automatikus időzítő (Fázis 4 funkció)
          </small>
        </div>

        <div class="config-section">
          <label class="config-checkbox">
            <input
              type="checkbox"
              id="show-notifications"
              ${this._config.show_notifications !== false ? 'checked' : ''}
            />
            Értesítések
          </label>
        </div>

        <div class="config-section">
          <label class="config-checkbox">
            <input
              type="checkbox"
              id="show-debug"
              ${this._config.show_debug === true ? 'checked' : ''}
            />
            Debug mód
          </label>
        </div>
      </div>
    `;

    this._attachEventListeners();
  }

  /**
   * Attach event listeners to config inputs
   */
  _attachEventListeners() {
    const managerSelect = this.shadowRoot.getElementById('manager-select');
    const dailySaveTime = this.shadowRoot.getElementById('daily-save-time');
    const showNotifications = this.shadowRoot.getElementById('show-notifications');
    const showDebug = this.shadowRoot.getElementById('show-debug');

    if (managerSelect) {
      managerSelect.addEventListener('change', (e) => {
        this._updateConfig('manager_id', parseInt(e.target.value));
      });
    }

    if (dailySaveTime) {
      dailySaveTime.addEventListener('change', (e) => {
        this._updateConfig('daily_save_time', e.target.value);
      });
    }

    if (showNotifications) {
      showNotifications.addEventListener('change', (e) => {
        this._updateConfig('show_notifications', e.target.checked);
      });
    }

    if (showDebug) {
      showDebug.addEventListener('change', (e) => {
        this._updateConfig('show_debug', e.target.checked);
      });
    }
  }

  /**
   * Update config and fire event
   * @param {string} key - Config key
   * @param {any} value - Config value
   */
  _updateConfig(key, value) {
    this._config = {
      ...this._config,
      [key]: value
    };

    // Fire config-changed event for Lovelace
    const event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);

    console.log('[CFM Card Config] Updated:', this._config);
  }

  /**
   * Get config editor styles
   */
  _getStyles() {
    return `
      :host {
        display: block;
      }

      .config-editor {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .config-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
        color: #333;
      }

      .config-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .config-label {
        font-size: 14px;
        font-weight: 500;
        color: #333;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .required {
        color: #F44336;
      }

      .config-input {
        padding: 10px;
        font-size: 14px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: white;
      }

      .config-input:focus {
        outline: none;
        border-color: #2196F3;
      }

      .config-checkbox {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #333;
        cursor: pointer;
      }

      .config-checkbox input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      .help-text {
        font-size: 12px;
        color: #666;
        margin-top: -4px;
      }

      .warning-box {
        padding: 12px;
        background-color: #fff3cd;
        border: 1px solid #ffc107;
        border-radius: 4px;
        color: #856404;
        font-size: 14px;
        line-height: 1.5;
      }

      .config-info {
        padding: 12px;
        background-color: #e3f2fd;
        border-radius: 4px;
        font-size: 13px;
        color: #1565c0;
      }

      .config-info strong {
        display: block;
        margin-bottom: 8px;
      }

      .config-info ul {
        margin: 0;
        padding-left: 20px;
      }

      .config-info li {
        margin: 4px 0;
        font-family: monospace;
      }
    `;
  }
}

// Register config editor
customElements.define('cfm-manager-card-editor', CfmManagerCardEditor);

console.log('[CFM Card] v2.0.0 - Config Editor loaded successfully');
