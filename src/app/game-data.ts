import { Player } from './player';
import { Board } from './board';

export class GameData {
  id: number;
  joueurs: Player[];
  boards?: Board[];

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class BoardsData {
  id: number;
  boards: Board[];

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
