/* eslint-disable node/no-missing-import */
import { DEPLOYED_CONTRACTS } from "./deploys";

export const TOKENS: { [symbol: string]: { address: string; decimals: number } } = {
  WETH: { decimals: 18, address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },
  rETH: { decimals: 18, address: "0xae78736Cd615f374D3085123A210448E74Fc6393" },
  stETH: { decimals: 18, address: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84" },
  wstETH: { decimals: 18, address: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0" },
  CRV: { decimals: 18, address: "0xD533a949740bb3306d119CC777fa900bA034cd52" },
  CVX: { decimals: 18, address: "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B" },
  LDO: { decimals: 18, address: "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32" },
  FXS: { decimals: 18, address: "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0" },
  ALCX: { decimals: 18, address: "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF" },
  SPELL: { decimals: 18, address: "0x090185f2135308BaD17527004364eBcC2D37e5F6" },
  FRAX: { decimals: 18, address: "0x853d955aCEf822Db058eb8505911ED77F175b99e" },
  TRICRV: { decimals: 18, address: "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490" },
  DAI: { decimals: 18, address: "0x6B175474E89094C44Da98b954EedeAC495271d0F" },
  USDC: { decimals: 6, address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
  USDT: { decimals: 6, address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
  WBTC: { decimals: 8, address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" },
  renBTC: { decimals: 8, address: "0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D" },
  cvxFXS: { decimals: 18, address: "0xFEEf77d3f69374f66429C91d732A244f074bdf74" },
  cvxCRV: { decimals: 18, address: "0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7" },
  UST_WORMHOLE: { decimals: 6, address: "0xa693B19d2931d498c5B318dF961919BB4aee87a5" },
  UST_TERRA: { decimals: 18, address: "0xa47c8bf37f92aBed4A126BDA807A7b7498661acD" },
  LYRA: { decimals: 18, address: "0x01BA67AAC7f75f647D94220Cc98FB30FCc5105Bf" },
  SNX: { decimals: 18, address: "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F" },
  GRO: { decimals: 18, address: "0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7" },
  FLX: { decimals: 18, address: "0x6243d8CEA23066d098a15582d81a598b4e8391F4" },
  ANGLE: { decimals: 18, address: "0x31429d1856aD1377A8A0079410B297e1a9e214c2" },
  INV: { decimals: 18, address: "0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68" },
  STG: { decimals: 18, address: "0xaf5191b0de278c7286d6c7cc6ab6bb8a73ba2cd6" },
  TRIBE: { decimals: 18, address: "0xc7283b66eb1eb5fb86327f08e1b5816b0720212b" },
  GEIST: { decimals: 18, address: "0x2EBfF165CB363002C5f9cBcfd6803957BA0B7208" },
  FEI: { decimals: 18, address: "0x956F47F50A910163D8BF957Cf5846D573E7f87CA" },
  JPEG: { decimals: 18, address: "0xE80C0cd204D654CEbe8dd64A4857cAb6Be8345a3" },
  USDN: { decimals: 18, address: "0x674C6Ad92Fd080e4004b2312b45f796a192D27a0" },
  EURS: { decimals: 2, address: "0xdB25f211AB05b1c97D595516F45794528a807ad8" },
  agEUR: { decimals: 18, address: "0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8" },
  EURT: { decimals: 6, address: "0xC581b735A1688071A1746c968e0798D642EDE491" },
  PUSD: { decimals: 18, address: "0x466a756E9A7401B5e2444a3fCB3c2C12FBEa0a54" },
  pETH: { decimals: 18, address: "0x836A808d4828586A69364065A1e064609F5078c7" },
  cbETH: { decimals: 18, address: "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704" },
  frxETH: { decimals: 18, address: "0x5e8422345238f34275888049021821e8e08caa1f" },
  MTA: { decimals: 18, address: "0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2" },
  GNO: { decimals: 18, address: "0x6810e776880C02933D47DB1b9fc05908e5386b96" },
  sUSD: { decimals: 18, address: "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51" },
  sBTC: { decimals: 18, address: "0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6" },
  sETH: { decimals: 18, address: "0x5e74C9036fb86BD7eCdcb084a0673EFc32eA31cb" },
  LQTY: { decimals: 18, address: "0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D" },
  MIM: { decimals: 18, address: "0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3" },
  cyDAI: { decimals: 8, address: "0x8e595470Ed749b85C6F7669de83EAe304C2ec68F" },
  cyUSDC: { decimals: 8, address: "0x76Eb2FE28b36B3ee97F3Adae0C69606eeDB2A37c" },
  cyUSDT: { decimals: 8, address: "0x48759F220ED983dB51fA7A8C0D2AAb8f3ce4166a" },
  FPI: { decimals: 18, address: "0x5Ca135cB8527d76e932f34B5145575F9d8cbE08E" },
  alUSD: { decimals: 18, address: "0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9" },
  alETH: { decimals: 18, address: "0x0100546F2cD4C9D97f798fFC9755E47865FF7Ee6" },
  DOLA: { decimals: 18, address: "0x865377367054516e17014CcdED1e7d814EDC9ce4" },
  BUSD: { decimals: 18, address: "0x4Fabb145d64652a948d72533023f6E7A623C7C53" },
  SILO: { decimals: 18, address: "0x6f80310CA7F2C654691D1383149Fa1A57d8AB1f8" },
  APEFI: { decimals: 18, address: "0x4332f8a38f14bd3d8d1553af27d7c7ac6c27278d" },
  USDD: { decimals: 18, address: "0x0C10bF8FcB7Bf5412187A595ab97a3609160b5c6" },
  crvFRAX: { decimals: 18, address: "0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC" },
  TUSD: { decimals: 18, address: "0x0000000000085d4780B73119b644AE5ecd22b376" },
  LUSD: { decimals: 18, address: "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0" },
  T: { decimals: 18, address: "0xCdF7028ceAB81fA0C6971208e83fa7872994beE5" },
  aCRV: { decimals: 18, address: DEPLOYED_CONTRACTS.Concentrator.cvxCRV.aCRV },
  aFXS: { decimals: 18, address: DEPLOYED_CONTRACTS.Concentrator.cvxFXS.aFXS },
  CTR: { decimals: 18, address: DEPLOYED_CONTRACTS.Concentrator.CTR },
  clevCVX: { decimals: 18, address: DEPLOYED_CONTRACTS.CLever.CLeverCVX.clevCVX },
  OGN: { decimals: 18, address: "0x8207c1FfC5B6804F6024322CcF34F29c3541Ae26" },
  BADGER: { decimals: 18, address: "0x3472a5a71965499acd81997a54bba8d852c6e53d" },
};
