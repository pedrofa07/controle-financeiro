
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

export default function CadastroUsuario({ navigation, setLogado }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function cadastrar() {
    if (carregando) return;

    setMensagem('');
    setErro(false);

    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();

    if (!nomeLimpo || !emailLimpo || !senha) {
      setErro(true);
      setMensagem('Preencha todos os campos.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      setErro(true);
      setMensagem('Digite um endereço de e-mail válido.');
      return;
    }

    if (senha.length < 8) {
      setErro(true);
      setMensagem('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    try {
      setCarregando(true);

      const resposta = await api.post('/usuarios/cadastro', {
        nome: nomeLimpo,
        email: emailLimpo,
        senha
      });

      const { token, usuario } = resposta.data;

      if (!token || !usuario) {
        throw new Error('A API não retornou os dados da conta.');
      }

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('usuario', JSON.stringify(usuario));
      await AsyncStorage.setItem('tema', usuario.tema || 'claro');

      setMensagem('Conta criada com sucesso! Entrando...');
      setErro(false);

      await setLogado(true, usuario);
    } catch (e) {
      setErro(true);

      setMensagem(
        e.response?.data?.erro ||
        e.message ||
        'Não foi possível criar sua conta. Verifique a conexão com a API.'
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
        <Text style={estilos.titulo}>Crie sua conta</Text>
        <Text style={estilos.subtitulo}>
          Seu dinheiro, suas metas, suas decisões.
        </Text>

        <View style={estilos.cartao}>
          <Text style={estilos.rotulo}>NOME COMPLETO</Text>

          <TextInput
            style={estilos.input}
            placeholder="Digite seu nome"
            placeholderTextColor="#89978F"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
            editable={!carregando}
          />

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
            placeholder="Pelo menos 8 caracteres"
            placeholderTextColor="#89978F"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            autoCapitalize="none"
            editable={!carregando}
          />

          {!!mensagem && (
            <View
              style={[
                estilos.aviso,
                erro ? estilos.avisoErro : estilos.avisoSucesso
              ]}
            >
              <Text
                style={[
                  estilos.textoAviso,
                  erro ? estilos.textoErro : estilos.textoSucesso
                ]}
              >
                {mensagem}
              </Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              estilos.botao,
              pressed && estilos.pressionado,
              carregando && estilos.desativado
            ]}
            onPress={cadastrar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={estilos.textoBotao}>
                Criar minha conta →
              </Text>
            )}
          </Pressable>

          <Pressable
            style={estilos.linkBotao}
            onPress={() => navigation.navigate('Login')}
            disabled={carregando}
          >
            <Text style={estilos.link}>
              Já possui uma conta?{' '}
              <Text style={estilos.linkForte}>Entrar</Text>
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
    paddingVertical: 30,
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
    color: '#087F5B',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center'
  },
  titulo: {
    color: '#16352B',
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 14
  },
  subtitulo: {
    color: '#718078',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 9,
    marginBottom: 24
  },
  cartao: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2EBE5',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#183A2E',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3
  },
  rotulo: {
    color: '#3D574B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 5,
    marginBottom: 8
  },
  input: {
    backgroundColor: '#F7FAF8',
    borderWidth: 1,
    borderColor: '#DCE7E0',
    borderRadius: 13,
    padding: 15,
    color: '#16352B',
    fontSize: 15,
    marginBottom: 15
  },
  aviso: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1
  },
  avisoErro: {
    backgroundColor: '#FFF0F0',
    borderColor: '#FFD2D2'
  },
  avisoSucesso: {
    backgroundColor: '#E8F8EF',
    borderColor: '#B7E8CD'
  },
  textoAviso: {
    fontSize: 13,
    lineHeight: 19
  },
  textoErro: {
    color: '#B42332'
  },
  textoSucesso: {
    color: '#087443'
  },
  botao: {
    backgroundColor: '#087F5B',
    minHeight: 54,
    padding: 17,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5
  },
  pressionado: {
    opacity: 0.82
  },
  desativado: {
    opacity: 0.6
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  },
  linkBotao: {
    padding: 13,
    marginTop: 8
  },
  link: {
    textAlign: 'center',
    color: '#718078'
  },
  linkForte: {
    color: '#087F5B',
    fontWeight: '800'
  },
  rodape: {
    color: '#87948C',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 22
  }
});
