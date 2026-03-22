import React, { useState, useEffect } from 'react';
import {
  X, ShieldCheck, Calendar, AlertCircle, Loader2,
  CheckCircle2, ExternalLink, Clock,
} from 'lucide-react';
import { Property } from '../types';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface PaymentModalProps {
  property:   Property;
  onClose:    () => void;
  onSuccess:  () => void;
  onNeedAuth: () => void;
}

const FMT = (n: number) => '₦' + n.toLocaleString('en-NG', { maximumFractionDigits: 0 });

type Step = 'summary' | 'date' | 'paying' | 'verifying' | 'success' | 'error';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  property, onClose, onSuccess, onNeedAuth,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [step,           setStep]           = useState<Step>('summary');
  const [inspectionDate, setInspectionDate] = useState('');
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');
  const [paymentRef,     setPaymentRef]     = useState('');
  const [releaseDate,    setReleaseDate]    = useState('');

  // Min inspection date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Max inspection date = 60 days from now
  const maxDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  useEffect(() => {
    if (!isAuthenticated) { onNeedAuth(); }
  }, [isAuthenticated]);

  const handleInitialize = async () => {
    if (!inspectionDate) { setError('Please select your inspection date.'); return; }
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/payments/initialize', {
        propertyId:     property._id,
        inspectionDate: new Date(inspectionDate).toISOString(),
      }) as any;

      const data = res.data as {
        reference:        string;
        accessCode:       string;
        authorizationUrl: string;
        releaseDate:      string;
      };

      setPaymentRef(data.reference);
      setReleaseDate(data.releaseDate);
      setStep('paying');

      // Load Paystack inline script if not already loaded
      if (!(window as any).PaystackPop) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://js.paystack.co/v1/inline.js';
          script.onload  = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Paystack'));
          document.head.appendChild(script);
        });
      }

      // Open Paystack popup
      const handler = (window as any).PaystackPop.setup({
        key:          process.env.PAYSTACK_PUBLIC_KEY || (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY,
        email:        user?.email || '',
        amount:       property.totalInitialPayment * 100, // kobo
        ref:          data.reference,
        label:        `${property.title} — Verifind`,
        onClose: () => {
          // User closed popup without paying
          setStep('date');
          setError('Payment was cancelled. You can try again.');
        },
        callback: async (response: { reference: string }) => {
          // Paystack calls this after successful payment
          setStep('verifying');
          await verifyPayment(response.reference);
        },
      });

      handler.openIframe();

    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not start payment. Please try again.');
      setStep('date');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    try {
      const res = await api.get(`/api/payments/verify/${reference}`) as any;
      const { status } = res.data as { status: string };

      if (status === 'confirmed' || status === 'success') {
        setStep('success');
      } else {
        setError(`Payment status: ${status}. If money was deducted, contact support with reference: ${reference}`);
        setStep('error');
      }
    } catch {
      setError(`We could not verify your payment. Your reference is: ${reference}. Please contact support if money was deducted.`);
      setStep('error');
    }
  };

  const breakdown = [
    { l: 'Annual Rent',       v: property.baseRent },
    { l: 'Agency Fee (10%)',  v: property.agencyFee  || property.baseRent * 0.1 },
    { l: 'Legal Fee (10%)',   v: property.legalFee   || property.baseRent * 0.1 },
    { l: 'Service Charge',    v: property.serviceCharge },
    { l: 'Caution Deposit',   v: property.cautionFee },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        width: '100%', maxWidth: 480,
        background: 'var(--bg-surface)',
        borderRadius: 24,
        border: '1px solid var(--glass-border)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'DM Sans',sans-serif" }}>
              Secure This Property
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Protected by Paystack · Released after 48hrs
            </div>
          </div>
          {step !== 'verifying' && (
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Property summary — always visible */}
        <div style={{ padding: '16px 24px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 12 }}>
          {property.images?.[0] ? (
            <img src={property.images[0]} alt="" style={{ width: 56, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 56, height: 44, borderRadius: 8, background: 'linear-gradient(135deg,#0A1F3D,#0A5E50)', flexShrink: 0 }} />
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{property.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{property.district} · {property.type}</div>
          </div>
        </div>

        <div style={{ padding: '20px 24px' }}>

          {/* ── STEP: SUMMARY ────────────────────────────────────────── */}
          {step === 'summary' && (
            <>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 10 }}>Cost Breakdown</div>
                {breakdown.map(r => r.v > 0 && (
                  <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{r.l}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{FMT(r.v)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '2px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Total</span>
                  <span style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 500, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>{FMT(property.totalInitialPayment)}</span>
                </div>
              </div>

              {/* How it works */}
              <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(27,79,216,0.06)', border: '1px solid rgba(27,79,216,0.14)', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary)', marginBottom: 8 }}>How payment works</div>
                {[
                  'You pay via Paystack — Nigeria\'s most trusted payment gateway',
                  'Money is collected by Paystack (CBN licensed), not Verifind',
                  'After your inspection is confirmed, funds release to the agent in 48hrs',
                  'You are fully protected if the inspection fails',
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(27,79,216,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-primary)' }}>{i + 1}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep('date')}
                style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(27,79,216,0.30)' }}
              >
                Continue to Payment <span style={{ fontSize: 18 }}>→</span>
              </button>
            </>
          )}

          {/* ── STEP: DATE PICKER ────────────────────────────────────── */}
          {step === 'date' && (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Pick your inspection date</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Select the date you plan to physically inspect this property. The agent will be notified. Funds release 48 hours after this date.
                </div>
              </div>

              {error && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', color: '#DC2626', fontSize: 13, marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 8 }}>
                  Inspection Date
                </label>
                <input
                  type="date"
                  value={inspectionDate}
                  min={minDate}
                  max={maxDate}
                  onChange={e => { setInspectionDate(e.target.value); setError(''); }}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: 'none' }}
                />
              </div>

              {inspectionDate && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.15)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={14} style={{ color: '#059669', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#059669', fontWeight: 500 }}>
                    Funds release to agent: <strong>{new Date(new Date(inspectionDate).getTime() + 48 * 3600000).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setStep('summary')}
                  style={{ flex: 1, padding: '12px', borderRadius: 14, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 14 }}
                >
                  Back
                </button>
                <button
                  onClick={handleInitialize}
                  disabled={loading || !inspectionDate}
                  style={{ flex: 2, padding: '12px', borderRadius: 14, background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: loading || !inspectionDate ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, opacity: loading || !inspectionDate ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Opening Paystack…</> : `Pay ${FMT(property.totalInitialPayment)}`}
                </button>
              </div>
            </>
          )}

          {/* ── STEP: PAYING ─────────────────────────────────────────── */}
          {step === 'paying' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(27,79,216,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <ExternalLink size={28} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Paystack is open
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 300, margin: '0 auto' }}>
                Complete your payment in the Paystack popup. Do not close this window.
              </div>
              <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(0,0,0,0.04)', fontSize: 11, color: 'var(--text-muted)' }}>
                Reference: <code style={{ fontFamily: 'monospace', fontSize: 11 }}>{paymentRef}</code>
              </div>
            </div>
          )}

          {/* ── STEP: VERIFYING ──────────────────────────────────────── */}
          {step === 'verifying' && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Loader2 size={36} className="animate-spin" style={{ color: 'var(--color-primary)', display: 'block', margin: '0 auto 16px' }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Confirming your payment…</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>This takes just a moment</div>
            </div>
          )}

          {/* ── STEP: SUCCESS ────────────────────────────────────────── */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(5,150,105,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={32} style={{ color: '#059669' }} />
              </div>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 400, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>Payment Confirmed</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 300, margin: '0 auto 20px' }}>
                Your payment of <strong>{FMT(property.totalInitialPayment)}</strong> has been received by Paystack. The agent will contact you to confirm your inspection.
              </div>

              {releaseDate && (
                <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(27,79,216,0.06)', border: '1px solid rgba(27,79,216,0.14)', marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary)', marginBottom: 4 }}>Scheduled Release</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Funds release to agent on{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {new Date(releaseDate).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </strong>
                  </div>
                </div>
              )}

              <button
                onClick={() => { onSuccess(); onClose(); }}
                style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14 }}
              >
                Done
              </button>
            </div>
          )}

          {/* ── STEP: ERROR ──────────────────────────────────────────── */}
          {step === 'error' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <AlertCircle size={36} style={{ color: '#DC2626', display: 'block', margin: '0 auto 16px' }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Payment Issue</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 300, margin: '0 auto 20px' }}>
                {error}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 12, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13 }}>
                  Close
                </button>
                <button onClick={() => { setStep('date'); setError(''); }} style={{ flex: 1, padding: '11px', borderRadius: 12, background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13 }}>
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
