const express = require('express');
const app = express();
const db = require('./db');
const hb = require('express-handlebars');
const cookieSession = require('cookie-session');
const { hash, compare } = require('./utils/bc.js');
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
//////////////////////////////////////////////
///
app.get('/', (req, res) => res.redirect('/petition'));

////////////////////////////////////////////
/// signers
app.get('/signers', (req, res) => {
    db.getAllSigners()
        .then(({ rows }) => {
            console.log('rows', rows);
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
    } else if (req.session.userId) {
        res.render('petition', {
            layout: 'main',
        });
    } else {
        res.redirect('/register');
    }
});

///////////////////////////////////
// post petition
app.post('/petition', (req, res) => {
    let { signature } = req.body;
    console.log('signature', signature);
    console.log('req.session.userId', req.session.userId);
    if (!signature) {
        res.redirect('/petition');
    } else {
        // if there is no sginature redirect plus message
        db.addSignature(signature, req.session.userId)
            .then(({ rows }) => {
                req.session.signatureId = rows[0].id;
                console.log('🚀 ~ .then ~ rows[0].id', rows[0].id);
                res.redirect('/petition/thanks');
            })
            .catch((err) => console.log('err in petition post', err));
    }
});
/////////////////////////////////////////
//thanks template
app.get('/petition/thanks', (req, res) => {
    signatureId = req.session.signatureId;
    console.log('signatureId', signatureId);
    db.getSignature(signatureId)
        .then(({ rows }) => {
            console.log('rows', rows);
            let signature = rows[0].signature;
            console.log('signature in thanx', signature);
            db.getSignersNumber().then(({ rows }) => {
                let signersNumber = rows[0].count;
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
    if (req.session.userId) {
        res.redirect('/petition');
    } else {
        res.render('register', {});
    }
});

///////////////////////////////////////////
/// register post
app.post('/register', (req, res) => {
    var { first_name, last_name, email, password_hash } = req.body;
    if (!first_name || !last_name || !email || !password_hash) {
        res.render('register', {
            error: true,
            errorMessage: 'please fill all the required fields',
        });
    } else {
        hash(password_hash)
            .then((hashedPassword) =>
                db.addUser(first_name, last_name, email, hashedPassword)
            )
            .then(({ rows }) => {
                req.session.userId = rows[0].id;
                res.redirect('/profile');
            })

            .catch((err) => {
                console.log('err in register post', err);
                res.render('/register', {
                    error: true,
                    errorMessage: 'something went wrong, please try again',
                });
            });
    }
});

/////////////////////////////////////////////////
///login get
app.get('/login', (req, res) => {
    if (req.session.userId) {
        res.redirect('/petition');
    }
    res.render('login', {
        layout: 'main',
    });
});

///////////////////////////////////////////////////
///log in post
app.post('/login', (req, res) => {
    let { email, password_hash } = req.body;
    if (!email || !password_hash) {
        res.render('login', {
            error: true,
            errorMessage: 'please fill all the required fields',
        });
    }
    db.getUser(email)
        .then(({ rows }) => {
            const hashed_password = rows[0].password_hash;
            const match = compare(password_hash, hashed_password);
            req.session.userId = rows[0].id;
            return match;
        })
        .then((match) => {
            if (match) {
                res.redirect('/petition');
            } else {
                res.render('login', {
                    error: true,
                    errorMessage: 'password does not match',
                });
            }
        })
        .catch((err) => console.log('err in login post', err));
});

//////////////////////////////////////////////////
//// profile get
app.get('/profile', (req, res) => {
    res.render('profile');
});

///////////////////////////////////////////
//// profile post
app.post('/profile', (req, res) => {
    let { age, city, url } = req.body;
    if (url.startsWith('https://') || url.startsWith('http://')) {
        let userId = req.session.userId;
        db.addProfile(age, city, url, userId)
            .then(() => {
                res.redirect('petition');
            })
            .catch((err) => console.log('err in profile', err));
    } else if (!url.startsWith('https://') || !url.startsWith('http://')) {
        url = 'https://' + url;
        let userId = req.session.userId;
        console.log('userId', userId);
        db.addProfile(age, city, url, userId)
            .then(() => {
                res.redirect('petition');
            })
            .catch((err) => console.log('err in profile', err));
    }
});
//  Promise.all([
//         db.updateUsers(first, last, email, userId),
//         db.updateProfile(age, city, url, userId),
//     ]).then

app.get('/signers/:city', (req, res) => {
    let city = req.params.city;
    db.getSignersByCity(city)
        .then(({ rows }) => {
            let allSigners = rows;
            console.log('all', allSigners);
            res.render('city', {
                layout: 'main',
                allSigners,
            });
        })
        .catch((err) => console.log('err in signers city', err));
});
app.listen(process.env.PORT || 8080, () => console.log('petition running'));
