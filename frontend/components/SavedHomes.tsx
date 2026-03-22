import React from 'react';
export const SavedHomes: React.FC<{ onViewDetails: any }> = () => (
  <div style={{ textAlign:'center', padding:'40px', color:'var(--text-secondary)' }}>
    <p style={{ fontFamily:"'Fraunces',serif", fontSize:22, color:'var(--text-primary)', marginBottom:8 }}>Saved Homes</p>
    <p style={{ fontSize:14 }}>Your favorite properties will appear here.</p>
  </div>
);
