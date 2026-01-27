const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

// conexão com retry simples (necessário em docker)
async function connectDB() {
    return mysql.createConnection({
        host: 'db',
        user: 'root',
        password: 'root',
        database: 'fullcycle'
    });
}

app.get('/', async (req, res) => {
    let connection;


    try {
        connection = await connectDB();

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS people (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(255) NOT NULL
            )
        `);

        const name = "joao-" + Math.floor(Math.random() * 1000 );
        await connection.execute(
            'INSERT INTO people(name) VALUES (?)',
            [name]
        );

        const [rows] = await connection.execute(
            'SELECT name FROM people'
        );

        let html = '<h1>Full Cycle Rocks!</h1>';
        rows.forEach(row => {
            html += `<p>${row.name}</p>`;
        });

        res.send(html);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao conectar no banco');
    } finally {
        if (connection) await connection.end();
    }
});

app.listen(port, () => {
    console.log(`Node rodando na porta ${port}`);
});
