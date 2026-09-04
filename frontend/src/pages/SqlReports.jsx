import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Play, 
  Clock, 
  Download, 
  Copy, 
  Check, 
  Code2, 
  Table as TableIcon, 
  FileSpreadsheet, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

function SqlCodeHighlighter({ code, isDarkTerminal }) {
  if (!code) return null;

  const lines = code.split('\n');

  const keywords = new Set([
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'CROSS',
    'ON', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'AS', 'CASE', 'WHEN', 'THEN',
    'ELSE', 'END', 'GROUP', 'BY', 'ORDER', 'HAVING', 'WITH', 'UNION', 'ALL',
    'OVER', 'PARTITION', 'ROW_NUMBER', 'DENSE_RANK', 'RANK', 'COUNT', 'SUM',
    'AVG', 'MAX', 'MIN', 'ROUND', 'COALESCE', 'DISTINCT', 'TOP', 'LIMIT',
    'ASC', 'DESC', 'CREATE', 'PROCEDURE', 'TABLE', 'VIEW', 'EXEC', 'DECLARE',
    'BEGIN', 'TRANSACTION', 'COMMIT', 'ROLLBACK', 'UPDATE', 'INSERT', 'INTO',
    'VALUES', 'DELETE', 'DROP', 'ALTER', 'SET', 'CAST', 'CONVERT', 'DATEADD',
    'DATEDIFF', 'GETDATE', 'CURRENT_TIMESTAMP'
  ]);

  return (
    <>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        // 1. Comments
        if (trimmed.startsWith('--')) {
          return (
            <div
              key={lineIdx}
              className={isDarkTerminal ? 'text-slate-400 italic font-mono' : 'text-slate-500 dark:text-slate-400 italic font-mono'}
            >
              {line}
            </div>
          );
        }

        // 2. Tokenize line words, punctuation, strings, numbers
        const tokens = line.split(/(\s+|[(),;=<>+*/]|\b)/);

        return (
          <div key={lineIdx} className="font-mono">
            {tokens.map((tok, tokIdx) => {
              const upper = tok.toUpperCase();

              // Keywords
              if (keywords.has(upper)) {
                return (
                  <span
                    key={tokIdx}
                    className={isDarkTerminal ? 'text-sky-300 font-bold' : 'text-blue-700 dark:text-sky-300 font-bold'}
                  >
                    {tok}
                  </span>
                );
              }

              // Strings
              if (/^'[^']*'?$/.test(tok) || tok.startsWith("'")) {
                return (
                  <span
                    key={tokIdx}
                    className={isDarkTerminal ? 'text-amber-300 font-medium' : 'text-amber-800 dark:text-amber-300 font-medium'}
                  >
                    {tok}
                  </span>
                );
              }

              // Numbers
              if (/^\d+(?:\.\d+)?$/.test(tok)) {
                return (
                  <span
                    key={tokIdx}
                    className={isDarkTerminal ? 'text-emerald-400 font-semibold' : 'text-emerald-700 dark:text-emerald-400 font-semibold'}
                  >
                    {tok}
                  </span>
                );
              }

              // Default code text
              return (
                <span
                  key={tokIdx}
                  className={isDarkTerminal ? 'text-slate-100' : 'text-slate-900 dark:text-slate-100'}
                >
                  {tok}
                </span>
              );
            })}
          </div>
        );
      })}
    </>
  );
}

