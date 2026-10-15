
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';
import { api } from '../servicos/api';

const largura = Dimensions.get('window').width;

function moeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

export default function Inicio({
  navigation,
  usuario,
  tema = 'claro'
}) {
  const escuro = tema === 'escuro';

  const cores = {
    fundo: escuro ? '#111827' : '#F5FAF8',
    cartao: escuro ? '#1F2937' : '#FFFFFF',
    texto: escuro ? '#F9FAFB' : '#173B34',
    secundario: escuro ? '#CBD5E1' : '#64748B',
    borda: escuro ? '#374151' : '#E2EBE5',
    principal: escuro ? '#35F2B5' : '#087F5B',
    saldo: escuro ? '#103A35' : '#087F5B',
    bordaSaldo: escuro ? '#1A6655' : '#087F5B'
  };

  const estilos = criarEstilos(cores);

  const [renda, setRenda] = useState(0);
  const [movimentos, setMovimentos] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);

      const [resRenda, resMovimentos] = await Promise.all([
        api.get('/renda'),
        api.get('/movimentacoes')
      ]);

      setRenda(Number(resRenda.data?.valor || 0));

      setMovimentos(
        Array.isArray(resMovimentos.data)
          ? resMovimentos.data
          : []
      );
    } catch (erro) {
      console.log(
        'Erro ao carregar resumo:',
        erro.response?.data || erro.message
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const receitas = movimentos
    .filter((item) => item.tipo === 'receita')
    .reduce(
      (total, item) => total + Number(item.valor || 0),
      0
    );

  const despesas = movimentos
    .filter((item) => item.tipo === 'despesa')
    .reduce(
      (total, item) => total + Number(item.valor || 0),
      0
    );

  const totalRecebido = renda + receitas;
  const saldo = totalRecebido - despesas;
  const disponivel = Math.max(saldo, 0);

  const despesasNoGrafico =
    totalRecebido > 0
      ? Math.min(despesas, totalRecebido)
      : despesas;

  const grafico = [
    {
      name: 'Disponível',
      valor: disponivel,
      color: '#10B981',
      legendFontColor: cores.secundario,
      legendFontSize: 13
    },
    {
      name: 'Já gasto',
      valor: despesasNoGrafico,
      color: '#FB7185',
      legendFontColor: cores.secundario,
      legendFontSize: 13
    }
  ].filter((item) => item.valor > 0);

  return (
    <ScrollView
      style={estilos.tela}
      contentContainerStyle={estilos.conteudo}
      refreshControl={
        <RefreshControl
          refreshing={carregando}
          onRefresh={carregar}
          tintColor={cores.principal}
        />
      }
    >
      <Text style={estilos.ola}>
        Olá, {usuario?.nome || 'bem-vindo'}! 👋
      </Text>

      <Text style={estilos.titulo}>
        Seu resumo
      </Text>

      <View style={estilos.cartaoSaldo}>
        <Text style={estilos.rotuloSaldo}>
          Saldo disponível
        </Text>

        <Text style={estilos.valorSaldo}>
          {moeda(saldo)}
        </Text>

        <Text style={estilos.rotuloSaldo}>
          Renda mensal: {moeda(renda)}
        </Text>

        <Text style={estilos.rotuloSaldo}>
          Receitas adicionais: {moeda(receitas)}
        </Text>
      </View>

      <View style={estilos.linha}>
        <View style={estilos.cartao}>
          <Text style={estilos.verde}>
            Total recebido
          </Text>

          <Text style={estilos.valor}>
            {moeda(totalRecebido)}
          </Text>
        </View>

        <View style={estilos.cartao}>
          <Text style={estilos.vermelho}>
            Total de despesas
          </Text>

          <Text style={estilos.valor}>
            {moeda(despesas)}
          </Text>
        </View>
      </View>

      <Pressable
        style={estilos.botao}
        onPress={() => navigation.navigate('RendaMensal')}
      >
        <Text style={estilos.textoBotao}>
          Definir renda mensal
        </Text>
      </Pressable>

      <Pressable
        style={estilos.botao}
        onPress={() =>
          navigation.navigate('CadastroMovimentacao')
        }
      >
        <Text style={estilos.textoBotao}>
          + Nova movimentação
        </Text>
      </Pressable>

      <Pressable
        style={estilos.botaoSecundario}
        onPress={() => navigation.navigate('Movimentacoes')}
      >
        <Text style={estilos.textoPrincipal}>
          Ver todas as movimentações
        </Text>
      </Pressable>

      <Pressable
        style={estilos.botaoSecundario}
        onPress={() => navigation.navigate('Relatorios')}
      >
        <Text style={estilos.textoPrincipal}>
          Ver relatórios financeiros
        </Text>
      </Pressable>

      <View style={estilos.secao}>
        <Text style={estilos.tituloSecao}>
          Distribuição do seu dinheiro
        </Text>

        <Text style={estilos.info}>
          Total recebido: {moeda(totalRecebido)}
        </Text>

        {grafico.length > 0 ? (
          <PieChart
            data={grafico}
            width={Math.max(largura - 44, 280)}
            height={220}
            accessor="valor"
            backgroundColor="transparent"
            paddingLeft="10"
            absolute
            chartConfig={{
              backgroundGradientFrom: cores.cartao,
              backgroundGradientTo: cores.cartao,
              color: () => cores.texto,
              labelColor: () => cores.texto
            }}
          />
        ) : (
          <Text style={estilos.info}>
            Defina sua renda mensal para começar a
            acompanhar seu dinheiro no gráfico.
          </Text>
        )}

        <View style={estilos.legenda}>
          <View style={estilos.itemLegenda}>
            <View style={estilos.bolinhaVerde} />

            <View style={estilos.textosLegenda}>
              <Text style={estilos.nomeLegenda}>
                Dinheiro disponível
              </Text>

              <Text style={estilos.valorLegenda}>
                {moeda(disponivel)}
              </Text>
            </View>
          </View>

          <View style={estilos.itemLegenda}>
            <View style={estilos.bolinhaVermelha} />

            <View style={estilos.textosLegenda}>
              <Text style={estilos.nomeLegenda}>
                Dinheiro gasto
              </Text>

              <Text style={estilos.valorLegenda}>
                {moeda(despesas)}
              </Text>
            </View>
          </View>
        </View>

        {saldo < 0 && (
          <Text style={estilos.aviso}>
            Suas despesas ultrapassaram o dinheiro
            recebido em {moeda(Math.abs(saldo))}.
          </Text>
        )}
      </View>

      <Text style={estilos.tituloSecao}>
        Últimas movimentações
      </Text>

      {movimentos.length > 0 ? (
        movimentos.slice(0, 5).map((item, indice) => (
          <View
            style={estilos.movimento}
            key={String(item.id ?? indice)}
          >
            <View style={{ flex: 1 }}>
              <Text style={estilos.nome}>
                {item.nome}
              </Text>

              <Text style={estilos.info}>
                {item.categoria}
              </Text>
            </View>

            <Text
              style={
                item.tipo === 'receita'
                  ? estilos.verde
                  : estilos.vermelho
              }
            >
              {item.tipo === 'receita' ? '+ ' : '- '}
              {moeda(item.valor)}
            </Text>
          </View>
        ))
      ) : (
        <Text style={estilos.info}>
          Nenhuma movimentação cadastrada.
        </Text>
      )}

      {/*<Pressable
        style={estilos.botaoSecundario}
        onPress={() => navigation.navigate('Orcamentos')}
      >
        <Text style={estilos.textoPrincipal}>
          Meus orçamentos
        </Text>
      </Pressable>

      <Pressable
        style={estilos.botaoSecundario}
        onPress={() => navigation.navigate('Metas')}
      >
        <Text style={estilos.textoPrincipal}>
          Minhas metas
        </Text>
      </Pressable>*/}

      <Pressable
        style={estilos.botaoSecundario}
        onPress={() => navigation.navigate('Configuracoes')}
      >
        <Text style={estilos.textoPrincipal}>
          Configurações
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function criarEstilos(cores) {
  return StyleSheet.create({
    tela: {
      flex: 1,
      backgroundColor: cores.fundo
    },

    conteudo: {
      padding: 20,
      paddingTop: 30,
      paddingBottom: 40
    },

    ola: {
      color: cores.secundario,
      fontSize: 16,
      marginBottom: 5
    },

    titulo: {
      fontSize: 27,
      fontWeight: 'bold',
      color: cores.texto,
      marginBottom: 20
    },

    cartaoSaldo: {
      backgroundColor: cores.saldo,
      borderRadius: 22,
      padding: 23,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: cores.bordaSaldo
    },

    rotuloSaldo: {
      color: '#B9FBE5',
      marginBottom: 8
    },

    valorSaldo: {
      color: '#FFFFFF',
      fontSize: 29,
      fontWeight: 'bold',
      marginBottom: 12
    },

    linha: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16
    },

    cartao: {
      flex: 1,
      backgroundColor: cores.cartao,
      padding: 16,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: cores.borda
    },

    valor: {
      fontSize: 16,
      fontWeight: 'bold',
      color: cores.texto,
      marginTop: 8
    },

    verde: {
      color: cores.principal,
      fontWeight: 'bold'
    },

    vermelho: {
      color: '#FB7185',
      fontWeight: 'bold'
    },

    botao: {
      backgroundColor: '#10B981',
      borderRadius: 14,
      padding: 16,
      alignItems: 'center',
      marginBottom: 10
    },

    textoBotao: {
      color: '#FFFFFF',
      fontWeight: 'bold'
    },

    botaoSecundario: {
      backgroundColor: cores.cartao,
      padding: 15,
      borderRadius: 14,
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 1,
      borderColor: cores.borda
    },

    textoPrincipal: {
      color: cores.principal,
      fontWeight: 'bold'
    },

    secao: {
      backgroundColor: cores.cartao,
      borderRadius: 20,
      padding: 16,
      marginVertical: 12,
      borderWidth: 1,
      borderColor: cores.borda
    },

    tituloSecao: {
      fontSize: 18,
      fontWeight: 'bold',
      color: cores.texto,
      marginBottom: 12
    },

    info: {
      color: cores.secundario,
      fontSize: 13,
      marginVertical: 5
    },

    legenda: {
      marginTop: 10,
      gap: 14
    },

    itemLegenda: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10
    },

    bolinhaVerde: {
      width: 13,
      height: 13,
      borderRadius: 7,
      backgroundColor: '#10B981'
    },

    bolinhaVermelha: {
      width: 13,
      height: 13,
      borderRadius: 7,
      backgroundColor: '#FB7185'
    },

    textosLegenda: {
      flex: 1
    },

    nomeLegenda: {
      color: cores.secundario,
      fontSize: 13
    },

    valorLegenda: {
      color: cores.texto,
      fontWeight: 'bold',
      marginTop: 3
    },

    aviso: {
      color: '#FB7185',
      fontWeight: '700',
      lineHeight: 20,
      marginTop: 16
    },

    movimento: {
      backgroundColor: cores.cartao,
      borderRadius: 14,
      padding: 14,
      marginBottom: 9,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: cores.borda
    },

    nome: {
      fontWeight: 'bold',
      color: cores.texto
    }
  });
}
