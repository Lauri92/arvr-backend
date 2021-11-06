'use strict';
const pool = require('../database/database');
const promisePool = pool.promise();

// Add a user
const insertUser = async (user) => {
  try {
    const [rows] = await promisePool.execute(
        'INSERT INTO ar_users (username, password)' +
        'VALUES (?, ?)',
        [
          user.username,
          user.password,
        ]);
    return rows.insertId;
  } catch (e) {
    console.error('userModel insertUser error: ', e.message);
    return 0;
  }
};

const checkUsernameAvailability = async (username) => {
  try {
    console.log('userModel checkUsernameAvailability');
    const [rows] = await promisePool.execute('SELECT *\n' +
        'FROM users\n' +
        'WHERE users.email = ?;', [username]);
    return rows[0];
  } catch (e) {
    console.error(e.message);
  }
};

module.exports = {
  insertUser,
  checkUsernameAvailability,
};