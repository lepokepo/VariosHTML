const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment');
const dayjs = require('dayjs')
const app = express();
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'eventodb',
})

connection.connect(function (err) {
    if (err) {
        console.error('erro conectando banco: ' + err.stack())
        return;
    }

    console.log('Banco conectado')
})
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



//Rotas
app.get('/eventos', function (req, res) {
    connection.query('select * from evento where extract(month from date_hora)= extract(month from current_date)',
        function (error, results, fields) {
            if (error)
                res.json;
            else {
                results.forEach(element => {
                    var data = element['date_hora']
                    element['date_hora'] = moment(data).format('L, hh:mm:ss')
                    console.log(element['date_hora'])


                });
                res.json(results);
                console.log('executou /eventos')
            }

        })
});


app.post('/add_evento', function (req, res) {
    console.log(req.body)


    var nomeEvento = req.body.namee
    var dataEvento = moment(req.body.dt_hr, 'DDMMYYYY HHmm').format()
    connection.query(`insert into evento(nome, date_hora) values('${nomeEvento}', '${dataEvento}')`, function (error, results, fields) {
        if (error)
            return res.send(error);

        res.json({
            id: results.insertId
        });
        console.log('executou /add_evento');
    });
});

app.listen(80, function () {
    console.log('Server escutou\n')
});