import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable, Subject, Observer, PartialObserver } from 'rxjs';
import { environment } from '../environments/environment';
import { Socket } from 'socket.io';
import { Board } from './board';
import { BoardsData } from './game-data';

@Injectable()
export class WebsocketService {

  // Our socket connection
  private socket: Socket;
  private monObservable: Observable<any>;
  private sujet: Subject<any> = new Subject<any>();

  constructor() {
  }

  public connexion() {
    this.socket = io(environment.ws_url);
  }

  public subscription(typeEvent: string): Observable<any> {
    return new Observable<String>((obs) => {
      this.socket.on(typeEvent, (data) => {
        console.log('data reçu : ' + data);
        obs.next(data);
        return () => {
          console.log('disconect');
          this.socket.disconnect();
        };
      });
    });
  }

  public sendBoards(boards: Board[], id: number) {
    const boardData = new BoardsData;
    boardData.boards = boards;
    boardData.id = id;
    console.log(this.socket);
    this.socket.emit('boards', boardData);
  }


  // public onEvent(event: Event): Observable<any> {
  //   return new Observable<Event>((obs) => {
  //     this.socket.on(event, () => {
  //       obs.next();
  //       return () => {
  //         console.log('disconect');
  //         this.socket.disconnect();
  //       };
  //     });
  //   });
  // }

}
