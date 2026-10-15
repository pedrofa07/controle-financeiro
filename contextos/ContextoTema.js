import React, { createContext, useContext, useState } from 'react';

const TemaContexto = createContext(null);

export function ProvedorTema({ children }) {
  const [tema, setTema] = useState('claro');
  const escuro = tema === 'escuro';

  const cores = {
    fundo: escuro ? '#111827' : '#F5FAF8',
    cartao: escuro ? '#1F2937' : '#FFFFFF',
    texto: escuro ? '#F9FAFB' : '#173B34',
    secundario: escuro ? '#CBD5E1' : '#64748B',
    principal: '#10B981',
    erro: '#E11D48'
  };

  function alternarTema() {
    setTema((atual) => (atual === 'claro' ? 'escuro' : 'claro'));
  }

  return (
    <TemaContexto.Provider value={{ tema, setTema, escuro, cores, alternarTema }}>
      {children}
    </TemaContexto.Provider>
  );
}

export function useTema() {
  const contexto = useContext(TemaContexto);
  if (!contexto) {
    throw new Error('useTema deve ser usado dentro de ProvedorTema.');
  }
  return contexto;
}

// Exporta o Context também (usado no App.js)
export { TemaContexto };