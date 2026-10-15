
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

export default function GraficoCircular({
  dados = [],
  titulo = 'Distribuição financeira'
}) {
  const largura = Math.max(
    250,
    Math.min(Dimensions.get('window').width - 80, 420)
  );

  const dadosValidos = dados
    .filter(item => Number(item.valor) > 0)
    .map(item => ({
      name: item.nome,
      valor: Number(item.valor),
      color: item.cor || '#087F5B',
      legendFontColor: '#475569',
      legendFontSize: 12
    }));

  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>{titulo}</Text>

      {dadosValidos.length > 0 ? (
        <PieChart
          data={dadosValidos}
          width={largura}
          height={220}
          accessor="valor"
          backgroundColor="transparent"
          paddingLeft="12"
          absolute
          chartConfig={{
            color: () => '#334155'
          }}
        />
      ) : (
        <View style={estilos.vazio}>
          <Text style={estilos.icone}>◔</Text>
          <Text style={estilos.textoVazio}>
            Ainda não existem dados suficientes para mostrar o gráfico.
          </Text>
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 17,
    marginBottom: 14,
    alignItems: 'center'
  },
  titulo: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: '800',
    color: '#16352B',
    marginBottom: 12
  },
  vazio: {
    alignItems: 'center',
    paddingVertical: 22
  },
  icone: {
    color: '#087F5B',
    fontSize: 32,
    marginBottom: 8
  },
  textoVazio: {
    color: '#718078',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12
  }
});
