
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CartaoMovimentacao({ item }) {
  const receita = item.tipo === 'receita';

  const valor = Number(item.valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  return (
    <View style={estilos.cartao}>
      <View style={[
        estilos.icone,
        receita ? estilos.fundoReceita : estilos.fundoDespesa
      ]}>
        <Text style={estilos.iconeTexto}>{receita ? '↗' : '↘'}</Text>
      </View>

      <View style={estilos.informacoes}>
        <Text style={estilos.nome}>{item.nome}</Text>
        <Text style={estilos.categoria}>
          {item.categoria || 'Sem categoria'}
        </Text>
        <Text style={estilos.data}>{item.data || ''}</Text>
      </View>

      <Text style={receita ? estilos.receita : estilos.despesa}>
        {receita ? '+ ' : '− '}{valor}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2EBE5',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  icone: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center'
  },
  fundoReceita: { backgroundColor: '#E5F7EE' },
  fundoDespesa: { backgroundColor: '#FFF0F0' },
  iconeTexto: { color: '#087F5B', fontSize: 21, fontWeight: '900' },
  informacoes: { flex: 1 },
  nome: { color: '#16352B', fontSize: 14, fontWeight: '800' },
  categoria: { color: '#718078', fontSize: 12, marginTop: 4 },
  data: { color: '#8A9A91', fontSize: 11, marginTop: 3 },
  receita: { color: '#087F5B', fontSize: 13, fontWeight: '800' },
  despesa: { color: '#D9485F', fontSize: 13, fontWeight: '800' }
});
