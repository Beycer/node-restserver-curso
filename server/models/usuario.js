//El encargado en trabajar el modelo de datos
const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');
//const { delete } = require('../routes/usuario');

//En {VALUE} inyecta sea lo que sea que el usuario envie
let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};

//obtener el cascaron para crear esquemas de mongoose
let Schema = mongoose.Schema;

//Definir esquema
let usuarioSchema = new Schema({//definir las reglas y controles que va tener el usuairo
    //es decir los campos que va tener la colecion
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        //tiene que existir dentro de esta enumeración
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }

});

//el metodo toJSON en un esquema siempre se llama cuando se intenta imprimir
//para no regresar la contraseña como respuesta
usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único'});

//entreparenstesis el nombre que yo le quiero dar al modelo ya fisicamente
//se llamara Usuario y ese usuario tendra toda la confoguracion de usuarioSchema
module.exports = mongoose.model('Usuario', usuarioSchema);