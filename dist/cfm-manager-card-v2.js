/**
 * CFM Manager Card v2.0.0
 *
 * PRODUCTION BUILD - Fázis 1: Card Alapok
 *
 * Funkciók:
 * - State machine (PRE-START, ACTIVE, CLOSED)
 * - Sensor beolvasás Home Assistant-ből
 * - Dinamikus UI állapot szerint
 * - Config editor (manager választás)
 *
 * Author: Fehér Zsolt
 * License: MIT
 */

(function() {
  'use strict';

  // ============================================================
  // STYLES (inline CSS)
  // ============================================================

  const CARD_STYLES = `
    :host {
      display: block;
    }

    ha-card {
      padding: 16px;
      overflow: hidden;
    }

    .card-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Header */
    .header {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      color: #333;
    }

    .cycle-id {
      font-size: 16px;
      color: #666;
      font-weight: 400;
    }

    /* Status badges */
    .status {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      display: inline-block;
      max-width: fit-content;
    }

    .status.waiting { background-color: #FFA500; color: white; }
    .status.completed { background-color: #4CAF50; color: white; }
    .status.error { background-color: #F44336; color: white; }

    /* Info rows */
    .info-row {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 120px;
    }

    .label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .value {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .breed {
      font-size: 15px;
      color: #555;
      font-style: italic;
    }

    /* Metrics grid */
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      margin: 8px 0;
    }

    .metric {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 14px;
      background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
      border-radius: 10px;
      border: 1px solid #e0e0e0;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .metric:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .metric-label {
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }

    .metric-value {
      font-size: 20px;
      font-weight: 700;
      color: #2196F3;
    }

    /* Buttons */
    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 8px;
    }

    button {
      padding: 14px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    button:active {
      transform: translateY(0);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .primary-button {
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
    }

    .primary-button:hover {
      background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
    }

    .secondary-button {
      background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
      color: white;
    }

    .secondary-button:hover {
      background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
    }

    .danger-button {
      background: linear-gradient(135deg, #F44336 0%, #D32F2F 100%);
      color: white;
    }

    .danger-button:hover {
      background: linear-gradient(135deg, #D32F2F 0%, #C62828 100%);
    }

    /* Next save timer */
    .next-save {
      text-align: center;
      font-size: 14px;
      color: #666;
      padding: 12px;
      background-color: #fff8e1;
      border-radius: 8px;
      border: 1px solid #ffd54f;
      font-weight: 500;
    }

    /* Summary (closed cycle) */
    .summary {
      display: flex;
      flex-direction: column;
      gap: 0;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
      transition: background-color 0.2s;
    }

    .summary-item:last-child {
      border-bottom: none;
    }

    .summary-item:hover {
      background-color: #f5f5f5;
    }

    .summary-item .label {
      font-size: 14px;
      color: #666;
    }

    .summary-item .value {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    /* Error state */
    .error-message {
      padding: 16px;
      background-color: #ffebee;
      border-radius: 8px;
      border: 1px solid #ef5350;
      color: #c62828;
    }

    .error-message p {
      margin: 8px 0;
      line-height: 1.5;
    }

    .error-message p:first-child {
      margin-top: 0;
      font-weight: 600;
    }

    .error-message p:last-child {
      margin-bottom: 0;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .metrics { grid-template-columns: 1fr; }
      .info-row { flex-direction: column; gap: 12px; }
      ha-card { padding: 12px; }
      .header h2 { font-size: 18px; }
      button { font-size: 14px; padding: 12px; }
    }
  `;

  const CONFIG_STYLES = `
    :host {
      display: block;
    }

    .config-editor {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      background-color: #fafafa;
      border-radius: 8px;
    }

    .config-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    .config-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
      background-color: white;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .config-label {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .required {
      color: #F44336;
      font-weight: bold;
    }

    .config-input {
      padding: 12px;
      font-size: 14px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      background-color: white;
      transition: border-color 0.2s;
    }

    .config-input:focus {
      outline: none;
      border-color: #2196F3;
      box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
    }

    .config-checkbox {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      color: #333;
      cursor: pointer;
      padding: 8px 0;
    }

    .config-checkbox input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
      accent-color: #2196F3;
    }

    .help-text {
      font-size: 12px;
      color: #777;
      margin-top: -4px;
      line-height: 1.4;
    }

    .warning-box {
      padding: 14px;
      background-color: #fff3cd;
      border: 2px solid #ffc107;
      border-radius: 6px;
      color: #856404;
      font-size: 14px;
      line-height: 1.6;
    }

    .config-info {
      padding: 14px;
      background-color: #e3f2fd;
      border-radius: 6px;
      font-size: 13px;
      color: #1565c0;
      border: 1px solid #90caf9;
    }

    .config-info strong {
      display: block;
      margin-bottom: 10px;
      font-size: 14px;
    }

    .config-info ul {
      margin: 0;
      padding-left: 24px;
    }

    .config-info li {
      margin: 6px 0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
    }
  `;

  // ============================================================
  // MAIN CARD CLASS
  // ============================================================

  class CfmManagerCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._config = {};
      this._hass = null;
      this._currentState = 'UNKNOWN';
    }

    setConfig(config) {
      if (!config.manager_id) {
        throw new Error('manager_id is required in configuration');
      }

      this._config = {
        manager_id: config.manager_id,
        daily_save_time: config.daily_save_time || '07:00',
        show_notifications: config.show_notifications !== false,
        show_debug: config.show_debug || false
      };

      this._render();
    }

    set hass(hass) {
      this._hass = hass;
      this._updateState();
      this._render();
    }

    _updateState() {
      if (!this._hass || !this._config.manager_id) {
        this._currentState = 'UNKNOWN';
        return;
      }

      const managerId = this._config.manager_id;
      const statusSensor = `sensor.manager_${managerId}_cycle_status`;
      const statusEntity = this._hass.states[statusSensor];

      if (!statusEntity) {
        console.warn(`[CFM Card] Sensor not found: ${statusSensor}`);
        this._currentState = 'UNKNOWN';
        return;
      }

      const status = statusEntity.state;

      if (status === 'waiting' || status === 'idle') {
        this._currentState = 'PRE-START';
      } else if (status === 'active' || status === 'running') {
        this._currentState = 'ACTIVE';
      } else if (status === 'completed' || status === 'closed') {
        this._currentState = 'CLOSED';
      } else {
        this._currentState = 'UNKNOWN';
      }

      if (this._config.show_debug) {
        console.log(`[CFM Card] State: ${this._currentState}, Status: ${status}`);
      }
    }

    _getSensorValue(entity_id) {
      if (!this._hass || !entity_id) return null;
      const entity = this._hass.states[entity_id];
      return entity ? entity.state : null;
    }

    _getSensorAttribute(entity_id, attribute) {
      if (!this._hass || !entity_id) return null;
      const entity = this._hass.states[entity_id];
      return entity && entity.attributes ? entity.attributes[attribute] : null;
    }

    _render() {
      if (!this.shadowRoot) return;

      const managerId = this._config.manager_id;
      const managerNameSensor = `sensor.manager_${managerId}_cycle_status`;
      const managerName = this._getSensorAttribute(managerNameSensor, 'manager_name') || `Manager ${managerId}`;

      let content = '';

      switch (this._currentState) {
        case 'PRE-START':
          content = this._renderPreStart(managerName);
          break;
        case 'ACTIVE':
          content = this._renderActiveCycle(managerName);
          break;
        case 'CLOSED':
          content = this._renderClosedCycle(managerName);
          break;
        case 'UNKNOWN':
        default:
          content = this._renderUnknown(managerName);
          break;
      }

      this.shadowRoot.innerHTML = `
        <style>${CARD_STYLES}</style>
        <ha-card>${content}</ha-card>
      `;
    }

    _renderPreStart(managerName) {
      return `
        <div class="card-content pre-start">
          <div class="header">
            <h2>${managerName}</h2>
            <div class="status waiting">Várakozik ciklus indításra</div>
          </div>
          <div class="action-buttons">
            <button class="primary-button" onclick="this.getRootNode().host._handleStartCycle()">
              🐔 CIKLUS INDÍTÁS
            </button>
          </div>
        </div>
      `;
    }

    _renderActiveCycle(managerName) {
      const managerId = this._config.manager_id;

      const cycleId = this._getSensorValue(`sensor.manager_${managerId}_current_cycle_id`);
      const cycleDay = this._getSensorValue(`sensor.manager_${managerId}_cycle_day`);
      const currentStock = this._getSensorValue(`sensor.manager_${managerId}_current_stock`);
      const averageWeight = this._getSensorValue(`sensor.manager_${managerId}_average_weight`);
      const fcr = this._getSensorValue(`sensor.manager_${managerId}_fcr`);
      const dailyFeed = this._getSensorValue(`sensor.manager_${managerId}_daily_feed_consumed`);
      const totalMortality = this._getSensorValue(`sensor.manager_${managerId}_total_mortality`);
      const mortalityRate = this._getSensorValue(`sensor.manager_${managerId}_mortality_rate`);
      const breed = this._getSensorAttribute(`sensor.manager_${managerId}_cycle_status`, 'breed');

      return `
        <div class="card-content active-cycle">
          <div class="header">
            <h2>${managerName}</h2>
            <div class="cycle-id">${cycleId || 'N/A'}</div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="label">Kor:</span>
              <span class="value">${cycleDay || 0} nap</span>
            </div>
            <div class="info-item">
              <span class="label">Állomány:</span>
              <span class="value">${currentStock || 0} db</span>
            </div>
          </div>
          <div class="info-row">
            <span class="breed">Fajta: ${breed || 'N/A'}</span>
          </div>
          <div class="metrics">
            <div class="metric">
              <span class="metric-label">Súly</span>
              <span class="metric-value">${averageWeight || 0}g</span>
            </div>
            <div class="metric">
              <span class="metric-label">FCR</span>
              <span class="metric-value">${fcr || 'N/A'}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Takarmány</span>
              <span class="metric-value">${dailyFeed || 0}kg/nap</span>
            </div>
            <div class="metric">
              <span class="metric-label">Elhullás</span>
              <span class="metric-value">${totalMortality || 0} db (${mortalityRate || 0}%)</span>
            </div>
          </div>
          <div class="action-buttons">
            <button class="secondary-button" onclick="this.getRootNode().host._handleShipping()">
              🚚 Elszállítás
            </button>
            <button class="secondary-button" onclick="this.getRootNode().host._handleMortality()">
              💀 Elhullás
            </button>
            <button class="danger-button" onclick="this.getRootNode().host._handleCloseCycle()">
              📊 Ciklus Lezárás
            </button>
          </div>
          <div class="next-save">
            ⏰ Következő mentés: holnap ${this._config.daily_save_time}
          </div>
        </div>
      `;
    }

    _renderClosedCycle(managerName) {
      const managerId = this._config.manager_id;

      const cycleId = this._getSensorValue(`sensor.manager_${managerId}_last_cycle_id`);
      const duration = this._getSensorValue(`sensor.manager_${managerId}_last_cycle_duration`);
      const finalStock = this._getSensorValue(`sensor.manager_${managerId}_last_final_stock`);
      const finalWeight = this._getSensorValue(`sensor.manager_${managerId}_last_final_weight`);
      const finalFcr = this._getSensorValue(`sensor.manager_${managerId}_last_final_fcr`);
      const totalShipped = this._getSensorValue(`sensor.manager_${managerId}_last_total_shipped`);
      const totalMortality = this._getSensorValue(`sensor.manager_${managerId}_last_total_mortality`);
      const mortalityRate = this._getSensorValue(`sensor.manager_${managerId}_last_mortality_rate`);

      return `
        <div class="card-content closed-cycle">
          <div class="header">
            <h2>${managerName}</h2>
            <div class="cycle-id">${cycleId || 'N/A'}</div>
            <div class="status completed">✅ Lezárt ciklus</div>
          </div>
          <div class="summary">
            <div class="summary-item">
              <span class="label">Időtartam:</span>
              <span class="value">${duration || 0} nap</span>
            </div>
            <div class="summary-item">
              <span class="label">Végső állomány:</span>
              <span class="value">${finalStock || 0} db</span>
            </div>
            <div class="summary-item">
              <span class="label">Végső súly:</span>
              <span class="value">${finalWeight || 0}g</span>
            </div>
            <div class="summary-item">
              <span class="label">Végső FCR:</span>
              <span class="value">${finalFcr || 'N/A'}</span>
            </div>
            <div class="summary-item">
              <span class="label">Elszállítás:</span>
              <span class="value">${totalShipped || 0} db</span>
            </div>
            <div class="summary-item">
              <span class="label">Elhullás:</span>
              <span class="value">${totalMortality || 0} db (${mortalityRate || 0}%)</span>
            </div>
          </div>
          <div class="action-buttons">
            <button class="primary-button" onclick="this.getRootNode().host._handleStartCycle()">
              🐔 ÚJ CIKLUS INDÍTÁS
            </button>
          </div>
        </div>
      `;
    }

    _renderUnknown(managerName) {
      return `
        <div class="card-content unknown">
          <div class="header">
            <h2>${managerName}</h2>
            <div class="status error">❌ Ismeretlen állapot</div>
          </div>
          <div class="error-message">
            <p>Nem található sensor: sensor.manager_${this._config.manager_id}_cycle_status</p>
            <p>Ellenőrizd a konfigurációt és a szenzorok létezését!</p>
          </div>
        </div>
      `;
    }

    _handleStartCycle() {
      console.log('[CFM Card] Start Cycle clicked - TODO: Implement form (Phase 2)');
      alert('Ciklus indítás - Implementálva lesz Fázis 2-ben');
    }

    _handleShipping() {
      console.log('[CFM Card] Shipping clicked - TODO: Implement modal (Phase 3)');
      alert('Elszállítás rögzítés - Implementálva lesz Fázis 3-ban');
    }

    _handleMortality() {
      console.log('[CFM Card] Mortality clicked - TODO: Implement modal (Phase 3)');
      alert('Elhullás rögzítés - Implementálva lesz Fázis 3-ban');
    }

    _handleCloseCycle() {
      console.log('[CFM Card] Close Cycle clicked - TODO: Implement confirm (Phase 3)');
      if (confirm('Biztosan lezárod a ciklust?')) {
        alert('Ciklus lezárás - Implementálva lesz Fázis 3-ban');
      }
    }

    static getStubConfig() {
      return {
        manager_id: 1,
        daily_save_time: '07:00',
        show_notifications: true,
        show_debug: false
      };
    }

    getCardSize() {
      switch (this._currentState) {
        case 'ACTIVE': return 8;
        case 'CLOSED': return 7;
        case 'PRE-START':
        default: return 3;
      }
    }

    static getConfigElement() {
      return document.createElement('cfm-manager-card-editor');
    }
  }

  // ============================================================
  // CONFIG EDITOR CLASS
  // ============================================================

  class CfmManagerCardEditor extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._config = {};
      this._hass = null;
    }

    setConfig(config) {
      this._config = config || {};
      this._render();
    }

    set hass(hass) {
      this._hass = hass;
    }

    _getAvailableManagers() {
      if (!this._hass) return [];

      const managers = [];
      const states = this._hass.states;

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

      managers.sort((a, b) => a.id - b.id);
      return managers;
    }

    _render() {
      if (!this.shadowRoot) return;

      const managers = this._getAvailableManagers();

      this.shadowRoot.innerHTML = `
        <style>${CONFIG_STYLES}</style>
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
              <select class="config-input" id="manager-select" .value="${this._config.manager_id || ''}">
                <option value="">-- Válassz --</option>
                ${managers.map(m => `
                  <option value="${m.id}" ${this._config.manager_id === m.id ? 'selected' : ''}>
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
            <label class="config-label">Napi mentés időpont</label>
            <input type="time" class="config-input" id="daily-save-time" .value="${this._config.daily_save_time || '07:00'}" />
            <small class="help-text">
              Automatikus időzítő (Fázis 4 funkció)
            </small>
          </div>

          <div class="config-section">
            <label class="config-checkbox">
              <input type="checkbox" id="show-notifications" ${this._config.show_notifications !== false ? 'checked' : ''} />
              Értesítések
            </label>
          </div>

          <div class="config-section">
            <label class="config-checkbox">
              <input type="checkbox" id="show-debug" ${this._config.show_debug === true ? 'checked' : ''} />
              Debug mód
            </label>
          </div>
        </div>
      `;

      this._attachEventListeners();
    }

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

    _updateConfig(key, value) {
      this._config = { ...this._config, [key]: value };

      const event = new CustomEvent('config-changed', {
        detail: { config: this._config },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(event);

      console.log('[CFM Card Config] Updated:', this._config);
    }
  }

  // ============================================================
  // REGISTER CUSTOM ELEMENTS
  // ============================================================

  customElements.define('cfm-manager-card', CfmManagerCard);
  customElements.define('cfm-manager-card-editor', CfmManagerCardEditor);

  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'cfm-manager-card',
    name: 'CFM Manager Card',
    description: 'Baromfi nevelési ciklus kezelő kártya v2.0.0',
    preview: true
  });

  console.log('%c CFM Manager Card v2.0.0 %c Loaded successfully ',
    'background: #4CAF50; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
    'background: #2196F3; color: white; padding: 2px 6px; border-radius: 3px;'
  );

})();
