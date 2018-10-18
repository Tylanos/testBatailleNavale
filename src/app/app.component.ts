// import needed classes and services
import { Component, OnInit, DoCheck } from '@angular/core';
import { ToastaService, ToastOptions } from 'ngx-toasta';
import { BoardService } from './board.service';
import { Board } from './board';
import { WebsocketService } from './websocket.service';
import { Observable, Subject, Observer, PartialObserver } from 'rxjs';
import { GameData, BoardsData } from './game-data';


// set game constants
const NUM_PLAYERS = 2;
const BOARD_SIZE = 6;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [BoardService, WebsocketService]
})

export class AppComponent implements OnInit, DoCheck {
  messages: string[] = [];
  canPlay = true;
  player = -1;
  players = 0;
  gameId: string;
  gameUrl: string = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
  validPlayer: boolean;

  constructor(
    private toastr: ToastaService,
    private boardService: BoardService,
    private webSockServ: WebsocketService
  ) {
    this.createBoards();
  }

  buildToastOptions(title: string, msg: string): ToastOptions {
    return {
      title: title,
      msg: msg,
      showClose: false,
      timeout: 5000,
      theme: 'default'
    };
  }

  // event handler for click event on
  // each tile - fires torpedo at selected tile
  fireTorpedo(e: any): AppComponent {
    const id = e.target.id,
      boardId = id.substring(1, 2),
      row = id.substring(2, 3), col = id.substring(3, 4),
      tile = this.boards[boardId].tiles[row][col];
    if (!this.checkValidHit(boardId, tile)) {
      return;
    }

    if (tile.value === 1) {
      this.toastr.success(this.buildToastOptions('You got this.', 'HURRAAA! YOU SANK A SHIP!'));
      this.boards[boardId].tiles[row][col].status = 'win';
      this.boards[this.player].player.score++;
    } else {
      this.toastr.info(this.buildToastOptions('Keep trying.', 'OOPS! YOU MISSED THIS TIME'));
      this.boards[boardId].tiles[row][col].status = 'fail';
    }
    this.canPlay = false;
    this.boards[boardId].tiles[row][col].used = true;
    this.boards[boardId].tiles[row][col].value = 'X';
    this.webSockServ.sendBoards(this.boards, this.player);
    return this;
  }

  checkValidHit(boardId: number, tile: any): boolean {
    if (boardId === this.player) {
      this.toastr.error(this.buildToastOptions('Don\'t commit suicide.', 'You can\'t hit your own board.'));
      return false;
    }
    if (this.winner) {
      this.toastr.error('Game is over');
      return false;
    }
    if (!this.canPlay) {
      this.toastr.error(this.buildToastOptions('A bit too eager.', 'It\'s not your turn to play.'));
      return false;
    }
    if (tile.value === 'X') {
      this.toastr.error(this.buildToastOptions('Don\'t waste your torpedos.', 'You already shot here.'));
      return false;
    }
    return true;
  }

  createBoards(): AppComponent {
    for (let i = 0; i < NUM_PLAYERS; i++) {
      this.boardService.createBoard(BOARD_SIZE);
    }
    return this;
  }

  // winner property to determine if a user has won the game.
  // once a user gets a score higher than the size of the game
  // board, he has won.
  get winner(): Board {
    return this.boards.find(board => board.player.score >= BOARD_SIZE);
  }

  // get all boards and assign to boards property
  get boards(): Board[] {
    return this.boardService.getBoards();
  }

  ngOnInit() {
    this.webSockServ.connexion();
    this.webSockServ.subscription('gameData').subscribe((gameData: GameData) => {
      this.players = gameData.joueurs.length;
      if (this.player === -1 && gameData.id != null) {
        this.player = gameData.id;
        this.canPlay = this.player % 2 === 1 ? true : false;
      }
      if (this.players === 2) {
        this.validPlayer = true;
      }
    });
    this.webSockServ.subscription('boards').subscribe((boardsData: BoardsData) => {
      this.boardService.boards = boardsData.boards;
      if (this.player !== boardsData.id) {
        this.canPlay = true;
      }
    });
  }

  ngDoCheck(): void {
    console.log(this.player);
  }

}
