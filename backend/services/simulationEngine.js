/**
 * Simulation Engine for PeerPulse
 * Controls:
 * 1. Timeline Fast-Forwarding (+7, +15, +30, +90 Days)
 * 2. Daily 18% p.a. Penal Interest Accrual
 * 3. NACH AutoPay Collection Sweeps & Retries (Days 3, 7, 15, 25)
 * 4. Regulatory Recovery State Machine Transitions (ACTIVE -> DELAYED -> AT_RISK -> NPA)
 * 5. Simulated Micro-Investments on Listed Marketplace Tranches
 * 6. Live Activity Stream Feed Generation
 */

const mongoose = require('mongoose');
const LoanApplication = require('../models/LoanApplication');
const LoanRepayment = require('../models/LoanRepayment');
const Borrower = require('../models/Borrower');
const Lender = require('../models/Lender');
const AuditLog = require('../models/AuditLog');
const { exec } = require('child_process');
const path = require('path');

class SimulationEngine {
  constructor() {
    this.simulatedDaysOffset = 0;
    this.startDate = new Date('2026-03-01T00:00:00Z');
    this.recentActivities = [];
    this.initDefaultActivities();
  }

  initDefaultActivities() {
    const defaultEvents = [
      { id: 'ACT-1', timestamp: new Date(Date.now() - 15000), text: 'Lender LEN-ENT-042 committed ₹25,000 to Apex Precision Components (92% Funded)', type: 'INVESTMENT', badge: 'TRANCHE' },
      { id: 'ACT-2', timestamp: new Date(Date.now() - 42000), text: 'Borrower BOR-ENT-015 completed monthly NACH repayment of ₹38,400', type: 'REPAYMENT', badge: 'NACH_SUCCESS' },
      { id: 'ACT-3', timestamp: new Date(Date.now() - 95000), text: 'IDFC Trustee Escrow disbursed ₹4,50,000 to Sri Balaji Engineering', type: 'ESCROW', badge: 'DISBURSEMENT' },
      { id: 'ACT-4', timestamp: new Date(Date.now() - 140000), text: 'Bajaj Finserv NBFC committed ₹16,00,000 anchor co-lending tranche (80%)', type: 'INSTITUTIONAL', badge: '80:20 ANCHOR' },
      { id: 'ACT-5', timestamp: new Date(Date.now() - 210000), text: 'Lender LEN-ENT-019 cast 50,000 tranche vote in favor of Amit Deshmukh OTS', type: 'VOTE', badge: 'OTS_BALLOT' }
    ];
    this.recentActivities = defaultEvents;
  }

  getCurrentSimulatedDate() {
    const d = new Date(this.startDate);
    d.setDate(d.getDate() + this.simulatedDaysOffset);
    return d;
  }

  getStatus() {
    return {
      daysOffset: this.simulatedDaysOffset,
      simulatedDate: this.getCurrentSimulatedDate().toISOString().split('T')[0],
      activeDelinquencies: 0,
      timestamp: new Date()
    };
  }

