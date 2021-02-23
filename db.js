const spicedPg = require('spiced-pg');

const db = spicedPg(
    process.env.DATABASE_URL ||
        'postgres:postgres:postgres@localhost:5432/petition'
);
module.exports.getAllSigners = () => {
    const q = `SELECT first_name,last_name,age,city,url
    FROM users
    JOIN user_profiles
    ON users.id = user_profiles.user_id;`;
    return db.query(q);
};
module.exports.getAllSignatures = () => {
    const q = `SELECT * FROM signatures`;
    return db.query(q);
};

module.exports.addSignature = (signature, user_id) => {
    const q = `INSERT INTO signatures (signature, user_id)
    VALUES ('${signature}', '${user_id}')
    RETURNING id
    `;
    return db.query(q);
};
module.exports.getSignature = (signatureId) => {
    const q = `SELECT signature FROM signatures WHERE
     signatures.user_id = '${signatureId}'`;
    return db.query(q);
};
module.exports.getSignersNumber = () => {
    const q = `SELECT COUNT(*) FROM signatures`;
    return db.query(q);
};
module.exports.addUser = (first_name, last_name, email, password_hash) => {
    const q = `INSERT INTO users (first_name, last_name, email, password_hash)
    VALUES ('${first_name}', '${last_name}', '${email}','${password_hash}')
    RETURNING id
    `;
    return db.query(q);
};
module.exports.getUser = (email) => {
    const q = `SELECT email,password_hash,id FROM users WHERE
     email = '${email}'`;
    return db.query(q);
};
module.exports.addProfile = (age, city, url, user_id) => {
    const q = `INSERT INTO user_profiles (age, city, url,user_id)
    VALUES ('${age}', '${city}', '${url}','${user_id}')`;
    return db.query(q);
};

module.exports.getSignersByCity = (city) => {
    const q = `SELECT first_name,last_name,age,url 
    FROM users
    LEFT JOIN signatures
    ON users.id = signatures.user_id
    LEFT JOIN user_profiles
    ON users.id = user_profiles.user_id
    WHERE city = '${city}'`;
    return db.query(q);
};
