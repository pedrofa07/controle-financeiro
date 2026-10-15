CREATE DATABASE IF NOT EXISTS controle_financeiro
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE controle_financeiro;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tema ENUM('claro', 'escuro') NOT NULL DEFAULT 'claro',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rendas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    valor DECIMAL(12,2) NOT NULL DEFAULT 0,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE movimentacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nome VARCHAR(120) NOT NULL,
    tipo ENUM('receita', 'despesa') NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    data_movimentacao DATE NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE orcamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    limite_valor DECIMAL(12,2) NOT NULL,
    mes TINYINT NOT NULL,
    ano SMALLINT NOT NULL,
    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY orcamento_unico
        (usuario_id, categoria, mes, ano)
);

CREATE TABLE metas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nome VARCHAR(120) NOT NULL,
    valor_objetivo DECIMAL(12,2) NOT NULL,
    valor_guardado DECIMAL(12,2) NOT NULL DEFAULT 0,
    data_limite DATE NULL,
    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE
);