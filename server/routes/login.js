const express = require('express');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario');
const usuario = require('../models/usuario');

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

//Configuraciones de Google

async function verify(token) {
    
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

  }


app.post('/google', async (req, res) => {

    let token = req.body.idtoken;

    //poner await para que se asigne automaticamente ya que verify es una promesa
    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });

    //ir a la BD hacer una serie validaciones y crear toda la información
    //verificar si yo no tengo un usuario que tenga ese correo

    Usuario.findOne({email: googleUser.email}, (err, usuarioDB) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            }); 
        };

        //Si existe el usuario de BD
        if(usuarioDB){
            //es un usuario que ya se autentico con credenciales normales, no por google
            if(usuarioDB.google === false){
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });
            }else{
                //Usuario autenticado por google
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {expiresIn: process.env.CADICIDAD_TOKEN });


                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                });

            }
        }
        else{//el usuario no existe, es la primera vez que usa sus credenciales 
            //validas de google para crear el usuario
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            //la gente no va poder autenticarse con la carita feliz por que eso
            //se va encriptar, es decir cuando se intente hacer un login normal
            //con la carita feliz y un correo va intentar pasar eso a un has de 
            //10 vueltas cosa que nunca va hacer macht, lo podemos dejar a si 
            //solo para pasar la validación de nuesta BD ya que el password 
            //es obligatorio
            usuario.password = ':)';

            //Grabacion en la BD
            usuario.save( (err, usuarioDB) => {

                if(err){
                    return res.status(500).json({
                        ok: false,
                        err
                    }); 
                };

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {expiresIn: process.env.CADICIDAD_TOKEN });


                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                });


            });

        }

    });


    /*res.json({
        usuario: googleUser
    });*/

});







module.exports = app;