export default function SqlReports() {
  const [reports, setReports] = useState([]);
  const [activeReportId, setActiveReportId] = useState('par-aging');
  const [reportResult, setReportResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSql, setShowSql] = useState(true);
  const [darkEditor, setDarkEditor] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Report Catalog on Mount
  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/reports`);
      if (res.data && res.data.reports) {
        setReports(res.data.reports);
        if (res.data.reports.length > 0) {
          executeReport(res.data.reports[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load SQL reports catalog:', err);
      setError('Could not connect to SQL Reporting API. Please ensure backend is running.');
    }
  };

  // 2. Execute Selected SQL Query Live
  const executeReport = async (reportId) => {
    setLoading(true);
    setError(null);
    setActiveReportId(reportId);

    try {
      const res = await axios.get(`${BACKEND_URL}/api/reports/${reportId}/execute`);
      setReportResult(res.data);
    } catch (err) {
      console.error('Failed to execute SQL report:', err);
      setError(err.response?.data?.details || err.message || 'Error executing SQL script.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySql = () => {
    if (reportResult?.rawSql) {
      navigator.clipboard.writeText(reportResult.rawSql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportCsv = () => {
    if (!reportResult?.data || reportResult.data.length === 0) return;
    const cols = reportResult.columns;
    const csvRows = [];
    csvRows.push(cols.join(','));

    reportResult.data.forEach((row) => {
      const values = cols.map((c) => {
        const val = row[c] !== null && row[c] !== undefined ? String(row[c]).replace(/"/g, '""') : '';
        return `"${val}"`;
      });
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeReportId}_report_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const activeDef = reports.find((r) => r.id === activeReportId) || reports[0];

  // Filter rows by search term
  const filteredData = reportResult?.data?.filter((row) => {
    if (!searchTerm) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white shadow-xl border border-indigo-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" /> 3NF Relational Core
              </span>
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> RBI Master Directions Spec
              </span>
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                Dialect: {reportResult?.dialect || 'SQL'}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Core Banking SQL & Ledger Audit Console
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl">
              Internal risk operations and compliance query workbench. Executes real-time financial ledger reconciliations, delinquency aging matrices, and statutory exposure audits.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => executeReport(activeReportId)}
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Executing Query...' : 'Run Live Query'}
            </button>
            <button
              onClick={handleExportCsv}
              disabled={!reportResult?.data?.length}
              className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-medium rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Report Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {reports.map((rep) => {
          const isActive = rep.id === activeReportId;
          return (
            <button
              key={rep.id}
              onClick={() => executeReport(rep.id)}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'bg-blue-600/10 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-card border-border hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    REPORT {rep.number}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[90px]">
                    {rep.moduleType || 'AUDIT'}
                  </span>
                </div>
                <h4 className="font-semibold text-sm line-clamp-2">{rep.name}</h4>
              </div>
              <p className="text-xs text-muted-fg mt-3 line-clamp-2">{rep.description}</p>
            </button>
          );
        })}
      </div>

      {/* Query Execution Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-muted-fg">Execution Time:</span>
            <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {reportResult ? `${reportResult.executionTimeMs} ms` : '—'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-muted-fg">Rows Retrieved:</span>
            <span className="text-sm font-mono font-bold">
              {reportResult ? reportResult.rowCount : '—'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-muted-fg">Columns:</span>
            <span className="text-sm font-mono font-bold">
              {reportResult ? reportResult.columns.length : '—'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSql(!showSql)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted flex items-center gap-1.5 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            {showSql ? 'Hide SQL Code' : 'View SQL Code'}
          </button>
          <button
            onClick={handleCopySql}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-fg hover:opacity-90 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Script'}
          </button>
        </div>
      </div>

      {/* SQL Script View (Collapsible) */}
      {showSql && reportResult?.rawSql && (
        <div 
          className={`rounded-xl border overflow-hidden shadow-md transition-colors ${
            darkEditor 
              ? 'border-slate-800 bg-[#0B0F17] text-slate-100' 
              : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100'
          }`}
        >
          <div 
            className={`px-4 py-2.5 border-b flex items-center justify-between text-xs transition-colors ${
              darkEditor 
                ? 'bg-slate-900/90 border-slate-800 text-slate-300' 
                : 'bg-slate-100 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 font-mono">
              <Code2 className={`w-4 h-4 ${darkEditor ? 'text-blue-400' : 'text-blue-600 dark:text-blue-400'}`} />
              <span className="font-bold text-slate-900 dark:text-slate-100">{activeDef?.file}</span>
              <span className="text-slate-400 dark:text-slate-600">|</span>
              <span className={`font-semibold ${darkEditor ? 'text-emerald-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {activeDef?.moduleType || 'Financial Risk Engine'}
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setDarkEditor(!darkEditor)}
                className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-sans text-xs cursor-pointer transition-colors shadow-xs"
                title="Toggle Code Theme"
              >
                {darkEditor ? '☀️ Light Canvas' : '🌙 Dark Terminal'}
              </button>
              <span className="text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                ANSI / T-SQL Compliant
              </span>
            </div>
          </div>

          <pre 
            className={`p-4 text-xs font-mono overflow-x-auto max-h-80 leading-relaxed transition-colors ${
              darkEditor 
                ? 'bg-[#0B0F17] text-slate-100 selection:bg-blue-950' 
                : 'bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900'
            }`}
          >
            <code>
              <SqlCodeHighlighter code={reportResult.rawSql} isDarkTerminal={darkEditor} />
            </code>
          </pre>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Execution Error</p>
            <p className="mt-1 font-mono text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Tabular Data View */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-base flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-blue-500" />
              {activeDef?.name}
            </h3>
            <p className="text-xs text-muted-fg mt-0.5">{activeDef?.description}</p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search table rows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="sticky top-0 bg-muted border-b border-border text-muted-fg font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-center w-12">#</th>
                {reportResult?.columns.map((col) => (
                  <th key={col} className="px-4 py-3 font-mono whitespace-nowrap">
                    {col.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.length > 0 ? (
                filteredData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-muted/50 transition-colors font-mono text-slate-800 dark:text-slate-200"
                  >
                    <td className="px-4 py-2.5 text-center text-muted-fg text-[11px] font-sans">
                      {idx + 1}
                    </td>
                    {reportResult.columns.map((col) => {
                      const val = row[col];
                      const isNumber = typeof val === 'number';
                      const isStatus = typeof val === 'string' && (val.includes('COMPLIANT') || val.includes('BREACH') || val.includes('PASSED') || val.includes('NPA'));

                      return (
                        <td key={col} className="px-4 py-2.5 whitespace-nowrap">
                          {isStatus ? (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                val.includes('BREACH') || val.includes('NPA') || val.includes('CRITICAL')
                                  ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                                  : val.includes('COMPLIANT') || val.includes('PASSED')
                                  ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                                  : 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                              }`}
                            >
                              {val}
                            </span>
                          ) : isNumber ? (
                            col.includes('percentage') || col.includes('pct') || col.includes('rate') ? (
                              `${val}%`
                            ) : col.includes('amount') || col.includes('principal') || col.includes('balance') || col.includes('exposure') || col.includes('fee') || col.includes('received') ? (
                              `₹${Number(val).toLocaleString('en-IN')}`
                            ) : (
                              val.toLocaleString('en-IN')
                            )
                          ) : val === null || val === undefined ? (
                            <span className="text-muted-fg italic">NULL</span>
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={(reportResult?.columns.length || 0) + 1}
                    className="px-4 py-12 text-center text-muted-fg"
                  >
                    {loading ? 'Executing SQL query and compiling dataset...' : 'No matching rows found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Engineering & SQL Optimization Explainer Callout */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-slate-900/10 border border-blue-500/20 shadow-sm">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm text-foreground">
              Core Banking & Risk Engineering: SQL Optimization & Ledger Integrity
            </h4>
            <p className="mt-1 text-xs text-muted-fg leading-relaxed">
              In regulated P2P lending platforms, financial ledger audits and regulatory compliance queries are engineered to execute without locking live transaction pipelines. 
              Report 01 leverages composite B-Tree indexing on <code className="px-1.5 py-0.5 bg-muted rounded font-mono text-blue-500">repayments(dpd, status)</code> to perform index seeks for delinquency aging buckets. 
              Report 02 utilizes <code className="px-1.5 py-0.5 bg-muted rounded font-mono text-blue-500">DENSE_RANK() OVER (PARTITION BY lender_id)</code> to identify exposure concentration in a single query scan, avoiding multiple correlated subqueries and table locks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
