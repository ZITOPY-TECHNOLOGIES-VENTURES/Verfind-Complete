import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Building2, Lock } from 'lucide-react';
import api from '../services/api';

interface Bank { code: string; name: string; }

export const AgentBankSetup: React.FC = () => {
  const [banks,        setBanks]       = useState<Bank[]>([]);
  const [bankCode,     setBankCode]    = useState('');
  const [bankName,     setBankName]    = useState('');
  const [accountNum,   setAccountNum]  = useState('');
  const [accountName,  setAccountName] = useState('');
  const [resolving,    setResolving]   = useState(false);
  const [saving,       setSaving]      = useState(false);
  const [saved,        setSaved]       = useState(false);
  const [error,        setError]       = useState('');
  const [existing,     setExisting]    = useState<{bankName:string;accountName:string;accountNumber:string}|null>(null);

  useEffect(() => {
    // Load bank list and existing setup in parallel
    Promise.all([
      api.get('/api/banks'),
      api.get('/api/banks/setup'),
    ]).then(([banksRes, setupRes]) => {
      setBanks((banksRes.data as any)?.banks || []);
      const setup = setupRes.data as any;
      if (setup?.configured) setExisting(setup);
    }).catch(() => {});
  }, []);

  // Auto-resolve account name when account number + bank are both filled
  useEffect(() => {
    if (accountNum.length === 10 && bankCode) {
      resolveAccount();
    } else {
      setAccountName('');
    }
  }, [accountNum, bankCode]);

  const resolveAccount = async () => {
    setResolving(true);
    setError('');
    try {
      const res = await api.post('/api/banks/resolve', { accountNumber: accountNum, bankCode }) as any;
      setAccountName((res.data as any)?.accountName || '');
    } catch {
      setAccountName('');
      setError('Could not verify this account. Check the number and bank selection.');
    } finally {
      setResolving(false);
    }
  };

  const handleSave = async () => {
    setError('');
    if (!bankCode || !accountNum || !accountName)
      return setError('Please fill all fields and verify your account number.');

    setSaving(true);
    try {
      await api.post('/api/banks/setup', { bankCode, bankName, accountNumber: accountNum, accountName });
      setSaved(true);
      setExisting({ bankName, accountName, accountNumber: accountNum.replace(/\d(?=\d{4})/g, '*') });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save bank details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 12,
    border: '1px solid var(--border-color)', background: 'var(--bg-surface)',
    color: 'var(--text-primary)', fontFamily: "'DM Sans',sans-serif",
    fontSize: 14, outline: 'none',
  };
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    color: 'var(--text-muted)', marginBottom: 6,
  };

  if (saved) return (
    <div style={{ padding: '24px', borderRadius: 20, background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.20)', textAlign: 'center' }}>
      <CheckCircle2 size={32} style={{ color: '#059669', display: 'block', margin: '0 auto 12px' }} />
      <div style={{ fontWeight: 700, color: '#059669', fontSize: 15 }}>Bank account saved!</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
        Paystack will send your payments directly to this account when funds are released.
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div>
        <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
          Payout Account
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          This is the account Paystack sends your rental payments to, 48hrs after each inspection is confirmed. You must set this up before tenants can pay.
        </p>
      </div>

      {/* Existing account display */}
      {existing && !saved && (
        <div style={{ padding: '16px', borderRadius: 14, background: 'rgba(27,79,216,0.06)', border: '1px solid rgba(27,79,216,0.14)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary)', marginBottom: 8 }}>Current Account</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{existing.accountName}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{existing.bankName} · {existing.accountNumber}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Fill the form below to update your account.</div>
        </div>
      )}

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', color: '#DC2626', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={lbl}>Bank</label>
          <select
            value={bankCode}
            onChange={e => {
              setBankCode(e.target.value);
              setBankName(banks.find(b => b.code === e.target.value)?.name || '');
            }}
            style={{ ...inp, appearance: 'none' as any, cursor: 'pointer' }}
          >
            <option value="">Select your bank</option>
            {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
          </select>
        </div>

        <div>
          <label style={lbl}>Account Number (10 digits)</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={accountNum}
              onChange={e => setAccountNum(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="0123456789"
              maxLength={10}
              style={inp}
            />
            {resolving && (
              <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                <Loader2 size={16} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
              </div>
            )}
          </div>
        </div>

        {/* Account name — auto-filled by Paystack resolution */}
        <div>
          <label style={lbl}>Account Name (auto-verified)</label>
          <div style={{ ...inp, background: accountName ? 'rgba(5,150,105,0.06)' : 'var(--bg-surface)', border: `1px solid ${accountName ? 'rgba(5,150,105,0.30)' : 'var(--border-color)'}`, color: accountName ? '#059669' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {accountName ? (
              <><CheckCircle2 size={14} style={{ color: '#059669', flexShrink: 0 }} /> {accountName}</>
            ) : resolving ? (
              <><Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> Verifying…</>
            ) : (
              <span style={{ opacity: 0.5, fontSize: 13 }}>Filled automatically when you enter your account number</span>
            )}
          </div>
        </div>

        {/* Security note */}
        <div style={{ display: 'flex', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(0,0,0,0.04)', alignItems: 'flex-start' }}>
          <Lock size={13} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
            Your account details are sent directly to Paystack and stored as a transfer recipient. Verifind never stores your full account number in plain text.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !accountName || !bankCode}
          style={{ padding: '13px', borderRadius: 14, background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: saving || !accountName || !bankCode ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving || !accountName || !bankCode ? 0.6 : 1 }}
        >
          {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Building2 size={16} /> Save Payout Account</>}
        </button>
      </div>
    </div>
  );
};
