const express = require('express');
const app = express();
const db = require('./db');
db.getAllSignatures()
    .then((results) => {
        console.log('result', results.rows);
    })
    .catch((err) => console.log('err', err));

db.addSignature('York', 'UK', 50000)
    .then(({ rows }) => {
        console.log('rows', rows);
    })
    .catch((err) => console.log('err', err));

app.listen(8080, () => console.log('petition running'));
