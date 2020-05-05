var express = require("express");
var mysql = require('mysql');
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

/*configure mysql database*/
/*configutr connection to connect to database*/
const connection = mysql.createConnection({
   host: 'un0jueuv2mam78uv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
   user: 'cvh7c80odxa3842y',
   password: 'rdjpaec6bxtfpfeo',
   database: 'kdeq32oratldp6w6'
});

connection.connect();


app.get('/', function(req, res){
    res.render('home');
});

app.get('/admin', function(re, res){
    var stmt = 'SELECT * FROM l9_author;';
    console.log(stmt);
    var authors = null;
    connection.query(stmt, function(error, result){
       if(error) throw error;
       if(result.length){
           authors = result;
       }
       
       res.render('admin', {authors: authors});
    });
    
    //res.render('admin');
});

app.get('/author/new', function(req, res){
    //console.log(req.body);
    res.render('addAuthor');
});

app.post('/author/new', function(req, res){
   console.log(req.body);
   let body = req.body; 
   connection.query('SELECT COUNT(*) FROM l9_author;', function(error, result){
       if(error) throw error;
       if(result.length){
            var authorId = result[0]['COUNT(*)'] + 2;
            var stmt = `INSERT INTO l9_author
                        (authorId, firstName, lastName, dob, dod, sex, profession, country, portrait, biography)
                        VALUES ('${authorId}', '${body.firstname}', '${body.lastname}', '${body.dob}', '${body.dod}', '${body.sex}', '${body.profession}', '${body.country}', '${body.portrait}', '${body.biography}')`;
            
            /*var stmt = 'INSERT INTO l9_author ' +
                      '(authorId, firstName, lastName, dob, dod, sex, profession, country, portrait, biography) '+
                      'VALUES ' +
                      '(' + 
                       authorId + ',"' +
                       req.body.firstname + '","' +
                       req.body.lastname + '","' +
                       req.body.dob + '","' +
                       req.body.dod + '","' +
                       req.body.sex + '","' +
                       req.body.profession + '","' +
                       req.body.country + '","' +
                       req.body.portrait + '","' +
                       req.body.biography + '"' +
                       ');';*/
            console.log("stmt: " + stmt);
            connection.query(stmt, function(error, result){
                if(error) throw error;
                res.redirect('/admin');
            })
       }
   });
});

app.get('/author', function(req, res){
    var firstName = req.query.firstname;
    var lastName =  req.query.lastname;
    var stmt = 'select *' + 
    'from l9_author ' + 
    'where firstName=\'' + firstName +'\'' + 
    ' and lastName=\'' + lastName + '\';';
   
   connection.query(stmt, function(error, found){
       var author = null;
      if(error) throw error;
      if(found.length){
          author = found[0];
          author.dob = author.dob.toString().split(' ').slice(0,4).join(' ');
          author.dod = author.dod.toString().split(' ').slice(0,4).join(' ');
      }
      res.render('author', {author: author});
   });
});



app.get('/author/:aid', function(req, res){
    
    var stmt = 'select quote, firstName, lastName '+
                'from l9_quotes, l9_author '+
                'where l9_quotes.authorId=l9_author.authorId '+
                'and l9_quotes.authorId=' + req.params.aid + ';';
    connection.query(stmt, function(error, found){
        if(error) throw error;
        if(found.length){
            var name = found[0].firstName + ' ' + found[0].lastName;
            res.render('quotes', {name: name, quotes: found});
        }
    });
    
});


//search by keyword
app.get('/keyword', function(req,res){
    var stmt = 'select quote, firstName, lastName '+
                'from l9_quotes, l9_author '+
                'where l9_quotes.authorId=l9_author.authorId '+
                'and quote like\'%' + req.query.keyword + '%\';';
    connection.query(stmt, function(error, found){
       if(error) throw error;
       if(found.length){
           var name = found[0].firstName + ' ' + found[0].lastName;
           res.render('quotes', {name: name, quotes: found});
       }
    });
});

//gender
app.get('/gender', function(req,res){
    var stmt = 'select quote, firstName, lastName '+
                'from l9_quotes, l9_author '+
                'where sex=\'' + req.query.gender + '\';';
    connection.query(stmt, function(error, found){
        if(error) throw error;
        if(found.length){
            var name = found[0].firstName + ' ' + found[0].lastName;
            res.render('quotes', {name:name, quotes: found});
        }
    });
});



/*/* Home Route 
app.get('/', function(req, res){
    var stmt = 'SELECT * FROM l9_author;';
    console.log(stmt);
    var authors = null;
    connection.query(stmt, function(error, results){
        if(error) throw error;
        if(results.length) authors = results;
        res.render('home', {authors: authors});
    });
});*/

app.get('/author/:aid/edit', function(req, res){
    var stmt = 'SELECT * FROM l9_author WHERE authorId=' + req.params.aid + ';';
    connection.query(stmt, function(error, results){
       if(error) throw error;
       if(results.length){
          
           var author = results[0];
           author.dob = author.dob.toISOString().split('T')[0];
           author.dod = author.dod.toISOString().split('T')[0];
           
           res.render('edit', {author: author});
       }
    });
    
});


/* Edit an author record - Update an author in DBMS */
app.put('/author/:aid', function(req, res){
    console.log(req.body);
    var stmt = 'UPDATE l9_author SET ' +
                                'firstName = "'+ req.body.firstname + '",' +
                                'lastName = "'+ req.body.lastname + '",' +
                                'dob = "'+ req.body.dob + '",' +
                                'dod = "'+ req.body.dod + '",' +
                                'sex = "'+ req.body.sex + '",' +
                                'profession = "'+ req.body.profession + '",' +
                                'portrait = "'+ req.body.portrait + '",' +
                                'country = "'+ req.body.country + '",' +
                                'biography = "'+ req.body.biography + '"' +
                                'WHERE authorId = ' + req.params.aid + ";";
    //console.log(stmt);
    connection.query(stmt, function(error, result){
        if(error) throw error;
        
        res.redirect('/admin');
    });
    
});


app.get('/author/:aid/delete', function(req, res){
    var stmt = 'DELETE from l9_author WHERE authorId='+ req.params.aid + ';';
    
    
    connection.query(stmt, function(error, result){
        if(error) throw error;
        
        res.redirect('/admin');
    });
});





app.get('*', function(req, res){
    res.render('error');
});

app.listen(process.env.PORT || 3000, function(){
    console.log('Server has started');
})