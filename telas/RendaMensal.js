
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';

import { api } from '../servicos/api';
import { TemaContexto } from '../contextos/ContextoTema';

export default function RendaMensal({ navigation }) {
  const { tema } = useContext(TemaContexto);
  const escuro = tema === 'escuro';
  const estilos = criarEstilos(escuro);

  const [valor, setValor] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function buscarRenda() {
      try {
        const resposta = await api.get('/renda');
        const numero = Number(resposta.data?.valor || 0);
        setValor(numero > 0 ? String(numero).replace('.', ',') : '');
      } catch (erro) {
        Alert.alert(
          'Erro',
          erro.response?.data?.erro || 'Não foi possível carregar a renda.'
        );
      } finally {
        setCarregando(false);
      }
    }

    buscarRenda();
  }, []);

  async function salvar() {
    if (salvando) return;

    const numero = Number(valor.trim().replace(',', '.'));

    if (!Number.isFinite(numero) || numero < 0) {
      Alert.alert('Atenção', 'Informe um valor válido, maior ou igual a zero.');
      return;
    }

    try {
      setSalvando(true);
      await api.put('/renda', { valor: numero });

      Alert.alert('Sucesso', 'Renda atualizada com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (erro) {
      Alert.alert(
        'Erro',
        erro.response?.data?.erro || 'Não foi possível atualizar a renda.'
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <View style={estilos.carregandoContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={estilos.container}>
      <Text style={estilos.etiqueta}>PLANEJAMENTO FINANCEIRO</Text>

      <Text style={estilos.titulo}>Minha renda mensal</Text>

      <Text style={estilos.descricao}>
        Informe quanto você recebe por mês. Esse valor será usado para calcular
        seu saldo disponível.
      </Text>

      <View style={estilos.cartao}>
        <Text style={estilos.rotulo}>Renda mensal em reais</Text>

        <TextInput
          style={estilos.input}
          placeholder="Ex.: 2500,00"
          placeholderTextColor={escuro ? '#94A3B8' : '#94A3B8'}
          keyboardType="decimal-pad"
          value={valor}
          onChangeText={setValor}
          editable={!salvando}
        />

        <Pressable
          style={({ pressed }) => [
            estilos.botao,
            pressed && estilos.botaoPressionado,
            salvando && estilos.botaoDesativado
          ]}
          onPress={salvar}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={estilos.textoBotao}>Salvar renda</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function criarEstilos(escuro) {
  return StyleSheet.create({
    carregandoContainer: {
      flex: 1,
      backgroundColor: escuro ? '#111827' : '#F5FAF8',
      alignItems: 'center',
      justifyContent: 'center'
    },
    container: {
      flex: 1,
      backgroundColor: escuro ? '#111827' : '#F5FAF8',
      padding: 24,
      paddingTop: 35
    },
    etiqueta: {
      color: '#10B981',
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.5,
      marginBottom: 10
    },
    titulo: {
      fontSize: 28,
      fontWeight: '800',
      color: escuro ? '#F9FAFB' : '#173B34',
      marginBottom: 10
    },
    descricao: {
      color: escuro ? '#CBD5E1' : '#64748B',
      fontSize: 14,
      lineHeight: 21,
      marginBottom: 25
    },
    cartao: {
      backgroundColor: escuro ? '#1F2937' : '#FFFFFF',
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: escuro ? '#374151' : '#D9E7E1'
    },
    rotulo: {
      fontWeight: '700',
      color: escuro ? '#E5E7EB' : '#334155',
      marginBottom: 9
    },
    input: {
      backgroundColor: escuro ? '#111827' : '#F8FBF9',
      borderWidth: 1,
      borderColor: escuro ? '#374151' : '#D9E7E1',
      padding: 16,
      borderRadius: 13,
      marginBottom: 18,
      color: escuro ? '#F9FAFB' : '#173B34',
      fontSize: 16
    },
    botao: {
      backgroundColor: '#10B981',
      padding: 16,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 52
    },
    botaoPressionado: {
      opacity: 0.8
    },
    botaoDesativado: {
      opacity: 0.6
    },
    textoBotao: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 15
    }
  });
}
