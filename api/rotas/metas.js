
const express = require('express');
const banco = require('../banco');
const autenticar = require('../intermediarios/autenticar');

const router = express.Router();

router.use(autenticar);

router.get('/', async (req, res) => {
  const [dados] = await banco.execute(
    `SELECT id, nome, valor_objetivo, valor_guardado, data_limite
     FROM metas WHERE usuario_id = ?
     ORDER BY id DESC`,
    [req.usuario.id]
  );

  res.json(dados);
});

router.post('/', async (req, res) => {
  try {
    const { nome, valor_objetivo, data_limite } = req.body;
    const objetivo = Number(valor_objetivo);

    if (!nome?.trim() || !Number.isFinite(objetivo) || objetivo <= 0) {
      return res.status(400).json({ erro: 'Dados inválidos.' });
    }

    await banco.execute(
      `INSERT INTO metas (usuario_id, nome, valor_objetivo, data_limite)
       VALUES (?, ?, ?, ?)`,
      [req.usuario.id, nome.trim(), objetivo, data_limite || null]
    );

    res.status(201).json({ mensagem: 'Meta cadastrada!' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao cadastrar meta.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { nome, valor_objetivo, valor_guardado, data_limite } = req.body;
    const objetivo = Number(valor_objetivo);
    const guardado = Number(valor_guardado);

    if (
      !nome?.trim() ||
      !Number.isFinite(objetivo) || objetivo <= 0 ||
      !Number.isFinite(guardado) || guardado < 0
    ) {
      return res.status(400).json({ erro: 'Dados inválidos.' });
    }

    const [resultado] = await banco.execute(
      `UPDATE metas SET nome = ?, valor_objetivo = ?,
       valor_guardado = ?, data_limite = ?
       WHERE id = ? AND usuario_id = ?`,
      [
        nome.trim(), objetivo, guardado, data_limite || null,
        req.params.id, req.usuario.id
      ]
    );

    if (!resultado.affectedRows) {
      return res.status(404).json({ erro: 'Meta não encontrada.' });
    }

    res.json({ mensagem: 'Meta atualizada!' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao editar meta.' });
  }
});

router.delete('/:id', async (req, res) => {
  const [resultado] = await banco.execute(
    'DELETE FROM metas WHERE id = ? AND usuario_id = ?',
    [req.params.id, req.usuario.id]
  );

  if (!resultado.affectedRows) {
    return res.status(404).json({ erro: 'Meta não encontrada.' });
  }

  res.json({ mensagem: 'Meta excluída!' });
});

module.exports = router;