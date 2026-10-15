
import React, { useCallback, useState } from 'react';
import {
  View, Text, TextInput, Pressable, FlatList,
  StyleSheet, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../servicos/api';

function moeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

export default function Orcamentos() {
  const [categoria, setCategoria] = useState('');
  const [limite, setLimite] = useState('');
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const resposta = await api.get('/orcamentos');
      setDados(Array.isArray(resposta.data) ? resposta.data : []);
    } catch (erro) {
      setMensagem(erro.response?.data?.erro || 'Não foi possível carregar os orçamentos.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    carregar();
  }, [carregar]));

  async function salvar() {
    const valor = Number(limite.replace(',', '.'));
    const agora = new Date();

    if (!categoria.trim() || !Number.isFinite(valor) || valor <= 0) {
      setMensagem('Informe a categoria e um limite maior que zero.');
      return;
    }

    try {
      await api.post('/orcamentos', {
        categoria: categoria.trim(),
        limite_valor: valor,
        mes: agora.getMonth() + 1,
        ano: agora.getFullYear()
      });

      setCategoria('');
      setLimite('');
      setMensagem('Orçamento salvo com sucesso!');
      await carregar();
    } catch (erro) {
      setMensagem(
        erro.response?.data?.erro ||
        'Não foi possível salvar. Talvez já exista um orçamento para essa categoria neste mês.'
      );
    }
  }

  async function excluir(id) {
    try {
      await api.delete(`/orcamentos/${id}`);
      setDados(atual => atual.filter(item => String(item.id) !== String(id)));
      setMensagem('Orçamento excluído.');
    } catch (erro) {
      setMensagem(erro.response?.data?.erro || 'Não foi possível excluir o orçamento.');
    }
  }

  function renderizar({ item }) {
    const gasto = Number(item.gasto_total || 0);
    const teto = Number(item.limite_valor || 0);
    const porcentagem = teto > 0 ? Math.min(gasto / teto, 1) * 100 : 0;
    const ultrapassou = gasto > teto;

    return (
      <View style={estilos.cartao}>
        <View style={estilos.cabecalhoCartao}>
          <View style={estilos.iconeCategoria}>
            <Text style={estilos.iconeTexto}>◈</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={estilos.nome}>{item.categoria}</Text>
            <Text style={estilos.info}>Período: {item.mes}/{item.ano}</Text>
          </View>
          <Pressable style={estilos.botaoExcluir} onPress={() => excluir(item.id)}>
            <Text style={estilos.textoExcluir}>Excluir</Text>
          </Pressable>
        </View>

        <View style={estilos.valores}>
          <View>
            <Text style={estilos.rotulo}>LIMITE MENSAL</Text>
            <Text style={estilos.limite}>{moeda(teto)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={estilos.rotulo}>UTILIZADO</Text>
            <Text style={ultrapassou ? estilos.alerta : estilos.utilizado}>
              {moeda(gasto)}
            </Text>
          </View>
        </View>

        <View style={estilos.trilho}>
          <View style={[
            estilos.progresso,
            {
              width: `${porcentagem}%`,
              backgroundColor: ultrapassou ? '#FF7894' : '#35F2B5'
            }
          ]} />
        </View>

        <View style={estilos.rodape}>
          <Text style={estilos.info}>{Math.round(teto > 0 ? gasto / teto * 100 : 0)}% do limite</Text>
          <Text style={ultrapassou ? estilos.alerta : estilos.info}>
            {ultrapassou ? `Excedeu ${moeda(gasto - teto)}` : `Restam ${moeda(teto - gasto)}`}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      style={estilos.tela}
      contentContainerStyle={estilos.conteudo}
      data={dados}
      keyExtractor={item => String(item.id)}
      renderItem={renderizar}
      onRefresh={carregar}
      refreshing={carregando}
      refreshControl={
        <RefreshControl refreshing={carregando} onRefresh={carregar} tintColor="#35F2B5" />
      }
      ListHeaderComponent={
        <View>
          <Text style={estilos.etiqueta}>CONTROLE DE GASTOS</Text>
          <Text style={estilos.titulo}>Orçamentos</Text>
          <Text style={estilos.subtitulo}>Defina limites e mantenha seus gastos sob controle.</Text>

          <View style={estilos.formulario}>
            <Text style={estilos.tituloFormulario}>＋  Novo orçamento</Text>

            <Text style={estilos.rotulo}>CATEGORIA</Text>
            <TextInput
              style={estilos.input}
              placeholder="Ex.: Alimentação"
              placeholderTextColor="#71839A"
              value={categoria}
              onChangeText={setCategoria}
            />

            <Text style={estilos.rotulo}>LIMITE PARA ESTE MÊS</Text>
            <TextInput
              style={estilos.input}
              placeholder="Ex.: 600,00"
              placeholderTextColor="#71839A"
              value={limite}
              onChangeText={setLimite}
              keyboardType="decimal-pad"
            />

            {!!mensagem && <Text style={estilos.mensagem}>{mensagem}</Text>}

            <Pressable style={estilos.botaoCriar} onPress={salvar}>
              <Text style={estilos.textoBotao}>Salvar orçamento  →</Text>
            </Pressable>
          </View>

          <Text style={estilos.secao}>Seus limites mensais</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={estilos.vazio}>
          <Text style={estilos.vazioIcone}>◌</Text>
          <Text style={estilos.nome}>Nenhum orçamento cadastrado</Text>
          <Text style={estilos.info}>Crie um limite para acompanhar seus gastos por categoria.</Text>
        </View>
      }
    />
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#07111F' },
  conteudo: { padding: 18, paddingTop: 25, paddingBottom: 40 },
  etiqueta: { color: '#35F2B5', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  titulo: { color: '#F0F7FF', fontSize: 29, fontWeight: 'bold', marginTop: 8 },
  subtitulo: { color: '#91A5B9', marginTop: 5, marginBottom: 22, lineHeight: 20 },
  formulario: { backgroundColor: '#0D1B2A', borderWidth: 1, borderColor: '#203448', borderRadius: 20, padding: 18, marginBottom: 24 },
  tituloFormulario: { color: '#E8FFF8', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  rotulo: { color: '#91A5B9', fontSize: 10, fontWeight: 'bold', letterSpacing: 1.1, marginBottom: 7, marginTop: 7 },
  input: { backgroundColor: '#081522', borderColor: '#263C50', borderWidth: 1, color: '#F0F7FF', borderRadius: 12, padding: 13, marginBottom: 8 },
  mensagem: { color: '#63F2C2', marginTop: 7, lineHeight: 19 },
  botaoCriar: { backgroundColor: '#35F2B5', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 12 },
  textoBotao: { color: '#07111F', fontWeight: '900' },
  secao: { color: '#F0F7FF', fontSize: 20, fontWeight: 'bold', marginBottom: 13 },
  cartao: { backgroundColor: '#0D1B2A', borderWidth: 1, borderColor: '#203448', borderRadius: 18, padding: 16, marginBottom: 13 },
  cabecalhoCartao: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconeCategoria: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#103D34', alignItems: 'center', justifyContent: 'center' },
  iconeTexto: { color: '#35F2B5', fontSize: 24 },
  nome: { color: '#F0F7FF', fontWeight: 'bold', fontSize: 16 },
  info: { color: '#91A5B9', fontSize: 12, marginTop: 5 },
  botaoExcluir: { padding: 8, backgroundColor: '#321D2A', borderRadius: 9 },
  textoExcluir: { color: '#FF8BA2', fontSize: 11, fontWeight: 'bold' },
  valores: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 12 },
  limite: { color: '#F0F7FF', fontSize: 17, fontWeight: 'bold', marginTop: 5 },
  utilizado: { color: '#35F2B5', fontSize: 15, fontWeight: 'bold', marginTop: 5 },
  alerta: { color: '#FF7894', fontSize: 13, fontWeight: 'bold', marginTop: 5 },
  trilho: { height: 8, backgroundColor: '#243345', borderRadius: 10, overflow: 'hidden' },
  progresso: { height: 8, borderRadius: 10 },
  rodape: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 8 },
  vazio: { alignItems: 'center', padding: 25, backgroundColor: '#0D1B2A', borderRadius: 18 },
  vazioIcone: { color: '#35F2B5', fontSize: 38, marginBottom: 10 }
});
