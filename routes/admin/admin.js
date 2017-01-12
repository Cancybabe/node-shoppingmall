var express = require('express');
var async = require("async");
var router = express.Router();

var mysql = require("mysql");
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
	port:'3306',
    database:'shoppingmall'
});

conn.connect();

/*------------------登录模块------------------------*/
//登录页面请求
router.get('/login', function(req, res, next) {
  res.render("admin/login");
});

//判断能否登录成功
router.post('/doLogin', function(req, res, next) {
		//判断登录的用户名和密码是否正确，如果正确则写cookie信息，不正确则提示用户名或密码错误
			var sql = "select *from admin";
			var params = req.body.username;
			conn.query("select *from admin where adAdminname = ?",params,function(err,result){
				if(err){
					console.log("err"+err);
					return;
				}
				 str = JSON.stringify(result);
				 var obj = JSON.parse(str);
				 var password = obj[0].adPassword;
				 if(password == req.body.userpassword){
						//写cookie信息
						res.cookie('adminuser', 'zhangsan', { maxAge: 3600000, httpOnly: true });
						res.redirect("/admin/findAllCommodity");     
				 }
		});
});

//退出登录
router.get('/doLoginOut', function(req, res, next) {
	  //清除指定cookie信息
  res.clearCookie('adminuser', { path: '/' });
  res.render("admin/login");  
});


/*------------------博客模块------------------------*/
//查找所有商品页面请求
router.get('/findAllCommodity', function(req, res, next) {
				var sql = "select *from commodity c1 inner join commodityType c4 on c4.ctId = c1.cmdType ,(select c2.cmdId,GROUP_CONCAT(c3.laName) as labelName from commodity c1 left join lableCommodity c2 on c1.cmdId = c2.cmdId left join label c3 on 	c2.laId = c3.laId group by c1.cmdId limit 1000  ) as b where c1.cmdId = b.cmdId";
				conn.query(sql, function(err, result) {
					console.log('result ', result);
				  for(var i=0;i<result.length;i++){
					   var string=JSON.stringify(result[i]);
					   console.log('string ', string);
					   var data = JSON.parse(string);
					   console.log('data ', data);
				   }
				   res.render('admin/commoditytable',{list:result});
		});
});

//编辑商品
router.get('/addCommodity', function(req, res, next) {
				   res.render('admin/addCommodity');
	
});




//查找所有订单页面请求
router.get('/findAllOrders', function(req, res, next) {
				var sql = "select *from orders c1 inner join user c4 on c4.uId = c1.orUserId,(select c2.orId,GROUP_CONCAT(c3.cmdName) as cmdName from orders c1 left join orderCommodity c2 on c1.orId = c2.orId left join commodity c3 on 	c2.cmdId = c3.cmdId group by c1.orId limit 1000  ) as b where c1.orId= b.orId;";
				conn.query(sql, function(err, result) {
					console.log('result ', result);
					for(var i=0;i<result.length;i++){
					   var string=JSON.stringify(result[i]);
					   console.log('string ', string);
					   var data = JSON.parse(string);
					   console.log('data ', data);
				   }
				   res.render('admin/orderstable',{list:result});
		});
});

//订单详情
router.get('/doOrderDetails', function(req, res, next) {
				var params = req.query.id;
				var sql = "select  *from (select cmdId from orderCommodity where orId = "+params+") as a ,commodity where a.cmdId = commodity.cmdId;";
				conn.query(sql, function(err, result) {
					console.log('result ', result);
					for(var i=0;i<result.length;i++){
					   var string=JSON.stringify(result[i]);
					   console.log('string ', string);
					   var data = JSON.parse(string);
					   console.log('data ', data);
				   }
				   res.render('admin/orderdetailstable',{list:result});
		});
});


//查找所有商品评论

router.get('/findAllComments', function(req, res, next) {
				var sql = "select cmId,cmContent,cmUserid,cmcmdId,cmTime,cmdName,uName from comment,commodity,user where comment.cmUserid = user.uid and comment.cmcmdId = commodity.cmdId;";
				conn.query(sql, function(err, result) {
					console.log('result ', result);
					for(var i=0;i<result.length;i++){
					   var string=JSON.stringify(result[i]);
					   console.log('string ', string);
					   var data = JSON.parse(string);
					   console.log('data ', data);
				   }
				   res.render('admin/commoditycomment',{list:result});
		});
});


//查找所有商品评论

router.get('/findOneCmdComment', function(req, res, next) {
				var params = req.query.id;
				var sql = "select cmId,cmContent,cmUserid,cmcmdId,cmTime,cmdName,uName from comment,commodity,user where comment.cmUserid = user.uid and comment.cmcmdId = commodity.cmdId and comment.cmcmdId = "+params+";";
				conn.query(sql, function(err, result) {
					console.log('result ', result);
					for(var i=0;i<result.length;i++){
					   var string=JSON.stringify(result[i]);
					   console.log('string ', string);
					   var data = JSON.parse(string);
					   console.log('data ', data);
				   }
				   res.render('admin/commoditycomment',{list:result});
		});
});

module.exports = router;



