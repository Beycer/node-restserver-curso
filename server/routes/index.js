const express = require('express');
const app = express();


//de esta manera usamos e importamos las rutas del usuario
app.use(require('./usuario'));
app.use(require('./login'));
app.use(require('./categoria'));
app.use(require('./producto'));


module.exports = app;