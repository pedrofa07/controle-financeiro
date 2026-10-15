
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const banco = require('./banco');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    mensagem: 'API Controle Financeiro funcionando!'
  });
});

app.get('/api/teste-banco', async (req, res) => {
  try {
    const [resultado] = await banco.query('SELECT 1 AS conectado');

    res.json({
      mensagem: 'API conectada ao MySQL!',
      banco: resultado[0].conectado === 1
    });
  } catch (erro) {
    console.error('Erro ao testar o MySQL:', erro.message);

    res.status(500).json({
      mensagem: 'Erro ao consultar o banco de dados.'
    });
  }
});

app.use('/usuarios', require('./rotas/usuarios'));
app.use('/movimentacoes', require('./rotas/movimentacoes'));
app.use('/renda', require('./rotas/renda'));
app.use('/orcamentos', require('./rotas/orcamentos'));
app.use('/metas', require('./rotas/metas'));

app.use((req, res) => {
  res.status(404).json({
    erro: `Rota não encontrada: ${req.method} ${req.originalUrl}`
  });
});

const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
});
