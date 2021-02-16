const spicedPg = require('spiced-pg');

const db = spicedPg('postgres:ameer:ameer123321@localhost:5432/cities');

module.exports.getAllCities = () => {
    const q = `SELECT * FROM cities`;
    return db.query(q);
};

module.exports.addCity = (city, country, population) => {
    const q = `INSERT INTO cities (city, country, population)
    VALUES ('${city}', '${country}', '${population}')
    RETURNING id
    `;
    return db.query(q);
};
