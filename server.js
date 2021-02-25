const express = require('express');
const app = express();
const csurf = require('csurf');
const db = require('./db');
const hb = require('express-handlebars');
const cookieSession = require('cookie-session');
const { hash, compare } = require('./utils/bc.js');
////////////////////////////////////////////////
///////////////////////////////////////////
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: false }));
/////////////////////////////////////////////////
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);
app.use(csurf());

app.use(function (req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});
//////////////////////////////////////////////
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');
///
app.get('/', (req, res) => res.redirect('/petition'));

////////////////////////////////////////////
/// signers
app.get('/signers', (req, res) => {
    db.getAllSigners()
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
    let userId = req.session.userId;
    let { signature } = req.body;
    if (!signature) {
        res.redirect('/petition');
    } else {
        // if there is no sginature redirect plus message
        db.addSignature(signature, userId)
            .then(({ rows }) => {
                req.session.signatureId = rows[0].id;
                res.redirect('/petition/thanks');
            })
            .catch((err) => console.log('err in petition post', err));
    }
});
/////////////////////////////////////////
//thanks template
app.get('/petition/thanks', (req, res) => {
    signatureId = req.session.signatureId;
    if (!signatureId) {
        res.redirect('/petition');
    }
    db.getSignature(req.session.userId)
        .then(({ rows }) => {
            let signature = rows[0].signature;
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
        // req.session = null;
        res.render('register', { layout: 'main' });
    }
});

///////////////////////////////////////////
/// register post
app.post('/register', (req, res) => {
    let { first_name, last_name, email, password_hash } = req.body;
    first_name = first_name.charAt(0).toUpperCase() + first_name.slice(1);
    last_name = last_name.charAt(0).toUpperCase() + last_name.slice(1);
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
    city = city.charAt(0).toUpperCase() + city.slice(1);
    if (!age) {
        age = null;
    }
    if (!age && !city && !url) {
        res.redirect('/petition');
    }

    if (
        url.startsWith('https://') ||
        url.startsWith('http://') ||
        url.startsWith('//') ||
        !url
    ) {
        let userId = req.session.userId;

        db.addProfile(age, city, url, userId)
            .then(() => {
                res.redirect('/petition');
            })
            .catch((err) => console.log('err in profile', err));
    } else if (url) {
        newUrl = '';
        newUrl = newUrl.concat('https://', url);
        let userId = req.session.userId;
        db.addProfile(age, city, newUrl, userId)
            .then(() => {
                res.redirect('/petition');
            })
            .catch((err) => console.log('err in profile', err));
    }
});
/////////////////////////////////////////////////
///signers
app.get('/signers/:city', (req, res) => {
    let city = req.params.city;
    db.getSignersByCity(city)
        .then(({ rows }) => {
            let allSigners = rows;
            res.render('city', {
                layout: 'main',
                allSigners,
            });
        })
        .catch((err) => console.log('err in signers city', err));
});
////////////////////////////////////////////////
////update get
app.get('/edit', (req, res) => {
    let userId = req.session.userId;
    if (!userId) {
        return res.redirect('/register');
    }
    db.getSigner(userId)
        .then(({ rows }) => {
            signer = rows[0];
            res.render('edit', {
                signer,
            });
        })
        .catch((err) => console.log('err in edit get', err));
});

///////////////////////////////////////////////////
///update post
app.post('/edit', (req, res) => {
    let userId = req.session.userId;
    let { first_name, last_name, password_hash, email, age, city } = req.body;
    let url = req.body.url;

    if (!age) {
        age = null;
    }

    if (
        url.startsWith('https://') ||
        url.startsWith('http://') ||
        url.startsWith('//') ||
        !url
    ) {
        newUrl = '';
        newUrl = newUrl.concat('https://', url);
        city = city.charAt(0).toUpperCase() + city.slice(1);
        first_name = first_name.charAt(0).toUpperCase() + first_name.slice(1);
        last_name = last_name.charAt(0).toUpperCase() + last_name.slice(1);
        if (password_hash) {
            hash(password_hash).then((hashedPassword) => {
                Promise.all([
                    db.updateUserWithPassword(
                        first_name,
                        last_name,
                        hashedPassword,
                        email,
                        userId
                    ),
                    db.upsertUserProfile(age, city, newUrl, userId),
                ])
                    .then(() => {
                        res.redirect('/petition');
                    })
                    .catch((err) =>
                        console.log('err in edit if passowrd', err)
                    );
            });
        } else {
            Promise.all([
                db.updateUserWithoutPassword(
                    first_name,
                    last_name,
                    email,
                    userId
                ),
                db.upsertUserProfile(age, city, url, userId),
            ])
                .then(() => res.redirect('/petition'))
                .catch((err) =>
                    console.log('err in edit without password', err)
                );
        }
    } else {
        newUrl = '';
        newUrl = newUrl.concat('https://', url);
        city = city.charAt(0).toUpperCase() + city.slice(1);
        first_name = first_name.charAt(0).toUpperCase() + first_name.slice(1);
        last_name = last_name.charAt(0).toUpperCase() + last_name.slice(1);
        if (password_hash) {
            hash(password_hash).then((hashedPassword) => {
                Promise.all([
                    db.updateUserWithPassword(
                        first_name,
                        last_name,
                        hashedPassword,
                        email,
                        userId
                    ),
                    db.upsertUserProfile(age, city, newUrl, userId),
                ])
                    .then(() => {
                        res.redirect('/petition');
                    })
                    .catch((err) =>
                        console.log('err in edit if passowrd', err)
                    );
            });
        } else {
            Promise.all([
                db.updateUserWithoutPassword(
                    first_name,
                    last_name,
                    email,
                    userId
                ),
                db.upsertUserProfile(age, city, newUrl, userId),
            ])
                .then(() => res.redirect('/petition'))
                .catch((err) =>
                    console.log('err in edit without password', err)
                );
        }
    }
});
///////////////////////////////////////////
///////post delete
app.post('/delete', (req, res) => {
    let userId = req.session.userId;
    let signatureId = req.session.signatureId;
    db.deleteSignature(userId)
        .then(() => {
            req.session.signatureId = null;
            res.redirect('/petition');
        })
        .catch((err) => console.log('err in delete', err));
});
////////////////////////////////////////////
//// logout
app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/login');
});

app.listen(process.env.PORT || 8080, () => console.log('petition running'));
