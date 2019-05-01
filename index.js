const crypto = require('crypto');

let initialTargetHash = "000000000000000000000000000000000ffffffffffffffffffffffffff";  //                  Integer: 20282409603651670423947251286015
let targetHashDelta = "fffffffffffffffffffffffff";      // Increase or decrease target by this value        Integer: 79228162514264337593543950335
let desiredHashRate = 1 / 5;                           // 1 Block every 5 seconds
let block_hash_length = 30;                             // Take only first 30 bytes of a SHA256 hash

// Create Genesis block
let genesisBlock = {
	index: 0,
	transactions: [],
	targetHash: initialTargetHash,
	timestamp: new Date().getTime(),
	nonce: 238199,
	prevHash: 'fffffffffffffffffffffffff',
	hash: '36a1517830a8a71a50cc619a4991ca5a1fef0289d82e8276e62a93263cb718f5',
};

// Initiate blockchain array with Genesis block
let blockchain = [genesisBlock];

class Block {
	/**
	 * Constructor of a new block
	 * @param index - Index of the block in the chain
	 * @param transactions - Array of transactions
	 * @param prevHash - Hash of the previous block in the chain
	 * @param targetHash - The target hash value set by the network
	 * @param timestamp - Time from epoch in milliseconds
	 * @param nonce - A random value added to achieve the required hash difficulty
	 */
	constructor(index, transactions, prevHash, targetHash, timestamp, nonce) {
		this.index = index;
		this.transactions = transactions;
		this.prevHash = prevHash;
		this.targetHash = targetHash;
		if (typeof timestamp === "undefined") {
			this.timestamp = new Date().getTime();
		}
		
		if (typeof nonce === "undefined") {
			this.nonce = 0;
		} else {
			this.nonce = nonce
		}
		
		this.hash = crypto.createHash('sha256').update(this.toString()).digest('hex').substring(0, block_hash_length);
	}
	
	/**
	 * Increase the nonce value by 1 and rehash the block
	 */
	updateNonce() {
		this.nonce += 1;
		let updatedBlock = new Block(this.index, this.transactions, this.prevHash, this.targetHash, this.timestamp, this.nonce);
		this.hash = updatedBlock.hash;
	}
	
	/**
	 * Return the block's JSON value has a string
	 * @returns {string} - the stringified value
	 */
	toString() {
		return JSON.stringify(this);
	}
}

/**
 * Subtract to hexadecimal numbers and return the sum as a hexadecimal number
 * @param firstNumber
 * @param secondNumber
 * @returns {string}
 */
let hexMultiplication = (firstNumber, secondNumber) => {
	return (parseInt(firstNumber, 16) * parseFloat(secondNumber)).toString(16);
};

/**
 * Get the target hash value for a block. This value is adjusted based on actual hash rate of last 2 blocks to inch closer to desired hash rate.
 * @param index - The index of current block
 * @returns {string|*} - Target value to be used in the block
 */
let calculateTargetHash = (index) => {
	
	// For the first 3 blocks, keep the target same as the Genesis block
	if (blockchain.length < 3) {
		return genesisBlock.targetHash;
	}
	
	let lastBlockTargetHash = blockchain[index - 1].targetHash;
	let lastBlockTime = blockchain[index - 1].timestamp;
	let blockBeforeLastBlockTime = blockchain[index - 2].timestamp;
	let actualHashRate = 1 / ((lastBlockTime - blockBeforeLastBlockTime) / 1000);
	console.log('Desired Hash Rate => ', desiredHashRate, '/sec, Actual Hash Rate => ', actualHashRate, '/sec');
	
	if (actualHashRate > desiredHashRate) {
		console.log('** Higher Hash Rate **, Decreasing Target Hash to ' + Math.round((desiredHashRate / actualHashRate) * 100) / 100 + '% of ' + lastBlockTargetHash);
		return hexMultiplication(lastBlockTargetHash, desiredHashRate / actualHashRate);
	} else if (actualHashRate < desiredHashRate) {
		console.log('** Lower Hash Rate **, Increasing Target Hash to ' + Math.round((desiredHashRate / actualHashRate) * 100) / 100 + '% of ' + lastBlockTargetHash);
		return hexMultiplication(lastBlockTargetHash, desiredHashRate / actualHashRate);
	} else
		return lastBlockTargetHash;
};

/**
 *  1. Calculate the new target value based on past network performance.
 *  2. Create a new block using hash of previous block and no nonce.
 *  3. Check if the Hash difficulty of this block less than the preset network difficulty?
 *  4. If not, update the nonce value and rehash the block till the difficulty is lower than network difficulty
 *  5. When found, return the block to be added to the chain
 *  @returns {Promise<any>} - New block found with hash lower than target hash
 */
let createBlock = () => {
	return new Promise((resolve) => {
		console.log('Mining block => ', blockchain.length);
		const newTargetHash = calculateTargetHash(blockchain.length);                                                            // Step 1
		console.log('New Target Hash => ' + newTargetHash);
		let newBlock = new Block(blockchain.length, [], blockchain[blockchain.length - 1].hash, newTargetHash);      // Step 2
		
		while (parseInt(newBlock.hash, 16) > parseInt(newTargetHash, 16)) {                                         // Step 3
			newBlock.updateNonce();                                                                                             // Step 4
		}
		resolve(newBlock);                                                                                                      // Step 5
	});
};

/**
 * Attempt to create a new block a second after the previous block.
 */
function main() {
	function loop() {
		return createBlock()
				.then(function (newBlock) {
					blockchain.push(newBlock);
					console.log("Mined block in " + (newBlock.timestamp - blockchain[newBlock.index - 1].timestamp) / 1000 + " sec => ", newBlock);
					setTimeout(loop, 1000)
				});
	}
	
	return loop();
}

main();