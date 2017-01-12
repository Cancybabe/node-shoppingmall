
var mysql = require("mysql");
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
	port:'3306',
    database:'mydb'
});
var localhost = new Object();

conn.connect();

/*------------------登录模块------------------------*/

exports.login = function(req, res, next) {
  res.render("AdminLTE/login");
};

exports.doNameCheck = function(){
	var sql = "select *from bloguser where uname= ?";
	var uname = req.query.uname;
	//var upass = req.query.upass;
		
	conn.query(sql,function(err,result){
		if(err){
            console.log('[delete error:]'+err.message);
			res.send("N");
            return;
        }else{
			res.send("Y");
		}
		
	});
}

exports.doLogin = function(req, res, next) {
	
	//判断登录的用户名和密码是否正确，如果正确则写cookie信息，不正确则提示用户名或密码错误
   
   		//写cookie信息
		res.cookie('adminuser', 'zhangsan', { maxAge: 3600000, httpOnly: true });
		res.redirect("/findAllblog");   
		
	
};

exports.doLoginOut = function(req, res, next) {
  //清除指定cookie信息
  res.clearCookie('adminuser', { path: '/' });
  res.render("AdminLTE/login");
};

/*------------------博客模块------------------------*/
exports.findAllblog = function(req, res){
	var sql = "select newsid,newstitle,newspublishtime,newspraise,tagtype,count(commentid) as newscomment from(select newsid,newstitle,newspublishtime,newspraise,tagtype,commentid,cconteent,blogid from myblog,comment where myblog.newsid = comment.blogid) aa group by blogid";
	//var sqlall = "select *from myblog";
	conn.query(sql,function(err,result){
		res.render('AdminLTE/blogtable',{list:result}); //加载模板
	});
};

//添加
exports.add = function(req, res){
	conn.query('select *from tag',function(err,result){
		res.render('AdminLTE/add',{list:result});
	});
	//res.render('AdminLTE/add');
};

exports.doAdd = function(req, res){
	var myDate = new Date();  
    myDate.getYear();      //获取当前年份(2位)  
    myDate.getFullYear(); //获取完整的年份(4位,1970-????)  
    myDate.getMonth();      //获取当前月份(0-11,0代表1月)  
    myDate.getDate();      //获取当前日(1-31)  
    myDate.getDay();        //获取当前星期X(0-6,0代表星期天)  
    myDate.getTime();      //获取当前时间(从1970.1.1开始的毫秒数)  
    myDate.getHours();      //获取当前小时数(0-23)  
    myDate.getMinutes();    //获取当前分钟数(0-59)  
    myDate.getSeconds();    //获取当前秒数(0-59)  
    myDate.getMilliseconds(); //获取当前毫秒数(0-999)  
    myDate.toLocaleDateString(); 
	var mytime=myDate.toLocaleDateString();
	//console.log('mytime:'+mytime);
	 //获取当前日期  
    //var mytime=myDate.toLocaleTimeString();    //获取当前时间  
    //myDate.toLocaleString();      //获取日期与时间----如果涉及到时分秒，直接使用即可。  
	var sql = "insert into myblog (newstitle,tagtype,newscontent,newspublishtime,newscomment,newspraise) values(?,?,?,?,?,?)";
	var params = [req.body.utitle,req.body.utag,req.body.ucontent,mytime,0,0];
	
	 conn.query(sql,params,function(err,result){
        if(err){
            console.log('[insert error:]'+err.message);
            return;
        }else{
			console.log("insertId"+result.insertId);
			var sql = "insert into comment (cconteent,blogid) values (?,?)"
			var params = ['',result.insertId];
			conn.query(sql,params,function(err,result){
				if(err){
					console.log('[insert comment error:]'+err.message);
				}else{
					res.render('AdminLTE/info',{info:'添加成功！'});
				}
			});
		}
    });
};

//删除
exports.doDelete = function(req, res){
	var sql = "delete from myblog where newsid=?";
	var params = [req.query.id];
	conn.query(sql,params,function(err,result){
		if(err){
            console.log('[delete error:]'+err.message);
            return;
        }
		if(result.affectedRows >0){
			res.render('AdminLTE/info',{info:'删除成功'});
		}
	});
	
};
//编辑
exports.edit = function(req, res){
	var results;
	conn.query('select *from tag',function(err,result){
		results = result;
	});
	conn.query('select *from myblog where newsid='+req.query.id,function(err,result){
        console.log("result"+result);
        res.render('AdminLTE/edit',{vo:result[0],list:results}); //加载模板
    });
	
	

};

