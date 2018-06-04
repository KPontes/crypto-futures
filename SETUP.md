npm init
npm install --save express lodash nodemon

package.json, permite rodar npm run start ou npm run dev

"scripts": {
"start": "node index.js",
"dev": "nodemon index.js"
},

still on the server directory:
$ sudo npm install -g create-react-app

Precisei alterar a rede config da VM para NAT antes de executar:
$ create-react-app client

Após executar o comando, retornei para Bridged Adapter
Now, on dev environment, we have a server on port 5000 for server side and a server on port 3000 for client side.

Ir para a pasta server.
Alterar package.json no Server, para permitir executar ambos os servidores simultaneamente (npm run dev):
"scripts": {
"start": "node index.js",
"server": "nodemon index.js",
"client": "npm run start --prefix client",
"dev": "concurrently \"npm run server\" \"npm run client\""
},

npm install --save concurrently

Para, a partir do Client, colocar somente a path relativa a href="/auth/google", ao visitar uma página (url) do server que não seja simples JSON request.
Exemplo: Gostaria de acessar em dev http://localhost:5000/auth/google , mas em produção seria algo como http://herokuapp.com/auth/google

Alterar package.json no Client
"private": true,
"proxy": {
"/auth/google": {
"target": "http://localhost:5000"
},

At the Client:
npm install --save redux react-redux react-router-dom@4.2.2

Other installed packages:
@axetroy/react-download crypto-js react-simple-file-input moment react-bootstrap
validator heroku-ssl-redirect react-browser-detection axios react-number-format

jest on the client
