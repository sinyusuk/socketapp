const express = require('express');
const socket = require('socket.io');
const http = require('http');
const app = express();
const fs = require('fs');
//const port 
/*익스프레스 http서버 생성*/
const server = http.createServer(app)
/*생성된 서버를 socket.io에 묶음*/
const io = socket(server);

app.use('/css', express.static('./static/css'))
app.use('/js', express.static('./static/js'))

/* Get 방식으로 / 경로에 접속하면 실행 됨 */
app.get('/', function(request, response) {
  fs.readFile('./static/index.html', function(err, data) {
    if(err) {
      response.send('에러')
    } else {
      response.writeHead(200, {'Content-Type':'text/html'})
      response.write(data)
      response.end()
    }
  })
})

io.sockets.on('connection',function(socket){
    /*새로운 유저가 접속할때 이벤트 발생 */
    socket.on('newUser',function(name){
        console.log(name+'is Connected!')
        /*소켓에 이름 저장 */
        socket.name = name;
        /*모든 소켓에 전송 */
        io.sockets.emit('update',{
            type:'connect',
            name:'SERVER',
            message:name+'is Connected!'
        })
    })

    socket.on('message',function(data){
        /*받은 데이터에 누가 보냈는지 이름을 추가 */
        data.name = socket.name;
        console.log(data);
        /*보낸 사람을 제외한 나머지 유저에게 메시지 전송 */
        /*io.sockets.emit() = 모든 유저(본인 포함) */
        socket.broadcast.emit('update',data);

    })

    socket.on('disconnect',function(){
        console.log(socket.name + "is Disconnected!");

        /*자신을 제외한 모두에게 메시지 전송 */
        socket.broadcast.emit('update',{
            type:'disconnect',
            name:"SERVER",
            message:socket.name + "is Disconnected!"
        });
    })
})


/*서버를 80번 포트로 listen*/
server.listen(80,function(){
    console.log("Server Ready!");
})