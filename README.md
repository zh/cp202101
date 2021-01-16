# Decentralized Membership Management

CoinParty 2021/01 Project

## Objectives

Working with Non-fungible tokens (NFT) on the BCH blockchain is still a very complicated task. In order to increase the SLP-based NFTs adoption amound UI/UX designers, beginner programmers and other software engineers without deep blockchain experience, the current project will try to implement some building blocks for easier working with NFTs:

* Easy to use **REST API interface** - usual GET/POST requests to create NFTs and quering the blockchain for NFT-related information
* **Basic React frontend** for REST API usage demonstration

For the time of the hackatron all parts implementations will be in the current repository,
but because parts should be independent, the plans are to have independent repositories for every part, so they can be used separately.

## REST backend

Implemented using [koa.js web framework](https://koajs.com/). See [nft-rest repository](./nft-rest/README.md) for more information about the installation and usage.

## React Frontend

Implemented using [react.js](https://reactjs.org/). See [nft-react repository](./nft-react/README.md) for more information about the installation and usage.

## Used libraries and services

* [slpjs](https://github.com/simpleledger/slpjs) - all BCH/SLP related operations
* [SLPDB](https://slpdb.fountainhead.cash/explorer) - SLP-related queries
* [koa.js](https://koajs.com/) - web framework used for the REST interface backend
* [react.js](https://reactjs.org/) - JavaScript library for building user interfaces

## Work progress

Because of the short time of the hackatron, implementing all parts is very difficult, but I'm planing to continue working on the project even after the end of the hackatron.
