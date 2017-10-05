var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
app.listen(3000);

var pg = require('pg');
var config = {
  user: 'postgres',
  database: 'chucmunggiangsinh',
  password: 'root',
  host: 'localhost',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
};
//ket noi den csdl
var pool = new pg.Pool(config);
var bodyParser = require('body-parser');
// nhan du lieu tu port tra ve
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var multer  = require('multer');
// cau hinh duong dan upload file
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/upload')
  },
  filename: function (req, file, cb) {
    // hien thi ten file goc
    cb(null, file.originalname)
  }
})

var upload = multer({ storage: storage }).single('uploadfile')
app.get("/", function(req, res){
  pool.connect(function(err, client, done){
    if(err){
      return console.error('error fetching client fromt pool', err);
    }
    client.query('select * from video', function(err, result){
      done();
      if(err){
        res.end();
        return console.error('error running query', err);
      }
      res.render("home",{data:result});
    });
  });

});

app.get("/video/list", function(req, res){
  pool.connect(function(err, client, done){
    if(err){
      return console.error('error fetching client fromt pool', err);
    }
    client.query('select * from video', function(err, result){
      done();
      if(err){
        res.end();
        return console.error('error running query', err);
      }
      res.render("list",{data:result});
    });
  });
});

app.get("/video/delete/:id", function(req, res){
  //res.send(req.params.id);
  pool.connect(function(err, client, done){
    if(err){
      return console.error('error fetching client fromt pool', err);
    }
    client.query('delete from video where id ='+req.params.id, function(err, result){
      done();
      if(err){
        res.end();
        return console.error('error running query', err);
      }
      res.redirect("../list");
    });
  });
})

app.get('/video/add', function(req, res){
  res.render("add");
});

app.post('/video/add', urlencodedParser, function(req, res){
  upload(req, res, function (err) {
    if (err) {
      res.send('loi');
    } else {
      if (req.file == undefined) {
        res.send("file chua duoc chon");
      } else {
        // res.send("ok");
        // console.log(req.body);
        pool.connect(function(err, client, done){
          if(err){
            return console.error('error fetching client fromt pool', err);
          }
          var sql = "insert into video (title, mota, key, image) values ('"+req.body.title+"','"+req.body.title+"','"+req.body.key+"','"+req.file.originalname+"')";
          client.query(sql, function(err, result){
            done();

            if(err){
              res.end();
              return console.error('error running query', err);
            }
            res.redirect("./list");
          });
        });
      }

    }

  })

});

app.get('/video/edit/:id', function(req, res){
  var id = req.params.id;
  pool.connect(function(err, client, done){
    if(err){
      return console.error('error fetching client fromt pool', err);
    }
    client.query('SELECT * FROM video WHERE id='+id, function(err, result){
      done();
      if(err){
        res.end();
        return console.error('error running query', err);
      }
      res.render("edit",{data:result.rows[0]});
    });
  });
});

app.post('/video/edit/:id', urlencodedParser, function(req, res){
  var id = req.params.id;
  upload(req, res, function(err){
    if (err) {
      res.send('Xay ra loi trong qua trinh upload');
    } else{
      if (typeof(req.file) == 'undefined') {
        pool.connect(function(err, client, done){
          if(err){
            return console.error('error fetching client fromt pool', err);
          }
          client.query("UPDATE video set title ='"+req.body.title+"', mota='"+req.body.mota+"',key='"+req.body.key+"' WHERE id="+id, function(err, result){
            done();
            if(err){
              res.end();
              return console.error('error running query', err);
            }
            res.redirect("../list");
          });
        });
      }
      else{
        pool.connect(function(err, client, done){
          if(err){
            return console.error('error fetching client fromt pool', err);
          }
          client.query("UPDATE video set title ='"+req.body.title+"', mota='"+req.body.mota+"',key='"+req.body.key+"', image='"+req.file.originalname+"' WHERE id="+id, function(err, result){
            done();
            if(err){
              res.end();
              return console.error('error running query', err);
            }
            res.redirect("../list");
          });
        });
      }
    }
  });
})
