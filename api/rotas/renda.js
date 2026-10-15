
const express = require('express');
const banco = require('../banco');
const autenticar = require('../intermediarios/autenticar');

const router = express.Router();

router.use(autenticar);

router.get('/', async (req, res) => {
  try {
    const [dados] = await banco.execute(
      'SELECT valor FROM rendas WHERE usuario_id = ?',
      [req.usuario.id]
    );

    res.json({ valor: Number(dados[0]?.valor || 0) });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao consultar renda.' });
  }
});

router.put('/', async (req, res) => {
  try {
    const valor = Number(req.body.valor);

    if (!Number.isFinite(valor) || valor < 0) {
      return res.status(400).json({ erro: 'Informe uma renda válida.' });
    }

    await banco.execute(
      `INSERT INTO rendas (usuario_id, valor)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
      [req.usuario.id, valor]
    );

    res.json({
      mensagem: 'Renda mensal atualizada!',
      valor
    });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao salvar renda.' });
  }
});

module.exports = router;