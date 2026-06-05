import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Download, CheckCircle2, Trash2, FileText, X,
  Briefcase, Calendar, DollarSign, Clock,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../../context/AuthContext';

function toInvNum(id: string, issueDate?: string): string {
  const year    = issueDate ? new Date(issueDate).getFullYear() : new Date().getFullYear();
  const cleaned = (id ?? '').replace(/[^0-9a-f]/gi, '');
  const hex     = cleaned.slice(-6) || '000000';
  const num     = (parseInt(hex, 16) % 9000) + 1000;
  return `INV-${year}-${String(num).padStart(4, '0')}`;
}

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmtMoney(n?: number): string {
  return (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STEPS = ['Draft', 'Sent', 'Paid'] as const;

function stepIdx(status: string): number {
  if (status === 'paid') return 2;
  if (status === 'sent') return 1;
  return 0;
}

export default function InvoiceDetails() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [invoice, setInvoice]         = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPdfOpen, setIsPdfOpen]     = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  useEffect(() => {
    fetch(`/api/invoices/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(data => setInvoice(data))
      .catch(() => navigate('/invoices'))
      .finally(() => setLoading(false));
  }, [id, token]);

  const canManage = ['admin', 'super_admin', 'manager', 'finance'].includes(user?.role ?? '');

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>;
  if (!invoice) return null;

  const invNum      = toInvNum(invoice.id ?? id ?? '', invoice.issue_date);
  const amount      = invoice.amount ?? 0;
  const rate        = invoice.rate ?? 0;
  const duration    = invoice.duration ?? 0;
  const rateLabel   = invoice.rate_type === 'daily' ? 'day' : 'hr';
  const durLabel    = invoice.rate_type === 'daily' ? 'days' : 'hours';
  const serviceDesc = invoice.description ?? 'Invoice Services';
  const currentStep = stepIdx(invoice.status);

  const today     = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate   = invoice.due_date ? new Date(invoice.due_date) : null;
  const isOverdue = invoice.status === 'sent' && dueDate !== null && dueDate < today;

  const handleMarkPaid = async () => {
    setMarkingPaid(true);
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0],
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setInvoice(updated);
      } else {
        const e = await res.json();
        alert(`Error: ${e.error}`);
      }
    } catch {
      alert('Failed to update invoice');
    } finally {
      setMarkingPaid(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) navigate('/invoices');
      else {
        const e = await res.json();
        alert(`Error: ${e.error}`);
      }
    } catch {
      alert('Failed to delete invoice');
    }
  };

  const downloadPdf = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    const pw  = doc.internal.pageSize.getWidth();
    const ph  = doc.internal.pageSize.getHeight();
    const L   = 15;
    const cw  = pw - L * 2;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(20, 20, 20);
    doc.text('Invoice', L, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(invNum, L, 30);
    doc.setFontSize(9);
    doc.text(`Issue Date: ${fmtDate(invoice.issue_date)}`, L, 36);
    doc.text(`Due Date: ${fmtDate(invoice.due_date)}`, L, 42);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(68, 68, 68);
    doc.text(invoice.status.toUpperCase(), pw - L, 22, { align: 'right' });

    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.5);
    doc.line(L, 48, pw - L, 48);

    const col2 = L + cw / 2 + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text('BILL TO', L, 57);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text(invoice.customer_name ?? '—', L, 64);

    if (rate > 0 || duration > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 160);
      doc.text('DETAILS', col2, 57);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Rate: $${rate.toFixed(2)} / ${rateLabel}`, col2, 64);
      doc.text(`Duration: ${duration} ${durLabel}`, col2, 70);
    }

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(L, 78, pw - L, 78);

    autoTable(doc, {
      startY: 83,
      head: [['Description', `Rate ($/${rateLabel})`, durLabel.charAt(0).toUpperCase() + durLabel.slice(1), 'Amount']],
      body: [[
        serviceDesc,
        rate > 0 ? `$${rate.toFixed(2)}` : '—',
        duration > 0 ? String(duration) : '—',
        `$${fmtMoney(amount)}`,
      ]],
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
      bodyStyles: { fillColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: cw * 0.46 },
        1: { halign: 'right', cellWidth: cw * 0.18 },
        2: { halign: 'right', cellWidth: cw * 0.16 },
        3: { halign: 'right', cellWidth: cw * 0.20 },
      },
      margin: { left: L, right: L },
    });

    const afterTable = (doc as any).lastAutoTable.finalY;

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
    doc.text(`$${fmtMoney(amount)}`, pw - L, afterTable + 20, { align: 'right' });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text('Confidential — For client use only', pw / 2, ph - 10, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('Page 1 of 1', pw - L, ph - 10, { align: 'right' });

    const slug = (invoice.customer_name ?? 'Client').replace(/\s+/g, '_');
    doc.save(`Invoice_${invNum}_${slug}.pdf`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* ── Top bar ── */}
      <div className="flex justify-between items-center">
        <Link
          to="/invoices"
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Link>

        <div className="flex items-center gap-2">
          {invoice.status === 'sent' && canManage && (
            <button
              onClick={handleMarkPaid}
              disabled={markingPaid}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              {markingPaid ? 'Updating…' : 'Mark as Paid'}
            </button>
          )}

          {invoice.status === 'paid' && (
            <button
              onClick={() => setIsPdfOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Download Invoice PDF
            </button>
          )}

          {canManage && (
            <button
              onClick={() => setIsDeleteOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* ── Overdue alert ── */}
      {isOverdue && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
          <Clock className="w-4 h-4 flex-shrink-0" />
          This invoice is overdue. Due date was {fmtDate(invoice.due_date)}.
        </div>
      )}

      {/* ── Main card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

        {/* Section 1 — Hero */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Invoice</p>
            <h1 className="text-2xl font-bold text-slate-900">#{invNum}</h1>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">${fmtMoney(amount)}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
              <span>Issued: <span className="text-slate-700 font-medium">{fmtDate(invoice.issue_date)}</span></span>
              <span>Due: <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>{fmtDate(invoice.due_date)}</span></span>
              {invoice.paid_date && (
                <span>Paid: <span className="text-emerald-700 font-medium">{fmtDate(invoice.paid_date)}</span></span>
              )}
            </div>
          </div>
          <span
            className="flex-shrink-0"
            style={{ fontSize: '12px', fontWeight: 600, color: '#444', letterSpacing: '0.08em' }}
          >
            {invoice.status.toUpperCase()}
          </span>
        </div>

        <hr className="my-6 border-slate-100" />

        {/* Section 2 — Timeline */}
        <div className="relative">
          <div
            className="absolute top-3 h-0.5 bg-slate-200"
            style={{ left: 12, right: 12, zIndex: 0 }}
          />
          {currentStep > 0 && (
            <div
              className="absolute top-3 h-0.5 bg-emerald-500 transition-all"
              style={{
                left: 12,
                width: `calc((100% - 24px) * ${currentStep / (STEPS.length - 1)})`,
                zIndex: 0,
              }}
            />
          )}
          <div className="relative flex justify-between" style={{ zIndex: 1 }}>
            {STEPS.map((step, i) => {
              const done    = i < currentStep;
              const current = i === currentStep;
              return (
                <div key={step} className="flex flex-col items-center w-6 overflow-visible">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      done || current ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  >
                    {(done || current) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={`mt-2 text-xs font-medium whitespace-nowrap ${
                    done || current ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <hr className="my-6 border-slate-100" />

        {/* Section 3 — Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Customer</p>
              <p className="text-sm font-medium text-slate-800">{invoice.customer_name ?? '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Issue Date</p>
              <p className="text-sm font-medium text-slate-800">{fmtDate(invoice.issue_date)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Due Date</p>
              <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-slate-800'}`}>
                {fmtDate(invoice.due_date)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Amount</p>
              <p className="text-sm font-medium text-slate-800">${fmtMoney(amount)}</p>
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
                Rate ($/{rateLabel})
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {durLabel.charAt(0).toUpperCase() + durLabel.slice(1)}
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="px-5 py-4 text-slate-700">{serviceDesc}</td>
              <td className="px-5 py-4 text-right text-slate-700">
                {rate > 0 ? `$${rate.toFixed(2)}` : '—'}
              </td>
              <td className="px-5 py-4 text-right text-slate-700">
                {duration > 0 ? duration : '—'}
              </td>
              <td className="px-5 py-4 text-right text-slate-700">${fmtMoney(amount)}</td>
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
                ${fmtMoney(amount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Delete modal ── */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setIsDeleteOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Delete Invoice</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Are you sure you want to delete this invoice? This action cannot be undone.
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

      {/* ── PDF modal ── */}
      {isPdfOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setIsPdfOpen(false)} />
          <div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col"
            style={{ maxHeight: '90vh' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
              <h2 className="text-sm font-semibold text-slate-900">PDF Preview — #{invNum}</h2>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#111', lineHeight: 1.1 }}>Invoice</div>
                    <div style={{ fontSize: '13px', color: '#777', marginTop: '5px' }}>{invNum}</div>
                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '3px' }}>Issue Date: {fmtDate(invoice.issue_date)}</div>
                    <div style={{ fontSize: '12px', color: '#aaa' }}>Due Date: {fmtDate(invoice.due_date)}</div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#444', letterSpacing: '0.08em' }}>
                    {invoice.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ height: '1.5px', backgroundColor: '#111', margin: '20px 0' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#aaa', marginBottom: '6px' }}>Bill To</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>{invoice.customer_name ?? '—'}</div>
                  </div>
                  {(rate > 0 || duration > 0) && (
                    <div>
                      <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#aaa', marginBottom: '6px' }}>Details</div>
                      <div style={{ fontSize: '12px', color: '#777' }}>Rate: ${rate.toFixed(2)} / {rateLabel}</div>
                      <div style={{ fontSize: '12px', color: '#777' }}>Duration: {duration} {durLabel}</div>
                    </div>
                  )}
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #111' }}>
                      <th style={{ textAlign: 'left', padding: '8px 10px', color: '#888', fontWeight: 600, fontSize: '10px', letterSpacing: '0.6px', textTransform: 'uppercase' }}>Description</th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', color: '#888', fontWeight: 600, fontSize: '10px', letterSpacing: '0.6px', textTransform: 'uppercase' }}>Rate ($/{rateLabel})</th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', color: '#888', fontWeight: 600, fontSize: '10px', letterSpacing: '0.6px', textTransform: 'uppercase' }}>{durLabel.charAt(0).toUpperCase() + durLabel.slice(1)}</th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', color: '#888', fontWeight: 600, fontSize: '10px', letterSpacing: '0.6px', textTransform: 'uppercase' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ backgroundColor: '#fff', borderBottom: '0.5px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 10px', color: '#333' }}>{serviceDesc}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#333' }}>{rate > 0 ? `$${rate.toFixed(2)}` : '—'}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#333' }}>{duration > 0 ? duration : '—'}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#333' }}>${fmtMoney(amount)}</td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ borderTop: '1.5px solid #111', marginTop: '0', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: '20px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#aaa' }}>Total Amount</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#111' }}>${fmtMoney(amount)}</span>
                </div>

                <div style={{ position: 'absolute', bottom: '40px', left: '48px', right: '48px', paddingTop: '14px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#bbb', fontStyle: 'italic', flex: 1, textAlign: 'center' }}>Confidential — For client use only</span>
                  <span style={{ fontSize: '10px', color: '#bbb' }}>Page 1 of 1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
