DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;

CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR NOT NULL CHECK (first_name <> ''),
    last_name VARCHAR NOT NULL CHECK (last_name <> ''),
    email VARCHAR NOT NULL UNIQUE CHECK (email <> ''),
    password_hash VARCHAR NOT NULL CHECK (password_hash <> ''),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE signatures
(
    id SERIAL PRIMARY KEY,
    -- Add the foreign key user_id
    -- Foreign keys let us link tables together, in this case it let's us
    -- identify which signature belongs to which user from the users table.
    -- This link can be leverage in JOIN queries (covered in Part 4).
    user_id INTEGER NOT NULL UNIQUE REFERENCES users (id),
    -- get rid of first_name and last_name
    signature TEXT NOT NULL CHECK (signature <> ''),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);