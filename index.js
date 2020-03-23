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
    if (req.body.nomeP.length >= 2) {
        var nomeProd = req.body.nomeP
        if (req.body.valorP != "") {
            var fValor = parseFloat(req.body.valorP)
            if (fValor > 0) {
                var valorProd = req.body.valorP
                connection.query(`insert into produto(nome, valor) values('${nomeProd}', '${valorProd}')`, function (error, results, fields) {
                    res.send({ res: "Produto Inserido!" })
                    console.log('executou /postProd');
                });
            } else {
                res.send({ res: "Valor inválido" })
            }
        } else {
            res.send({ res: "Valor inválido" })
        }
    } else {
        res.send({ res: "Nome inválido" })
    }
});

app.patch('/updateProduto', function (req, res) {
    if (req.body.nomeA.length >= 2) {
        var nomeProd = req.body.nomeA
        if (req.body.valorA != "") {
            var fValor = parseFloat(req.body.valorA)
            if (fValor > 0) {
                var valorProd = req.body.valorA
                connection.query(`update produto set nome = ${nomeProd}, valor=${valorProd} where idproduto = ${idA}`, function (error, results, fields) {
                    res.send({ res: "Produto Atualizado!" })
                    console.log('executou /postProd');
                });
            } else {
                res.send({ res: "Valor inválido" })
            }
        } else {
            res.send({ res: "Valor inválido" })
        }
    } else {
        res.send({ res: "Nome inválido" })
    }
});

app.delete('/delProd/:id', function (req, res) {
    console.log(req.params)
    var aidi = req.params.id
    connection.query(`delete from produto where idproduto = ${aidi}`, function (error, results, fields) {
        if (error)
            return res.send(error);
        res.json({
            id: results.insertId
        });
        console.log('executou /delProd');
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

app.get('/getProduto/:id', function (req, res) {
    connection.query('select * from produto where idproduto = ?', [req.params.id],
        function (error, results, fields) {
            if (error)
                res.json;
            else {
                res.json(results[0]);
                console.log('executou /getProduto')
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

app.get('/getgraficop', function (req, res) {
    connection.query('select (select nome from produto where idproduto = produto_id)as nomeP, (quantidade * 100)/(select sum(quantidade)from item_venda)as porc from item_venda group by produto_id order by porc desc;',
        function (error, results, fields) {
            if (error)
                res.json;
            else {

                res.json(results);
                console.log('executou /getListaV')
            }

        })
});

app.use('/adiciona', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/cadastro.html'));

})

app.use('/edtProduto', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/edtProduto.html'));

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

app.use('/graficoP', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/graficoProduto.html'));

})

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));

})

app.listen(80, function () {
    console.log('Server escutou\n')
});