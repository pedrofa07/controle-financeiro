
const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho || !cabecalho.startsWith('Bearer ')) {
    return res.status(401).json({
      erro: 'Faça login para continuar.'
    });
  }

  try {
    const token = cabecalho.split(' ')[1];

    req.usuario = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    next();
  } catch (erro) {
    return res.status(401).json({
      erro: 'Sessão inválida ou expirada.'
    });
  }
}

module.exports = autenticar;