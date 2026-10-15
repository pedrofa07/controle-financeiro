import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';

import { api } from '../servicos/api';
import { TemaContexto } from '../contextos/ContextoTema';

export default function CadastroMovimentacao({ navigation, route }) {
  const { tema } = useContext(TemaContexto);
  const item = route?.params?.item;

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('despesa');
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [carregando, setCarregando] = useState(false);

  const escuro = tema === 'escuro';

  useEffect(() => {
    if (item) {
      setNome(item.nome || '');
      setTipo(item.tipo || 'despesa');
      setCategoria(item.categoria || '');
      setValor(String(item.valor ?? ''));
      setData(
        item.data
          ? String(item.data).split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
    }
  }, [item]);

  async function salvarMovimentacao() {
    if (
      !nome.trim() ||
      !categoria.trim() ||
      !valor.trim() ||
      !data.trim()
    ) {
      Alert.alert(
        'Atenção',
        'Preencha todos os campos antes de continuar.'
      );
      return;
    }

    const valorNumerico = Number(valor.replace(',', '.'));

    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      Alert.alert('Atenção', 'Digite um valor válido.');
      return;
    }

    const dados = {
      nome: nome.trim(),
      tipo,
      categoria: categoria.trim(),
      valor: valorNumerico,
      data
    };

    try {
      setCarregando(true);

      if (item) {
        await api.put(`/movimentacoes/${item.id}`, dados);
      } else {
        await api.post('/movimentacoes', dados);
      }

      Alert.alert(
        'Sucesso!',
        item
          ? 'Movimentação atualizada com sucesso!'
          : 'Movimentação realizada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (erro) {
      console.log(
        'Erro ao salvar movimentação:',
        erro.response?.data || erro.message
      );

      Alert.alert(
        'Erro',
        erro.response?.data?.mensagem ||
          erro.response?.data?.erro ||
          'Não foi possível salvar a movimentação. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setCarregando(false);
    }
  }

  const cores = {
    fundo: escuro ? '#121212' : '#F5F7FB',
    cartao: escuro ? '#1E1E1E' : '#FFFFFF',
    texto: escuro ? '#FFFFFF' : '#1B2430',
    secundario: escuro ? '#BBBBBB' : '#667085',
    campo: escuro ? '#2A2A2A' : '#F0F2F5',
    borda: escuro ? '#444444' : '#DDE2EA',
    verde: '#16A36A',
    vermelho: '#E5484D'
  };

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: cores.fundo,
      padding: 20
    },
    cartao: {
      backgroundColor: cores.cartao,
      borderRadius: 18,
      padding: 20,
      elevation: 3
    },
    titulo: {
      fontSize: 25,
      fontWeight: 'bold',
      color: cores.texto,
      marginBottom: 8
    },
    descricao: {
      fontSize: 14,
      color: cores.secundario,
      marginBottom: 24
    },
    label: {
      fontSize: 15,
      fontWeight: '600',
      color: cores.texto,
      marginBottom: 8,
      marginTop: 14
    },
    input: {
      backgroundColor: cores.campo,
      borderWidth: 1,
      borderColor: cores.borda,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: cores.texto
    },
    linha: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 4
    },
    botaoTipo: {
      flex: 1,
      paddingVertical: 13,
      borderRadius: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: cores.borda,
      backgroundColor: cores.campo
    },
    textoTipo: {
      fontWeight: '600',
      color: cores.texto
    },
    botaoSalvar: {
      backgroundColor: cores.verde,
      padding: 15,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 28
    },
    textoSalvar: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold'
    },
    botaoCancelar: {
      padding: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8
    },
    textoCancelar: {
      color: cores.secundario,
      fontWeight: '600'
    }
  });

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.cartao}>
        <Text style={styles.titulo}>
          {item ? 'Editar movimentação' : 'Nova movimentação'}
        </Text>

        <Text style={styles.descricao}>
          Registre suas receitas e despesas para manter suas finanças organizadas.
        </Text>

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: Compra no mercado"
          placeholderTextColor={cores.secundario}
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>Tipo de movimentação</Text>
        <View style={styles.linha}>
          <Pressable
            style={[
              styles.botaoTipo,
              tipo === 'despesa' && {
                backgroundColor: cores.vermelho,
                borderColor: cores.vermelho
              }
            ]}
            onPress={() => setTipo('despesa')}
          >
            <Text
              style={[
                styles.textoTipo,
                tipo === 'despesa' && { color: '#FFFFFF' }
              ]}
            >
              Despesa
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.botaoTipo,
              tipo === 'receita' && {
                backgroundColor: cores.verde,
                borderColor: cores.verde
              }
            ]}
            onPress={() => setTipo('receita')}
          >
            <Text
              style={[
                styles.textoTipo,
                tipo === 'receita' && { color: '#FFFFFF' }
              ]}
            >
              Receita
            </Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Categoria</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: Alimentação, salário, transporte"
          placeholderTextColor={cores.secundario}
          value={categoria}
          onChangeText={setCategoria}
        />

        <Text style={styles.label}>Valor (R$)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: 150,00"
          placeholderTextColor={cores.secundario}
          value={valor}
          onChangeText={setValor}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Data</Text>
        <TextInput
          style={styles.input}
          placeholder="AAAA-MM-DD"
          placeholderTextColor={cores.secundario}
          value={data}
          onChangeText={setData}
        />

        <Pressable
          style={[
            styles.botaoSalvar,
            carregando && { opacity: 0.6 }
          ]}
          onPress={salvarMovimentacao}
          disabled={carregando}
        >
          <Text style={styles.textoSalvar}>
            {carregando
              ? 'Salvando...'
              : item
                ? 'Salvar alterações'
                : 'Adicionar movimentação'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.botaoCancelar}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.textoCancelar}>Cancelar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}