import React, { createContext, useContext, useState } from 'react';

const UsuarioContexto = createContext(null);

export function ProvedorUsuario({ children }) {
  const [usuario, setUsuario] = useState(null);

  function entrar(dadosUsuario) {
    setUsuario(dadosUsuario);
  }

  function sair() {
    setUsuario(null);
  }

  return (
    <UsuarioContexto.Provider
      value={{ usuario, setUsuario, entrar, sair, logado: Boolean(usuario) }}
    >
      {children}
    </UsuarioContexto.Provider>
  );
}

export function useUsuario() {
  const contexto = useContext(UsuarioContexto);
  if (!contexto) {
    throw new Error('useUsuario deve ser usado dentro de ProvedorUsuario.');
  }
  return contexto;
}

export { UsuarioContexto };