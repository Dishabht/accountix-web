import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, Download, X, FileText,
  CheckCircle2, Briefcase, FolderKanban, Clock,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../../context/AuthContext';

function toQtNum(id: string, createdAt?: string): string {
  const year    = createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();
  const cleaned = (id ?? '').replace(/[^0-9a-f]/gi, '');
  const hex     = cleaned.slice(-6) || '000000';
  const num     = (parseInt(hex, 16) % 9000) + 1000;
  return `QT-${year}-${String(num).padStart(4, '0')}`;
}

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function addDays(iso: string | undefined, n: number): string {
  if (!iso) return '—';
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmtMoney(n?: number): string {
  return (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STEPS = ['Draft', 'Sent', 'Accepted'] as const;

function stepIdx(status: string): number {
  const s = (status ?? '').toLowerCase();
  if (s === 'sent') return 1;
  if (s === 'accepted') return 2;
  return 0;
}

export default function QuotationDetails() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPdfOpen, setIsPdfOpen]       = useState(false);
  const [converting, setConverting]     = useState(false);

  useEffect(() => {
    fetch(`/api/quotations/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setQuotation(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, token]);

  const canManage = ['admin', 'super_admin', 'manager'].includes(user?.role ?? '');

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>;
  if (!quotation) return <div className="p-8 text-slate-500">Quotation not found.</div>;

  const qtNum       = toQtNum(quotation.id ?? id ?? '', quotation.created_at);
  const rate        = quotation.rate ?? 0;
  const duration    = quotation.duration ?? 0;
  const totalAmount = quotation.total_amount ?? quotation.amount ?? 0;
  const rateLabel   = quotation.rate_type === 'daily' ? 'day' : 'hr';
  const durLabel    = quotation.rate_type === 'daily' ? 'days' : 'hours';
  const serviceDesc = quotation.project_name
    ? `Services — ${quotation.project_name}`
    : 'Professional Services';
  const currentStep    = stepIdx(quotation.status);
  const hasInvoice     = !!(quotation.invoice_id ?? quotation.invoiced ?? false);
  // 4 visual positions (0–3): Draft → Sent → Accepted → Invoiced
  const visualProgress = hasInvoice ? 3 : currentStep;

  const handleConvertToInvoice = async () => {
    setConverting(true);
    try {
      const today   = new Date();
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + 30);

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          customer_id:   quotation.customer_id  ?? quotation.customerId,
          project_id:    quotation.project_id   ?? quotation.projectId,
          description:   quotation.project_name ?? quotation.projectName ?? '',
          rate:          rate,
          duration:      duration,
          rate_type:     quotation.rate_type ?? 'hourly',
          amount:        totalAmount,
          status:        'sent',
          issue_date:    today.toISOString().split('T')[0],
          due_date:      dueDate.toISOString().split('T')[0],
          quotation_ref: quotation._id ?? quotation.id,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        navigate(`/invoices/${created.id}`);
      } else {
        const e = await res.json();
        alert(`Error: ${e.error}`);
      }
    } catch {
      alert('Failed to create invoice');
    } finally {
      setConverting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        navigate('/quotations');
      } else {
        const e = await res.json();
        alert(`Error: ${e.error}`);
      }
    } catch {
      alert('Failed to delete quotation');
    }
  };

  // ─────────────────────────────────────────────────────────────
  
  const downloadPdf = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    const pw  = doc.internal.pageSize.getWidth();
    const ph  = doc.internal.pageSize.getHeight();
    const L   = 15;
    const cw  = pw - L * 2;

    // ── Title ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(20, 20, 20);
    doc.text('Quotation', L, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(qtNum, L, 30);
    doc.setFontSize(9);
    doc.text(`Created: ${fmtDate(quotation.created_at)}`, L, 36);
    doc.text(`Valid until: ${addDays(quotation.created_at, 30)}`, L, 42);

    // ── Status — plain uppercase text top-right ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(68, 68, 68);
    doc.text(quotation.status.toUpperCase(), pw - L, 22, { align: 'right' });

    // ── 1.5pt dark separator ──
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.5);
    doc.line(L, 48, pw - L, 48);

    // ── Bill To / Project ──
    const col2 = L + cw / 2 + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text('BILL TO', L, 57);
    doc.text('PROJECT', col2, 57);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text(quotation.customer_name ?? '—', L, 64);
    doc.text(quotation.project_name ?? '—', col2, 64);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Rate: $${rate.toFixed(2)} / ${rateLabel}`, col2, 70);
    doc.text(`Duration: ${duration} ${durLabel}`, col2, 76);

    // ── Light divider ──
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(L, 83, pw - L, 83);

    // ── Services table — no fill, bottom-border header only ──
    autoTable(doc, {
      startY: 88,
      head: [['Description', 'Rate ($/hr)', 'Hours', 'Amount']],
      body: [[serviceDesc, `$${rate.toFixed(2)}`, String(duration), `$${fmtMoney(totalAmount)}`]],
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: [40, 40, 40],
        fillColor: [255, 255, 255],
        lineColor: [220, 220, 220],
        lineWidth: { top: 0, right: 0, bottom: 0.2, left: 0 },
      },
      headStyles: {
        fontStyle: 'bold',
        textColor: [100, 100, 100],
        fillColor: [255, 255, 255],
        lineColor: [20, 20, 20],
        lineWidth: { top: 0, right: 0, bottom: 0.4, left: 0 },
        fontSize: 8,
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
      },
      columnStyles: {
        0: { cellWidth: cw * 0.46 },
        1: { halign: 'right', cellWidth: cw * 0.18 },
        2: { halign: 'right', cellWidth: cw * 0.16 },
        3: { halign: 'right', cellWidth: cw * 0.20 },
      },
      margin: { left: L, right: L },
    });

    const afterTable = (doc as any).lastAutoTable.finalY;

    // ── Total — 1.5pt dark rule, right-aligned, no fill ──
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.5);
    doc.line(L, afterTable + 4, pw - L, afterTable + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text('TOTAL AMOUNT', pw - L, afterTable + 11, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    doc.text(`$${fmtMoney(totalAmount)}`, pw - L, afterTable + 20, { align: 'right' });

    // ── Footer ──
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text('Confidential — For client use only', pw / 2, ph - 10, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('Page 1 of 1', pw - L, ph - 10, { align: 'right' });

    const slug = (quotation.customer_name ?? 'Client').replace(/\s+/g, '_');
    doc.save(`Quotation_${qtNum}_${slug}.pdf`);
  };

  // ─────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* ── Top bar ── */}
      <div className="flex justify-between items-center">
        <Link
          to="/quotations"
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quotations
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPdfOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Preview &amp; Export PDF
          </button>

          {quotation.status?.toLowerCase() === 'accepted' && canManage && (
            <button
              onClick={handleConvertToInvoice}
              disabled={converting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {converting ? 'Creating…' : 'Convert to Invoice'}
            </button>
          )}

          {canManage && (
            <>
              <button
                onClick={() => navigate(`/quotations/${id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setIsDeleteOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Main card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

        {/* Section 1 — Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quotation #{qtNum}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Created on {fmtDate(quotation.created_at)} · Valid until {addDays(quotation.created_at, 30)}
            </p>
          </div>
          {/* Plain uppercase status — no badge */}
          <span
            className="flex-shrink-0"
            style={{ fontSize: '12px', fontWeight: 600, color: '#444', letterSpacing: '0.08em' }}
          >
            {quotation.status.toUpperCase()}
          </span>
        </div>

        <hr className="my-6 border-slate-100" />

        {/* Section 2 — Status timeline */}
        <div className="relative">
          {/* Gray track across all 4 visual positions */}
          <div
            className="absolute top-3 h-0.5 bg-slate-200"
            style={{ left: 12, right: 12, zIndex: 0 }}
          />
          {/* Green progress — visualProgress / 3 covers 4 positions (0–3) */}
          {visualProgress > 0 && (
            <div
              className="absolute top-3 h-0.5 bg-emerald-500 transition-all"
              style={{
                left: 12,
                width: `calc((100% - 24px) * ${visualProgress / 3})`,
                zIndex: 0,
              }}
            />
          )}

          <div className="relative flex justify-between" style={{ zIndex: 1 }}>
            {/* Real steps: Draft, Sent, Accepted */}
            {STEPS.map((step, i) => {
              const done    = i < currentStep;
              const current = i === currentStep;
              return (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      done    ? 'bg-emerald-500' :
                      current ? 'bg-violet-600'  :
                                'bg-slate-200'
                    }`}
                  >
                    {(done || current) && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      done    ? 'text-emerald-600' :
                      current ? 'text-violet-700'  :
                                'text-slate-400'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}

            {/* Visual-only "Invoiced" indicator — read-only, not a real status */}
            <div className="flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  hasInvoice ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              >
                {hasInvoice && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className={`mt-2 text-xs font-medium ${hasInvoice ? 'text-emerald-600' : 'text-slate-400'}`}>
                Invoiced
              </span>
            </div>
          </div>
        </div>

        <hr className="my-6 border-slate-100" />

        {/* Section 3 — Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                Customer
              </p>
              <p className="text-sm font-medium text-slate-800">{quotation.customer_name ?? '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <FolderKanban className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                Project
              </p>
              <p className="text-sm font-medium text-slate-800">{quotation.project_name ?? '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                Rate &amp; Duration
              </p>
              <p className="text-sm font-medium text-slate-800">
                ${rate.toFixed(2)}&nbsp;/&nbsp;{rateLabel}&nbsp;·&nbsp;{duration}&nbsp;{durLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Services table card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a2e' }}>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Description
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Rate ($/hr)
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Hours
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="px-5 py-4 text-slate-700">{serviceDesc}</td>
              <td className="px-5 py-4 text-right text-slate-700">${rate.toFixed(2)}</td>
              <td className="px-5 py-4 text-right text-slate-700">{duration}</td>
              <td className="px-5 py-4 text-right text-slate-700">${fmtMoney(totalAmount)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '1.5px solid #e2e8f0' }}>
              <td
                colSpan={3}
                className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Total Amount
              </td>
              <td className="px-5 py-4 text-right text-xl font-bold text-slate-900">
                ${fmtMoney(totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Delete confirmation modal ── */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setIsDeleteOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Delete Quotation</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Are you sure you want to delete this quotation? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PDF Preview modal ── */}
      {isPdfOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setIsPdfOpen(false)} />

          <div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col"
            style={{ maxHeight: '90vh' }}
          >
            {/* Modal header — Download PDF + X only, no bottom footer */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
              <h2 className="text-sm font-semibold text-slate-900">PDF Preview — #{qtNum}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadPdf}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => setIsPdfOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* A4 sheet preview — black & white, no color fills */}
            <div className="flex-1 overflow-y-auto bg-slate-200 p-6">
              <div
                className="bg-white shadow-lg mx-auto"
                style={{
                  position: 'relative',
                  width: '560px',
                  minHeight: '792px',
                  padding: '40px 48px 80px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#111', lineHeight: 1.1 }}>
                      Quotation
                    </div>
                    <div style={{ fontSize: '13px', color: '#777', marginTop: '5px' }}>{qtNum}</div>
                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '3px' }}>
                      Created: {fmtDate(quotation.created_at)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#aaa' }}>
                      Valid until: {addDays(quotation.created_at, 30)}
                    </div>
                  </div>
                  {/* Plain uppercase status — no badge */}
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#444', letterSpacing: '0.08em' }}>
                    {quotation.status.toUpperCase()}
                  </span>
                </div>

                {/* Thick dark separator — 1.5px */}
                <div style={{ height: '1.5px', backgroundColor: '#111', margin: '20px 0' }} />

                {/* Bill To / Project */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#aaa', marginBottom: '6px' }}>
                      Bill To
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>
                      {quotation.customer_name ?? '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#aaa', marginBottom: '6px' }}>
                      Project
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>
                      {quotation.project_name ?? '—'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#777', marginTop: '3px' }}>
                      Rate: ${rate.toFixed(2)} / {rateLabel} · {duration} {durLabel}
                    </div>
                  </div>
                </div>

                {/* Services table — no header background, bottom-border only */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #111' }}>
                      <th style={{ textAlign: 'left',  padding: '8px 10px', color: '#888', fontWeight: 600, fontSize: '10px', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                        Description
                      </th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', color: '#888', fontWeight: 600, fontSize: '10px', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                        Rate ($/hr)
                      </th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', color: '#888', fontWeight: 600, fontSize: '10px', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                        Hours
                      </th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', color: '#888', fontWeight: 600, fontSize: '10px', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ backgroundColor: '#fff', borderBottom: '0.5px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 10px', color: '#333' }}>{serviceDesc}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#333' }}>${rate.toFixed(2)}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#333' }}>{duration}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#333' }}>${fmtMoney(totalAmount)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Total — 1.5px dark rule, right-aligned, no fill */}
                <div style={{ borderTop: '1.5px solid #111', marginTop: '0', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: '20px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#aaa' }}>
                    Total Amount
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#111' }}>
                    ${fmtMoney(totalAmount)}
                  </span>
                </div>

                {/* Footer — pinned to bottom of A4 area */}
                <div style={{ position: 'absolute', bottom: '40px', left: '48px', right: '48px', paddingTop: '14px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#bbb', fontStyle: 'italic', flex: 1, textAlign: 'center' }}>
                    Confidential — For client use only
                  </span>
                  <span style={{ fontSize: '10px', color: '#bbb' }}>Page 1 of 1</span>
                </div>
              </div>
            </div>
            {/* No bottom modal footer */}
          </div>
        </div>
      )}

    </div>
  );
}
