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
        response.end('Hello world\n');
        
    })
}).listen(8088);
console.log('server started');