const express = require('express');

let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');


//=============================
//Mostrar todas las categorias
//=============================
app.get('/categoria',verificaToken, (req, res) => {

    //.exec para ejecutar el find
    //Populate => va a revisar que ID'S o que objectsid existe en la
    //categoria que estoy solicitando y me va permitir a mi cargar información
    //como segundo argumento se manda los campos que yo deseo cargar y/o mostrar
    //el id siempre se va pasar por defecto, entonces no hayq ue especificarlo
    Categoria.find({})//sort para ordenarlos por la descripcion
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias
            });

        });

});

//=============================
//Mostrar una categoria por ID
//=============================
app.get('/categoria/:id',verificaToken, (req, res) => {
    let id = req.params.id;
    
    Categoria.findById(id, (err, categoriaDB) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Si no viene una categoria
        //Si no existe
        if(!categoriaDB){
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            });
        }

        //Pero si si viene una categoria, hacemos la impresion
        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });
});

//=============================
//Crear nueva categoria
//=============================
app.post('/categoria', verificaToken, (req, res) => {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        //el ususario necesito mandar el id para que esto funcione req.usuario._id
        //se tiene que mandar el verificatoken si no no lo vamos a tener en el request
        usuario: req.usuario._id
    });

    categoria.save( (err, categoriaDB) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Si no se crea la categoria DB
        if(err){
            return res.status(400).json({
                ok: false,
                err
             });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });


    });

});

//=============================
//Actualiza una categoria
//=============================
app.put('/categoria/:id',verificaToken, (req, res) => {
    //Obtener ID
    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    };

    //runValidators para que no nos choquen con las validaciones
    Categoria.findByIdAndUpdate(id, descCategoria, {new: true, runValidators: true }, (err, categoriaDB) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Si no existe la categoria DB
        if(err){
            return res.status(400).json({
                ok: false,
                err
             });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });


    });

});

//=============================
//Elimina una categoria
//=============================
app.delete('/categoria/:id',[verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Si no viene nada, el ID no existe
        if(err){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
             });
        }

        res.json({
            ok: true,
            message: 'Categoria Borrada'
        });


    });
});










module.exports = app;