import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../servicos/api';

function moeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

export default function Metas() {
  const [nome, setNome] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [dataLimite, setDataLimite] = useState('');
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [criando, setCriando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [excluirId, setExcluirId] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const resposta = await api.get('/metas');
      setDados(Array.isArray(resposta.data) ? resposta.data : []);
      setMensagem('');
    } catch (erro) {
      setMensagem(
        erro.response?.data?.erro || 'Não foi possível carregar as metas.'
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

  async function salvar() {
    if (criando) return;

    const valor = Number(objetivo.replace(',', '.'));

    if (!nome.trim() || !Number.isFinite(valor) || valor <= 0) {
      setMensagem('Informe o nome da meta e um valor maior que zero.');
      return;
    }

    if (dataLimite && !/^\d{4}-\d{2}-\d{2}$/.test(dataLimite)) {
      setMensagem('Use o formato de data AAAA-MM-DD.');
      return;
    }

    try {
      setCriando(true);
      setMensagem('');

      await api.post('/metas', {
        nome: nome.trim(),
        valor_objetivo: valor,
        data_limite: dataLimite || null
      });

      setNome('');
      setObjetivo('');
      setDataLimite('');
      setMensagem('Meta criada com sucesso!');
      await carregar();
    } catch (erro) {
      setMensagem(
        erro.response?.data?.erro || 'Não foi possível criar a meta.'
      );
    } finally {
      setCriando(false);
    }
  }

  async function confirmarExclusao() {
    if (excluirId === null) return;

    try {
      await api.delete(`/metas/${excluirId}`);
      setDados((atual) =>
        atual.filter((item) => String(item.id) !== String(excluirId))
      );
      setExcluirId(null);
      setMensagem('Meta excluída.');
    } catch (erro) {
      setMensagem(
        erro.response?.data?.erro || 'Não foi possível excluir a meta.'
      );
    }
  }

  function renderizar({ item }) {
    const alvo = Number(item.valor_objetivo || 0);
    const guardado = Number(item.valor_guardado || 0);
    const progresso = alvo > 0 ? Math.min(guardado / alvo, 1) * 100 : 0;
    const estaConfirmando = String(excluirId) === String(item.id);

    return (
      <View style={estilos.cartaoMeta}>
        <View style={estilos.cabecalhoCartao}>
          <View style={estilos.iconeMeta}>
            <Text style={estilos.iconeTexto}>✦</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={estilos.nomeMeta}>{item.nome}</Text>
            <Text style={estilos.info}>Objetivo financeiro</Text>
          </View>
          <Pressable
            onPress={() => {
              setMensagem('');
              setExcluirId(item.id);
            }}
            style={estilos.botaoExcluir}
          >
            <Text style={estilos.textoExcluir}>Excluir</Text>
          </Pressable>
        </View>

        <View style={estilos.valores}>
          <View>
            <Text style={estilos.rotuloPequeno}>VALOR GUARDADO</Text>
            <Text style={estilos.valorGuardado}>{moeda(guardado)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={estilos.rotuloPequeno}>META</Text>
            <Text style={estilos.valorAlvo}>{moeda(alvo)}</Text>
          </View>
        </View>

        <View style={estilos.trilho}>
          <View style={[estilos.progresso, { width: `${progresso}%` }]} />
        </View>
        <View style={estilos.rodapeProgresso}>
          <Text style={estilos.info}>{Math.round(progresso)}% concluído</Text>
          <Text style={estilos.info}>
            Faltam {moeda(Math.max(alvo - guardado, 0))}
          </Text>
        </View>

        {item.data_limite ? (
          <Text style={estilos.prazo}>
            ◷  Prazo: {String(item.data_limite).slice(0, 10)}
          </Text>
        ) : null}

        {estaConfirmando && (
          <View style={estilos.confirmacao}>
            <Text style={estilos.pergunta}>Excluir esta meta?</Text>
            <View style={estilos.acoesConfirmacao}>
              <Pressable
                style={estilos.cancelar}
                onPress={() => setExcluirId(null)}
              >
                <Text style={estilos.textoCancelar}>Cancelar</Text>
              </Pressable>
              <Pressable style={estilos.apagar} onPress={confirmarExclusao}>
                <Text style={estilos.textoApagar}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <FlatList
      style={estilos.tela}
      contentContainerStyle={estilos.conteudo}
      data={dados}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderizar}
      refreshControl={
        <RefreshControl
          refreshing={carregando}
          onRefresh={carregar}
          tintColor="#35F2B5"
        />
      }
      ListHeaderComponent={
        <View>
          <Text style={estilos.etiqueta}>PLANEJAMENTO INTELIGENTE</Text>
          <Text style={estilos.titulo}>Minhas metas</Text>
          <Text style={estilos.subtitulo}>
            Transforme planos em conquistas.
          </Text>

          <View style={estilos.formulario}>
            <Text style={estilos.tituloFormulario}>＋  Nova meta</Text>

            <Text style={estilos.rotulo}>NOME DO OBJETIVO</Text>
            <TextInput
              style={estilos.input}
              placeholder="Ex.: Comprar um computador"
              placeholderTextColor="#71839A"
              value={nome}
              onChangeText={setNome}
            />

            <Text style={estilos.rotulo}>QUANTO QUER JUNTAR?</Text>
            <TextInput
              style={estilos.input}
              placeholder="Ex.: 3500,00"
              placeholderTextColor="#71839A"
              value={objetivo}
              onChangeText={setObjetivo}
              keyboardType="decimal-pad"
            />

            <Text style={estilos.rotulo}>PRAZO (OPCIONAL)</Text>
            <TextInput
              style={estilos.input}
              placeholder="AAAA-MM-DD"
              placeholderTextColor="#71839A"
              value={dataLimite}
              onChangeText={setDataLimite}
              autoCapitalize="none"
            />

            {!!mensagem && (
              <Text style={estilos.mensagem}>{mensagem}</Text>
            )}

            <Pressable
              style={({ pressed }) => [
                estilos.botaoCriar,
                pressed && { opacity: 0.85 },
                criando && { opacity: 0.6 }
              ]}
              onPress={salvar}
              disabled={criando}
            >
              <Text style={estilos.textoBotao}>
                {criando ? 'Criando...' : 'Criar meta  →'}
              </Text>
            </Pressable>
          </View>

          <Text style={estilos.secao}>Seus objetivos</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={estilos.vazio}>
          <Text style={estilos.vazioIcone}>◎</Text>
          <Text style={estilos.nomeMeta}>Nenhuma meta por enquanto</Text>
          <Text style={estilos.info}>
            Crie uma meta acima para começar seu planejamento.
          </Text>
        </View>
      }
    />
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#07111F' },
  conteudo: { padding: 18, paddingTop: 25, paddingBottom: 40 },
  etiqueta: {
    color: '#35F2B5',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2
  },
  titulo: {
    color: '#F0F7FF',
    fontSize: 29,
    fontWeight: 'bold',
    marginTop: 8
  },
  subtitulo: { color: '#91A5B9', marginTop: 5, marginBottom: 22 },
  formulario: {
    backgroundColor: '#0D1B2A',
    borderWidth: 1,
    borderColor: '#203448',
    borderRadius: 20,
    padding: 18,
    marginBottom: 24
  },
  tituloFormulario: {
    color: '#E8FFF8',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16
  },
  rotulo: {
    color: '#91A5B9',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.1,
    marginBottom: 7,
    marginTop: 7
  },
  input: {
    backgroundColor: '#081522',
    borderColor: '#263C50',
    borderWidth: 1,
    color: '#F0F7FF',
    borderRadius: 12,
    padding: 13,
    marginBottom: 7
  },
  mensagem: { color: '#63F2C2', marginTop: 8, lineHeight: 19 },
  botaoCriar: {
    backgroundColor: '#35F2B5',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 12
  },
  textoBotao: { color: '#07111F', fontWeight: '900' },
  secao: {
    color: '#F0F7FF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 13
  },
  cartaoMeta: {
    backgroundColor: '#0D1B2A',
    borderWidth: 1,
    borderColor: '#203448',
    borderRadius: 18,
    padding: 16,
    marginBottom: 13
  },
  cabecalhoCartao: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconeMeta: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#103D34',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconeTexto: { color: '#35F2B5', fontSize: 24 },
  nomeMeta: { color: '#F0F7FF', fontWeight: 'bold', fontSize: 16 },
  info: { color: '#91A5B9', fontSize: 12, marginTop: 5 },
  botaoExcluir: {
    padding: 8,
    backgroundColor: '#321D2A',
    borderRadius: 9
  },
  textoExcluir: { color: '#FF8BA2', fontSize: 11, fontWeight: 'bold' },
  valores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 12
  },
  rotuloPequeno: {
    color: '#91A5B9',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1
  },
  valorGuardado: {
    color: '#35F2B5',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5
  },
  valorAlvo: {
    color: '#F0F7FF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5
  },
  trilho: {
    height: 8,
    backgroundColor: '#243345',
    borderRadius: 10,
    overflow: 'hidden'
  },
  progresso: {
    height: 8,
    backgroundColor: '#35F2B5',
    borderRadius: 10
  },
  rodapeProgresso: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  prazo: { color: '#9DB4C8', fontSize: 12, marginTop: 12 },
  confirmacao: {
    backgroundColor: '#251C2A',
    borderRadius: 12,
    padding: 13,
    marginTop: 15
  },
  pergunta: { color: '#FFE7EC', fontWeight: 'bold', marginBottom: 10 },
  acoesConfirmacao: { flexDirection: 'row', gap: 10 },
  cancelar: {
    flex: 1,
    backgroundColor: '#243345',
    padding: 11,
    borderRadius: 10,
    alignItems: 'center'
  },
  textoCancelar: { color: '#D8E4F0', fontWeight: 'bold' },
  apagar: {
    flex: 1,
    backgroundColor: '#F45D79',
    padding: 11,
    borderRadius: 10,
    alignItems: 'center'
  },
  textoApagar: { color: '#1C1020', fontWeight: 'bold' },
  vazio: {
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#0D1B2A',
    borderRadius: 18
  },
  vazioIcone: { color: '#35F2B5', fontSize: 38, marginBottom: 10 }
});