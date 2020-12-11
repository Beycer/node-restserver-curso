const express = require('express');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');

const app = express();



app.post('/login', (req, res) => {

    let body = req.body;

    //Que email exista
    //Si existe un correo valido lo voy a obtener em usuarioDB
    //si no existe igual lo voy a obtener en usuarioDB pero como null o vació
    //el error es muy probable que aparescar si se disparo una excepción en la BD
    Usuario.findOne({email: body.email}, (err, usuarioDB) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            }); 
        };

        //si no exixte el email
        if(!usuarioDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }


        //Evaluar contraseña
        //tomar la ocntraseña e incriptarla y ver si hace match
        if( !bcrypt.compareSync(body.password, usuarioDB.password) ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, {expiresIn: process.env.CADICIDAD_TOKEN });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });


    });



});







module.exports = app;