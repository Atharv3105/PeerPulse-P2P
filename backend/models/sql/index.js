const { sequelize } = require('../../config/database');
const Borrower = require('./Borrower');
const Lender = require('./Lender');
const Loan = require('./Loan');
const LoanScoreBreakdown = require('./LoanScoreBreakdown');
const Tranche = require('./Tranche');
const Repayment = require('./Repayment');
const CollectionAttempt = require('./CollectionAttempt');
const RestructureProposal = require('./RestructureProposal');
const RestructureVote = require('./RestructureVote');
const RecoveryDistribution = require('./RecoveryDistribution');
const LenderDistributionSplit = require('./LenderDistributionSplit');
const AuditLog = require('./AuditLog');

// 1. Borrower <-> Loan
Borrower.hasMany(Loan, { foreignKey: 'borrower_id', as: 'loans' });
Loan.belongsTo(Borrower, { foreignKey: 'borrower_id', as: 'borrower' });

// 2. Loan <-> LoanScoreBreakdown
Loan.hasOne(LoanScoreBreakdown, { foreignKey: 'loan_id', as: 'scoreBreakdown' });
LoanScoreBreakdown.belongsTo(Loan, { foreignKey: 'loan_id', as: 'loan' });

// 3. Loan <-> Tranche <-> Lender
Loan.hasMany(Tranche, { foreignKey: 'loan_id', as: 'tranches' });
Tranche.belongsTo(Loan, { foreignKey: 'loan_id', as: 'loan' });

Lender.hasMany(Tranche, { foreignKey: 'lender_id', as: 'investments' });
Tranche.belongsTo(Lender, { foreignKey: 'lender_id', as: 'lender' });

// 4. Loan <-> Repayment
Loan.hasOne(Repayment, { foreignKey: 'loan_id', as: 'repayment' });
Repayment.belongsTo(Loan, { foreignKey: 'loan_id', as: 'loan' });

// 5. Repayment <-> CollectionAttempt
Repayment.hasMany(CollectionAttempt, { foreignKey: 'repayment_id', as: 'collectionAttempts' });
CollectionAttempt.belongsTo(Repayment, { foreignKey: 'repayment_id', as: 'repayment' });

// 6. Repayment <-> RestructureProposal
Repayment.hasMany(RestructureProposal, { foreignKey: 'repayment_id', as: 'restructureProposals' });
RestructureProposal.belongsTo(Repayment, { foreignKey: 'repayment_id', as: 'repayment' });

// 7. RestructureProposal <-> RestructureVote <-> Lender
RestructureProposal.hasMany(RestructureVote, { foreignKey: 'proposal_id', as: 'votes' });
RestructureVote.belongsTo(RestructureProposal, { foreignKey: 'proposal_id', as: 'proposal' });

Lender.hasMany(RestructureVote, { foreignKey: 'lender_id', as: 'restructureVotes' });
RestructureVote.belongsTo(Lender, { foreignKey: 'lender_id', as: 'lender' });

// 8. Repayment <-> RecoveryDistribution <-> LenderDistributionSplit <-> Lender
Repayment.hasMany(RecoveryDistribution, { foreignKey: 'repayment_id', as: 'recoveryDistributions' });
RecoveryDistribution.belongsTo(Repayment, { foreignKey: 'repayment_id', as: 'repayment' });

RecoveryDistribution.hasMany(LenderDistributionSplit, { foreignKey: 'distribution_id', as: 'lenderSplits' });
LenderDistributionSplit.belongsTo(RecoveryDistribution, { foreignKey: 'distribution_id', as: 'distribution' });

Lender.hasMany(LenderDistributionSplit, { foreignKey: 'lender_id', as: 'recoverySplits' });
LenderDistributionSplit.belongsTo(Lender, { foreignKey: 'lender_id', as: 'lender' });

module.exports = {
  sequelize,
  Borrower,
  Lender,
  Loan,
  LoanScoreBreakdown,
  Tranche,
  Repayment,
  CollectionAttempt,
  RestructureProposal,
  RestructureVote,
  RecoveryDistribution,
  LenderDistributionSplit,
  AuditLog
};
