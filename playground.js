const bcrypt = require("bcryptjs");

//To hash a password we need a salt.
//1234 -> abcd
//Hasing is a 1 way process that turns our password from 1234 to abcd.
//Salt is the random string inserted to the password, so each hashed password is different.

async function run() {
  const salt = await bcrypt.genSalt(10);
  console.log(salt);
  const hashed = await bcrypt.hash("1234", salt);
  console.log(hashed);
}

run();

//note there is Sync & Aync, as a convetion we use SYNC.
//10 is the length of the salt, bigger salt the longer the computation but more secure.
//We also have a callback function, which is how the documentation recommends its used.
//We're going to use an overload for promises to avoid the callback hell problem.

/*
Note:
In order to validate the password, we need to store the salt.
The user will send in the password as plain text, and we need to reuse the salt so we can reconstruct
the same passwords for verification.
*/
