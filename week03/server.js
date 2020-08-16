const http = require('http');

http.createServer((request, response)=>{
    let body = [];
    request.on('error', (err)=>{
        console.error('err',err);
    }).on('data', (chunk)=>{
        console.log('on=>',chunk)
        // body.push(chunk.toString());
        body.push(Buffer.from(chunk));

    }).on('end', ()=>{
        console.log('end=>',body)
        body = Buffer.concat(body).toString();
        console.log('body',body);
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(
`<html maaa=a>
<head>
    <style>
body div #myid{
    width:100px;
    background-color:#ff5000;
}
body div img{
    width:30px;
    background-color:#ff1111;
}
    </style>
</head>
<body>
    <div>
        <img id='myid' />
        <img />
        Hello world
    </div>
</body>
</html>\n`);
        
    })
}).listen(8088);
console.log('server started');