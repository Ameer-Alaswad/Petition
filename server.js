const express = require('express');
const app = express();
const db = require('./db');
db.getAllCities()
    .then((result) => {
        console.log('result', result);
    })
    .catch((err) => console.log('err', err));

db.addCity('York', 'UK', 50000)
    .then(({ rows }) => {
        console.log('rows', rows);
    })
    .catch((err) => console.log('err', err));
console.log('db', db);
app.listen(8080, () => console.log('petition running'));
