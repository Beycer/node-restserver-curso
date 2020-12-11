
// ================
// Puerto
// ================

process.env.PORT = process.env.PORT || 3000;

// ================
// Entorno, para saber si estoy en producción o desarrollo
// ================
//si existe algo quiere decir que voy a saber que estoy corriendolo en producción
//si esa variable no existe, voy a suponer que estoy en desarrollo => 'dev
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


// ================
// Vencimiento del Token
// ================
//60 segundos
//60 minutos
//24 horas
//30 días
process.env.CADICIDAD_TOKEN = 60 * 60 * 24 * 30;


// ================
// SEED de autenticación 
// ================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarollo';


// ================
// Base de Datos
// ================
let urlDB;

if(process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
}else{
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;