const http =  require('http');

http.createServer((request, response) => {
    let body = [];
    console.log('headers:'); 
    console.dir(request.headers);

    console.log('\nmethod:'); 
    console.dir(request.method);
    debugger;
    request.on('error', (err) => {
        console.error(err);
    }).on('data', (chunk) => {
        console.log(`chunk is a kind of ${chunk.constructor.name}`); 
        // body.push(Buffer.from(chunk)); // correct
        // body.push(chunk.toString());   // wrong
        body.push(chunk);                 // correct
        console.log("Before concat() and toString(), body: ");
        console.dir(body);
    }).on('end', () =>{
        body = Buffer.concat(body).toString();
        console.log("body: ", body);
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(
`<html maaa=a >
    <head>
        <style>
body div #myid{
    width: 100px;
    background-color: #ff5000;
}
body div img{
    width: 30px;
    background-color: #ff1111;
}
img{
    color: red;
}
        </style>
    </head>
    <body>
        <div class="a">
            <img id="myid"/>
        </div>
    </body>
</html>`);
    });
}).listen(8088);

console.log("server started");