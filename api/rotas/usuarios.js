
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const banco = require('../banco');
const autenticar = require('../intermediarios/autenticar');

const router = express.Router();

function criarToken(usuario) {
  return jwt.sign(
    { id: usuario.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

router.post('/cadastro', async (req, res) => {
  const conexao = await banco.getConnection();

  try {
    const { nome, email, senha } = req.body;

    if (!nome?.trim() || !email?.trim() || !senha || senha.length < 8) {
      return res.status(400).json({
        erro: 'Informe nome, e-mail e senha com pelo menos 8 caracteres.'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        erro: 'Informe um e-mail válido.'
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const [existente] = await conexao.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [emailNormalizado]
    );

    if (existente.length > 0) {
      return res.status(409).json({
        erro: 'Este e-mail já está cadastrado.'
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await conexao.beginTransaction();

    const [resultado] = await conexao.execute(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome.trim(), emailNormalizado, senhaHash]
    );

    const usuario = {
      id: resultado.insertId,
      nome: nome.trim(),
      email: emailNormalizado,
      tema: 'claro'
    };

    await conexao.execute(
      'INSERT INTO rendas (usuario_id, valor) VALUES (?, 0)',
      [usuario.id]
    );

    await conexao.commit();

    const token = criarToken(usuario);

    return res.status(201).json({
      mensagem: 'Conta criada com sucesso!',
      token,
      usuario
    });
  } catch (erro) {
    await conexao.rollback();

    console.error('Erro no cadastro:', erro.message);

    return res.status(500).json({
      erro: 'Não foi possível criar a conta.'
    });
  } finally {
    conexao.release();
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const [usuarios] = await banco.execute(
      'SELECT id, nome, email, senha, tema FROM usuarios WHERE email = ?',
      [(email || '').trim().toLowerCase()]
    );

    if (
      !usuarios.length ||
      !(await bcrypt.compare(senha || '', usuarios[0].senha))
    ) {
      return res.status(401).json({
        erro: 'E-mail ou senha incorretos.'
      });
    }

    const usuario = usuarios[0];
    const token = criarToken(usuario);

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tema: usuario.tema
      }
    });
  } catch (erro) {
    console.error('Erro no login:', erro.message);

    return res.status(500).json({
      erro: 'Erro ao realizar login.'
    });
  }
});

router.get('/eu', autenticar, async (req, res) => {
  try {
    const [dados] = await banco.execute(
      'SELECT id, nome, email, tema FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );

    if (!dados.length) {
      return res.status(404).json({
        erro: 'Usuário não encontrado.'
      });
    }

    return res.json(dados[0]);
  } catch (erro) {
    return res.status(500).json({
      erro: 'Não foi possível carregar o usuário.'
    });
  }
});

router.put('/tema', autenticar, async (req, res) => {
  try {
    const { tema } = req.body;

    if (!['claro', 'escuro'].includes(tema)) {
      return res.status(400).json({
        erro: 'Tema inválido.'
      });
    }

    await banco.execute(
      'UPDATE usuarios SET tema = ? WHERE id = ?',
      [tema, req.usuario.id]
    );

    return res.json({
      mensagem: 'Tema atualizado!',
      tema
    });
  } catch (erro) {
    return res.status(500).json({
      erro: 'Não foi possível atualizar o tema.'
    });
  }
});

router.delete('/conta', autenticar, async (req, res) => {
  try {
    const [resultado] = await banco.execute(
      'DELETE FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );

    if (!resultado.affectedRows) {
      return res.status(404).json({
        erro: 'Usuário não encontrado.'
      });
    }

    return res.json({
      mensagem: 'Conta excluída com sucesso.'
    });
  } catch (erro) {
    return res.status(500).json({
      erro: 'Não foi possível excluir a conta.'
    });
  }
});

module.exports = router;
