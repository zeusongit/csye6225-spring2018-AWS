"use strict";

const Hapi = require("hapi");
const MySQL = require("mysql");
const Joi = require("joi");
const Bcrypt = require("bcrypt");
const Inert = require("inert");
const Vision = require("vision");
const Path = require("path");
const HapiAuthCookie = require("hapi-auth-cookie");

const server = new Hapi.Server();
server.connection({ port: 3000, host: "localhost" });
server.register(Inert);
server.register(Vision);
server.register(HapiAuthCookie);

server.auth.strategy("restricted","cookie",{
  password: "longpasswordbecauseidontgiveashit",
  cookie: "session",
  isSecure: false,
  redirectTo: "/login",
  appendNext: true
  /*validateFunc : (request, cookie) => {

      var usr = cookie.user;
      return{valid: user!==undefined, credentials: user};
    }
*/

});


server.views({
  relativeTo: Path.join(__dirname,"templates"),
  engines: {
    hbs: require("handlebars")
  },
  isCached: false
  /*context: (request) => {
    console.log("user credentials returned are: ");
    console.log("request.auth.credentials");
    return {
      user: request.auth.credentials
    }
  }
  */
});



server.route({
    method: "GET",
    path: "/",
    handler: function (request, reply) {
      return reply.view("home", {title: "hello"});

    }
});


server.route({
  method: "GET",
  path: "/restricted",
  handler: function(request, reply){
    reply.view("restricted", {
      title: "restricted page title"
    });
  },
  config: {
    auth: {
      strategy: "restricted"
    }
  }
});

server.route({
  method: "GET",
  path: "/ash",
  handler: function(request, reply){
    reply.view("restricted", {
      title: "restricted page title"
    });
  }
});

server.route({
  method: "GET",
  path: "/login",
  handler: function(request, reply){
    console.log("query parameters: ");
    console.log(request.query.next);
    reply.view("login",{
      title: "login page"
    });
  }
});




server.route({
  method: "POST",
  path: "/login",
  handler: function(request, reply){
    const inUser = request.payload.username;
    const inPwd = request.payload.password;

    var allUsers = null;
    var pwdHash;
    db.query(
      "SELECT username FROM users;",
      function(err, result, fields){
        if(err) throw err;
        allUsers = result;
        var user = null;
        for (var i=0; i< allUsers.length; i++)
        {
          const storeUser = allUsers[i];
          if(inUser === storeUser.username)
          {

            user = storeUser;
            break;
          }
        }
        if(user){
          console.log("User found: "+user.username);
          console.log("now checking its password");
          var usr = user.username;
          var queryString = "SELECT password FROM users where username='"+usr+"';"
          console.log("query: "+queryString);
          db.query(
            queryString,
            function(err, result, fields){
              pwdHash = result[0].password;
              //return reply(pwdHash);
              console.log("user: "+usr);
              console.log("pwdHash: "+pwdHash);
              console.log("inPwd: "+inPwd);
              Bcrypt.compare(inPwd, pwdHash, function(err, res){
                if(res)
                {
                  console.log("user: "+usr+" authenticated");
                  request.cookieAuth.set({user: usr});
                  console.log(request.query);
                  return reply.redirect(request.query.next, {user: 'vikas'});
                }
                else {
                  return reply.redirect("/login");
                }
              });
            }
          );


        }
      }

    );



  }

});

server.route({
  method: "GET",
  path: "/logout",
  handler: function(request, reply){
    request.cookieAuth.clear();
    return reply.redirect("/");

  }
});


// Get users list
server.route({
    method: "GET",
    path: "/allUsers",

    handler: function (request, reply) {
       db.query("SELECT user_id, username, email FROM users;",
       function (error, results, fields) {
       if (error) throw error;
       console.log("showing all users");
       reply(results);
    });
  }
});

server.route({
    method: "POST",
    path: "/signup",
    handler: function (request, reply) {
    console.log("signing up new");
    reply("signing up");
    const username = request.payload.username;
    const email = request.payload.email;
    const password = request.payload.password;

    //Encryption
    var salt = Bcrypt.genSaltSync();
    var encryptedPassword = Bcrypt.hashSync(password, salt);

    //Decrypt
    var orgPassword = Bcrypt.compareSync(password, encryptedPassword);

    db.query('SELECT uid, username, email FROM users WHERE uid = "' + uid + '"',
    function (error, results, fields) {
        if (error) throw error;

        reply(results);
    });
  },



});


server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});

const db = MySQL.createConnection({
     host: "localhost",
     user: "root",
     password: "root",
     database: "user_db"
});
