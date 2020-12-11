const jwt = require('jsonwebtoken');


// ================
// Verificar Token 
// ================
//req => la solicitud que yo estoy haciendo
//res => la respuesta que yo deseo retornar
//next, lo que va hacer es continuar con la ejecución del programa

let verificaToken = (req, res, next) => {

    //leer header donde viene el token
    let token = req.get('token');

    //comprobar que el token sea valido
    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if(err){
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }//si no ejecuta esta linea de codigo quire decir que la informacion es correcta
        //y el decoded va tener infomación del usuario que es todo el payload

        //puedo hacer que cualquier petición pueda tener acceso a la infomación del usuario
        //con solo haber pasado por ese verefica token
        req.usuario = decoded.usuario;
        next();

    });

    //console.log(token);

    /*res.json({
        token: token
    });*/
};

// ================
// Verificar AdminRole 
// ================

let verificaAdmin_Role = (req, res, next) => {

    let usuario = req.usuario;

    if(usuario.role === 'ADMIN_ROLE'){
        next();
    }else{

        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });

    }


    
};


module.exports = {
    verificaToken,
    verificaAdmin_Role
}