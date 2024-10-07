const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
    user: 'postgres', // Substitua pelo seu usuário do PostgreSQL
    host: 'localhost',
    database: 'controle_frota', // Nome da sua database
    password: 'postgre', // Substitua pela sua senha
    port: 5432, // Porta padrão do PostgreSQL
});

// Habilitar CORS para todas as rotas
app.use(cors());
app.use(express.json());

// Rota para buscar todos os carros
app.get('/carros', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM carros');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro ao buscar carros' });
    }
});

// Rota para buscar um carro por ID
app.get('/carros/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM carros WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Carro não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro ao buscar carro' });
    }
});

// Rota para adicionar um carro
app.post('/carros', async (req, res) => {
    const { modelo, cor, km, placa, situacao } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO carros (modelo, cor, km, placa, situacao) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [modelo, cor, km, placa, situacao]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro ao adicionar carro' });
    }
});

// Rota para atualizar um carro
app.put('/carros/:id', async (req, res) => {
    const { id } = req.params;
    const { modelo, cor, km, placa, situacao } = req.body;
    try {
        const result = await pool.query(
            'UPDATE carros SET modelo = $1, cor = $2, km = $3, placa = $4, situacao = $5 WHERE id = $6 RETURNING *',
            [modelo, cor, km, placa, situacao, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Carro não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro ao atualizar carro' });
    }
});

// Rota para deletar um carro
app.delete('/carros/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM carros WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Carro não encontrado' });
        }
        res.json({ message: 'Carro deletado com sucesso' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro ao deletar carro' });
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});