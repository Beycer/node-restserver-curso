const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');
const categoria = require('../models/categoria');
const producto = require('../models/producto');

let app = express();
let Producto = require('../models/producto');


//=============================
//Obtener productos
//=============================
app.get('/productos', verificaToken, (req, res) => {

    //Controlar la pagina que yo quiero mostrar
    let desde = req.query.desde || 0;
    desde = Number(desde);

    //para saltar la pagina, poder utilizarla .skip
    //mostar cuantos registros por pagina .limit

    Producto.find({disponible: true})//sort para ordenarlos por la descripcion
        .sort('descripcion')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {

            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });

        });

});

//=============================
//Obtener un producto por ID
//=============================
app.get('/productos/:id', (req, res) => {
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec( (err, productoDB) => {

            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            //Puede ser que no venga un producto
            if(!productoDB){
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'ID no existe'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });

        });

});

//=============================
//Buscar productos
//=============================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    //exprecion regular, mando la i para que sea insensible a las mayusculas y minusculas
    //creeo una exprecion regular basada en el termino
    let regex = new RegExp(termino, 'i');

    //al nombre voy hacerle un match con el termino, la exprecion regular
    Producto.find({nombre: regex})
        .populate('categoria', 'nombre')
        .exec( (err, productos) => {

            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });

        });


});



//=============================
//Crear un nuevo producto
//=============================
app.post('/productos', verificaToken, (req, res) => {
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id

    });

    producto.save((err, productoDB) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Si no se crea el producto DB
        if(err){
            return res.status(400).json({
                ok: false,
                err
             });
        }

        //201 cuando se crea un nuevo registro
        //hay gente que lo usa y otras que no 
        //ya es a decisión
        res.status(201).json({
            ok: true,
            producto: productoDB
        });

    });
});

//=============================
//Actualizar un producto
//=============================
app.put('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion
    };

    //verificar que el id exista, si no  no voy actualizar nada
    Producto.findById(id, (err, productoDB) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Si no existe un producto DB quiere decir que id no existe o algo sucedio
        if(!productoDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        //Si si existe, se actualiza
        //Otra forma de actualizar
        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save((err, productoGuardado) => {

            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado
            });

        });

    });

    
});

//=============================
//Borrar un producto
//=============================
app.delete('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    //Buscar si existe el producto
    Producto.findById(id, (err, productoDB) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Si el producto no existe
        if(!productoDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        //Si logra encontrar el producto quiere decir que hay que cambiarle
        //el disponible a false

        productoDB.disponible = false;

        productoDB.save( (err, productoBorrado) => {

            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                //mandar el producto borrado por si se quiere una referencia
                producto: productoBorrado,
                message: 'Producto Borrado'
            });



        });



    });


});

module.exports = app;