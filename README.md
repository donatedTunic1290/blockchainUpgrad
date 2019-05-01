# Agenda
1. Anatomy of a block
2. SHA256 hash / SHA3 (Keccak-256)
3. Digital Signatures - secp256k1 elliptic curve & ECDSA
4. Mining
5. P2P networks vs Client Server networks
6. Blockchain Networking (Node discovery, Handshake, Communication)

# aakash@one0x.com 

<br><br><br><br><br><br><br><br><br><br><br><br><br><br>

# How does changing bytes in a target string affect difficulty?
Generation of hash with a nonce is a non-deterministic function. It will produce a completely random 256 bit hash with a max value of 0xff(x64). 

This randomly generated hash number has to be lower than the target. 

When the target is reduced, it becomes less probable to randomly generate a hash which is lower than the target, thus increasing the difficulty.

# What is the difference between Hash Rate and Difficulty?

Hash Rate is the time between 2 blocks. 

Difficulty is the probability of finding a block hash which is lower than the target.

A blockchain network sets a desired level of Hash Rate which is to be maintained. But as computing powers of miners increase and new algorithms are developed, blocks are created quicker (or sometimes slower) than the desired rate. 

To solve this, networks include re-targeting, a phenomenon where after every few blocks, the network checks for the actual average block rate and increases / reduces the target value to compensate for the difference in hash rates.    