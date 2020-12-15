require("./config/config");//al ser este el primer archivo cuando empieze 
// a ejecutar nuestra aplicacion va a leer ese archivo, al ejecutarlo va
//a configurar todo lo que el contenga

const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); //paquete que ya trae node por defecto


const app = express();

const bodyParser = require('body-parser');

// parse application/ //procesar peticiones x-www-form-urlencoded
//cuando veamnos un app.use son midlewares, son unas funciones que se van a disparar
//cada vez que pase por qui el codigo, cada peticion que nosotros hagamos 
//siempre pasa por estas lineas
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

//habilitar la capeta public para que todos lo puedan ver
//para que se pueda acceder desde cualquier lugar
//implementar el middleware para hacer publico todo ese directorio

//podemos mandar x cantidad de argumentos para crear ese path correcto
//lo que hacemos es mandar segmentos del path y este metodo lo va armar por nosotros
app.use(express.static(path.resolve(__dirname, '../public') ) );
//console.log(path.resolve(__dirname, '../public') );


//Configuración global de rutas
app.use(require('./routes/index'));




mongoose.connect(process.env.URLDB, {//estoy mandando estas configuraciones
            useNewUrlParser: true,
            useFindAndModify: false,
            useCreateIndex: true,
            useUnifiedTopology: true
        }, (err) => {
            if (err) {
                throw err;
 
            }
            console.log('Base de Datos online');
 
        });


app.listen(process.env.PORT, () => {
    console.log('escuchando puerto', process.env.PORT);
});








//https://github.com/Klerith/node-restserver-curso/releases/tag/v0.0.2

//https://github.com/Klerith/node-restserver-curso/releases/tag/v0.1.0

//https://github.com/Klerith/node-restserver-curso/releases/tag/v0.1.1

