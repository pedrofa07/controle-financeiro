
const express = require('express');
const banco = require('../banco');
const autenticar = require('../intermediarios/autenticar');

const router = express.Router();

router.use(autenticar);

router.get('/', async (req, res) => {
  try {
    const [dados] = await banco.execute(
      `SELECT
        o.id,
        o.categoria,
        o.limite_valor,
        o.mes,
        o.ano,
        COALESCE(SUM(m.valor), 0) AS gasto_total
      FROM orcamentos o
      LEFT JOIN movimentacoes m
        ON m.usuario_id = o.usuario_id
        AND m.categoria = o.categoria
        AND m.tipo = 'despesa'
        AND MONTH(m.data_movimentacao) = o.mes
        AND YEAR(m.data_movimentacao) = o.ano
      WHERE o.usuario_id = ?
      GROUP BY
        o.id, o.categoria, o.limite_valor, o.mes, o.ano
      ORDER BY o.ano DESC, o.mes DESC, o.categoria ASC`,
      [req.usuario.id]
    );

    return res.json(dados);
  } catch (erro) {
    console.error('Erro ao consultar orçamentos:', erro.message);
    return res.status(500).json({
      erro: 'Erro ao consultar orçamentos.'
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { categoria, limite_valor, mes, ano } = req.body;
    const limite = Number(limite_valor);

    if (
      !categoria?.trim() ||
      !Number.isFinite(limite) ||
      limite <= 0 ||
      !Number.isInteger(mes) ||
      mes < 1 ||
      mes > 12 ||
      !Number.isInteger(ano) ||
      ano < 2000 ||
      ano > 9999
    ) {
      return res.status(400).json({
        erro: 'Confira a categoria, o limite, o mês e o ano.'
      });
    }

    await banco.execute(
      `INSERT INTO orcamentos
        (usuario_id, categoria, limite_valor, mes, ano)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE limite_valor = VALUES(limite_valor)`,
      [req.usuario.id, categoria.trim(), limite, mes, ano]
    );

    return res.status(201).json({
      mensagem: 'Orçamento salvo!'
    });
  } catch (erro) {
    console.error('Erro ao salvar orçamento:', erro.message);
    return res.status(500).json({
      erro: 'Erro ao salvar orçamento.'
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const limite = Number(req.body.limite_valor);
    const categoria = req.body.categoria;

    if (
      !categoria?.trim() ||
      !Number.isFinite(limite) ||
      limite <= 0
    ) {
      return res.status(400).json({
        erro: 'Informe uma categoria e um limite válido.'
      });
    }

    const [resultado] = await banco.execute(
      `UPDATE orcamentos
       SET categoria = ?, limite_valor = ?
       WHERE id = ? AND usuario_id = ?`,
      [categoria.trim(), limite, req.params.id, req.usuario.id]
    );

    if (!resultado.affectedRows) {
      return res.status(404).json({
        erro: 'Orçamento não encontrado.'
      });
    }

    return res.json({
      mensagem: 'Orçamento atualizado!'
    });
  } catch (erro) {
    return res.status(500).json({
      erro: 'Erro ao editar orçamento.'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [resultado] = await banco.execute(
      'DELETE FROM orcamentos WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.usuario.id]
    );

    if (!resultado.affectedRows) {
      return res.status(404).json({
        erro: 'Orçamento não encontrado.'
      });
    }

    return res.json({
      mensagem: 'Orçamento excluído!'
    });
  } catch (erro) {
    return res.status(500).json({
      erro: 'Erro ao excluir orçamento.'
    });
  }
});

module.exports = router;
