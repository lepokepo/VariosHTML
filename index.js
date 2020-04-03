const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment');
const app = express();
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'remotemysql.com',
    port: 3306,
    user: '0AmEoIgtbe',
    password: '3j2zGKl22L',
    database: '0AmEoIgtbe',
})

connection.connect(function (err) {
    if (err) {
        console.error('Erro conectando banco: ', err)
        return;
    }

    console.log('Banco conectado')
})
moment.locale('pt-BR');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
const path = require('path');


//Rotas

app.post('/postitem', function (req, res) {
    let lista = req.body;
    let venda_id;
    connection.query(`insert into venda(dt_time) values(current_time)`, function (error, results, fields) {
        if (error) {
            console.log("Erro 1: ", error);
        } else {
            console.log('Passou 1');
            console.log(results.insertId);

            lista.forEach(i => {
                i.vendaId = results.insertId
                connection.query(`select valor from produto where idproduto = ${i.produto_id}`, function (error, results, fields) {
                    if (error) {
                        console.log("Erro 2: ", error);
                    } else {
                        let valo = results[0].valor * i.quantidade
                        i.valor_total = valo
                        console.log(i);
                        connection.query(`insert into item_venda(produto_id, venda_id, quantidade, item_valor) values(?, ?, ?, ?)`, [i.produto_id, i.vendaId, i.quantidade, i.valor_total], function (error, results, fields) {
                            if (error) {
                                console.log("deu pau rapaz", error);
                            } else {
                                console.log("certito");

                            }
                        })
                    }
                });
            });
        }
    })
});


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

app.post('/updateProduto', function (req, res) {
    console.log(req.body);

    if (req.body.nomeA.length >= 2) {
        var nomeProd = req.body.nomeA
        if (req.body.valorA != "") {
            var fValor = parseFloat(req.body.valorA)
            if (fValor > 0) {
                var valorProd = req.body.valorA
                connection.query(`update produto set nome=?, valor=? where idproduto=?`, [nomeProd, valorProd, req.body.idA], function (error, results, fields) {
                    if (error) {
                        console.log(error);

                        return res.send(error);
                    }
                    res.send({ res: "Produto Atualizado!" })
                    console.log('executou /updateProduto');
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

app.get('/getvendadata/:datad/:dataa', function (req, res) {
    console.log(req.params.datad);
    console.log(req.params.dataa);

    if (req.params.datad && req.params.dataa != null) {
        connection.query(`select venda.idvenda, venda.dt_time, sum(itemv.item_valor) as valorTotal, sum(itemv.quantidade) as quantidade from venda venda join item_venda itemv on(itemv.venda_id = venda.idvenda) where venda.dt_time between ? and ? group by venda.idvenda order by venda.dt_time desc`, [req.params.datad, req.params.dataa],
            function (error, results, fields) {
                if (error)
                    res.json;
                else {
                    results.forEach(element => {
                        element["dt_time"] = moment(element["dt_time"]).format('LLL')
                    });
                    res.json(results);
                }

            })
    }
});

app.get('/getListaV', function (req, res) {
    connection.query('select venda.idvenda, venda.dt_time, sum(itemv.item_valor) as valorTotal, sum(itemv.quantidade) as quantidade from venda venda join item_venda itemv on(itemv.venda_id = venda.idvenda)where extract(month from venda.dt_time) >= extract(month from current_date) group by venda.idvenda order by venda.dt_time desc',
        function (error, results, fields) {
            if (error)
                res.json;
            else {
                results.forEach(element => {
                    element["dt_time"] = moment(element["dt_time"]).format('LLL')
                });
                res.json(results);
                console.log('executou /getListaV')
            }

        })
});

app.get('/getgraficov', function (req, res) {
    connection.query(`
    select extract(month from v.dt_time)as mes, round(sum(item_valor))as valorTotal from item_venda 
    join venda as v on (idvenda = venda_id)
    where extract(year from v.dt_time) = extract(year from current_date)
    group by mes`,
        function (error, results, fields) {
            if (error)
                res.json;
            else {
                console.log(results);
                results.forEach(element => {
                    element["mes"] = moment(element["mes"], "MM").format('MMMM')
                });
                res.json(results);
                console.log('executou /getgraficov')
            }

        })
});

app.get('/getgraficop', function (req, res) {
    connection.query('select (select nome from produto where produto_id = idproduto)as nomeP, round((sum(quantidade)*100)/(select sum(quantidade)from item_venda))as porc, sum(item_valor)as valorItem, round((select sum(item_valor) from item_venda))as valorTotal  from item_venda group by produto_id order by porc desc ',
        function (error, results, fields) {
            if (error)
                res.json;
            else {

                res.json(results);
                console.log('executou /getgraficop')
            }

        })
});

app.post('/validacao', function (req, res) {
    if (req.body.nome != "" && req.body.nome != null && req.body.senha != "" && req.body.senha != null) {
        connection.query(`select * from usuario where nome=? and senha=?`, [req.body.nome, req.body.senha],
            function (error, results, fields) {
                if (results.length != 0) {
                    console.log(results);
                    res.send({ "mensagem": "" })
                } else {
                    res.send({ "mensagem": "Nome ou Senha inválidos" })
                    console.log('executou /validacao')
                }
            })
    }
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
app.use('/graficoVenda', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/graficoVenda.html'));

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

app.get('/menu', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'menu.html'));

})

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));

})

// app.listen(process.env.PORT || 3000, function () {
//     console.log('Server escutou\n')
// });

app.listen(process.env.PORT || 3000, function () {
    console.log('Porta: ' + (process.env.PORT || 3000));
});