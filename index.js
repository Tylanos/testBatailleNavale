const express = require("express");
const http = require('http');
const socketio = require('socket.io');

const bodyParser = require('body-parser');
const cors = require('cors');

class Server{
 
    constructor(){
        this.port =  process.env.PORT || 8000;
        this.host = `localhost`;
        this.app = express();
        this.http = http.Server(this.app);
        this.socket = socketio(this.http);
        this.joueurs = [];
    }
 
    appConfig(){        
        this.app.use(
            bodyParser.json()
        );
        this.app.use(
            cors()
        );
    }

    /* Including app Routes ends*/  
 
    appExecute(){
 
        this.appConfig();

        this.socket.on('connection', (socketEnCours) => {
            socketEnCours.monId = 0;
            if (this.joueurs.length > 0) {
                let joueur0Existe = false;
                let joueur1Existe = false;
                this.joueurs.forEach(element => {
                    if (element.id >= socketEnCours.monId) {
                        socketEnCours.monId = (element.id + 1);
                    }
                    if (element.id === 0) {
                        joueur0Existe = true;
                    } else if (element.id === 1) {
                        joueur1Existe = true;
                    }
                });
                if (joueur0Existe === false) {
                    socketEnCours.monId = 0;
                } else if (joueur1Existe === false) {
                    socketEnCours.monId = 1;
                }
            }
            let nouveauJoueur = {id: socketEnCours.monId, score: 0};
            console.log('nouvel utilisateur connecté : ', nouveauJoueur.id, nouveauJoueur.score);
            this.joueurs.push(nouveauJoueur);
            console.log('nombre de joueur : ' + this.joueurs.length);
            
            this.socket.emit('gameData', {id: socketEnCours.monId, joueurs: this.joueurs});

            socketEnCours.on('message', (msg) => {
                this.socket.emit('message', msg);
              });

            socketEnCours.on('gameData', (data) => {
                // this.nombreJoueurs = data;
                this.socket.emit('gameData', {id: this.joueurs.length, joueurs: this.joueurs});
            });

            socketEnCours.on('boards', (boardsData) => {
                this.socket.emit('boards', boardsData);
            });

            socketEnCours.on('disconnect', () => {
                console.log('user disconnected');
                console.log('liste joueurs avant disconect : ' + this.joueurs.length);
                this.joueurs = this.joueurs.filter((joueur) => joueur.id !== socketEnCours.monId);
                console.log('liste joueurs apres disconect : ' + this.joueurs.length);
              });
        });
 
        this.http.listen(this.port, this.host, () => {
            console.log(`Listening on http://${this.host}:${this.port}`);
        });
    }
 
}
 
const app = new Server();
app.appExecute();
