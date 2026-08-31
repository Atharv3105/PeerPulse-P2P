const fs = require('fs');
const path = require('path');
const axios = require('axios');

class AAAdapter {
  constructor(useMock = true) {
    this.useMock = useMock;
    this.mockDir = path.join(__dirname, '../../data');
  }

  /**
   * Fetch ReBIT-schema Account Aggregator statement data
   * @param {string} sessionIdOrPersona - persona name ('priya', 'ravi', 'clean', 'bounces') or AA session ID
   */
  async fetchStatementData(sessionIdOrPersona = 'clean') {
    if (this.useMock) {
      const isBounces = sessionIdOrPersona.includes('ravi') || sessionIdOrPersona.includes('bounces');
      const filename = isBounces ? 'mock_statement_bounces.json' : 'mock_statement_clean.json';
      const filepath = path.join(this.mockDir, filename);

      if (fs.existsSync(filepath)) {
        const raw = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(raw);
      } else {
        return {
          accountNumber: "50100492817291",
          bank: "HDFC Bank",
          holderName: "Priya Sharma",
          summary: {
            totalCredit: 3420000,
            totalDebit: 2980000,
            netCashFlow: 440000,
            bounceCount: 0,
            avgMonthlyBalance: 285000
          }
        };
      }
    }

    // Live Setu AA Consent Flow
    try {
      const response = await axios.get(`https://api.setu.co/v2/aa/sessions/${sessionIdOrPersona}`, {
        headers: {
          'x-client-id': process.env.SETU_CLIENT_ID || 'mock_client',
          'x-client-secret': process.env.SETU_CLIENT_SECRET || 'mock_secret'
        },
        timeout: 5000
      });
      return response.data;
    } catch (err) {
      console.warn(`[AAAdapter] Live Setu fetch failed (${err.message}). Falling back to mock data.`);
      return this.fetchStatementData('clean');
    }
  }

  /**
   * Fetch GST return filing data from GSTN mock or live adapter
   */
  async fetchGSTData(personaOrGstn = 'priya') {
    const isRavi = personaOrGstn.includes('ravi') || personaOrGstn.includes('27AAACR');
    const filename = isRavi ? 'mock_gst_ravi.json' : 'mock_gst_priya.json';
    const filepath = path.join(this.mockDir, filename);

    if (fs.existsSync(filepath)) {
      const raw = fs.readFileSync(filepath, 'utf8');
      return JSON.parse(raw);
    }
    return {
      gstin: "24AABCP1928K1Z5",
      declaredAnnualTurnover: 3420000,
      filingStatus: "REGULAR_COMPLIANT"
    };
  }
}

module.exports = AAAdapter;
