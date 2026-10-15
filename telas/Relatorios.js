
import React, {
  useCallback,
  useContext,
  useState
} from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';

import { api } from '../servicos/api';
import { TemaContexto } from '../contextos/ContextoTema';

import CartaoSaldo from '../componentes/CartaoSaldo';
import CartaoMovimentacao from '../componentes/CartaoMovimentacao';
import GraficoCircular from '../componentes/GraficoCircular';

const largura = Dimensions.get('window').width;

function moeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

export default function Relatorios() {
  const contextoTema = useContext(TemaContexto);
  const tema = contextoTema?.tema || 'claro';
  const escuro = tema === 'escuro';

  const coresTema = {
    fundo: escuro ? '#07111F' : '#F5FAF8',
    cartao: escuro ? '#0D1B2A' : '#FFFFFF',
    texto: escuro ? '#F0F7FF' : '#173B34',
    secundario: escuro ? '#A8B8CA' : '#64748B',
    borda: escuro ? '#203448' : '#E2EBE5',
    verde: escuro ? '#35F2B5' : '#087F5B'
  };

  const estilos = criarEstilos(coresTema);

  const [renda, setRenda] = useState(0);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);

      const [respostaRenda, respostaMovimentacoes] =
        await Promise.all([
          api.get('/renda'),
          api.get('/movimentacoes')
        ]);

      setRenda(Number(respostaRenda.data?.valor || 0));

      setMovimentacoes(
        Array.isArray(respostaMovimentacoes.data)
          ? respostaMovimentacoes.data
          : []
      );
    } catch (erro) {
      Alert.alert(
        'Erro',
        erro.response?.data?.erro ||
          'Não foi possível carregar os relatórios.'
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

  const receitas = movimentacoes
    .filter((item) => item.tipo === 'receita')
    .reduce(
      (total, item) => total + Number(item.valor || 0),
      0
    );

  const despesas = movimentacoes
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

  const dadosSaldo = [
    {
      name: 'Disponível',
      valor: disponivel,
      color: '#10B981',
      legendFontColor: coresTema.secundario,
      legendFontSize: 13
    },
    {
      name: 'Já gasto',
      valor: despesasNoGrafico,
      color: '#FB7185',
      legendFontColor: coresTema.secundario,
      legendFontSize: 13
    }
  ].filter((item) => item.valor > 0);

  const categorias = {};

  movimentacoes
    .filter((item) => item.tipo === 'despesa')
    .forEach((item) => {
      const categoria = item.categoria || 'Outros';

      categorias[categoria] =
        (categorias[categoria] || 0) +
        Number(item.valor || 0);
    });

  const coresGrafico = [
    '#10B981',
    '#F97316',
    '#6366F1',
    '#EC4899',
    '#0EA5E9',
    '#EAB308',
    '#8B5CF6'
  ];

  const dadosGrafico = Object.entries(categorias).map(
    ([nome, valor], indice) => ({
      nome,
      valor,
      cor: coresGrafico[indice % coresGrafico.length]
    })
  );

  return (
    <ScrollView
      style={estilos.tela}
      contentContainerStyle={estilos.conteudo}
      refreshControl={
        <RefreshControl
          refreshing={carregando}
          onRefresh={carregar}
          tintColor={coresTema.verde}
        />
      }
    >
      <Text style={estilos.titulo}>
        Relatórios financeiros
      </Text>

      <Text style={estilos.descricao}>
        Confira o resumo das suas finanças com base nos
        registros cadastrados.
      </Text>

      <CartaoSaldo
        titulo="Saldo disponível"
        valor={saldo}
        cor={saldo < 0 ? '#E11D48' : '#059669'}
      />

      <CartaoSaldo
        titulo="Renda mensal"
        valor={renda}
        cor="#075E4D"
      />

      <CartaoSaldo
        titulo="Receitas adicionais"
        valor={receitas}
        cor="#059669"
      />

      <CartaoSaldo
        titulo="Total de despesas"
        valor={despesas}
        cor="#E11D48"
      />

      <View style={estilos.secao}>
        <Text style={estilos.tituloSecao}>
          Distribuição do seu dinheiro
        </Text>

        <Text style={estilos.info}>
          Total recebido: {moeda(totalRecebido)}
        </Text>

        {dadosSaldo.length > 0 ? (
          <PieChart
            data={dadosSaldo}
            width={Math.max(largura - 44, 280)}
            height={220}
            accessor="valor"
            backgroundColor="transparent"
            paddingLeft="10"
            absolute
            chartConfig={{
              backgroundGradientFrom: coresTema.cartao,
              backgroundGradientTo: coresTema.cartao,
              color: () => coresTema.texto,
              labelColor: () => coresTema.texto
            }}
          />
        ) : (
          <Text style={estilos.vazio}>
            Cadastre sua renda ou suas movimentações para
            visualizar a distribuição do seu dinheiro.
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
            Suas despesas ultrapassaram o dinheiro recebido
            em {moeda(Math.abs(saldo))}.
          </Text>
        )}
      </View>

      <View style={estilos.secao}>
        <Text style={estilos.tituloSecao}>
          Despesas por categoria
        </Text>

        <GraficoCircular
          dados={dadosGrafico}
          titulo="Distribuição das despesas"
        />

        {Object.keys(categorias).length > 0 ? (
          Object.entries(categorias)
            .sort((a, b) => b[1] - a[1])
            .map(([categoria, valor], indice) => (
              <View
                style={estilos.linha}
                key={categoria}
              >
                <View
                  style={[
                    estilos.bolinhaCategoria,
                    {
                      backgroundColor:
                        coresGrafico[indice % coresGrafico.length]
                    }
                  ]}
                />

                <Text style={estilos.categoria}>
                  {categoria}
                </Text>

                <Text style={estilos.valorCategoria}>
                  {moeda(valor)}
                </Text>
              </View>
            ))
        ) : (
          <Text style={estilos.vazio}>
            Você ainda não cadastrou despesas.
          </Text>
        )}
      </View>

      <View style={estilos.secao}>
        <Text style={estilos.tituloSecao}>
          Movimentações recentes
        </Text>

        {movimentacoes.length > 0 ? (
          movimentacoes.slice(0, 10).map((item, indice) => (
            <CartaoMovimentacao
              key={String(item.id ?? indice)}
              item={item}
            />
          ))
        ) : (
          <Text style={estilos.vazio}>
            Nenhuma movimentação cadastrada.
          </Text>
        )}
      </View>
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
      paddingTop: 24,
      paddingBottom: 40
    },

    titulo: {
      fontSize: 27,
      fontWeight: 'bold',
      color: cores.texto,
      marginBottom: 8
    },

    descricao: {
      fontSize: 14,
      color: cores.secundario,
      lineHeight: 21,
      marginBottom: 20
    },

    secao: {
      backgroundColor: cores.cartao,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: cores.borda,
      padding: 16,
      marginTop: 14,
      marginBottom: 12
    },

    tituloSecao: {
      fontSize: 19,
      fontWeight: 'bold',
      color: cores.texto,
      marginBottom: 14
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

    linha: {
      backgroundColor: cores.fundo,
      padding: 15,
      borderRadius: 12,
      marginBottom: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 10
    },

    bolinhaCategoria: {
      width: 11,
      height: 11,
      borderRadius: 6
    },

    categoria: {
      color: cores.texto,
      flex: 1
    },

    valorCategoria: {
      color: '#FB7185',
      fontWeight: 'bold'
    },

    vazio: {
      color: cores.secundario,
      textAlign: 'center',
      padding: 18,
      lineHeight: 20
    }
  });
}
