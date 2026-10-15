
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  View
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './telas/Login';
import CadastroUsuario from './telas/CadastroUsuario';
import Inicio from './telas/Inicio';
import Movimentacoes from './telas/Movimentacoes';
import CadastroMovimentacao from './telas/CadastroMovimentacao';
import RendaMensal from './telas/RendaMensal';
import Orcamentos from './telas/Orcamentos';
import Metas from './telas/Metas';
import Configuracoes from './telas/Configuracoes';
import Relatorios from './telas/Relatorios';

import { TemaContexto } from './contextos/ContextoTema';
import { UsuarioContexto } from './contextos/ContextoUsuario';
import { api } from './servicos/api';

const Stack = createNativeStackNavigator();

export default function App() {
  const [logado, setLogado] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [tema, setTema] = useState('claro');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function verificarSessao() {
      try {
        const token = await AsyncStorage.getItem('token');

        const temaSalvo = await AsyncStorage.getItem('tema');

        if (temaSalvo === 'claro' || temaSalvo === 'escuro') {
          setTema(temaSalvo);
        }

        if (!token) {
          return;
        }

        const resposta = await api.get('/usuarios/eu');
        const usuarioAtual = resposta.data;

        setUsuario(usuarioAtual);

        const temaAtual =
          usuarioAtual.tema === 'escuro' ||
          usuarioAtual.tema === 'claro'
            ? usuarioAtual.tema
            : temaSalvo === 'escuro'
              ? 'escuro'
              : 'claro';

        setTema(temaAtual);
        setLogado(true);

        await AsyncStorage.setItem('usuario', JSON.stringify(usuarioAtual));
        await AsyncStorage.setItem('tema', temaAtual);
      } catch (erro) {
        console.log(
          'Erro ao verificar sessão:',
          erro.response?.data || erro.message
        );

        await AsyncStorage.multiRemove([
          'token',
          'usuario'
        ]);

        setUsuario(null);
        setLogado(false);
      } finally {
        setCarregando(false);
      }
    }

    verificarSessao();
  }, []);

  async function atualizarSessao(valor, dadosUsuario = null) {
    if (!valor) {
      setLogado(false);
      setUsuario(null);

      await AsyncStorage.multiRemove([
        'token',
        'usuario',
        'tema'
      ]);

      setTema('claro');

      return;
    }

    let usuarioAtual = dadosUsuario;

    if (!usuarioAtual) {
      const resposta = await api.get('/usuarios/eu');
      usuarioAtual = resposta.data;
    }

    setUsuario(usuarioAtual);

    const temaAtual =
      usuarioAtual.tema === 'escuro' ? 'escuro' : 'claro';

    setTema(temaAtual);
    setLogado(true);

    await AsyncStorage.setItem('usuario', JSON.stringify(usuarioAtual));
    await AsyncStorage.setItem('tema', temaAtual);
  }

  async function atualizarTema(novoTema) {
    if (novoTema !== 'claro' && novoTema !== 'escuro') {
      return;
    }

    setTema(novoTema);

    await AsyncStorage.setItem('tema', novoTema);

    setUsuario((usuarioAtual) => {
      if (!usuarioAtual) {
        return usuarioAtual;
      }

      const atualizado = {
        ...usuarioAtual,
        tema: novoTema
      };

      AsyncStorage.setItem(
        'usuario',
        JSON.stringify(atualizado)
      ).catch((erro) => {
        console.log('Erro ao salvar usuário:', erro.message);
      });

      return atualizado;
    });
  }

  if (carregando) {
    const fundoCarregamento =
      tema === 'escuro' ? '#101A17' : '#F3F7F5';

    const corIndicador =
      tema === 'escuro' ? '#35F2B5' : '#087F5B';

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: fundoCarregamento,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ActivityIndicator
          size="large"
          color={corIndicador}
        />
      </View>
    );
  }

  const escuro = tema === 'escuro';

  const fundo = escuro ? '#101A17' : '#F3F7F5';
  const texto = escuro ? '#E9F5EF' : '#173B2F';
  const corCartao = escuro ? '#182720' : '#FFFFFF';
  const corBorda = escuro ? '#30443A' : '#E2EBE5';

  const temaNavegacao = {
    dark: escuro,
    colors: {
      primary: escuro ? '#35F2B5' : '#087F5B',
      background: fundo,
      card: fundo,
      text: texto,
      border: corBorda,
      notification: '#FB7185'
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: '400'
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500'
      },
      bold: {
        fontFamily: 'System',
        fontWeight: '700'
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '900'
      }
    }
  };

  return (
    <UsuarioContexto.Provider
      value={{
        usuario,
        setUsuario,
        logado,
        setLogado
      }}
    >
      <TemaContexto.Provider
        value={{
          tema,
          setTema: atualizarTema
        }}
      >
        <NavigationContainer theme={temaNavegacao}>
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: fundo
              },
              headerTintColor: texto,
              headerTitleStyle: {
                fontWeight: '800'
              },
              headerShadowVisible: false,
              contentStyle: {
                backgroundColor: fundo
              }
            }}
          >
            {!logado ? (
              <>
                <Stack.Screen
                  name="Login"
                  options={{
                    headerShown: false
                  }}
                >
                  {(props) => (
                    <Login
                      {...props}
                      setLogado={atualizarSessao}
                    />
                  )}
                </Stack.Screen>

                <Stack.Screen
                  name="CadastroUsuario"
                  options={{
                    title: 'Criar conta'
                  }}
                >
                  {(props) => (
                    <CadastroUsuario
                      {...props}
                      setLogado={atualizarSessao}
                    />
                  )}
                </Stack.Screen>
              </>
            ) : (
              <>
                <Stack.Screen
                  name="Inicio"
                  options={{
                    title: 'Meu Controle'
                  }}
                >
                  {(props) => (
                    <Inicio
                      {...props}
                      usuario={usuario}
                      tema={tema}
                    />
                  )}
                </Stack.Screen>

                <Stack.Screen
                  name="Movimentacoes"
                  component={Movimentacoes}
                  options={{
                    title: 'Movimentações'
                  }}
                />

                <Stack.Screen
                  name="CadastroMovimentacao"
                  component={CadastroMovimentacao}
                  options={{
                    title: 'Movimentação'
                  }}
                />

                <Stack.Screen
                  name="RendaMensal"
                  component={RendaMensal}
                  options={{
                    title: 'Renda mensal'
                  }}
                />

                <Stack.Screen
                  name="Orcamentos"
                  component={Orcamentos}
                  options={{
                    title: 'Orçamentos'
                  }}
                />

                <Stack.Screen
                  name="Metas"
                  component={Metas}
                  options={{
                    title: 'Metas financeiras'
                  }}
                />

                <Stack.Screen
                  name="Relatorios"
                  component={Relatorios}
                  options={{
                    title: 'Relatórios'
                  }}
                />

                <Stack.Screen
                  name="Configuracoes"
                  options={{
                    title: 'Configurações'
                  }}
                >
                  {(props) => (
                    <Configuracoes
                      {...props}
                      setLogado={atualizarSessao}
                      tema={tema}
                      setTema={atualizarTema}
                    />
                  )}
                </Stack.Screen>
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </TemaContexto.Provider>
    </UsuarioContexto.Provider>
  );
}
