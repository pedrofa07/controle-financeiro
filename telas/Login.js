
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../servicos/api';

export default function Login({ navigation, setLogado }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    if (carregando) return;

    setMensagem('');

    const emailLimpo = email.trim().toLowerCase();

    if (!emailLimpo || !senha) {
      setMensagem('Preencha o e-mail e a senha.');
      return;
    }

    try {
      setCarregando(true);

      const resposta = await api.post('/usuarios/login', {
        email: emailLimpo,
        senha
      });

      const { token, usuario } = resposta.data;

      if (!token || !usuario) {
        throw new Error('A API não retornou os dados de acesso.');
      }

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('usuario', JSON.stringify(usuario));
      await AsyncStorage.setItem('tema', usuario.tema || 'claro');

      await setLogado(true, usuario);
    } catch (erro) {
      setMensagem(
        erro.response?.data?.erro ||
        erro.message ||
        'Não foi possível entrar. Verifique a conexão com a API.'
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={estilos.fundo}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <View style={estilos.simbolo}>
          <Text style={estilos.simboloTexto}>R$</Text>
        </View>

        <Text style={estilos.marca}>MEU CONTROLE</Text>
        <Text style={estilos.titulo}>Bem-vindo de volta!</Text>
        <Text style={estilos.subtitulo}>
          Organize seu dinheiro e acompanhe seus objetivos.
        </Text>

        <View style={estilos.cartao}>
          <Text style={estilos.rotulo}>E-MAIL</Text>

          <TextInput
            style={estilos.input}
            placeholder="voce@email.com"
            placeholderTextColor="#89978F"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!carregando}
          />

          <Text style={estilos.rotulo}>SENHA</Text>

          <TextInput
            style={estilos.input}
            placeholder="Digite sua senha"
            placeholderTextColor="#89978F"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            autoCapitalize="none"
            editable={!carregando}
            onSubmitEditing={entrar}
          />

          {!!mensagem && (
            <View style={estilos.aviso}>
              <Text style={estilos.textoAviso}>{mensagem}</Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              estilos.botao,
              pressed && estilos.pressionado,
              carregando && estilos.desativado
            ]}
            onPress={entrar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={estilos.textoBotao}>Entrar na minha conta →</Text>
            )}
          </Pressable>

          <View style={estilos.divisor}>
            <View style={estilos.linha} />
            <Text style={estilos.ou}>OU</Text>
            <View style={estilos.linha} />
          </View>

          <Pressable
            style={estilos.botaoSecundario}
            onPress={() => navigation.navigate('CadastroUsuario')}
            disabled={carregando}
          >
            <Text style={estilos.textoSecundario}>
              Criar uma conta grátis
            </Text>
          </Pressable>
        </View>

        <Text style={estilos.rodape}>
          Organização hoje, tranquilidade amanhã.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: '#F3F7F5'
  },
  conteudo: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 35,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center'
  },
  simbolo: {
    width: 68,
    height: 68,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#087F5B',
    borderRadius: 22,
    marginBottom: 18
  },
  simboloTexto: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900'
  },
  marca: {
    textAlign: 'center',
    color: '#087F5B',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3
  },
  titulo: {
    textAlign: 'center',
    fontSize: 29,
    fontWeight: '800',
    color: '#16352B',
    marginTop: 15
  },
  subtitulo: {
    textAlign: 'center',
    color: '#718078',
    lineHeight: 22,
    marginTop: 9,
    marginBottom: 25
  },
  cartao: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2EBE5',
    shadowColor: '#183A2E',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3
  },
  rotulo: {
    color: '#3D574B',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 5
  },
  input: {
    backgroundColor: '#F7FAF8',
    borderColor: '#DCE7E0',
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 15,
    color: '#16352B',
    marginBottom: 17
  },
  aviso: {
    backgroundColor: '#FFF0F0',
    borderColor: '#FFD2D2',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14
  },
  textoAviso: {
    color: '#B42332',
    fontSize: 13,
    lineHeight: 19
  },
  botao: {
    backgroundColor: '#087F5B',
    padding: 17,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54
  },
  pressionado: {
    opacity: 0.82
  },
  desativado: {
    opacity: 0.6
  },
  textoBotao: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15
  },
  divisor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20
  },
  linha: {
    height: 1,
    backgroundColor: '#E3EAE5',
    flex: 1
  },
  ou: {
    fontSize: 11,
    color: '#8A9A91',
    fontWeight: '700'
  },
  botaoSecundario: {
    borderWidth: 1,
    borderColor: '#087F5B',
    borderRadius: 13,
    padding: 16,
    alignItems: 'center'
  },
  textoSecundario: {
    color: '#087F5B',
    fontWeight: '800'
  },
  rodape: {
    color: '#87948C',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24
  }
});
