import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Bank { code: string; name: string; }
interface AgentBank { bankName: string; accountNumber: string; accountName: string; }

export default function AgentBankSetup() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [existing, setExisting] = useState<AgentBank | null>(null);
  const [bankCode, setBankCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<{ banks: Bank[] }>('/api/banks'),
      api.get<{ agentBank: AgentBank | null }>('/api/banks/my'),
    ]).then(([bRes, eRes]) => {
      setBanks(bRes.banks || []);
      if (eRes.agentBank) setExisting(eRes.agentBank);
    }).catch(console.error);
  }, []);

  async function verifyAccount() {
    if (accountNumber.length !== 10 || !bankCode) return;
    setVerifying(true);
    setAccountName('');
    setError('');
    try {
      const res = await api.post<{ accountName: string }>('/api/banks/verify-account', { accountNumber, bankCode });
      setAccountName(res.accountName);
    } catch (err: any) {
      setError('Could not verify account — check the number and bank');
    } finally {
      setVerifying(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!accountName) { setError('Please verify your account number first'); return; }
    setSaving(true);
    setError('');
    try {
      await api.post('/api/banks/setup', { bankCode, bankName, accountNumber, accountName });
      setSuccess('Bank account saved successfully!');
      setExisting({ bankName, accountNumber, accountName });
    } catch (err: any) {
      setError(err.message || 'Failed to save bank details');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>Bank Account Setup</h2>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
        Add your bank account to receive escrow payments from tenants.
      </p>

      {existing && (
        <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 14, padding: '14px 18px', marginBottom: 24 }}>
          <div style={{ fontWeight: 700, color: '#166534', marginBottom: 4 }}>✓ Bank account on file</div>
          <div style={{ fontSize: 14, color: '#166534' }}>{existing.bankName} · {existing.accountNumber} · {existing.accountName}</div>
          <div style={{ fontSize: 12, color: '#16a34a', marginTop: 6 }}>You can update your account by filling the form below.</div>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(232,76,61,.1)', border: '1px solid rgba(232,76,61,.3)', borderRadius: 12, padding: '12px 14px', marginBottom: 16, color: '#E84C3D', fontSize: 14 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 14px', marginBottom: 16, color: '#166534', fontSize: 14, fontWeight: 600 }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Bank *</label>
          <select value={bankCode} onChange={e => {
            const opt = banks.find(b => b.code === e.target.value);
            setBankCode(e.target.value);
            setBankName(opt?.name || '');
            setAccountName('');
          }} required>
            <option value="">Select your bank</option>
            {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Account Number *</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={accountNumber}
              onChange={e => { setAccountNumber(e.target.value.replace(/\D/g, '')); setAccountName(''); }}
              placeholder="0123456789"
              maxLength={10}
              required
              style={{ flex: 1 }}
            />
            <button type="button" onClick={verifyAccount} disabled={verifying || accountNumber.length !== 10 || !bankCode}
              style={{ padding: '11px 16px', background: 'var(--glass-bg-subtle)', border: '1.5px solid var(--border-color)', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', color: 'var(--text-primary)', opacity: (accountNumber.length !== 10 || !bankCode) ? 0.5 : 1 }}>
              {verifying ? '…' : 'Verify'}
            </button>
          </div>
        </div>

        {accountName && (
          <div style={{ background: '#dcfce7', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: '#166534', fontWeight: 600 }}>
            ✓ {accountName}
          </div>
        )}

        <button type="submit" disabled={saving || !accountName} style={{ padding: '13px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: (saving || !accountName) ? 'not-allowed' : 'pointer', opacity: (saving || !accountName) ? 0.6 : 1 }}>
          {saving ? 'Saving…' : 'Save Bank Account'}
        </button>
      </form>
    </div>
  );
}
