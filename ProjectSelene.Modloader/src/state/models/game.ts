export type GameInfo =
	| {
			id: number;
			type: 'handle';
			loaded: boolean;
	  }
	| {
			id: number;
			type: 'fs';
			path: string;
			loaded: boolean;
	  }
	| {
			id: number;
			type: 'filelist';
			loaded: boolean;
	  };

export enum GameState {
	/** The user needs to click a button before we can do anything. */
	PROMPT,
	/** The game is ready and installed mods have been read to run but nothing has been done yet. */
	READY,
	/** We are currently reading game metadata */
	OPENING,
	/** The game files are being read, mounted and transformed before we can launch the game.  */
	LOADING,
	/** The game has been launched. The game itself may still be running it's own startup logic. */
	PLAYING,
}
