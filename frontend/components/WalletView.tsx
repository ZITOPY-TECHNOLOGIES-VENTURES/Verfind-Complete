/**
 * WalletView.tsx
 *
 * The missing component that EscrowWallet.tsx imports.
 * Drop this into the same directory as EscrowWallet.tsx.
 *
 * Usage (already wired in EscrowWallet.tsx):
 *   <WalletView userEmail={user.email} userName={user.username} />
 *
 * What this covers:
 *  - Escrow balance card (available + held in escrow)
 *  - Transaction history with status badges
 *  - Top-up via Paystack inline (mock)
 *  - Withdrawal to saved payout account
 *  - Escrow release timeline per property
 *  - Matches Verifind design system exactly
 *    (Fraunces headings, DM Sans body, var(--color-primary), var(--bg-surface), etc.)
 */

import React, { useState, useEffect } from 'react';
import {
    Wallet, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2,
    AlertCircle, Loader2, Plus, Building2, ShieldCheck,
    TrendingUp, ChevronRight, RefreshCw, X, Lock, CreditCard,
    Copy, Eye, EyeOff,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface WalletViewProps {
    userEmail: string;
    userName: string;
}

type TxType = 'credit' | 'debit' | 'escrow_hold' | 'escrow_release';
type TxStatus = 'completed' | 'pending' | 'held' | 'failed';

interface Transaction {
    id: string;
    type: TxType;
    status: TxStatus;
    amount: number;
    description: string;
    property?: string;
    district?: string;
    date: string;
    ref: string;
}

interface EscrowItem {
    id: string;
    property: string;
    district: string;
    amount: number;
    heldSince: string;
    releaseDate: string;
    status: 'pending_inspection' | 'inspection_passed' | 'releasing';
    inspectorName: string;
}

// ─── Mock API (mirrors real /api/wallet endpoints) ────────────────────────────
const walletAPI = {
    getBalance: async (): Promise<{ available: number; held: number; total: number }> => {
        await new Promise(r => setTimeout(r, 600));
        return { available: 285_000, held: 450_000, total: 735_000 };
    },

    getTransactions: async (): Promise<Transaction[]> => {
        await new Promise(r => setTimeout(r, 400));
        return [
            { id: 't1', type: 'escrow_hold', status: 'held', amount: 450_000, description: 'Escrow held — 3-bedroom duplex inspection pending', property: '3-Bed Duplex', district: 'Maitama', date: '2025-03-18', ref: 'VF-ESC-9183' },
            { id: 't2', type: 'credit', status: 'completed', amount: 735_000, description: 'Wallet funded via Paystack', date: '2025-03-17', ref: 'PSK-28847221' },
            { id: 't3', type: 'escrow_release', status: 'completed', amount: 220_000, description: 'Escrow released — inspection confirmed', property: '2-Bed Flat', district: 'Jabi', date: '2025-03-02', ref: 'VF-ESC-7741' },
            { id: 't4', type: 'debit', status: 'completed', amount: 5_000, description: 'Legal Title Search fee — 2-Bed Flat, Jabi', property: '2-Bed Flat', district: 'Jabi', date: '2025-03-01', ref: 'VF-AUDIT-221' },
            { id: 't5', type: 'debit', status: 'completed', amount: 15_000, description: 'Physical Site Audit fee — 2-Bed Flat, Jabi', property: '2-Bed Flat', district: 'Jabi', date: '2025-02-28', ref: 'VF-AUDIT-219' },
            { id: 't6', type: 'credit', status: 'completed', amount: 240_000, description: 'Wallet funded via Paystack', date: '2025-02-20', ref: 'PSK-27612099' },
        ];
    },

    getEscrowItems: async (): Promise<EscrowItem[]> => {
        await new Promise(r => setTimeout(r, 300));
        return [
            {
                id: 'e1',
                property: '3-Bed Duplex, Plot 44',
                district: 'Maitama',
                amount: 450_000,
                heldSince: '18 Mar 2025',
                releaseDate: 'Est. 20 Mar 2025',
                status: 'pending_inspection',
                inspectorName: 'Engr. Adeyemi Bello',
            },
        ];
    },

    initiateTopUp: async (amount: number): Promise<{ authorizationUrl: string; reference: string }> => {
        await new Promise(r => setTimeout(r, 900));
        return {
            authorizationUrl: `https://checkout.paystack.com/mock_${Math.random().toString(36).slice(2)}`,
            reference: `PSK-${Date.now()}`,
        };
    },

    initiateWithdrawal: async (amount: number): Promise<{ success: boolean; reference: string }> => {
        await new Promise(r => setTimeout(r, 1200));
        return { success: true, reference: `VF-WD-${Date.now()}` };
    },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => `₦${n.toLocaleString()}`;

const TX_META: Record<TxType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    credit: { label: 'Top-up', color: '#059669', bg: 'rgba(5,150,105,0.08)', icon: <ArrowDownLeft size={14} /> },
    debit: { label: 'Debit', color: '#DC2626', bg: 'rgba(220,38,38,0.08)', icon: <ArrowUpRight size={14} /> },
    escrow_hold: { label: 'Escrow Held', color: '#D97706', bg: 'rgba(217,119,6,0.08)', icon: <Lock size={14} /> },
    escrow_release: { label: 'Escrow Released', color: '#059669', bg: 'rgba(5,150,105,0.08)', icon: <ShieldCheck size={14} /> },
};

const STATUS_META: Record<TxStatus, { label: string; color: string; bg: string }> = {
    completed: { label: 'Completed', color: '#059669', bg: 'rgba(5,150,105,0.1)' },
    pending: { label: 'Pending', color: '#D97706', bg: 'rgba(217,119,6,0.1)' },
    held: { label: 'Held', color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
    failed: { label: 'Failed', color: '#DC2626', bg: 'rgba(220,38,38,0.1)' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

// Card: balance overview
const BalanceCard: React.FC<{
    available: number; held: number; total: number; loading: boolean;
    onTopUp: () => void; onWithdraw: () => void; userName: string;
}> = ({ available, held, total, loading, onTopUp, onWithdraw, userName }) => {
    const [showBalance, setShowBalance] = useState(true);
    const [copied, setCopied] = useState(false);
    const walletId = 'VF-' + (userName?.slice(0, 6) || 'USER').toUpperCase();

    const handleCopy = () => {
        navigator.clipboard.writeText(walletId).catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div style={{
            borderRadius: 24,
            background: 'linear-gradient(135deg, #0a1628 0%, #1a3a8a 60%, #1B4FD8 100%)',
            padding: 28,
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            <div style={{ position: 'absolute', bottom: -30, right: 40, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Wallet size={18} />
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{userName || 'My Wallet'}</div>
                            <div
                                style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                                onClick={handleCopy}
                            >
                                {walletId} <Copy size={10} /> {copied && <span style={{ color: '#6EE7B7' }}>Copied!</span>}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowBalance(b => !b)}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}
                    >
                        {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                </div>

                {/* Total balance */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
                        Total Balance
                    </div>
                    {loading ? (
                        <div style={{ height: 40, width: 180, borderRadius: 8, background: 'rgba(255,255,255,0.1)' }} />
                    ) : (
                        <div style={{ fontSize: 38, fontWeight: 400, fontFamily: "'Fraunces', serif", letterSpacing: '-0.03em' }}>
                            {showBalance ? fmt(total) : '₦ •••••'}
                        </div>
                    )}
                </div>

                {/* Available vs Held */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                    {[
                        { label: 'Available', value: available, color: '#6EE7B7', icon: <TrendingUp size={13} /> },
                        { label: 'In Escrow', value: held, color: '#FCD34D', icon: <Lock size={13} /> },
                    ].map(item => (
                        <div key={item.label} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                                <span style={{ color: item.color }}>{item.icon}</span>
                                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'DM Sans', sans-serif" }}>{item.label}</span>
                            </div>
                            <div style={{ fontSize: 19, fontWeight: 700, fontFamily: "'Fraunces', serif", color: item.color }}>
                                {showBalance ? fmt(item.value) : '₦ •••'}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button
                        onClick={onTopUp}
                        style={{ padding: '12px', borderRadius: 12, background: '#fff', color: '#1B4FD8', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                        <Plus size={15} /> Fund Wallet
                    </button>
                    <button
                        onClick={onWithdraw}
                        disabled={available <= 0}
                        style={{ padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 700, fontSize: 13, cursor: available > 0 ? 'pointer' : 'not-allowed', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: available > 0 ? 1 : 0.5 }}
                    >
                        <ArrowUpRight size={15} /> Withdraw
                    </button>
                </div>
            </div>
        </div>
    );
}

// Card: active escrow items
const EscrowItemCard: React.FC<{ item: EscrowItem }> = ({ item }) => {
    const pct = item.status === 'inspection_passed' ? 80 : item.status === 'releasing' ? 95 : 40;
    const statusLabel = { pending_inspection: 'Awaiting Inspection', inspection_passed: 'Inspection Passed', releasing: 'Releasing Funds' }[item.status];
    const statusColor = { pending_inspection: '#D97706', inspection_passed: '#059669', releasing: '#1B4FD8' }[item.status];

    return (
        <div style={{ padding: '18px 20px', borderRadius: 16, background: 'rgba(217,119,6,0.05)', border: '1px solid rgba(217,119,6,0.2)', fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(27,79,216,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4FD8' }}>
                        <Building2 size={16} />
                    </div>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary, #111116)' }}>{item.property}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary, #535364)', marginTop: 1 }}>
                            {item.district} · Held since {item.heldSince}
                        </div>
                    </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#D97706', fontFamily: "'Fraunces', serif" }}>{fmt(item.amount)}</div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 5, borderRadius: 99, background: 'rgba(0,0,0,0.07)', marginBottom: 10 }}>
                <div style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, #1B4FD8, ${statusColor})`, width: `${pct}%`, transition: 'width 1s' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: 99, background: statusColor }} />
                    <span style={{ fontSize: 12, color: statusColor, fontWeight: 600 }}>{statusLabel}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted, #9CA3AF)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={10} /> {item.releaseDate}
                </div>
            </div>

            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.03)', fontSize: 12, color: 'var(--text-secondary, #535364)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={12} color="#1B4FD8" />
                Inspector: {item.inspectorName}
            </div>
        </div>
    );
}

// Transaction row
const TxRow: React.FC<{ tx: Transaction }> = ({ tx }) => {
    const meta = TX_META[tx.type];
    const status = STATUS_META[tx.status];
    const sign = tx.type === 'credit' || tx.type === 'escrow_release' ? '+' : '-';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--border-color, #F3F4F6)', fontFamily: "'DM Sans', sans-serif" }}>
            {/* Icon */}
            <div style={{ width: 38, height: 38, borderRadius: 12, background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {meta.icon}
            </div>

            {/* Description */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary, #111116)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tx.description}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted, #9CA3AF)', marginTop: 2 }}>
                    {tx.date} · <span style={{ fontFamily: 'monospace' }}>{tx.ref}</span>
                </div>
            </div>

            {/* Amount + status */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: sign === '+' ? '#059669' : 'var(--text-primary, #111116)', fontFamily: "'Fraunces', serif" }}>
                    {sign}{fmt(tx.amount)}
                </div>
                <div style={{ marginTop: 3, display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 99, background: status.bg, color: status.color, fontSize: 10, fontWeight: 700 }}>
                    {status.label}
                </div>
            </div>
        </div>
    );
}

// Top-up modal
const TopUpModal: React.FC<{ onClose: () => void; onConfirm: (amount: number) => void; loading: boolean }> = ({ onClose, onConfirm, loading }) => {
    const [amount, setAmount] = useState('');
    const presets = [50_000, 100_000, 200_000, 500_000];
    const parsed = parseInt(amount.replace(/\D/g, '')) || 0;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: 'var(--bg-surface, #fff)', borderRadius: 24, padding: 28, maxWidth: 420, width: '100%', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 32px 64px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                    <div>
                        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, margin: '0 0 4px', color: 'var(--text-primary, #111116)', letterSpacing: '-0.02em' }}>Fund Wallet</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary, #535364)', margin: 0 }}>Via Paystack · Instant transfer</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #9CA3AF)', padding: 4 }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Amount input */}
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted, #9CA3AF)', marginBottom: 6 }}>
                    Amount (₦)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border-color, #E5E7EB)', background: 'var(--bg-surface-alt, #F9FAFB)', marginBottom: 16, fontSize: 15 }}>
                    <span style={{ color: 'var(--text-muted, #9CA3AF)', marginRight: 6, fontWeight: 700 }}>₦</span>
                    <input
                        type="text"
                        value={amount}
                        onChange={e => setAmount(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ','))}
                        placeholder="0"
                        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 18, fontWeight: 700, color: 'var(--text-primary, #111116)', fontFamily: "'Fraunces', serif" }}
                    />
                </div>

                {/* Presets */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 22 }}>
                    {presets.map(p => (
                        <button
                            key={p}
                            onClick={() => setAmount(p.toLocaleString())}
                            style={{
                                padding: '8px 4px',
                                borderRadius: 10,
                                border: `1.5px solid ${parsed === p ? '#1B4FD8' : 'var(--border-color, #E5E7EB)'}`,
                                background: parsed === p ? 'rgba(27,79,216,0.06)' : 'transparent',
                                color: parsed === p ? '#1B4FD8' : 'var(--text-secondary, #535364)',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: "'DM Sans', sans-serif",
                            }}
                        >
                            {p >= 1000 ? `${p / 1000}k` : p}
                        </button>
                    ))}
                </div>

                {/* Security note */}
                <div style={{ display: 'flex', gap: 8, padding: '10px 12px', borderRadius: 10, background: 'rgba(27,79,216,0.04)', marginBottom: 20 }}>
                    <Lock size={13} color='#1B4FD8' style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: 'var(--text-muted, #9CA3AF)', lineHeight: 1.5, margin: 0 }}>
                        You'll be redirected to Paystack's secure checkout. Funds appear instantly after payment.
                    </p>
                </div>

                <button
                    onClick={() => onConfirm(parsed)}
                    disabled={parsed < 1000 || loading}
                    style={{
                        width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                        background: parsed >= 1000 && !loading ? '#1B4FD8' : 'var(--border-color, #E5E7EB)',
                        color: parsed >= 1000 && !loading ? '#fff' : 'var(--text-muted, #9CA3AF)',
                        fontWeight: 700, fontSize: 14, cursor: parsed >= 1000 && !loading ? 'pointer' : 'not-allowed',
                        fontFamily: "'DM Sans', sans-serif",
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                >
                    {loading
                        ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
                        : <><CreditCard size={16} /> Pay {parsed >= 1000 ? fmt(parsed) : ''} via Paystack</>
                    }
                </button>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );
}

// Withdraw modal
const WithdrawModal: React.FC<{ available: number; onClose: () => void; onConfirm: (amount: number) => void; loading: boolean }> = ({ available, onClose, onConfirm, loading }) => {
    const [amount, setAmount] = useState('');
    const parsed = parseInt(amount.replace(/\D/g, '')) || 0;
    const valid = parsed >= 1000 && parsed <= available;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: 'var(--bg-surface, #fff)', borderRadius: 24, padding: 28, maxWidth: 420, width: '100%', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 32px 64px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                    <div>
                        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, margin: '0 0 4px', color: 'var(--text-primary, #111116)', letterSpacing: '-0.02em' }}>Withdraw Funds</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary, #535364)', margin: 0 }}>To your registered payout account</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #9CA3AF)', padding: 4 }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(27,79,216,0.05)', border: '1px solid rgba(27,79,216,0.14)', marginBottom: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1B4FD8', marginBottom: 4 }}>Available to Withdraw</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary, #111116)', fontFamily: "'Fraunces', serif" }}>{fmt(available)}</div>
                </div>

                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted, #9CA3AF)', marginBottom: 6 }}>
                    Amount (₦)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${parsed > available ? '#DC2626' : 'var(--border-color, #E5E7EB)'}`, background: 'var(--bg-surface-alt, #F9FAFB)', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted, #9CA3AF)', marginRight: 6, fontWeight: 700 }}>₦</span>
                    <input
                        type="text"
                        value={amount}
                        onChange={e => setAmount(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ','))}
                        placeholder="0"
                        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 18, fontWeight: 700, color: 'var(--text-primary, #111116)', fontFamily: "'Fraunces', serif" }}
                    />
                    <button
                        onClick={() => setAmount(available.toLocaleString())}
                        style={{ fontSize: 11, color: '#1B4FD8', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                    >
                        MAX
                    </button>
                </div>
                {parsed > available && (
                    <p style={{ fontSize: 12, color: '#DC2626', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <AlertCircle size={12} /> Amount exceeds available balance
                    </p>
                )}

                <div style={{ display: 'flex', gap: 8, padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.03)', marginBottom: 20, marginTop: 14 }}>
                    <Lock size={13} color='var(--text-muted, #9CA3AF)' style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: 'var(--text-muted, #9CA3AF)', lineHeight: 1.5, margin: 0 }}>
                        Sent directly to your Paystack payout account. Arrives within 24–48 hrs. Only available balance can be withdrawn — escrow-held funds release after inspection.
                    </p>
                </div>

                <button
                    onClick={() => onConfirm(parsed)}
                    disabled={!valid || loading}
                    style={{
                        width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                        background: valid && !loading ? '#1B4FD8' : 'var(--border-color, #E5E7EB)',
                        color: valid && !loading ? '#fff' : 'var(--text-muted, #9CA3AF)',
                        fontWeight: 700, fontSize: 14, cursor: valid && !loading ? 'pointer' : 'not-allowed',
                        fontFamily: "'DM Sans', sans-serif",
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                >
                    {loading
                        ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
                        : <><ArrowUpRight size={16} /> Withdraw {valid ? fmt(parsed) : ''}</>
                    }
                </button>
            </div>
        </div>
    );
}

// ─── Main WalletView ──────────────────────────────────────────────────────────
export const WalletView: React.FC<WalletViewProps> = ({ userEmail, userName }) => {
    const [balance, setBalance] = useState({ available: 0, held: 0, total: 0 });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [escrowItems, setEscrowItems] = useState<EscrowItem[]>([]);
    const [loadingBal, setLoadingBal] = useState(true);
    const [loadingTx, setLoadingTx] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modal, setModal] = useState<'topup' | 'withdraw' | null>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const [activeTab, setActiveTab] = useState<'history' | 'escrow'>('history');

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const loadData = async () => {
        setLoadingBal(true);
        setLoadingTx(true);
        const [bal, txs, escrow] = await Promise.all([
            walletAPI.getBalance(),
            walletAPI.getTransactions(),
            walletAPI.getEscrowItems(),
        ]);
        setBalance(bal);
        setLoadingBal(false);
        setTransactions(txs);
        setEscrowItems(escrow);
        setLoadingTx(false);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    useEffect(() => { loadData(); }, []);

    const handleTopUp = async (amount: number) => {
        setModalLoading(true);
        try {
            const res = await walletAPI.initiateTopUp(amount);
            setModalLoading(false);
            setModal(null);
            showToast(`Paystack checkout initiated · Ref: ${res.reference}`);
            // In production: window.location.href = res.authorizationUrl;
        } catch {
            setModalLoading(false);
            showToast('Top-up failed. Please try again.', 'error');
        }
    };

    const handleWithdraw = async (amount: number) => {
        setModalLoading(true);
        try {
            const res = await walletAPI.initiateWithdrawal(amount);
            setModalLoading(false);
            setModal(null);
            if (res.success) {
                setBalance(b => ({ ...b, available: b.available - amount, total: b.total - amount }));
                showToast(`Withdrawal initiated · Ref: ${res.reference}`);
            }
        } catch {
            setModalLoading(false);
            showToast('Withdrawal failed. Please try again.', 'error');
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                maxWidth: 640,
                margin: '0 auto',
                fontFamily: "'DM Sans', sans-serif",
                padding: '4px 0',
            }}
        >
            {/* Toast */}
            {toast && (
                <div
                    style={{
                        position: 'fixed', top: 20, right: 20, zIndex: 700,
                        padding: '12px 18px',
                        borderRadius: 12,
                        background: toast.type === 'success' ? 'rgba(5,150,105,0.95)' : 'rgba(220,38,38,0.95)',
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        backdropFilter: 'blur(8px)',
                        animation: 'slideIn 0.2s ease',
                    }}
                >
                    {toast.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 400, margin: '0 0 4px', color: 'var(--text-primary, #111116)', letterSpacing: '-0.02em' }}>
                        Escrow Wallet
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary, #535364)', margin: 0 }}>
                        {userEmail || 'Your secure Verifind wallet'}
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    style={{ background: 'var(--bg-surface-alt, #F9FAFB)', border: '1px solid var(--border-color, #E5E7EB)', borderRadius: 10, padding: '8px 10px', cursor: 'pointer', color: 'var(--text-secondary, #535364)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}
                >
                    <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                    Refresh
                </button>
            </div>

            {/* Balance Card */}
            <BalanceCard
                available={balance.available}
                held={balance.held}
                total={balance.total}
                loading={loadingBal}
                onTopUp={() => setModal('topup')}
                onWithdraw={() => setModal('withdraw')}
                userName={userName}
            />

            {/* Active Escrow Items */}
            {escrowItems.length > 0 && (
                <div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary, #535364)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>
                        Active Escrow
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {escrowItems.map(item => <EscrowItemCard key={item.id} item={item} />)}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--bg-surface-alt, #F9FAFB)', borderRadius: 12, border: '1px solid var(--border-color, #E5E7EB)' }}>
                {([['history', 'Transaction History'], ['escrow', 'Escrow Info']] as const).map(([id, label]) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        style={{
                            flex: 1, padding: '9px', borderRadius: 9, border: 'none',
                            background: activeTab === id ? 'var(--bg-surface, #fff)' : 'transparent',
                            color: activeTab === id ? 'var(--text-primary, #111116)' : 'var(--text-muted, #9CA3AF)',
                            fontWeight: activeTab === id ? 700 : 500,
                            fontSize: 13,
                            cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                            boxShadow: activeTab === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                            transition: 'all 0.15s',
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Transaction History */}
            {activeTab === 'history' && (
                <div style={{ background: 'var(--bg-surface, #fff)', borderRadius: 16, border: '1px solid var(--border-color, #F3F4F6)', padding: '4px 18px' }}>
                    {loadingTx ? (
                        <div style={{ padding: 32, textAlign: 'center' }}>
                            <Loader2 size={22} color="#1B4FD8" style={{ animation: 'spin 0.8s linear infinite' }} />
                        </div>
                    ) : transactions.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted, #9CA3AF)', fontSize: 14 }}>
                            No transactions yet. Fund your wallet to get started.
                        </div>
                    ) : (
                        transactions.map(tx => <TxRow key={tx.id} tx={tx} />)
                    )}
                </div>
            )}

            {/* Escrow Info tab */}
            {activeTab === 'escrow' && (
                <div style={{ background: 'var(--bg-surface, #fff)', borderRadius: 16, border: '1px solid var(--border-color, #F3F4F6)', padding: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {[
                            { icon: <Lock size={16} />, title: 'How Escrow Works', body: 'When you pay for an inspection, your funds are held securely in your Verifind wallet. They are released to the agent 48 hours after an inspector confirms the property matches the listing.' },
                            { icon: <ShieldCheck size={16} />, title: 'Paystack Protection', body: 'All wallet transactions are processed by Paystack. Your account details are stored as transfer recipients and Verifind never holds full card numbers.' },
                            { icon: <Clock size={16} />, title: 'Release Timeline', body: 'After a successful inspection confirmation, funds are automatically released to the agent\'s registered payout account. You\'ll see a "Escrow Released" transaction in your history.' },
            ].map(item => (
                        <div key={item.title} style={{ display: 'flex', gap: 12, padding: '14px', borderRadius: 12, background: 'var(--bg-surface-alt, #F9FAFB)' }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(27,79,216,0.08)', color: '#1B4FD8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {item.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary, #111116)', marginBottom: 4 }}>{item.title}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary, #535364)', lineHeight: 1.6 }}>{item.body}</div>
                            </div>
                        </div>
            ))}
                    </div>
                </div>
            )}

            {/* Modals */}
            {modal === 'topup' && <TopUpModal onClose={() => setModal(null)} onConfirm={handleTopUp} loading={modalLoading} />}
            {modal === 'withdraw' && <WithdrawModal available={balance.available} onClose={() => setModal(null)} onConfirm={handleWithdraw} loading={modalLoading} />}

            <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
        </div>
    );
};