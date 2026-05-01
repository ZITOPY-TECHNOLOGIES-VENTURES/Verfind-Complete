import React, { useState } from 'react';
import api from '../services/api';
import type { Property } from '../types';

interface Props {
  property: Property;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'confirm' | 'redirecting' | 'pending_movein';

export default function PaymentModal({ property: p, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('confirm');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [moveInLoading, setMoveInLoading] = useState(false);
  const [moveInDone, setMoveInDone] = useState(false);

  async function handlePay() {
    setError('');
    setLoading(true);
    try {
      const res = await api.post<{ authorizationUrl: string; reference: string }>('/api/payments/initialize', { propertyId: p.id });
      setStep('redirecting');
      // Redirect to Paystack
      window.location.href = res.authorizationUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment');
      setLoading(false);
    }
  }

  async function handleConfirmMoveIn() {
    if (!paymentId) return;
    setMoveInLoading(true);
    try {
      await api.post(`/api/payments/confirm-movein/${paymentId}`, {});
      setMoveInDone(true);
      setTimeout(onSuccess, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to confirm move-in');
    } finally {
      setMoveInLoading(false);
    }
  }

  const total = p.totalInitialPayment || p.baseRent;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 440, padding: '32px 28px', borderRadius: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <h3 style={{ flex: 1, margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
            {step === 'pending_movein' ? 'Confirm Move-in' : 'Escrow Payment'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)' }}>✕</button>
        </div>

        {error && (
          <div style={{ background: 'rgba(232,76,61,.1)', border: '1px solid rgba(232,76,61,.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, color: '#E84C3D', fontSize: 14 }}>
            {error}
          </div>
        )}

        {step === 'confirm' && (
          <>
            {/* Property summary */}
            <div style={{ background: 'var(--glass-bg-subtle)', borderRadius: 14, padding: '16px 18px', marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: 'var(--text-primary)' }}>{p.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📍 {p.district}, Abuja</div>
            </div>

            {/* Fee breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {[
                { label: 'Base Rent', value: p.baseRent },
                p.serviceCharge > 0 ? { label: 'Service Charge', value: p.serviceCharge } : null,
                p.cautionFee > 0 ? { label: 'Caution Fee', value: p.cautionFee } : null,
                p.agencyFee ? { label: 'Agency Fee', value: p.agencyFee } : null,
                p.legalFee ? { label: 'Legal Fee', value: p.legalFee } : null,
              ].filter(Boolean).map((f: any) => (
                <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₦{f.value.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>Total</span>
                <span style={{ fontWeight: 900, fontSize: 18, color: 'var(--color-primary)' }}>₦{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Escrow explanation */}
            <div style={{ background: 'rgba(10,102,194,.08)', border: '1px solid rgba(10,102,194,.2)', borderRadius: 12, padding: '12px 14px', marginBottom: 20, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              🔒 <strong style={{ color: 'var(--text-primary)' }}>Escrow protection:</strong> Your payment is held securely. Funds are only released to the agent after you confirm you've moved in.
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'var(--glass-bg-subtle)', border: '1.5px solid var(--border-color)', borderRadius: 12, cursor: 'pointer', fontWeight: 700, color: 'var(--text-primary)' }}>Cancel</button>
              <button onClick={handlePay} disabled={loading} style={{ flex: 1, padding: '12px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Processing…' : 'Pay with Paystack'}
              </button>
            </div>
          </>
        )}

        {step === 'redirecting' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="animate-spin" style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border-color)', borderTopColor: 'var(--color-primary)', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Redirecting to Paystack…</p>
          </div>
        )}

        {step === 'pending_movein' && (
          <>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14, lineHeight: 1.6 }}>
              Your payment has been confirmed and is held in escrow.
              <br /><br />
              Once you've physically moved into the property, tap the button below to release the funds to the agent.
            </p>
            {moveInDone ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Move-in confirmed! Funds are being released.</p>
              </div>
            ) : (
              <button onClick={handleConfirmMoveIn} disabled={moveInLoading} style={{ width: '100%', padding: '14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: moveInLoading ? 'not-allowed' : 'pointer', opacity: moveInLoading ? 0.7 : 1 }}>
                {moveInLoading ? 'Processing…' : "✓ I've moved in — Release funds"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
