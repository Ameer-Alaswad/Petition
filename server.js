const express = require('express');
const app = express();
const db = require('./db');
const hb = require('express-handlebars');
const cookieSession = require('cookie-session');
////////////////////////////////////////////////
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');
///////////////////////////////////////////
app.use(express.urlencoded({ extended: false }));
app.use(express.static('./public'));
/////////////////////////////////////////////////
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);
////////////////////////////////////////////
/// signers
app.get('/signers', (req, res) => {
    db.getAllSignatures()
        .then(({ rows }) => {
            let allSigners = rows;
            res.render('signers', {
                layout: 'main',
                allSigners,
            });
        })
        .catch((err) => console.log('err', err));
});

//////////////////////////////////////////
// get petition
app.get('/petition', (req, res) => {
    if (req.session.signatureId) {
        res.redirect('/petition/thanks');
    } else {
        res.render('petition', {
            layout: 'main',
        });
    }
});

///////////////////////////////////
// post petition
app.post('/petition', (req, res) => {
    let { first, last, signature } = req.body;
    if (!signature) {
        res.redirect('petition');
    }
    // if there is no sginature redirect plus message
    db.addSignature(first, last, signature)
        .then(({ rows }) => {
            req.session.signatureId = rows[0].id;
            console.log('req.session.signatureId', req.session.signatureId);
            res.redirect('/petition/thanks');
        })
        .catch((err) => console.log('err', err));
});
/////////////////////////////////////////
//thanks template
app.get('/petition/thanks', (req, res) => {
    db.getSignature(req.session.signatureId)
        .then(({ rows }) => {
            let signature = rows[0].signature;
            db.getSignersNumber().then(({ rows }) => {
                let signersNumber = rows[0].count;
                console.log('rows in signersNumber', rows);
                res.render('thanks', {
                    layout: 'main',
                    signature,
                    signersNumber,
                });
            });
        })
        .catch((err) => console.log('err in get/thanks', err));
});
///////////////////////////////////////////////////////
/// register get
app.get('/register', (req, res) => {
    res.render('register', {});
});

///////////////////////////////////////////
/// register post
app.post('/register', (req, res) => {});

/////////////////////////////////////////////////
///login get
app.get('/login', (req, res) => {
    res.render('login', {});
});

///////////////////////////////////////////////////
///log in post
app.post('/login', (req, res) => {});

//////////////////////////////////////////////////
//// profile get
app.get('/profile', (req, res) => {
    res.render('profile');
});

///////////////////////////////////////////
//// profile post
app.post('/profile', (req, res) => {});
app.listen(8080, () => console.log('petition running'));