//执行信息修改
exports.doEdit = function(req,res){
    var sql = "update myblog set newstitle=?,tagtype=?,newscontent=?,newspublishtime=? where newsid=?";
    var params = [req.body.ntitle,req.body.ntag,req.body.ncontent,'2018-11-11',req.body.nid];
    conn.query(sql,params,function(err,result){
        if(err){
            console.log('[update error:]'+err.message);
            return;
        }
        //(判断影响行数)
        if(result.affectedRows>0){
            res.render('AdminLTE/info',{info:'编辑成功！'});
        }else{
            res.render('AdminLTE/info',{info:'编辑失败！'});
        }
    });
};

//查看博客内容
exports.lookover = function(req,res){
	//var sql = "select *from myblog where id = ?";
	var params = [req.query.id];
	conn.query("select *from myblog where newsid = "+params,function(err,result){
		res.render('AdminLTE/blogcontent',{bg:result[0]});
	});
}

//点击数据找到当前博客的评论
exports.findComment = function(req,res){
	//var sql = "select *from comment where id=?";
	//var params = [req.query.id];
	conn.query("select commentid , cconteent, newsid, newstitle from comment,myblog where comment.blogid = myblog.newsid and myblog.newsid="+req.query.id,function(err,result){
		 res.render('AdminLTE/commenttable',{list:result});
	})
}

/*------------------评论模块------------------------*/

//浏览所有评论
exports.findAllComment = function(req,res){
	conn.query("select commentid , cconteent, newsid, newstitle from comment,myblog where comment.blogid = myblog.newsid",function(err,result){
		 res.render('AdminLTE/commenttable',{list:result});
		//for(var i =0; i < result.length;i++){
			// str = JSON.stringify(result[i]);
			// var obj = JSON.parse(str);
			// console.log("result"+i+":"+"commentid："+obj.commentid+"cconteent："+obj.cconteent+"newstitle："+obj.newstitle+"blogid："+obj.blogid);
			// conn.query("select newstitle from myblog where id="+obj.blogid,function(err,result){
			///	 res.render('AdminLTE/blogcontent',{title:result});
			// });
		//}
	})
}
//删除评论
exports.doCommentDelete = function(req,res){
	var sql = "delete from comment where commentid=?";
	var params = [req.query.id];
	conn.query(sql,params,function(err,result){
		if(err){
            console.log('[delete error:]'+err.message);
            return;
        }
		if(result.affectedRows >0){
			res.render('AdminLTE/info',{info:'成功删除评论'});
		}
	});
}

/*------------------标签模块------------------------*/

//查找所有标签
exports.findAllTag = function(req,res){
	conn.query('select *from tag',function(err,result){
		res.render('AdminLTE/tagtable',{list:result});
	});
	
}
//删除标签
exports.doTagDelete = function(req,res){
	var sql = "delete from tag where tagid =?";
	var params = [req.query.id];
	conn.query(sql,params,function(err,result){
		if(err){
            console.log('[delete error:]'+err.message);
            return;
        }
		if(result.affectedRows > 0){
			res.render('AdminLTE/info',{info:'成功删除标签'});
		}
	});
}


//添加
exports.tagAdd = function(req, res){
	res.render('AdminLTE/addtagtable');
};

//添加标签
exports.doTagAdd = function(req,res){
	var sql = "insert into tag (tagname,tagstate,tagaddtime) values(?,?,?)"
	var params = [req.body.tagname,req.body.tagstate,req.body.tagaddtime];
	
	 conn.query(sql,params,function(err,result){
        if(err){
            console.log('[insert error:]'+err.message);
            return;
        }
        //result.affectedRows(影响行数)
        if(result.insertId>0){
            res.render('AdminLTE/info',{info:'添加标签成功！'});
        }else{
            res.render('AdminLTE/info',{info:'添加标签失败！'});
        }
    });
}


//编辑标签
exports.editTag = function(req, res){
	conn.query('select *from tag where tagid='+req.query.id,function(err,result){
       // console.log("result"+result);
        res.render('AdminLTE/edittagtable',{rs:result[0]}); //加载模板
    });

};

//执行标签修改
exports.doTagEdit = function(req,res){
    var sql = "update tag set tagname=?,tagstate=?,tagaddtime=? where tagid=?";
    var params = [req.body.tagname,req.body.tagstate,req.body.tagaddtime,req.body.tagid];
    conn.query(sql,params,function(err,result){
        if(err){
            console.log('[update error:]'+err.message);
            return;
        }
        //(判断影响行数)
        if(result.affectedRows>0){
            res.render('AdminLTE/info',{info:'编辑标签成功！'});
        }else{
            res.render('AdminLTE/info',{info:'编辑标签失败！'});
        }
    });
};
/*--------------------用户管理模块-------------------*/

//查找所有标签
exports.findAllUser = function(req,res){
	conn.query('select *from bloguser',function(err,result){
		res.render('AdminLTE/userinfo',{list:result});
	});
	
}
