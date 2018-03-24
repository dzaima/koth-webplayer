define(['math/RandomTrichoplax'], (RandomTrichoplax) => {
	'use strict';

	return (GameManager) => {
		let game = null;
		let time0 = null;

		function sendState(pauseTriggered = false) {
			const now = Date.now();
			const state = game.getState();
			self.postMessage({
				action: 'STEP_COMPLETE',
				state: Object.assign({}, state, {
					realWorldTime: now - time0,
				}),
				pauseTriggered,
			});
		}

		function begin(config) {
			if(game) {
				throw new Error('Cannot re-use game worker');
			}
			time0 = Date.now();
			game = new GameManager(new RandomTrichoplax(+config.seed.substring(1)), config);
			sendState();
		}

		function step({maxTime, steps, type, skip, skipFrame}) {
			const limit = maxTime ? (Date.now() + maxTime) : 0;
			try {
				for(let i = 0; (steps < 0 || i < steps) && !game.isOver() && (!skip || skipFrame>game.getState().frame); ++ i) {
					game.step(type);
					if(limit && Date.now() >= limit) {
						break;
					}
				}
				sendState();
			} catch(e) {
				if(e === 'PAUSE') {
					sendState(true);
				} else {
					throw e;
				}
			}
		}

		self.addEventListener('message', (event) => {
			const data = event.data;

			switch(data.action) {
			case 'BEGIN':
				begin(data.config);
				break;

			case 'STEP':
				step(data);
				break;

			case 'UPDATE_CONFIG':
				game.updateConfig(data.config);
				break;

			case 'UPDATE_ENTRY':
				game.updateEntry(data.entry);
				break;
			}
		});
	};
});
