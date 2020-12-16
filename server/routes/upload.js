const express = require('express');
const fileUpload = require('express-fileupload');
const usuario = require('../models/usuario');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

//cuando llamamos la funcion del fileUpload, todos los archivos que se cargen 
//caen dentro de req.files
app.use( fileUpload({ useTempFiles: true }) );

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    //Si no hay ningun archivo
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400)
                    .json({
                        ok: false,
                        err: {
                            message: 'No se ha seleccionado ningún archivo'
                        }
                    });
    }

    //Validar tipo
    let tiposValidos = ['productos', 'usuarios'];
    if(tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las tipos permitidos son: ' + tiposValidos.join(', ')
            }
        });
    }

    //Si vine un archivo o lo que sea que se suba
    //va caer dentro req.files.archivo;
    //archivo es el nombre que se le va colocar cuando nosotros coloquemos un input
    let archivo = req.files.archivo;

    //Obtener la extension del archivo para verificar que exista dentro del arreglo
    //si existe procedo con el prosedimiento si no no 
    let nombreCortado = archivo.name.split('.');//los separo por .
    let extension = nombreCortado[nombreCortado.length - 1];//para obtener la ultima posición

    //console.log(extension);

    //restringir para que solo sea un tipo de extension
    //Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];


    if(extensionesValidas.indexOf(extension) < 0){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son: ' + extensionesValidas.join(', '),
                ext: extension
            }
        });
    }

    //Cambiar nombre al archivo
    //Hay que procurar que el nombre del archivo sea unico y adicional adjuntarle algo
    //para hacerlo unico y prevenir el cache del navegador web 
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
    

    //mover ese archivo al directorio con el nombre que nosotros queremos
    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err)
        return res.status(500).json({
            ok: false,
            err
        });

        //Aqui, imagen cargada
        if(tipo === 'usuarios'){
            imagenUsuario(id, res, nombreArchivo);
        }else{
            imagenProducto(id, res, nombreArchivo);
        }
        
        

    });

});

function imagenUsuario(id, res, nombreArchivo){
    //Con el ID yo puedo buscar al usuario

    Usuario.findById(id, (err, usuarioDB) => {

        if(err){
            //se pone aqui porque aunq suseda un erro la imagen si se subio
            //y tengo que borrarla, nombreArchivo porque usuarioDB.img no se creo
            //vendria undefine por eso necesito nombreArchivo que yo acabo de subir
            borrarArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Verificar que exista ese usuario
        //Si no existe ese usuario
        if(!usuarioDB){
            //si el usuario no existe, tengo que borrar la imagen que se subio
            borrarArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        //antes de borrar la imgen confirmar que existe
        //verificar la ruta del archivo exista
        //se paso este codigo a la función de borrarArchivo
        /*let pathImagen = path.resolve(__dirname, `../../uploads/usuarios/${usuarioDB.img}`);
        if(fs.existsSync(pathImagen) ) {
            fs.unlinkSync(pathImagen);//esto lo borra
        }*/

        //recibe el nombre de la imagen
        borrarArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;

        usuarioDB.save( (err, usuarioGuardado) => {

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });


        });


    });

}

function imagenProducto(id, res, nombreArchivo){

    Producto.findById(id, (err, productoDB) => {

        if(err){
            borrarArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoDB){
            borrarArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        //recibe el nombre de la imagen
        borrarArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;

        productoDB.save( (err, productoGuardado) => {

            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });


        });


    });
    
}

function borrarArchivo(nombreImagen, tipo){

    //antes de borrar la imgen confirmar que existe
    //verificar la ruta del archivo exista
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if(fs.existsSync(pathImagen) ) {
        fs.unlinkSync(pathImagen);//esto lo borra
    }
}

module.exports = app;