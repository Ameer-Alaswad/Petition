const express = require('express');
const app = express();
const db = require('./db');
const hb = require('express-handlebars');
////////////////////////////////////////////////
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');
///////////////////////////////////////////
app.use(express.urlencoded({ extended: false }));
app.use(express.static('./public'));
/////////////////////////////////////////////////
// get petition
app.get('/petition', (req, res) => {
    res.render('petition', {
        layout: null,
    });
});
///////////////////////////////////
// post petition
app.post('/petition', (req, res) => {
    const { first, last, signature } = req.body;
    db.addSignature(first, last, signature)
        .then(({ rows }) => {
            console.log('rows', rows);
        })
        .catch((err) => console.log('err', err));
});

db.getAllSignatures()
    .then(({ rows }) => {
        console.log('result', rows);
    })
    .catch((err) => console.log('err', err));

app.listen(8080, () => console.log('petition running'));
