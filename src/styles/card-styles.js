/**
 * CFM Manager Card - CSS Styles
 *
 * Version: v2.0.0
 * Centralized CSS styles for card and config editor
 */

/**
 * Get main card styles
 * @returns {string} - CSS string
 */
export function getCardStyles() {
  return `
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
    }

    /* ===== HEADER ===== */
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

    /* ===== STATUS BADGES ===== */
    .status {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      display: inline-block;
      max-width: fit-content;
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

    /* ===== INFO ROWS ===== */
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

    /* ===== METRICS GRID ===== */
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

    /* ===== BUTTONS ===== */
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

    /* ===== NEXT SAVE TIMER ===== */
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

    /* ===== SUMMARY (Closed Cycle) ===== */
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

    /* ===== ERROR STATE ===== */
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

    /* ===== RESPONSIVE ===== */
    @media (max-width: 600px) {
      .metrics {
        grid-template-columns: 1fr;
      }

      .info-row {
        flex-direction: column;
        gap: 12px;
      }

      ha-card {
        padding: 12px;
      }

      .header h2 {
        font-size: 18px;
      }

      button {
        font-size: 14px;
        padding: 12px;
      }
    }

    /* ===== ANIMATIONS ===== */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .card-content {
      animation: fadeIn 0.3s ease-out;
    }

    /* ===== LOADING STATE (Future) ===== */
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px;
      color: #666;
    }

    .loading::after {
      content: "⏳ Betöltés...";
      font-size: 16px;
    }
  `;
}

/**
 * Get config editor styles
 * @returns {string} - CSS string
 */
export function getConfigStyles() {
  return `
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
}

console.log('[CFM Card] v2.0.0 - Styles loaded successfully');
