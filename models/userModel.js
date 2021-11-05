'use strict';
const pool = require('../database/database');
const promisePool = pool.promise();

// Add a user
const insertUser = async (user) => {
  console.log(`userModel insertUser req.body: ${user}`);
  try {
    const [rows] = await promisePool.execute(
        'INSERT INTO ar_users (username, password)' +
        'VALUES (?, ?)',
        [
          user.username,
          user.password,
        ]);
    console.log('userModel insertUser: ', rows);
    return rows.insertId;
  } catch (e) {
    console.log('userModel insertUser error: ', e);
    return 0;
  }
};

module.exports = {
  insertUser,
};