const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment');
const app = express();
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'clientesdb',
})

connection.connect(function (err) {
    if (err) {
        console.error('erro conectando banco: ', err)
        return;
    }

    console.log('Banco conectado')
})
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
const path = require('path');


//Rotas
app.get('/getListaP', function (req, res) {
    connection.query('select * from produto',
        function (error, results, fields) {
            if (error)
                res.json;
            else {
                res.json(results);
                console.log('executou /getListaP')
            }

        })
});

app.use('/adiciona', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/cadastro.html'));

})

app.use('/novaVenda', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/novaVenda.html'));

})
app.use('/listaP', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/listaProduto.html'));

})

app.use('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));

})

app.listen(80, function () {
    console.log('Server escutou\n')
});