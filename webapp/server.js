"use strict";

const Hapi = require("hapi");
const MySQL = require("mysql");
const Joi = require("joi");
const Bcrypt = require("bcrypt");
const Inert = require("inert");
const Vision = require("vision");
const Path = require("path");
const CookieAuth = require("hapi-auth-cookie");




const db = MySQL.createConnection({
     host: "localhost",
     user: "root",
     password: "root",
     database: "user_db"
});


var server = new Hapi.Server();

server.connection({
  host: 'localhost',
  port: 3000
});
server.register(Inert);
server.register(Vision);

// register plugins to server instance
server.register(CookieAuth, function (err) {

  var isSessionValid = function(request, reply, callback){
    const user = reply.authUser;
    if(!user)
    {

      return callback(null, false)
    }
    callback(err, true, user)
  }

  server.auth.strategy('session', 'cookie', {
    password: "longpasswordbecauseidontgiveashit",
    cookie: "session",
    isSecure: false,
    redirectTo: '/login',
    redirectOnTry: false,
    appendNext: true,
    validateFunc: isSessionValid
  }); // your TODO: options -> there are required ones

  server.auth.default({strategy: 'session', mode: 'try'});

  // start your server after plugin registration
  server.start(function (err) {
    console.log('info', 'Server running at: ' + server.info.uri)
  })


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
        title: "restricted page title",
        servertime: new Date()
      });
    },
    config: {
      auth: {
        strategy: "session",
        mode: "required"
      }
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
    handler: async function(request, reply){
      const inUser = request.payload.username;
      const inPwd = request.payload.password;

      var allUsers = null;
      var pwdHash;

        var queryString = "SELECT username FROM users;";
        db.query(queryString, function (err, result) {
          if (err) throw err;
          allUsers = result;
          console.log("totalUsers: "+allUsers.length);
          var dbUser;
          for (var i=0; i< allUsers.length; i++)
          {
            const storeUser = allUsers[i];

            console.log("comparing with: "+storeUser.username);
            if(inUser === storeUser.username)
            {

              dbUser = storeUser;
              console.log("user found in db: "+dbUser);
              break;
            }
          }
          console.log("user: "+dbUser);
          if(!dbUser)
          {
            console.log("user not found");
            return reply.view("login", {errorMsg: "Invalid username/password"});
          }

          queryString = "SELECT password FROM users where username='"+dbUser.username+"';"
          db.query(queryString,function(error, result){
            var pwdHash = result[0].password;
            Bcrypt.compare(inPwd,pwdHash,function(err,res){
              var authUser = {
                username: dbUser.username
              }
              if(!res)
              {
                return reply.view("login",{errorMsg: "invalid username/password"});
              }
              request.cookieAuth.set({ authUser });
              if(!request.query.next)
              {
                return reply.redirect("/");
              }
              return reply.redirect(request.query.next);
            });

          });


        });




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
    method: 'GET',
    path: '/signup',
    handler: function(request, reply){
      return reply.view("signup");

    }

  });

  server.route({
      method: "POST",
      path: "/signup",
      handler: function (request, reply) {
      console.log("signing up new");
      const inUsername = request.payload.username;
      const inEmail = request.payload.email;
      const inPassword = request.payload.password;


      //Encryption
      var salt = Bcrypt.genSaltSync();
      var encryptedPassword = Bcrypt.hashSync(inPassword, salt);

      /*//Decrypt
      var orgPassword = Bcrypt.compareSync(password, encryptedPassword);
      */
      var queryString = "SELECT username,email FROM users;"
      db.query(queryString, function(err, result){
        var userFound = false;
          for(var i=0; i<result.length; i++)
          {
            console.log("comparing : "+result[0].username +" : " +result[0].email);
            if(inUsername === result[i].username || inEmail === result[i].email)
            {
              console.log("user alreay exists");
              userFound = true;
              break;
            }

          }
          if(userFound===true)
          {
            return reply.view("signup" , {errorMsg: "username/email already exists"});
          }
          console.log("creating new user:" +inUsername);
          queryString = "INSERT INTO users (username,password,email) values ('"+inUsername+"','"+encryptedPassword+"','"+inEmail+"');";
          db.query(queryString,function(err, result){
            if(err) throw err;
            console.log(result);
            return reply.view("signup",{successMsg: "user created successfuly"});
          });


      });

      db.query('SELECT * FROM users',
      function (error, results, fields) {
          if (error) throw error;
          console.log(results);
      });
    }



  });



  server.views({
    relativeTo: Path.join(__dirname,"templates"),
    engines: {
      hbs: require("handlebars")
    },
    isCached: false,
    context: (request) => {
      return {
        user: request.auth.credentials

      };
    }

  })




});
