React Frontend for accessing NFT REST API. Part of the project for easy working with SLP-based non-fungible tokens (NFT) on top of the BCH blockchain.

## Usage

### Installation

For now, the installation is only possible from the GitHub repository:

```sh
git clone https://github.com/zh/cp202101.git
cd cp202101/nft-react
yarn
```

This will install all the dependencies.

### Configuration

Edit, if needed, the path to the REST API in `src/services/api.service.js`:

```js
const ApiURL = 'http://127.0.0.1:8000/';
```

### Starting the React frontend

Be sure to first start the backend daemon


```sh
yarn start
```