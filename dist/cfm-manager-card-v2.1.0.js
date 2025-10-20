/**
 * CFM Manager Card - Main Class
 *
 * Version: v2.1.0
 * State Machine: PRE-START → ACTIVE CYCLE → CLOSED
 * Phase 2: Cycle Start Form Implementation
 */

class CfmManagerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._currentState = 'UNKNOWN';
    this._showStartForm = false;
    this._formData = {};
  }

  /**
   * Set card configuration from Lovelace UI
   * @param {Object} config - Card configuration
   */
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

  /**
   * HA passes hass object to card
   * @param {Object} hass - Home Assistant object
   */
  set hass(hass) {
    this._hass = hass;
    this._updateState();
    this._render();
  }

  /**
   * State machine - Detect current cycle state
   * @returns {string} - Current state (PRE-START, ACTIVE, CLOSED, UNKNOWN)
   */
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

    // State machine logic
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

  /**
   * Get sensor value from Home Assistant
   * @param {string} entity_id - Sensor entity ID
   * @returns {string|null} - Sensor value or null
   */
  _getSensorValue(entity_id) {
    if (!this._hass || !entity_id) return null;

    const entity = this._hass.states[entity_id];
    return entity ? entity.state : null;
  }

  /**
   * Get sensor attribute from Home Assistant
   * @param {string} entity_id - Sensor entity ID
   * @param {string} attribute - Attribute name
   * @returns {any} - Attribute value or null
   */
  _getSensorAttribute(entity_id, attribute) {
    if (!this._hass || !entity_id) return null;

    const entity = this._hass.states[entity_id];
    return entity && entity.attributes ? entity.attributes[attribute] : null;
  }

  /**
   * Render card based on current state
   */
  _render() {
    if (!this.shadowRoot) return;

    const managerId = this._config.manager_id;

    // Get manager name from sensor attribute
    const managerNameSensor = `sensor.manager_${managerId}_cycle_status`;
    const managerName = this._getSensorAttribute(managerNameSensor, 'manager_name') || `Manager ${managerId}`;

    // Render based on state
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
      <style>
        ${this._getStyles()}
      </style>
      <ha-card>
        ${content}
      </ha-card>
    `;
  }

  /**
   * Render PRE-START state (Várakozó)
   */
  _renderPreStart(managerName) {
    if (this._showStartForm) {
      return this._renderStartForm(managerName);
    }

    return `
      <div class="card-content pre-start">
        <div class="header">
          <h2>${managerName}</h2>
          <div class="status waiting">Várakozik ciklus indításra</div>
        </div>

        <div class="action-buttons">
          <button class="primary-button" onclick="this.getRootNode().host._toggleStartForm()">
            🐔 CIKLUS INDÍTÁS
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render Cycle Start Form (Phase 2)
   */
  _renderStartForm(managerName) {
    const today = new Date().toISOString().split('T')[0];

    return `
      <div class="card-content start-form">
        <div class="header">
          <h2>${managerName}</h2>
          <div class="status waiting">Új Ciklus Indítása</div>
        </div>

        <form id="cycleStartForm" class="form-container">
          <!-- KÖTELEZŐ MEZŐK -->
          <div class="form-section">
            <h3>Alapadatok</h3>

            <div class="form-group">
              <label>Ciklus ID (opcionális):</label>
              <input type="text" id="cycle_id" placeholder="Automatikus generálás" />
              <span class="form-hint">Üres marad = automatikus generálás (MSZ/2025/001 formátum)</span>
            </div>

            <div class="form-group">
              <label>Betelepített madarak száma: *</label>
              <input type="number" id="settled_count" required min="1" placeholder="pl. 1000" />
            </div>

            <div class="form-group">
              <label>Betelepítés dátuma: *</label>
              <input type="date" id="settlement_date" required value="${today}" />
            </div>

            <div class="form-group">
              <label>Betelepítési kor (nap):</label>
              <input type="number" id="settlement_age_days" value="0" min="0" />
              <span class="form-hint">0 = naposcsibe</span>
            </div>
          </div>

          <!-- TAKARMÁNY ÁRAK -->
          <div class="form-section">
            <h3>Takarmány árak (Ft/kg)</h3>

            <div class="form-row">
              <div class="form-group-inline">
                <label>Fázis 1:</label>
                <input type="number" id="feed_phase1_price" value="0" min="0" step="0.1" />
              </div>
              <div class="form-group-inline">
                <label>Fázis 2:</label>
                <input type="number" id="feed_phase2_price" value="0" min="0" step="0.1" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group-inline">
                <label>Fázis 3:</label>
                <input type="number" id="feed_phase3_price" value="0" min="0" step="0.1" />
              </div>
              <div class="form-group-inline">
                <label>Fázis 4:</label>
                <input type="number" id="feed_phase4_price" value="0" min="0" step="0.1" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group-inline">
                <label>Fázis 5:</label>
                <input type="number" id="feed_phase5_price" value="0" min="0" step="0.1" />
              </div>
            </div>
          </div>

          <!-- OPCIONÁLIS MEZŐK -->
          <div class="form-section">
            <h3>További beállítások</h3>

            <div class="form-group">
              <label>Kezdeti takarmány készlet (kg):</label>
              <input type="number" id="initial_feed_amount" value="0" min="0" step="0.1" />
            </div>

            <div class="form-group">
              <label>Hiányzó elhullások száma:</label>
              <input type="number" id="missed_mortality_count" value="0" min="0" />
              <span class="form-hint">Korábbi, nem regisztrált elhullások pótlása</span>
            </div>
          </div>

          <!-- GOMBOK -->
          <div class="form-actions">
            <button type="button" class="secondary-button" onclick="this.getRootNode().host._toggleStartForm()">
              ❌ Mégsem
            </button>
            <button type="submit" class="primary-button" onclick="event.preventDefault(); this.getRootNode().host._submitStartForm();">
              ✅ CIKLUS INDÍTÁS
            </button>
          </div>
        </form>
      </div>
    `;
  }

  /**
   * Render ACTIVE CYCLE state (Futó ciklus)
   */
  _renderActiveCycle(managerName) {
    const managerId = this._config.manager_id;

    // Get cycle data from sensors
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

  /**
   * Render CLOSED CYCLE state (Lezárt ciklus)
   */
  _renderClosedCycle(managerName) {
    const managerId = this._config.manager_id;

    // Get final cycle data
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

  /**
   * Render UNKNOWN state (Hibás konfiguráció)
   */
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

  /**
   * Event handlers
   */

  /**
   * Toggle Cycle Start Form visibility
   */
  _toggleStartForm() {
    this._showStartForm = !this._showStartForm;
    this._render();
  }

  /**
   * Submit Cycle Start Form
   */
  async _submitStartForm() {
    if (!this.shadowRoot) return;

    const form = this.shadowRoot.getElementById('cycleStartForm');
    if (!form) return;

    // Collect form data
    const formData = {
      cycle_id: this.shadowRoot.getElementById('cycle_id').value || null,
      settled_count: parseInt(this.shadowRoot.getElementById('settled_count').value),
      settlement_date: this.shadowRoot.getElementById('settlement_date').value,
      settlement_age_days: parseInt(this.shadowRoot.getElementById('settlement_age_days').value) || 0,
      initial_feed_amount: parseFloat(this.shadowRoot.getElementById('initial_feed_amount').value) || 0.0,
      feed_phase1_price: parseFloat(this.shadowRoot.getElementById('feed_phase1_price').value) || 0.0,
      feed_phase2_price: parseFloat(this.shadowRoot.getElementById('feed_phase2_price').value) || 0.0,
      feed_phase3_price: parseFloat(this.shadowRoot.getElementById('feed_phase3_price').value) || 0.0,
      feed_phase4_price: parseFloat(this.shadowRoot.getElementById('feed_phase4_price').value) || 0.0,
      feed_phase5_price: parseFloat(this.shadowRoot.getElementById('feed_phase5_price').value) || 0.0,
      missed_mortality_count: parseInt(this.shadowRoot.getElementById('missed_mortality_count').value) || 0
    };

    // Validation
    if (!formData.settled_count || formData.settled_count < 1) {
      this._showNotification('Hiba: A betelepített madarak száma kötelező!', 'error');
      return;
    }

    if (!formData.settlement_date) {
      this._showNotification('Hiba: A betelepítés dátuma kötelező!', 'error');
      return;
    }

    try {
      // API call to backend
      const managerId = this._config.manager_id;
      const apiUrl = `/api/cycle-management/managers/${managerId}/start-cycle`;

      if (this._config.show_debug) {
        console.log('[CFM Card] Starting cycle:', formData);
        console.log('[CFM Card] API URL:', apiUrl);
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        this._showNotification(`Ciklus sikeresen indítva: ${result.cycle_id}`, 'success');
        this._showStartForm = false;
        this._render();

        // Trigger HA state refresh
        if (this._hass) {
          this._hass.callService('homeassistant', 'update_entity', {
            entity_id: `sensor.manager_${managerId}_cycle_status`
          });
        }
      } else {
        this._showNotification(`Hiba: ${result.message || 'Ismeretlen hiba történt'}`, 'error');
      }
    } catch (error) {
      console.error('[CFM Card] Start cycle error:', error);
      this._showNotification(`Hiba: ${error.message}`, 'error');
    }
  }

  /**
   * Show notification (toast)
   */
  _showNotification(message, type = 'info') {
    if (!this._config.show_notifications) return;

    if (this._hass) {
      this._hass.callService('persistent_notification', 'create', {
        title: 'CFM Manager',
        message: message,
        notification_id: `cfm_card_${Date.now()}`
      });
    }

    console.log(`[CFM Card] ${type.toUpperCase()}: ${message}`);
  }

  _handleShipping() {
    console.log('[CFM Card] Shipping clicked - TODO: Implement modal');
    // TODO: Show shipping modal (Phase 3)
  }

  _handleMortality() {
    console.log('[CFM Card] Mortality clicked - TODO: Implement modal');
    // TODO: Show mortality modal (Phase 3)
  }

  _handleCloseCycle() {
    console.log('[CFM Card] Close Cycle clicked - TODO: Implement confirm');
    // TODO: Show confirmation dialog (Phase 3)
  }

  /**
   * Get card styles (imported from card-styles.js)
   */
  _getStyles() {
    // TODO: Import from src/styles/card-styles.js
    return `
      :host {
        display: block;
      }

      ha-card {
        padding: 16px;
      }

      .card-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .header {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .header h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }

      .status {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 14px;
        display: inline-block;
      }

      .status.waiting {
        background-color: #FFA500;
        color: white;
      }

      .status.completed {
        background-color: #4CAF50;
        color: white;
      }

      .status.error {
        background-color: #F44336;
        color: white;
      }

      .cycle-id {
        font-size: 16px;
        color: #666;
      }

      .info-row {
        display: flex;
        justify-content: space-between;
        gap: 16px;
      }

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .label {
        font-size: 12px;
        color: #666;
      }

      .value {
        font-size: 16px;
        font-weight: 500;
      }

      .breed {
        font-size: 14px;
        color: #666;
      }

      .metrics {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .metric {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 12px;
        background-color: #f5f5f5;
        border-radius: 8px;
      }

      .metric-label {
        font-size: 12px;
        color: #666;
      }

      .metric-value {
        font-size: 18px;
        font-weight: 500;
      }

      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      button {
        padding: 12px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .primary-button {
        background-color: #4CAF50;
        color: white;
      }

      .primary-button:hover {
        background-color: #45a049;
      }

      .secondary-button {
        background-color: #2196F3;
        color: white;
      }

      .secondary-button:hover {
        background-color: #1976D2;
      }

      .danger-button {
        background-color: #F44336;
        color: white;
      }

      .danger-button:hover {
        background-color: #D32F2F;
      }

      .next-save {
        text-align: center;
        font-size: 14px;
        color: #666;
        padding: 8px;
        background-color: #f5f5f5;
        border-radius: 8px;
      }

      .summary {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .summary-item {
        display: flex;
        justify-content: space-between;
        padding: 8px;
        border-bottom: 1px solid #eee;
      }

      .error-message {
        padding: 16px;
        background-color: #ffebee;
        border-radius: 8px;
        color: #c62828;
      }

      .error-message p {
        margin: 8px 0;
      }

      /* Form styles (Phase 2) */
      .form-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .form-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px;
        background-color: #f9f9f9;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
      }

      .form-section h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 500;
        color: #333;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .form-group label {
        font-size: 14px;
        font-weight: 500;
        color: #555;
      }

      .form-group input {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        font-family: inherit;
      }

      .form-group input:focus {
        outline: none;
        border-color: #4CAF50;
        box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
      }

      .form-hint {
        font-size: 12px;
        color: #999;
        font-style: italic;
      }

      .form-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .form-group-inline {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .form-group-inline label {
        font-size: 13px;
        font-weight: 500;
        color: #555;
      }

      .form-group-inline input {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        font-family: inherit;
      }

      .form-actions {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-top: 8px;
      }

      @media (max-width: 600px) {
        .form-row {
          grid-template-columns: 1fr;
        }
      }
    `;
  }

  /**
   * Get card stub config for Lovelace UI editor
   */
  static getStubConfig() {
    return {
      manager_id: 1,
      daily_save_time: '07:00',
      show_notifications: true,
      show_debug: false
    };
  }

  /**
   * Get card size for Lovelace layout
   */
  getCardSize() {
    // Dynamic size based on state and form visibility
    if (this._showStartForm) {
      return 12;  // Large card for form
    }

    switch (this._currentState) {
      case 'ACTIVE':
        return 8;  // Larger card for active cycle
      case 'CLOSED':
        return 7;  // Medium card for summary
      case 'PRE-START':
      default:
        return 3;  // Small card for waiting state
    }
  }
}

// Register custom card
customElements.define('cfm-manager-card', CfmManagerCard);

// Register card for Lovelace UI editor
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'cfm-manager-card',
  name: 'CFM Manager Card',
  description: 'Baromfi nevelési ciklus kezelő kártya',
  preview: true
});

console.log('[CFM Card] v2.1.0 - Card Main loaded successfully (Phase 2: Cycle Start Form)');
