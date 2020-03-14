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
app.post('/postProd', function (req, res) {
    console.log(req.body)
    var nomeProd = req.body.nomeP
    var valorProd = req.body.valorP
    connection.query(`insert into produto(nome, valor) values('${nomeProd}', '${valorProd}')`, function (error, results, fields) {
        if (error)
            return res.send(error);

        res.json({
            id: results.insertId
        });
        console.log('executou /postProd');
    });
});

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

app.get('/getListaV', function (req, res) {
    connection.query('select * from venda order by idvenda desc',
        function (error, results, fields) {
            if (error)
                res.json;
            else {
                results.forEach(element => {
                    element["dt_time"] = moment(element["dt_time"]).format('lll')
                });
                res.json(results);
                console.log('executou /getListaV')
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

app.use('/listaV', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/listaVenda.html'));

})

app.use('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));

})

app.listen(80, function () {
    console.log('Server escutou\n')
});