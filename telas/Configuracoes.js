
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../servicos/api';

export default function Configuracoes({ setLogado, tema, setTema }) {
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [confirmacao, setConfirmacao] = useState('');

  const escuro = tema === 'escuro';

  async function mudarTema(novoTema) {
    try {
      setCarregando(true);
      setMensagem('');

      await api.put('/usuarios/tema', { tema: novoTema });
      await AsyncStorage.setItem('tema', novoTema);
      setTema(novoTema);

      setMensagem('Tema atualizado com sucesso.');
    } catch (erro) {
      setMensagem(
        erro.response?.data?.erro ||
        'Não foi possível salvar o tema.'
      );
    } finally {
      setCarregando(false);
    }
  }

  async function sair() {
    try {
      await setLogado(false);
    } catch (erro) {
      setMensagem('Não foi possível encerrar a sessão.');
    }
  }

  async function excluirConta() {
    try {
      setCarregando(true);
      setMensagem('');

      await api.delete('/usuarios/conta');
      await AsyncStorage.multiRemove(['token', 'usuario', 'tema']);
      setConfirmacao('');
      await setLogado(false);
    } catch (erro) {
      setMensagem(
        erro.response?.data?.erro ||
        'Não foi possível excluir a conta.'
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={[estilos.tela, escuro && estilos.telaEscura]}>
      <Text style={[estilos.etiqueta, escuro && estilos.textoClaro]}>
        PREFERÊNCIAS
      </Text>

      <Text style={[estilos.titulo, escuro && estilos.textoClaro]}>
        Configurações
      </Text>

      <Text style={[estilos.subtitulo, escuro && estilos.subtituloEscuro]}>
        Personalize seu aplicativo.
      </Text>

      {!!mensagem && (
        <Pressable
          style={estilos.aviso}
          onPress={() => setMensagem('')}
        >
          <Text style={estilos.textoAviso}>{mensagem}  ×</Text>
        </Pressable>
      )}

      <View style={[estilos.cartao, escuro && estilos.cartaoEscuro]}>
        <Text style={[estilos.nome, escuro && estilos.textoClaro]}>
          Aparência
        </Text>
        <Text style={estilos.info}>
          Escolha como deseja visualizar o aplicativo.
        </Text>

        <View style={estilos.linha}>
          <Pressable
            style={[
              estilos.opcao,
              tema === 'claro' && estilos.opcaoSelecionada
            ]}
            onPress={() => mudarTema('claro')}
            disabled={carregando}
          >
            <Text style={estilos.icone}>☀</Text>
            <Text style={estilos.textoOpcao}>Claro</Text>
          </Pressable>

          <Pressable
            style={[
              estilos.opcao,
              tema === 'escuro' && estilos.opcaoSelecionada
            ]}
            onPress={() => mudarTema('escuro')}
            disabled={carregando}
          >
            <Text style={estilos.icone}>☾</Text>
            <Text style={estilos.textoOpcao}>Escuro</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        style={[estilos.cartao, escuro && estilos.cartaoEscuro]}
        onPress={sair}
        disabled={carregando}
      >
        <Text style={[estilos.nome, escuro && estilos.textoClaro]}>
          ↪  Sair da conta
        </Text>
        <Text style={estilos.info}>Encerrar sua sessão neste dispositivo.</Text>
      </Pressable>

      <View style={[estilos.cartao, escuro && estilos.cartaoEscuro]}>
        <Text style={estilos.excluirTitulo}>Zona de perigo</Text>
        <Text style={estilos.info}>
          A exclusão remove sua conta. Essa ação pode ser irreversível.
        </Text>

        {confirmacao === 'excluir' ? (
          <View style={estilos.confirmacao}>
            <Text style={estilos.pergunta}>
              Deseja realmente excluir sua conta?
            </Text>

            <View style={estilos.linha}>
              <Pressable
                style={estilos.botaoCancelar}
                onPress={() => setConfirmacao('')}
              >
                <Text style={estilos.textoCancelar}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={estilos.botaoExcluir}
                onPress={excluirConta}
                disabled={carregando}
              >
                {carregando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={estilos.textoBotaoExcluir}>
                    Confirmar exclusão
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            style={estilos.botaoExcluir}
            onPress={() => setConfirmacao('excluir')}
          >
            <Text style={estilos.textoBotaoExcluir}>Excluir minha conta</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#F3F7F5',
    padding: 22,
    paddingTop: 28
  },
  telaEscura: { backgroundColor: '#101A17' },
  etiqueta: {
    color: '#087F5B',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2
  },
  titulo: {
    fontSize: 29,
    fontWeight: '900',
    color: '#16352B',
    marginTop: 9
  },
  subtitulo: { color: '#718078', marginTop: 6, marginBottom: 22 },
  subtituloEscuro: { color: '#B2C6BB' },
  textoClaro: { color: '#E9F5EF' },
  cartao: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2EBE5',
    padding: 18,
    borderRadius: 18,
    marginBottom: 14
  },
  cartaoEscuro: {
    backgroundColor: '#192923',
    borderColor: '#30463B'
  },
  nome: { fontSize: 16, fontWeight: '800', color: '#16352B' },
  info: { color: '#718078', lineHeight: 20, marginTop: 7 },
  linha: { flexDirection: 'row', gap: 10, marginTop: 16 },
  opcao: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DCE7E0',
    borderRadius: 13,
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#F7FAF8'
  },
  opcaoSelecionada: {
    backgroundColor: '#E5F7EE',
    borderColor: '#087F5B'
  },
  icone: { fontSize: 23, color: '#087F5B' },
  textoOpcao: {
    color: '#16352B',
    fontWeight: '800',
    marginTop: 6
  },
  excluirTitulo: { color: '#D9485F', fontSize: 16, fontWeight: '900' },
  botaoExcluir: {
    backgroundColor: '#D9485F',
    padding: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: 14
  },
  textoBotaoExcluir: { color: '#FFFFFF', fontWeight: '800' },
  confirmacao: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFF0F0'
  },
  pergunta: { color: '#9F2637', fontWeight: '800' },
  botaoCancelar: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    padding: 12
  },
  textoCancelar: { color: '#475569', fontWeight: '800' },
  aviso: {
    backgroundColor: '#FFF0F0',
    borderColor: '#FFD2D2',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14
  },
  textoAviso: { color: '#B42332', lineHeight: 20 }
});
