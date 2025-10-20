/**
 * CFM Mortality Card - Elhullás Rögzítés Kártya
 *
 * Version: v1.0.0
 * Mindig látható, csak ACTIVE ciklusnál enabled
 */

class CfmMortalityCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
  }

  setConfig(config) {
    if (!config.manager_id) {
      throw new Error('manager_id is required in configuration');
    }

    this._config = {
      manager_id: config.manager_id,
      demo_state: config.demo_state
    };

    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  /**
   * Get sensor value (or demo data)
   */
  _getSensorValue(entity_id, demoValue) {
    // DEMO MODE
    if (this._config.demo_state !== undefined) {
      return demoValue;
    }

    // PRODUCTION MODE
    if (!this._hass || !entity_id) return null;
    const entity = this._hass.states[entity_id];
    return entity ? entity.state : null;
  }

  /**
   * Check if cycle is active (button should be enabled)
   */
  _isCycleActive() {
    const managerId = this._config.manager_id;
    const status = this._getSensorValue(`sensor.manager_${managerId}_cycle_status`, 'active');
    return status === 'active';
  }

  /**
   * Get today's mortality count
   */
  _getTodayMortality() {
    const managerId = this._config.manager_id;
    // TODO: Backend API endpoint: GET /api/mortality/today?manager_id=X
    // For now, demo data
    return this._getSensorValue(`sensor.manager_${managerId}_today_mortality`, '15');
  }

  /**
   * Render card
   */
  _render() {
    if (!this.shadowRoot) return;

    const managerId = this._config.manager_id;
    const cycleId = this._getSensorValue(`sensor.manager_${managerId}_cycle_id`, 'MSZ/2025/001');
    const areaName = this._getSensorValue(`sensor.manager_${managerId}_area_name`, 'Istálló 1');
    const todayMortality = this._getTodayMortality();
    const isActive = this._isCycleActive();

    const today = new Date().toISOString().split('T')[0];

    this.shadowRoot.innerHTML = `
      <style>
        ${this._getStyles()}
      </style>
      <ha-card>
        <div class="card-content">
          <div class="header">
            <h2>💀 Elhullás Rögzítés</h2>
          </div>

          <div class="info-section">
            <div class="info-row">
              <span class="label">Ciklus:</span>
              <span class="value">${cycleId || 'Nincs aktív ciklus'}</span>
            </div>
            <div class="info-row">
              <span class="label">Terület:</span>
              <span class="value">${areaName || 'N/A'}</span>
            </div>
            <div class="info-row highlight">
              <span class="label">Ma rögzített elhullás:</span>
              <span class="value">${todayMortality} db</span>
            </div>
          </div>

          <form id="mortalityForm" class="form-section">
            <div class="form-group">
              <label>Dátum:</label>
              <input type="date" id="mortality_date" value="${today}" readonly />
            </div>

            <div class="form-group">
              <label>Darabszám: *</label>
              <input
                type="number"
                id="mortality_count"
                required
                min="1"
                placeholder="pl. 5"
                ${!isActive ? 'disabled' : ''}
              />
            </div>

            <button
              type="submit"
              class="submit-button ${!isActive ? 'disabled' : ''}"
              onclick="event.preventDefault(); this.getRootNode().host._submitMortality();"
              ${!isActive ? 'disabled' : ''}
            >
              ✅ Rögzít
            </button>

            ${!isActive ? '<p class="warning">⚠️ Csak aktív ciklus esetén rögzíthetsz elhullást!</p>' : ''}
          </form>
        </div>
      </ha-card>
    `;
  }

  /**
   * Submit mortality record
   */
  async _submitMortality() {
    if (!this.shadowRoot) return;
    if (!this._isCycleActive()) return;

    const countInput = this.shadowRoot.getElementById('mortality_count');
    const count = parseInt(countInput.value);

    if (!count || count < 1) {
      alert('Hiba: Darabszám kötelező!');
      return;
    }

    // DEMO MODE: Just show notification
    if (this._config.demo_state !== undefined) {
      alert(`DEMO: Elhullás rögzítve: ${count} db`);
      countInput.value = '';
      this._render(); // Refresh today's count
      return;
    }

    // PRODUCTION MODE: API call
    try {
      const managerId = this._config.manager_id;
      const cycleId = this._getSensorValue(`sensor.manager_${managerId}_cycle_id`);
      const date = this.shadowRoot.getElementById('mortality_date').value;

      const response = await fetch(`/api/cycle-management/cycles/${cycleId}/mortality`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: date,
          count: count
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(`Elhullás rögzítve: ${count} db`);
        countInput.value = '';
        this._render();
      } else {
        alert(`Hiba: ${result.message}`);
      }
    } catch (error) {
      alert(`Hiba: ${error.message}`);
    }
  }

  /**
   * Card styles
   */
  _getStyles() {
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
      .header h2 {
        margin: 0;
        font-size: 1.5rem;
        color: var(--primary-text-color);
      }
      .info-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        background: var(--secondary-background-color);
        border-radius: 8px;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .info-row.highlight {
        background: var(--primary-color);
        color: white;
        padding: 8px;
        border-radius: 4px;
        font-weight: bold;
      }
      .label {
        font-weight: 500;
        color: var(--secondary-text-color);
      }
      .info-row.highlight .label {
        color: white;
      }
      .value {
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .info-row.highlight .value {
        color: white;
      }
      .form-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .form-group label {
        font-weight: 500;
        font-size: 0.9rem;
        color: var(--secondary-text-color);
      }
      .form-group input {
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        font-size: 1rem;
      }
      .form-group input[readonly] {
        background: var(--disabled-text-color);
        opacity: 0.6;
      }
      .form-group input:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .submit-button {
        padding: 12px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      .submit-button:hover:not(:disabled) {
        opacity: 0.9;
      }
      .submit-button.disabled {
        background: var(--disabled-text-color);
        cursor: not-allowed;
        opacity: 0.5;
      }
      .warning {
        color: var(--error-color);
        font-size: 0.9rem;
        text-align: center;
        margin: 0;
      }
    `;
  }

  getCardSize() {
    return 4; // Compact card
  }
}

// Register custom card
customElements.define('cfm-mortality-card', CfmMortalityCard);

// Register for Lovelace UI editor
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'cfm-mortality-card',
  name: 'CFM Mortality Card',
  description: 'Elhullás rögzítés kártya (mindig látható, csak aktív ciklusnál enabled)',
  preview: true
});

console.log('[CFM Mortality Card] v1.0.0 loaded successfully');
