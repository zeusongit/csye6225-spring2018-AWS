function(request, cookie){
  var usr = cookie.user;
  console.log("usr from cookie");
  console.log(usr);
  var queryString = "SELECT * FROM users;"
  var user;
  db.query(
    queryString,
    function(err, result, fields){
      if(err) throw err;

      var allUsers = result;
      console.log(result);
      for (var i=0; i< allUsers.length; i++)
      {
        const storeUser = allUsers[i];
        if(usr === storeUser.username)
        {
          console.log("user found in db");
          user = storeUser;
          break;
        }
      }
      console.log("session user is : "+user.username);
    }

  );

  return{valid: user!==undefined, credentials: user};
}
