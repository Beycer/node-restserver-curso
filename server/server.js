require("./config/config");//al ser este el primer archivo cuando empieze 
// a ejecutar nuestra aplicacion va a leer ese archivo, al ejecutarlo va
//a configurar todo lo que el contenga

const express = require('express');
const app = express();

const bodyParser = require('body-parser');

// parse application/ //procesar peticiones x-www-form-urlencoded
//cuando veamnos un app.use son midlewares, son unas funciones que se van a disparar
//cada vez que pase por qui el codigo, cada peticion que nosotros hagamos 
//siempre pasa por estas lineas
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());



app.get('/usuario', function (req, res) {
  res.json  ('Get usuario');
});

app.post('/usuario', function (req, res) {

    let body = req.body;

    if(body.nombre === undefined){

        res.status(400).json({
            ok: false,
            mensaje: 'El nombre es necesario'
        });

    }else{
        res.json({
            paersona: body
        });
    }
    
    //res.json  ('Post usuario');
});

app.put('/usuario/:id', function (req, res) {
    //obtener ese parametro
    let id = req.params.id;

    res.json({
        id
    });

    //res.json  ('Put usuario');
});

app.delete('/usuario', function (req, res) {
    res.json  ('Delete usuario');
});

app.listen(process.env.PORT, () => {
    console.log('escuchando puerto', process.env.PORT);
});