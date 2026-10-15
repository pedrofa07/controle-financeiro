
import React, { useCallback, useContext, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  RefreshControl
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { api } from '../servicos/api';
import { TemaContexto } from '../contextos/ContextoTema';

function moeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

export default function Movimentacoes({ navigation }) {
  const { tema } = useContext(TemaContexto);
  const escuro = tema === 'escuro';

  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [excluirId, setExcluirId] = useState(null);
  const [excluindoId, setExcluindoId] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);

  const cores = {
    fundo: escuro ? '#111827' : '#F5FAF8',
    cartao: escuro ? '#1F2937' : '#FFFFFF',
    texto: escuro ? '#F9FAFB' : '#173B34',
    secundario: escuro ? '#CBD5E1' : '#64748B',
    borda: escuro ? '#374151' : '#E2E8F0',
    principal: '#10B981',
    vermelho: '#E11D48',
    campo: escuro ? '#263449' : '#ECFDF5',
    aviso: escuro ? '#3B1D2A' : '#FFF1F2'
  };

  const estilos = StyleSheet.create({
    tela: {
      flex: 1,
      backgroundColor: cores.fundo,
      paddingHorizontal: 18,
      paddingTop: 25
    },
    etiqueta: {
      color: cores.principal,
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 2
    },
    titulo: {
      color: cores.texto,
      fontSize: 28,
      fontWeight: 'bold',
      marginTop: 8
    },
    subtitulo: {
      color: cores.secundario,
      marginTop: 5,
      marginBottom: 20
    },
    novo: {
      backgroundColor: cores.principal,
      borderRadius: 14,
      padding: 16,
      alignItems: 'center',
      marginBottom: 14
    },
    textoNovo: {
      color: '#FFFFFF',
      fontWeight: 'bold'
    },
    lista: {
      paddingBottom: 35,
      flexGrow: 1
    },
    cartao: {
      backgroundColor: cores.cartao,
      borderColor: cores.borda,
      borderWidth: 1,
      borderRadius: 18,
      padding: 15,
      marginBottom: 12
    },
    linhaTopo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11
    },
    icone: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center'
    },
    iconeReceita: {
      backgroundColor: escuro ? '#064E3B' : '#D1FAE5'
    },
    iconeDespesa: {
      backgroundColor: escuro ? '#4C1D2D' : '#FFE4E6'
    },
    iconeTexto: {
      color: cores.principal,
      fontSize: 22,
      fontWeight: 'bold'
    },
    nome: {
      color: cores.texto,
      fontSize: 15,
      fontWeight: 'bold'
    },
    info: {
      color: cores.secundario,
      fontSize: 12,
      marginTop: 4
    },
    data: {
      color: cores.secundario,
      fontSize: 11,
      marginTop: 3
    },
    receita: {
      color: cores.principal,
      fontWeight: 'bold',
      fontSize: 13
    },
    despesa: {
      color: cores.vermelho,
      fontWeight: 'bold',
      fontSize: 13
    },
    acoes: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 15
    },
    botao: {
      flex: 1,
      padding: 12,
      borderRadius: 10,
      alignItems: 'center'
    },
    editar: {
      backgroundColor: cores.campo
    },
    excluir: {
      backgroundColor: cores.aviso
    },
    textoEditar: {
      color: cores.principal,
      fontWeight: 'bold'
    },
    textoExcluir: {
      color: cores.vermelho,
      fontWeight: 'bold'
    },
    confirmacao: {
      backgroundColor: cores.aviso,
      borderRadius: 12,
      padding: 13,
      marginTop: 15
    },
    pergunta: {
      color: cores.texto,
      fontWeight: 'bold',
      marginBottom: 10
    },
    cancelar: {
      backgroundColor: cores.borda
    },
    textoCancelar: {
      color: cores.texto,
      fontWeight: 'bold'
    },
    apagar: {
      backgroundColor: cores.vermelho
    },
    textoApagar: {
      color: '#FFFFFF',
      fontWeight: 'bold'
    },
    aviso: {
      backgroundColor: erro ? cores.aviso : cores.campo,
      padding: 12,
      borderRadius: 12,
      marginBottom: 12
    },
    textoAviso: {
      color: erro ? cores.vermelho : cores.principal
    },
    vazio: {
      padding: 35,
      alignItems: 'center',
      marginTop: 25
    },
    vazioIcone: {
      color: cores.principal,
      fontSize: 36
    },
    vazioTitulo: {
      color: cores.texto,
      fontWeight: 'bold',
      fontSize: 17,
      marginTop: 10
    },
    vazioTexto: {
      color: cores.secundario,
      textAlign: 'center',
      marginTop: 7,
      lineHeight: 20
    }
  });

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);

      const resposta = await api.get('/movimentacoes');

      setDados(
        Array.isArray(resposta.data) ? resposta.data : []
      );

      setMensagem('');
      setErro(false);
    } catch (e) {
      setMensagem(
        e.response?.data?.erro ||
        e.response?.data?.mensagem ||
        e.message ||
        'Não foi possível carregar as movimentações.'
      );
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  async function excluirMovimentacao(id) {
    if (id === null || id === undefined || excluindoId !== null) {
      return;
    }

    try {
      setExcluindoId(id);
      setMensagem('');
      setErro(false);

      const resposta = await api.delete(
        `/movimentacoes/${id}`
      );

      setDados(atual =>
        atual.filter(
          item => String(item.id) !== String(id)
        )
      );

      setExcluirId(null);
      setMensagem(
        resposta.data?.mensagem ||
        'Movimentação excluída com sucesso!'
      );
      setErro(false);
    } catch (e) {
      console.log(
        'Erro ao excluir movimentação:',
        e.response?.status,
        e.response?.data || e.message
      );

      setMensagem(
        e.response?.data?.erro ||
        e.response?.data?.mensagem ||
        (e.response?.status === 404
          ? 'A rota ou a movimentação não foi encontrada.'
          : e.response?.status === 401
          ? 'Sua sessão expirou. Faça login novamente.'
          : e.message === 'Network Error'
          ? 'Não foi possível conectar ao servidor. Verifique se a API está ligada.'
          : 'Não foi possível excluir a movimentação.')
      );

      setErro(true);
    } finally {
      setExcluindoId(null);
    }
  }

  function renderizar({ item }) {
    const receita = item.tipo === 'receita';
    const confirmando =
      String(excluirId) === String(item.id);
    const excluindo =
      String(excluindoId) === String(item.id);

    return (
      <View style={estilos.cartao}>
        <View style={estilos.linhaTopo}>
          <View
            style={[
              estilos.icone,
              receita
                ? estilos.iconeReceita
                : estilos.iconeDespesa
            ]}
          >
            <Text style={estilos.iconeTexto}>
              {receita ? '↗' : '↘'}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={estilos.nome}>{item.nome}</Text>
            <Text style={estilos.info}>
              {item.categoria || 'Sem categoria'}
            </Text>
            <Text style={estilos.data}>
              {item.data
                ? String(item.data).split('T')[0]
                : ''}
            </Text>
          </View>

          <Text
            style={
              receita ? estilos.receita : estilos.despesa
            }
          >
            {receita ? '+' : '−'} {moeda(item.valor)}
          </Text>
        </View>

        {confirmando ? (
          <View style={estilos.confirmacao}>
            <Text style={estilos.pergunta}>
              Deseja excluir esta movimentação?
            </Text>

            <View style={estilos.acoes}>
              <Pressable
                style={[estilos.botao, estilos.cancelar]}
                onPress={() => setExcluirId(null)}
                disabled={excluindo}
              >
                <Text style={estilos.textoCancelar}>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                style={[estilos.botao, estilos.apagar]}
                onPress={() => excluirMovimentacao(item.id)}
                disabled={excluindo}
              >
                <Text style={estilos.textoApagar}>
                  {excluindo ? 'Excluindo...' : 'Confirmar exclusão'}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={estilos.acoes}>
            <Pressable
              style={[estilos.botao, estilos.editar]}
              onPress={() =>
                navigation.navigate(
                  'CadastroMovimentacao',
                  { item }
                )
              }
            >
              <Text style={estilos.textoEditar}>
                ✎ Editar
              </Text>
            </Pressable>

            <Pressable
              style={[estilos.botao, estilos.excluir]}
              onPress={() => {
                setMensagem('');
                setErro(false);
                setExcluirId(item.id);
              }}
            >
              <Text style={estilos.textoExcluir}>
                Excluir
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={estilos.tela}>
      <Text style={estilos.etiqueta}>
        CENTRAL FINANCEIRA
      </Text>

      <Text style={estilos.titulo}>
        Movimentações
      </Text>

      <Text style={estilos.subtitulo}>
        Acompanhe cada entrada e saída.
      </Text>

      <Pressable
        style={estilos.novo}
        onPress={() =>
          navigation.navigate('CadastroMovimentacao')
        }
      >
        <Text style={estilos.textoNovo}>
          + Nova movimentação
        </Text>
      </Pressable>

      {!!mensagem && (
        <Pressable
          style={estilos.aviso}
          onPress={() => setMensagem('')}
        >
          <Text style={estilos.textoAviso}>
            {mensagem}  ×
          </Text>
        </Pressable>
      )}

      <FlatList
        data={dados}
        keyExtractor={item => String(item.id)}
        renderItem={renderizar}
        contentContainerStyle={estilos.lista}
        refreshControl={
          <RefreshControl
            refreshing={carregando}
            onRefresh={carregar}
            tintColor={cores.principal}
          />
        }
        ListEmptyComponent={
          !carregando ? (
            <View style={estilos.vazio}>
              <Text style={estilos.vazioIcone}>◈</Text>
              <Text style={estilos.vazioTitulo}>
                Nenhuma movimentação
              </Text>
              <Text style={estilos.vazioTexto}>
                Suas movimentações aparecerão nesta tela.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
