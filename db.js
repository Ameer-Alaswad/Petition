const spicedPg = require('spiced-pg');

const db = spicedPg(
    process.env.DATABASE_URL ||
        'postgres:postgres:postgres@localhost:5432/petition'
);
module.exports.getAllSignatures = () => {
    const q = `SELECT * FROM signatures`;
    return db.query(q);
};

module.exports.addSignature = (first, last, signature) => {
    const q = `INSERT INTO signatures (first, last, signature)
    VALUES ('${first}', '${last}', '${signature}')
    RETURNING id
    `;
    return db.query(q);
};
module.exports.getSignature = (signatureId) => {
    const q = `SELECT signature FROM signatures WHERE
     signatures.id = ${signatureId}`;
    return db.query(q);
};
module.exports.getSignersNumber = () => {
    const q = `SELECT COUNT(*) FROM signatures`;
    return db.query(q);
};
