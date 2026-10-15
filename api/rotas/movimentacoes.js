
const express = require('express');
const banco = require('../banco');
const autenticar = require('../intermediarios/autenticar');

const router = express.Router();

router.use(autenticar);

// CONSULTAR
router.get('/', async (req, res) => {
  try {
    const [dados] = await banco.execute(
      `SELECT id, nome, tipo, categoria, valor,
       DATE_FORMAT(data_movimentacao, '%Y-%m-%d') AS data
       FROM movimentacoes
       WHERE usuario_id = ?
       ORDER BY data_movimentacao DESC, id DESC`,
      [req.usuario.id]
    );

    res.json(dados);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao consultar movimentações.' });
  }
});

// CADASTRAR
router.post('/', async (req, res) => {
  try {
    const { nome, tipo, categoria, valor, data } = req.body;
    const numero = Number(valor);

    if (
      !nome?.trim() ||
      !categoria?.trim() ||
      !['receita', 'despesa'].includes(tipo) ||
      !Number.isFinite(numero) ||
      numero <= 0 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data || '')
    ) {
      return res.status(400).json({ erro: 'Confira os dados informados.' });
    }

    const [resultado] = await banco.execute(
      `INSERT INTO movimentacoes
       (usuario_id, nome, tipo, categoria, valor, data_movimentacao)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.usuario.id,
        nome.trim(),
        tipo,
        categoria.trim(),
        numero,
        data
      ]
    );

    res.status(201).json({
      mensagem: 'Movimentação cadastrada!',
      id: resultado.insertId
    });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao cadastrar movimentação.' });
  }
});

// EDITAR
router.put('/:id', async (req, res) => {
  try {
    const { nome, tipo, categoria, valor, data } = req.body;
    const numero = Number(valor);

    if (
      !nome?.trim() ||
      !categoria?.trim() ||
      !['receita', 'despesa'].includes(tipo) ||
      !Number.isFinite(numero) ||
      numero <= 0 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data || '')
    ) {
      return res.status(400).json({ erro: 'Dados inválidos.' });
    }

    const [resultado] = await banco.execute(
      `UPDATE movimentacoes
       SET nome = ?, tipo = ?, categoria = ?, valor = ?,
           data_movimentacao = ?
       WHERE id = ? AND usuario_id = ?`,
      [
        nome.trim(),
        tipo,
        categoria.trim(),
        numero,
        data,
        req.params.id,
        req.usuario.id
      ]
    );

    if (!resultado.affectedRows) {
      return res.status(404).json({ erro: 'Movimentação não encontrada.' });
    }

    res.json({ mensagem: 'Movimentação atualizada!' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao editar movimentação.' });
  }
});

// EXCLUIR
router.delete('/:id', async (req, res) => {
  try {
    const [resultado] = await banco.execute(
      'DELETE FROM movimentacoes WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.usuario.id]
    );

    if (!resultado.affectedRows) {
      return res.status(404).json({ erro: 'Movimentação não encontrada.' });
    }

    res.json({ mensagem: 'Movimentação excluída!' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao excluir movimentação.' });
  }
});

module.exports = router;