  /**
   * Fast-Forward Time by N days
   * Updates DPD, accrues penal interest at 18% p.a., transitions loan states.
   */
  async fastForward(days) {
    const daysToAdd = parseInt(days, 10) || 30;
    this.simulatedDaysOffset += daysToAdd;
    const simDate = this.getCurrentSimulatedDate();

    // 1. Fetch all active/delinquent repayments
    const repayments = await LoanRepayment.find({
      status: { $in: ['ACTIVE', 'DELAYED', 'AT_RISK'] }
    }).populate({
      path: 'loanId',
      populate: { path: 'borrowerId' }
    });

    let transitionedDelayed = 0;
    let transitionedAtRisk = 0;
    let transitionedNpa = 0;
    let totalPenalAccrued = 0;

    for (let rep of repayments) {
      // Determine if loan is prone to delinquency:
      // (Ravi, Amit, or ~15% of enterprise loans with trustScore < 80)
      const loan = rep.loanId;
      const b = loan ? loan.borrowerId : null;
      const isDistressed = (b && (b.borrowerId === 'BOR-RAVI-002' || b.borrowerId === 'BOR-AMIT-004' || b.platformTrustScore < 78));

      if (isDistressed) {
        rep.dpd = (rep.dpd || 0) + daysToAdd;

        // Daily Penal interest formula: Outstanding * 18% * (days / 365)
        const principal = rep.outstandingPrincipal || 300000;
        const additionalPenal = Math.round(principal * 0.18 * (daysToAdd / 365));
        rep.penalInterestAccrued = (rep.penalInterestAccrued || 0) + additionalPenal;
        totalPenalAccrued += additionalPenal;

        // Transition logic
        if (rep.dpd >= 90 && rep.status !== 'NPA') {
          rep.status = 'NPA';
          transitionedNpa++;
          if (b) {
            b.platformTrustScore = 0;
            await b.save();
          }
          rep.recovery = {
            classifiedNpaAt: simDate,
            totalRecovered: 0,
            recoveryFee: 12500,
            netDistributed: 0
          };
          this.recentActivities.unshift({
            id: `ACT-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            timestamp: new Date(),
            text: `Loan for ${b?.businessName || 'Borrower'} classified as Stage 4 NPA (${rep.dpd} DPD) • CIBIL default reported`,
            type: 'DEFAULT',
            badge: 'NPA 90+ DPD'
          });
        } else if (rep.dpd >= 31 && rep.dpd < 90 && rep.status !== 'AT_RISK') {
          rep.status = 'AT_RISK';
          transitionedAtRisk++;
          const currentVote = Math.min(85, 30 + Math.floor(Math.random() * 40));
          rep.restructurePlan = {
            option: 'OTS',
            proposedAmount: Math.round(principal * 0.70),
            status: currentVote >= 60 ? 'APPROVED' : 'PENDING_VOTE',
            approvalPercentage: currentVote,
            votingExpiresAt: new Date(Date.now() + 7 * 86400000)
          };
          this.recentActivities.unshift({
            id: `ACT-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            timestamp: new Date(),
            text: `Restructuring OTS vote initiated for ${b?.businessName || 'MSME'} (${rep.dpd} DPD)`,
            type: 'RESTRUCTURE',
            badge: 'OTS VOTING'
          });
        } else if (rep.dpd >= 1 && rep.dpd < 31 && rep.status !== 'DELAYED') {
          rep.status = 'DELAYED';
          transitionedDelayed++;
          this.recentActivities.unshift({
            id: `ACT-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            timestamp: new Date(),
            text: `NACH AutoPay bounce reported for ${b?.businessName || 'MSME'} • Entered Stage 2 (${rep.dpd} DPD)`,
            type: 'BOUNCE',
            badge: 'DELAYED'
          });
        }

        // Add collection attempt log
        rep.collectionAttempts.push({
          attemptDate: simDate,
          method: 'NACH',
          outcome: 'FAILED',
          amountAttempted: rep.monthlyEmi || 45000
        });

        await rep.save();
      } else {
        // Healthy borrower regular repayment simulation
        if (rep.status === 'ACTIVE' && rep.outstandingPrincipal > 0) {
          const emi = rep.monthlyEmi || 25000;
          rep.outstandingPrincipal = Math.max(0, rep.outstandingPrincipal - Math.round(emi * 0.85));
          if (rep.outstandingPrincipal === 0) {
            rep.status = 'CLOSED';
          }
          await rep.save();
        }
      }
    }

    // Keep recent activity log compact
    if (this.recentActivities.length > 25) {
      this.recentActivities = this.recentActivities.slice(0, 25);
    }

    // Log to Audit Trail
    await AuditLog.create({
      action: 'TIMELINE_FAST_FORWARD',
      targetId: `DAYS_+${daysToAdd}`,
      performedBy: 'Simulation_TimeMachine',
      reason: `Advanced platform timeline by ${daysToAdd} days. Accrued ₹${totalPenalAccrued.toLocaleString('en-IN')} penal interest.`,
      timestamp: new Date()
    });

    return {
      daysFastForwarded: daysToAdd,
      totalDaysOffset: this.simulatedDaysOffset,
      simulatedDate: simDate.toISOString().split('T')[0],
      transitionedDelayed,
      transitionedAtRisk,
      transitionedNpa,
      totalPenalAccrued
    };
  }

  /**
   * Pulse Investment: Simulates retail investors claiming a fractional tranche
   */
  async pulseInvestment() {
    // Find a listed loan that is not yet 100% funded
    const loan = await LoanApplication.findOne({
      status: 'LISTED',
      'fundingStatus.percentFunded': { $lt: 100 }
    });

    if (!loan) return null;

    const lender = await Lender.findOne();
    const trancheAmount = 25000;

    const currentFunded = loan.fundingStatus.funded || 0;
    const target = loan.fundingStatus.target || loan.loanAmount;
    const newFunded = Math.min(target, currentFunded + trancheAmount);
    const newPercent = Math.round((newFunded / target) * 100);

    loan.fundingStatus.funded = newFunded;
    loan.fundingStatus.percentFunded = newPercent;
    loan.fundingStatus.lenders.push({
      lenderId: lender ? lender._id : null,
      trancheId: `TR-SIM-${Math.floor(100 + Math.random() * 900)}`,
      amount: trancheAmount,
      fundedAt: new Date()
    });

    let completed = false;
    if (newPercent >= 100) {
      loan.status = 'ACTIVE';
      completed = true;
    }

    await loan.save();

    const activity = {
      id: `ACT-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
      text: `Retail Tranche of ₹${trancheAmount.toLocaleString('en-IN')} committed to ${loan.purpose || loan.applicationId} (${newPercent}% Funded)`,
      type: 'INVESTMENT',
      badge: completed ? '100% FUNDED' : `${newPercent}% FUNDED`
    };
    this.recentActivities.unshift(activity);
    if (this.recentActivities.length > 25) this.recentActivities.pop();

    return {
      applicationId: loan.applicationId,
      funded: newFunded,
      target: target,
      percentFunded: newPercent,
      isFullyFunded: completed,
      activity
    };
  }

  /**
   * Reset Timeline back to Day 0
   */
  async resetTimeline() {
    this.simulatedDaysOffset = 0;
    this.initDefaultActivities();

    return new Promise((resolve, reject) => {
      exec('node scripts/seedEnterprise.js', { cwd: path.join(__dirname, '../') }, (err, stdout, stderr) => {
        if (err) {
          console.error('[SimulationEngine] Reset error:', err);
          return reject(err);
        }
        resolve({
          message: 'Timeline reset to Day 0 with original baseline seed state',
          daysOffset: 0,
          simulatedDate: this.getCurrentSimulatedDate().toISOString().split('T')[0]
        });
      });
    });
  }

  getActivityFeed() {
    return this.recentActivities;
  }
}

module.exports = new SimulationEngine();
