import { TChainConfig } from '@/types'
import {
  arbitrum,
  polygonMumbai,
  mainnet,
  arbitrumSepolia,
  bscTestnet,
  base,
} from '@wagmi/core/chains'

export const chainID = Number(process.env.CHAIN_NUMBER ?? arbitrum.id)

export const chainConfigs: TChainConfig = {
  [arbitrum.id]: {
    chainStackHTTPS:
      'https://nd-009-939-622.p2pify.com/0390ea2c5ea8c1d20e350e3a1c95f302',
    chainStackWS:
      'wss://ws-nd-009-939-622.p2pify.com/0390ea2c5ea8c1d20e350e3a1c95f302',
    CrosschainSaleManagerAddress: '0x0Af159a8E0B1282509663D8AceA2Bd59fcb1CCc8',
    iTokenStakingContractAddress: '0xB38b6827757b40c08BB83cfe7D9fB2e69D12CD3D',
    chefContractAddress: '0x6fE79b531b2b1d5378631B3Ab33B0994E297355E',
    astraContractAddress: '0xd3188e0df68559c0B63361f6160c57Ad88B239D8',
    DAOContractAddress: '0x8D9cbe442C664872A526cE65cfE0c4a4CfF89A7d',
    DAAContractAddress: '0xFa3e6EC87941d4e29b1738F8F7f5C27B23Eb3f94',
    nftContractAddress: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    utilityContractAddress: '0x52ED59772BB1005e196E6baE3C25F6c25167feD4',
    USDCContractAddress: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    WETHContractAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
  [mainnet.id]: {
    chainStackHTTPS:
      'https://nd-069-375-190.p2pify.com/c0963d7b6845a9b601d2569f65f4e178',
    chainStackWS:
      'wss://ws-nd-069-375-190.p2pify.com/c0963d7b6845a9b601d2569f65f4e178',
    CrosschainSaleManagerAddress: '0x8f2Dad40EdD9661dADa834e4e5473c238B146527',
    iTokenStakingContractAddress: '0x87e980034D3aA7879F3aB79a8c3CB2919bFb05F4',
    chefContractAddress: '0xDFE672C671943411fc16197fb8E328662B57CE2C',
    astraContractAddress: '0x7E9c15C43f0D6C4a12E6bdfF7c7D55D0f80e3E23',
    DAOContractAddress: '0x2E1fb79129B3d44881bd56a82Bb7CBb7328B6143',
    DAAContractAddress: '0x17b9B197E422820b3e28629a2BB101949EE7D12B',
    nftContractAddress: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    utilityContractAddress: '0x1Df154042d0a7F1Cd093D907094A8ba5d83dF6C0',
    USDCContractAddress: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    WETHContractAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
  [base.id]: {
    chainStackHTTPS:
      'https://nd-009-939-622.p2pify.com/0390ea2c5ea8c1d20e350e3a1c95f302',
    chainStackWS:
      'wss://ws-nd-009-939-622.p2pify.com/0390ea2c5ea8c1d20e350e3a1c95f302',
    CrosschainSaleManagerAddress: '0x5b15FbE7aB98ad8000Cd50DA5A8906994f57e8F1',
    iTokenStakingContractAddress: '0xB38b6827757b40c08BB83cfe7D9fB2e69D12CD3D',
    chefContractAddress: '0x6fE79b531b2b1d5378631B3Ab33B0994E297355E',
    astraContractAddress: '0xd3188e0df68559c0B63361f6160c57Ad88B239D8',
    DAOContractAddress: '0x8D9cbe442C664872A526cE65cfE0c4a4CfF89A7d',
    DAAContractAddress: '0xFa3e6EC87941d4e29b1738F8F7f5C27B23Eb3f94',
    nftContractAddress: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    utilityContractAddress: '0x52ED59772BB1005e196E6baE3C25F6c25167feD4',
    USDCContractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    WETHContractAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
  [polygonMumbai.id]: {
    chainStackHTTPS:
      'https://nd-228-957-154.p2pify.com/a67c91c9db4e0cb9c5c0a3c41e08790c',
    chainStackWS:
      'wss://ws-nd-228-957-154.p2pify.com/a67c91c9db4e0cb9c5c0a3c41e08790c',
    CrosschainSaleManagerAddress: '0x8f2Dad40EdD9661dADa834e4e5473c238B146527',
    iTokenStakingContractAddress: '0xFaBFA910b9cED2508bdFE9057847fcE9d13ABe1b',
    chefContractAddress: '0x94bf0B6796b989FD50cA133Ab22C344914f00a3d',
    astraContractAddress: '0xBDb3bc2A287f8676823Af9a9CFB2a9c6104E815c',
    DAOContractAddress: '0x85864F898ac8ADC58dA9e74C9891c89FbCf0C98f',
    DAAContractAddress: '0x16f7b3444FD0edfB33A49656b4fCB05Fbf06060d',
    nftContractAddress: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    utilityContractAddress: '0x0D301585F55cd2835472AE9651255c694A51BBCD',
    USDCContractAddress: '0x17F40bb578C91E4A0C69968487A269f55C75A65D',
    WETHContractAddress: '0x9c3c9283d3e44854697cd22d3faa240cfb032889',
  },
  [arbitrumSepolia.id]: {
    chainStackHTTPS:
      'https://arbitrum-sepolia.core.chainstack.com/25d78e54fa768b868fee699a675ad8f3',
    chainStackWS:
      'wss://arbitrum-sepolia.core.chainstack.com/ws/25d78e54fa768b868fee699a675ad8f3',
    CrosschainSaleManagerAddress: '0x51D436DE37bB4f66016046518D22A93b0503dE97',
    iTokenStakingContractAddress: '0x828650Bc3270dD27B21914CDa1f2650dC23100a9',
    chefContractAddress: '0xa527476575972e28F2055F28901B7767b6672928',
    astraContractAddress: '0x6ea5046B9aB2F5100644f67EfBa797f8d08D7515',
    DAOContractAddress: '0xeFdc06A60D568B875b75b6F46d715423264AfEd7',
    DAAContractAddress: '0x93Ee0bAcDbe4743a4fEEF68c91563ddCf913eD14',
    nftContractAddress: '0x6b2937Bde17889EDCf8fbD8dE31C3C2a70Bc4d65',
    utilityContractAddress: '0xc5e0930379fe53489F8f6e56351949c1B647518B',
    USDCContractAddress: '0xDEBC254Eb31c8a54DA05e586cbC7CF2e30ebb616',
    WETHContractAddress: '0x9c3c9283d3e44854697cd22d3faa240cfb032889',
  },
  [bscTestnet.id]: {
    chainStackHTTPS:
      'https://bsc-testnet.core.chainstack.com/be7c0598abf930ce4bf8377f17a2456b',
    chainStackWS:
      'wss://bsc-testnet.core.chainstack.com/be7c0598abf930ce4bf8377f17a2456b',
    CrosschainSaleManagerAddress: '0x8f2Dad40EdD9661dADa834e4e5473c238B146527',
    DAAContractAddress: '0x93Ee0bAcDbe4743a4fEEF68c91563ddCf913eD14',
    DAOContractAddress: '0x7b251CF8a6b5382BcA1a6C414846Eb0749BD589E',
    USDCContractAddress: '0x76fa6bab73779164738B1b1C8E3d1ecf0865D152',
    WETHContractAddress: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
    iTokenStakingContractAddress: '0x828650Bc3270dD27B21914CDa1f2650dC23100a9',
    chefContractAddress: '0x954Ba68d08fFe8F9cf33C13FCcCdf8376d18F04b',
    astraContractAddress: '0x2850e9f193579b5Fc43459a9190Ab881AdE1ab98',
    utilityContractAddress: '0xc5e0930379fe53489F8f6e56351949c1B647518B',
    nftContractAddress: '0x6b2937Bde17889EDCf8fbD8dE31C3C2a70Bc4d65',
  },
}

export const chainConfig = chainConfigs[chainID]
