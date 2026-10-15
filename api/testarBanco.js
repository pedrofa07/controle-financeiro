
const banco = require('./banco');

async function testar() {
  try {
    const conexao = await banco.getConnection();

    console.log('Conexão com MySQL realizada com sucesso!');

    const [tabelas] = await conexao.query('SHOW TABLES');

    console.log('Tabelas encontradas:');
    console.table(tabelas);

    conexao.release();
  } catch (erro) {
    console.error('Erro ao conectar:', erro.message);
  } finally {
    await banco.end();
  }
}

testar();