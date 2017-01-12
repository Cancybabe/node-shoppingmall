var express = require('express');
var router = express.Router();


var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
	port:'3306',
    database:'mydb'
});

connection.connect();

/*
	相应用户登录请求
*/
router.get('/', function(req, res, next) {
  	//查询
		var params = req.body.username;
		connection.query('select *from appusers where u_name ='+ params, function(err, result) {
			if (err){
				console.log("error");
				return;
			}
			console.log(result);
			var data = JSON.stringify(result[0]);
			console.log(data);
		    var obj = JSON.parse(data);
			var uname = obj.username;
			console.log(uname);
			var upwd = obj.password;
			console.log(upwd);
			res.json({"username":uname,"password":upwd});
			//console.log('The solution is: ', rows[0].solution);
		});
});



/*
	相应用户登录请求
*/
router.post('/login', function(req, res, next) {
  	//查询
		var data = req.body;
		console.log(data);
		var msg = JSON.stringify(data[0]);
		console.log("msg"+msg);
		var obj = JSON.parse(msg);
	    var pwd = obj.age;
		console.log(pwd);
		var name = obj.name;
		console.log(name);
		
		connection.query('select *from appusers where u_name ='+ name, function(err, result) {
			if (err){
				console.log("error");
				return;
			}
			console.log(result);
			var data = JSON.stringify(result[0]);
			console.log(data);
		    var obj = JSON.parse(data);
			var uname = obj.username;
			console.log(uname);
			var upwd = obj.password;
			console.log(upwd);
			
			if(upwd == pwd){
				var token = jwt.sign(result,'resul')
				res.json({"success":true,});
			}
			
			//console.log('The solution is: ', rows[0].solution);
		});
});

module.exports = router;
