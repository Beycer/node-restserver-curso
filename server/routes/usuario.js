const express = require('express');

const bcrypt = require('bcrypt');

const _ = require('underscore');

const Usuario = require('../models/usuario');
//esta es otra manera de importar, pero pudo ser como las otras importando toda
//la libreria, se puede usar cualquiera de las 2
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');


const app = express();

//mostrar registros que solo esten activos e igual el conteo solo activos
//con la condición {estado: true}

//los midelwares se colocan como segundo argumento en este tipo de servicios usando express
app.get('/usuario', verificaToken, (req, res) => {

    /*Solo para probar que trai la información y funcionaba el verificaToken
    return res.json({
        usuario: req.usuario,
        nombre: req.usuario.nombre,
        email: req.usuario.email
    });*/

    //los parametros opcionales caen dentro dentro de un objeto llamado en el resq .query
    //y ese query puedo suponer que vaa venir una variable llamada .desde
    //es probable que venga, es probable que no, entonces si viene esa variable quiero que
    //la use si no || entonces voy a suponer que quiere desde la pag 0, los primeros registros
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    //limite por pagian

    Usuario.find({estado: true}, 'nombre email role estado google img')
            .skip(desde)
            .limit(limite)
            .exec( (err, usuarios) => {

                if(err){
                    return res.status(400).json({
                        ok: false,
                        err
                    }); 
                }
                //el count debe recibir una condicion que debe ser excatamente la misma
                //que Usuario.find({})
                Usuario.count({estado: true}, (err, conteo) => {

                    res.json({
                        ok: true,
                        usuarios,
                        cuantos: conteo
                    });

                });
                
            });

    //res.json  ('Get usuario LOCAL');
  });
  
  app.post('/usuario',[verificaToken, verificaAdmin_Role], function (req, res) {
  
      let body = req.body;


      let usuario = new Usuario({
          nombre: body.nombre,
          email: body.email,
          password: bcrypt.hashSync(body.password, 10),
          role: body.role
      });

      //Grabar en la base de datos
      usuario.save( (err, usuarioDB) => {

        if(err){
            return res.status(400).json({
                ok: false,
                err
            }); 
        }

        //usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        });

      });

  /*
      if(body.nombre === undefined){
  
          res.status(400).json({
              ok: false,
              mensaje: 'El nombre es necesario'
          });
  
      }else{
          res.json({
              paersona: body
          });
      }*/
      
      //res.json  ('Post usuario');
  });
  
  app.put('/usuario/:id',[verificaToken, verificaAdmin_Role], function (req, res) {
      //obtener ese parametro
      let id = req.params.id;
      //recibe el objeto que tiene todas las propiedads => req.body
      //despues un arreglo con todas las propiedades validas que si quiero actualizar
      let body = _.pick( req.body, ['nombre', 'email', 'img', 'role', 'estado'] );


      //para saber como funciona mas visitar la doc de mongoose
      //new: true para regresar el nuevo actualizado y no el antes de ser actualizado
      //si es true entonces ejecuta todas las validaciones definidas en el squema
      Usuario.findByIdAndUpdate(id, body, {new: true, runValidators: true }, (err, usuarioDB) => {

        if(err){
            return res.status(400).json({
                ok: false,
                err
            }); 
        }

        //si todo lo hace bien, ademas esta función ya manda el status 200 por defecto
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    
      });
  
      //res.json  ('Put usuario');
  });

  
  app.delete('/usuario/:id',[verificaToken, verificaAdmin_Role], function (req, res) {
      
    let id = req.params.id;

    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

    //La data, la información que yo quiero cambiar
    let cambiaEstado = {
        estado: false
    };

    Usuario.findByIdAndUpdate(id, cambiaEstado, {new: true}, (err, usuarioBorrado) => {

        if(err){
            return res.status(400).json({
                ok: false,
                err
            }); 
        };

        //evaluar si viene un usuario borrado
        //if(usuarioBorrado === null){  es mejor de la otra forma de abajo
        if(!usuarioBorrado){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            }); 
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });


    });

    //res.json  ('Delete usuario');
  });

  module.exports = app;


  /**
   * Node.js Extension Pack

https://marketplace.visualstudio.com/items?itemName=waderyan.nodejs-extension-pack
   */

  /**
   * Usuario.findById(id, (err, usuarioDB) => {
   *    usuarioDB.save
   * }) es una forma de hacerlo
   */

   /**
    * una forma de hacerlo, PUT, para que no se actualizcen esos campos
    * pero es un poco ineficiente cuando son muchos objetos
    * delete body.password;
    * delete.google
    */


    /**
     * Revisar
     * https://underscorejs.org/#pick
     */


     /** Eliminacion fisica de una base de datos
      *   app.delete('/usuario/:id', function (req, res) {
      
    let id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if(err){
            return res.status(400).json({
                ok: false,
                err
            }); 
        };

        //evaluar si viene un usuario borrado
        //if(usuarioBorrado === null){  es mejor de la otra forma de abajo
        if(!usuarioBorrado){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            }); 
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });


    });

    //res.json  ('Delete usuario');
  });

      */