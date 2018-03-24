define(() => {
	'use strict';

	return class RandomTrichoplax {
		constructor(seed) {
			this.stateArray = new Uint32Array(1)
			this.stateArray[0] = seed;
			// this.callCount = 0;
			// this.id = seed;
		}
		
		static makeRandomSeed() {
			const buffer = new Uint32Array(1);
			crypto.getRandomValues(buffer);
			return buffer[0];
		}
		next(range = 0x100000000) { // https://en.wikipedia.org/wiki/Xorshift
			// if (!console.x) {
			// 	console.x = {y:0};
			// 	console.log([console.x]);
			// }
			// console.x[this.id] = ++this.callCount;
			// console.x.y++;
		  this.stateArray[0] ^= this.stateArray[0] << 13
		  this.stateArray[0] ^= this.stateArray[0] >> 17
		  this.stateArray[0] ^= this.stateArray[0] << 5
		  return this.stateArray[0] % range
		}
		shuffle(array) {
			for (var i=0; i<array.length-1; i++) {  // No need to consider last element of array as it would only ever be swapped with itself.
				var target = this.next(array.length - i) + i;
				var temp = array[i];
				array[i] = array[target];
				array[target] = temp;
			}
		}
	};
});