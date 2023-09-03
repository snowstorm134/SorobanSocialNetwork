<div>
<img src="projectLogo.png" width="500">

<h3 align="center">Soroban Social Network</h3>

  <p align="center">Social Network on Soroban Stellar (Futurenet)</p>
    - Live app: https://soroban-social-network.netlify.app<br/>
    - Tutorial (article): https://dev.to/user1122/soroban-social-network-tutorial-38ai<br/>
    - Tutorial (video): <a href="https://t.ly/Z9R9F">Link</a>
</div>


## About Soroban Social Network

TBD

## Built With

- Soroban smart contracts - https://soroban.stellar.org
- React
- IPFS Storage - https://thirdweb.com/dashboard/infrastructure/storage
- Chakra UI - https://chakra-ui.com/

## Getting Started

### Prerequisites

* **Node v18** - Install here: https://nodejs.org/en/download
  
* **Rust** - How to install Rust: 
  [https://soroban.stellar.org/docs/getting-started/setup#install-rust](https://soroban.stellar.org/docs/getting-started/setup#install-rust)

* **Soroban CLI** - How to install Soroban CLI: 
  [https://soroban.stellar.org/docs/getting-started/setup#install-the-soroban-cli](https://soroban.stellar.org/docs/getting-started/setup#install-the-soroban-cli)
  
* **Stellar Account with test tokens on Futurenet** - How to create new wallet using soroban-cli & receive test tokens:
  [https://soroban.stellar.org/docs/getting-started/deploy-to-futurenet#configure-an-identity](https://soroban.stellar.org/docs/getting-started/deploy-to-futurenet#configure-an-identity)

* **Freighter Wallet** - Wallet extension for interact with the app. Link: https://www.freighter.app



### Build, deploy & run the app frontend

1. Clone this repository:
   ```sh
   git clone https://github.com/snowstorm134/SorobanSocialNetwork.git
   ```

2. Rename the `env.example` file to `.env` and set the `VITE_THIRDWEB_CLIENT_ID` variable. This ID are used for upload content to IPFS. You can get it for free here: https://thirdweb.com/dashboard/infrastructure/storage
   
3. Run
  ```sh
   npm run setup
   ```
  It will do all actions (creating a new wallet, get test tokens, build and deploy the contract using this wallet, create bind for typescript and also will install all node js packages). For more details, please check the guide.
  
4. Run
  ```sh
   npm run dev
   ```
 It will run the app frontend on port 3000 or other.
 
5. Open the app and start use it.
