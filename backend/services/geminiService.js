const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const PRIMARY_MODEL = 'gemini-2.5-flash';

/**
 * PeerPulse Gemini AI Copilot & Risk Underwriting Service
 * Directly interacts with Google Generative AI API (gemini-2.5-flash)
 */
class GeminiService {
  constructor() {
    this.apiKey = GEMINI_API_KEY;
  }

  getApiKey() {
    return process.env.GEMINI_API_KEY || this.apiKey;
  }

  async callGeminiApi(prompt, systemInstruction) {
    const key = this.getApiKey();
    if (!key) {
      throw new Error('GEMINI_API_KEY is not configured in backend environment.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${PRIMARY_MODEL}:generateContent?key=${key}`;

    const payload = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.25,
        topP: 0.95,
        maxOutputTokens: 2048,
        thinkingConfig: {
          thinkingBudget: 0
        }
      }
    };

    if (systemInstruction) {
      payload.system_instruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 20000
    });

    const candidates = response.data?.candidates;
    if (candidates && candidates.length > 0) {
      const text = candidates[0].content?.parts?.[0]?.text || '';
      return {
        text: text.trim(),
        model: PRIMARY_MODEL,
        usage: response.data?.usageMetadata || null
      };
    }
    throw new Error('No candidate response returned by Gemini API');
  }

  /**
   * Main Copilot Assistant Generator
   */
  async generateCopilotResponse({ message, context }) {
    const role = context?.role || 'lender';
    const lender = context?.lender || {};
    const borrower = context?.borrower || {};
    const portfolio = context?.portfolio || [];
    const lenderName = lender.name || 'Vikram Sethi';
    const borrowerName = borrower.businessName || 'Priya Textiles Surat';
    const walletBalance = lender.walletBalance || 450000;

    const systemInstruction = `You are the Senior Credit Risk Officer & AI Portfolio Advisor at PeerPulse, an RBI-regulated Fractional P2P Lending Platform for Indian MSMEs.
Your role: Provide concise, mathematically rigorous, quantitative credit assessments and investment advice tailored to the user's live profile.

Active User Profile:
- Current Role: ${role.toUpperCase()}
- Synchronized Persona: ${role === 'lender' ? lenderName : borrowerName}
- Uninvested Escrow Liquidity: ₹${walletBalance.toLocaleString('en-IN')} (held in IDFC Trustee Escrow)
- Active Exposure: ₹1,25,000 across 3 MSME tranches
- Portfolio Holdings:
  1. LN-PRIYA-810: Priya Textiles Surat • ₹25,000 • Grade A • Yield: 13.5% p.a. • DPD: 0 (Current)
  2. LN-AMIT-710: Deshmukh Precision Engineering • ₹50,000 • Grade B • Yield: 14.5% p.a. • DPD: 12 (Stage 1 Delayed) • Pending OTS settlement ballot (Vikram holds 40% voting weight)
  3. LN-RAVI-590: Ravi General Stores • ₹25,000 • Grade C • Yield: 18.0% p.a. • DPD: 0 (Current)
- Live Marketplace Listings Available:
  1. Apex Precision Components: Auto & Engineering • Grade A (782/900) • 14.0% p.a. • ₹25k Tranches • 92% Funded
  2. Sri Balaji Engineering Works: Tooling OEM • Grade A (795/900) • 13.5% p.a. • 80:20 Anchor Co-lending with Bajaj Finserv NBFC
  3. Delta Chauhan Logistics: Cold-Chain Fleet • Grade B (718/900) • 15.5% p.a. • High asset turnover
- Indian Regulatory Safeguards (RBI NBFC-P2P Master Directions):
  - Max ₹50,000 exposure per individual borrower.
  - Max ₹10,00,000 aggregate platform exposure limit across all P2P platforms.
  - Dual nodal escrow accounts (IDFC Trustee).
  - 18% p.a. penal interest accrual on delinquencies with e-NACH auto-sweeps.

Tone & Formatting Guidelines:
- Professional, concise banking tone.
- Use clean Markdown with headers (###), bullet points (•), and bold figures.
- Quote amounts in Indian Rupees (₹ and Lakhs).
- Provide explicit, actionable financial directives.`;

    const userPrompt = `User Question / Command: "${message}"

Analyze the live account context and provide a structured, data-driven answer.`;

    try {
      const result = await this.callGeminiApi(userPrompt, systemInstruction);
      return {
        source: 'gemini-2.5-flash-live',
        model: result.model,
        liveApi: true,
        reply: result.text,
        timestamp: new Date().toISOString()
      };
    } catch (apiErr) {
      console.warn('[GeminiService] Live API invocation failed, switching to curated fallback:', apiErr.message);
      return null; // Signals route to use curated financial responses
    }
  }
}

module.exports = new GeminiService();
