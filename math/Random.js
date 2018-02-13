define(() => {
	'use strict';

	// xorshift+ 64-bit random generator
	// https://en.wikipedia.org/wiki/Xorshift

	const CHARS_PER_INT = 5;
	const BASE = (
		'0123456789' +
		'abcdefghij' +
		'klmnopqrst' +
		'uvwxyzABCD' +
		'EFGHIJKLMN' +
		'OPQRSTUVWX' +
		'YZ\u03B1\u03B2\u03B3\u03B4\u03B5\u03B6\u03B7\u03B8' +
		'\u03B9\u03BA\u03BB\u03BC\u03BD\u03BE\u03BF\u03C0\u03C1\u03C3' +
		'\u03C4\u03C5\u03C6\u03C7\u03C8'
	);

	const SEED_LENGTH = CHARS_PER_INT * 4;

	function readEncoded(s) {
		let r = 0;
		for(let i = 0; i < s.length; ++ i) {
			r = (r * BASE.length) + BASE.indexOf(s.substr(i, 1));
		}
		return r;
	}

	function makeEncoded(v, l) {
		let r = '';
		let x = v;
		for(let i = 0; i < l; ++ i) {
			r = BASE[x % BASE.length] + r;
			x = Math.floor(x / BASE.length);
		}
		return r;
	}

	return class Random {
		constructor(seed) {
			this.stateArray = new Uint32Array(1)
			this.s = new Uint32Array(8);
			this.seed(seed);
			
			// this.stateArray[0] = +(seed.substring(1))
		}

		seed(seed) {
			if(typeof seed === 'object') {
				seed = seed.makeRandomSeed();
			} else if((typeof seed) !== 'string') {
				seed = seed.toString();
			} else if(seed.length > SEED_LENGTH) {
				seed = seed.substr(seed.length - SEED_LENGTH);
			}
			for(let i = 0; i < 4; ++ i) {
				this.s[i] = readEncoded(seed.substr(i * CHARS_PER_INT, CHARS_PER_INT));
			}
		}

		save() {
//			this.s.copyWithin(4, 0, 4);
			for(let i = 0; i < 4; ++ i) { // WORKAROUND (Safari)
				this.s[i + 4] = this.s[i];
			}
		}

		rollback() {
//			this.s.copyWithin(0, 4, 4);
			for(let i = 0; i < 4; ++ i) { // WORKAROUND (Safari)
				this.s[i] = this.s[i + 4];
			}
		}
		
		
		next(range = 0x100000000) {
			/* jshint -W016 */ // bit-operations are part of the algorithm
			if (true) { // change this to false to enable trichoplax's seed system
				let x0 = this.s[0];
				let x1 = this.s[1];
				const y0 = this.s[2];
				const y1 = this.s[3];
				this.s[0] = y0;
				this.s[1] = y1;
				x0 ^= (x0 << 23) | (x1 >>> 9);
				x1 ^= (x1 << 23);
				this.s[2] = x0 ^ y0 ^ (x0 >>> 17) ^ (y0 >>> 26);
				this.s[3] = x1 ^ y1 ^ (x0 << 15 | x1 >>> 17) ^ (y0 << 6 | y1 >>> 26);
				return ((this.s[3] + y1) >>> 0) % range;
			} else {
				this.stateArray[0] ^= this.stateArray[0] << 13
				this.stateArray[0] ^= this.stateArray[0] >> 17
				this.stateArray[0] ^= this.stateArray[0] << 5
				return this.stateArray[0] % range
			}
		}

		intGenerator(range = 0x100000000) {
			return this.next.bind(this, range);
		}

		nextFloat(range = 1) {
			return (this.next(0x100000000) / 0x100000000) * range;
		}

		floatGenerator(range = 1) {
			return this.nextFloat.bind(this, range);
		}

		makeRandomSeed() {
			let s = '';
			for(let i = 0; i < 4; ++ i) {
				s += makeEncoded(this.next(0x100000000), CHARS_PER_INT);
			}
			return s;
		}

		static makeRandomSeed() {
			const buffer = new Uint32Array(4);
			crypto.getRandomValues(buffer);
			let s = '';
			for(let i = 0; i < 4; ++ i) {
				s += makeEncoded(buffer[i], CHARS_PER_INT);
			}
			return s;
		}
	};
});
