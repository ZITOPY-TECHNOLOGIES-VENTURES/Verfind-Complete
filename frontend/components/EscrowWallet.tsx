import React from 'react';
import { WalletView } from './WalletView';
import { useAuth } from '../contexts/AuthContext';

export const EscrowWallet: React.FC = () => {
  const { user } = useAuth();
  return <WalletView userEmail={user?.email || ''} userName={user?.username || ''} />;
};
