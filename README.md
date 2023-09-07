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
    It will execute the `initialize.sh` bash script. *

    > * If you are using Linux or Ubuntu OS, you may get the following error:
    >   
    >   `./initialize.sh: Permission denied`

    This error occurs when the shell script you’re trying to run doesn’t have the permissions to execute. To fix that, use this command:

    ```sh
    chmod +x initialize.sh
    ```

    and try again to run 
    
    ```sh
    npm run setup
    ```

    The `initialize.sh` script will do all actions (creating a new wallet, get test tokens, build and deploy all contracts using this wallet, create bind for typescript and also will install all node js packages). For more details, please check the guide.


4. Correction of errors in typescript binding files

    The `npm run setup` command from the previous steps also executed a script that creates typescript binding files for the smart contract. The fact is that at the moment, there is a certain error due to which the default created file generates an error in the frontend.

    To fix this error you need to:
    - Go to: `.soroban/social-network-contract/dist/esm/`;
    - Open `index.js` file;
    - Find all `export async function` and in each of them replace this part:

      ```js
      parseResultXdr: (xdr) => {
          THIS_ROW_NEEDS_TO_BE_REPLACED
      }
      ```
    
      with this one:
      ```js
      parseResultXdr: (xdr) => {
          return scValStrToJs(xdr);
      }
      ```
      
5. Run
   ```sh
   npm run dev
   ```
   It will run the app frontend on port 3000 or other.
 
6. Open the app and start use it.
