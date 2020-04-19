var express = require("express");
var mysql = require('mysql');
var app = express();
app.use(express.static('public'));
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
                'and l9_quotes.authorId=' + req.params.aid + ';'
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







app.get('*', function(req, res){
    res.render('error');
});

app.listen(process.env.PORT || 3000, function(){
    console.log('Server has started');
})