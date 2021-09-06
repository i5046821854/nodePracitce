var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var tmplt = require('../lib/tmplt.js');
var path = require('path');
var san = require('sanitize-html');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var title = queryData.id;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
        if(title === undefined)
          {
            var title = "welcome";
            var data = "hello world"
            var dir = './data'
            fs.readdir(dir,function(err,list)
            {
              var realist = tmplt.LIST(list);
              var template = tmplt.HTML(title,realist,`<h2>${title}</h2>${data}`,`<a href="/create">create</a>`);
              response.writeHead(200);
              response.end(template);
            })
          }
    else {
      var parsedId = path.parse(title).base;
      fs.readFile(`./data/${parsedId}`,'utf8',function(err,data){
        var dir = './data'
        fs.readdir(dir,function(err,list)
        {
          var realist = tmplt.LIST(list);
          var template = tmplt.HTML(title,realist,`<h2>${title}</h2>${data}`,`<a href="/create">create</a> <a href = "/update?id=${title}">update</a>
          <form action="/delete_process" method="post"><input type="hidden" name='id' value="${title}"></input><input type="submit" value="delete">`);
          response.writeHead(200);
          response.end(template);
        })
     }
  )
}
}else if(pathname === '/create')
{
  var title = "WEB-create";
  var dir = './data'
  fs.readdir(dir,function(err,list)
  {
    var realist = tmplt.LIST(list);
    var template = tmplt.HTML(title,realist,`<form action="http://localhost:3000/create_process" method = "post">
    <p><input type='text' name="title" placeholder = "title"></p>
    <p><textarea name="description" placeholder = "description"></textarea></p>
    <p><input type='submit'></p>
     `,'');
    response.writeHead(200);
    response.end(template);
  })

}else if(pathname === '/create_process')
{
  var body = '';
  request.on('data',function(data){
    body = body + data;
  });
  request.on('end',function(){
    var post = qs.parse(body);
    var title = post.title;
    var santitle = san(title);
    var description = post.description;
    var sandescription = san(description);
    fs.writeFile(`data/${santitle}`,sandescription,'utf8', function(err){ //make file
      response.writeHead(302,{Location: `/?id=${santitle}`}); //redirection
      response.end();
      })

    });
}
else if(pathname === '/update')
{
  var parsedId = path.parse(title).base;
  fs.readFile(`data/${parsedId}`,'utf8',function(err,data){
    var dir = './data'
    fs.readdir(dir,function(err,list)
    {
      var realist = tmplt.LIST(list);
      var template = tmplt.HTML(title,realist,`<form action="/update_process" method = "post">
      <p><input type='hidden' name="id" value="${title}"></p>
      <p><input type='text' name="title" value="${title}" placeholder = "title"></p>
      <p><textarea name="description" placeholder = "description">${data}</textarea></p>
      <p><input type='submit'></p>
       `,'');
       response.writeHead(200);
      response.end(template);
    })
 }
)
}
else if(pathname === `/update_process`){

    var body = '';
    request.on('data',function(data){
      body = body + data;
    });
    request.on('end',function(){
      var post = qs.parse(body);
      var title = post.title;
      var santitle = san(title);
      var description = post.description;
      var sandescription = san(description);
      var id = post.id;
      fs.rename(`data/${id}`,`data/${santitle}`,function(error){
        fs.writeFile(`data/${santitle}`,sandescription,'utf8', function(err){ //make file
          response.writeHead(302,{Location: `/?id=${title}`}); //redirection
          response.end();
        });
      });
      });
}
else if(pathname === `/delete_process`){

  var body = '';
  request.on('data',function(data){
    body = body + data;
  });
  request.on('end',function(){
    var post = qs.parse(body);
    var id = post.id;
    var parsedId = path.parse(id).base;
    fs.unlink(`data/${parsedId}`,function(err){
        response.writeHead(302,{Location: `/`});
        response.end();
      });
    });
}
else{
  response.writeHead(404);
  response.end("Not found");
}

});
app.listen(3000);
