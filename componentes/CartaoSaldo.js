
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CartaoSaldo({ titulo, valor, cor = '#087F5B' }) {
  const formatado = Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  return (
    <View style={estilos.cartao}>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={[estilos.valor, { color: cor }]}>{formatado}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 19,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2EBE5'
  },
  titulo: {
    color: '#718078',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 9
  },
  valor: {
    fontSize: 24,
    fontWeight: '900'
  }
});
