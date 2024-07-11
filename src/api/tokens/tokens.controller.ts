import { appConfig, databaseDetails, sqlQueries } from '@/config'
import { Request, Response } from 'express'
import { db } from '@/App'
import fs from 'fs'
import axios from 'axios'
import { chefAbi, positionManagerAbi, utilityAbi, v3stakingAbi } from '@/abi'
import path from 'path'
import { TToken } from '@/types'
import { testTokens } from '@/constants'
import { chainConfig } from '@/config/chain.config'
import { readContract } from '@wagmi/core'

export class TokensController {
  constructor() {}

  public static tokenlist = async (_req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    try {
      const query = `select * from ${sqlQueries.tokenInfo} LIMIT 100`
      const [resp] = await db.query(query)
      res.send({
        status: 200,
        data: resp,
      })
    } catch (error) {
      res.status(500).send({
        error: error,
      })
    }
  }
  public static tokenInfo = async (req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    try {
      const contractAddress = req.params['contractAddress']
      const query = `select * from ${sqlQueries.tokenInfo} WHERE CONTRACT_ADDR='${contractAddress}'`
      const [resp] = await db.query(query)
      res.send({
        status: 200,
        data: (resp && resp.length) > 0 ? resp[0] : null,
      })
    } catch (error) {
      res.status(500).send({
        error: error,
      })
    }
  }

  public static uniswapTokenList = async (_req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    const fileName =
      appConfig.prod === false ? 'goerlitokens.json' : 'tokens.json'
    const jsonData = JSON.parse(
      fs
        .readFileSync(
          path.resolve(
            __dirname,
            `${appConfig.jsonFilepathInitials}${fileName}`
          )
        )
        .toString()
    )
    // jsonData = JSON.parse(jsonData)
    res.send({
      status: 200,
      data: jsonData,
    })
  }

  public static getAstraPrice = async (_req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const jsonData = JSON.parse(
        fs
          .readFileSync(
            path.resolve(
              __dirname,
              `${appConfig.jsonFilepathInitials}${
                process.env.PROD_ENV === 'production'
                  ? 'astraPrice.json'
                  : 'astraPrice-test.json'
              }`
            )
          )
          .toString()
      )
      res.send({
        status: 200,
        data: jsonData,
      })
    } catch (error) {
      res.status(500).send({
        error: error,
      })
    }
  }

  public static updateAstraPrice = async () => {
    try {
      const astraTokenDetails = await axios.get(
        `https://pro-api.coingecko.com/api/v3/simple/token_price/arbitrum-one?contract_addresses=${chainConfig.astraContractAddress}&vs_currencies=usd&x_cg_pro_api_key=${process.env.COINGECKO_API_KEY}`
      )
      let tokenPrice: string =
        astraTokenDetails && astraTokenDetails.data
          ? astraTokenDetails.data[
              chainConfig.astraContractAddress.toLowerCase()
            ]?.usd
          : ''
      tokenPrice = parseFloat(tokenPrice).toFixed(10)
      if (tokenPrice === 'NaN')
        throw new Error(
          `Invalid Astra Price, ${JSON.stringify(astraTokenDetails.data)}`
        )
      fs.writeFileSync(
        path.resolve(
          __dirname +
            `/${appConfig.jsonFilepathInitials}${
              process.env.PROD_ENV === 'production'
                ? 'astraPrice.json'
                : 'astraPrice-test.json'
            }`
        ),
        JSON.stringify(tokenPrice)
      )
    } catch (error) {
      console.error('Update Astra Price Error: ', error)
    }
  }

  public static getAstraAndLMAPY = async () => {
    const response = {
      stakingRewardsAPR: '0',
      liquidityMiningAPR: '0',
    }
    const [poolInfo, astraPerBlock] = await Promise.all([
      readContract({
        address: chainConfig.chefContractAddress,
        abi: chefAbi,
        functionName: 'poolInfo',
        args: [BigInt(0)],
      }),
      readContract({
        address: chainConfig.chefContractAddress,
        abi: chefAbi,
        functionName: 'astraPerBlock',
      }),
    ])
    const totalStakedAmount = poolInfo[4]
    const totalNFTStakedAmount = await this.getTotalNFTStakedAmount()

    const perBlockRewardLmStake =
      Number(astraPerBlock * totalNFTStakedAmount) / Number(totalStakedAmount)
    const perBlockRewardAstrStake =
      Number(astraPerBlock) - perBlockRewardLmStake

    const astraAPY =
      100 *
      (perBlockRewardAstrStake /
        Number(totalStakedAmount - totalNFTStakedAmount)) *
      appConfig.numberofBlocksInYear
    const lmAPY =
      100 *
      (perBlockRewardLmStake / Number(totalNFTStakedAmount)) *
      appConfig.numberofBlocksInYear

    response.stakingRewardsAPR = isNaN(Number(astraAPY))
      ? '0'
      : Number(astraAPY).toFixed(2)
    response.liquidityMiningAPR = isNaN(Number(lmAPY))
      ? '0'
      : Number(lmAPY).toFixed(2)

    return response
  }

  public static updateAPRFile = async () => {
    const tokenPrice = JSON.parse(
      fs
        .readFileSync(
          path.resolve(
            __dirname,
            `${appConfig.jsonFilepathInitials}${
              process.env.PROD_ENV === 'production'
                ? 'astraPrice.json'
                : 'astraPrice-test.json'
            }`
          )
        )
        .toString()
    )

    // const object = new IndicesController()
    const ASTRALMAPR = await this.getAstraAndLMAPY()
    const iTokenAPR = await this.getItokenAPY(tokenPrice)

    const finalData = {
      liquidityMiningAPR: ASTRALMAPR.liquidityMiningAPR,
      stakingRewardsAPR: ASTRALMAPR.stakingRewardsAPR,
      iTokenAPR: iTokenAPR,
    }
    const jsonData = JSON.stringify(finalData)
    fs.writeFileSync(
      path.resolve(
        __dirname +
          `/${appConfig.jsonFilepathInitials}${
            process.env.PROD_ENV === 'production'
              ? 'aprdetails.json'
              : 'aprdetails-test.json'
          }`
      ),
      jsonData
    )
  }

  public static getTotalNFTStakedAmount = async () => {
    let returnValue = 0n
    const balance = await readContract({
      address: chainConfig.nftContractAddress,
      abi: positionManagerAbi,
      functionName: 'balanceOf',
      args: [chainConfig.chefContractAddress],
    })
    for (let i = 0; i < balance; i++) {
      const positionId = await readContract({
        address: chainConfig.nftContractAddress,
        abi: positionManagerAbi,
        functionName: 'tokenOfOwnerByIndex',
        args: [chainConfig.chefContractAddress, BigInt(i)],
      })

      const getAstraAmount = await readContract({
        address: chainConfig.utilityContractAddress,
        abi: utilityAbi,
        functionName: 'getAstraAmount',
        args: [positionId],
      })
      returnValue += getAstraAmount
    }

    return returnValue
  }

  public static getItokenAPY = async (astraPrice = 0) => {
    const [poolInfo, astraPerBlock] = await Promise.all([
      readContract({
        address: chainConfig.iTokenStakingContractAddress,
        abi: v3stakingAbi,
        functionName: 'poolInfo',
        args: [BigInt(0)],
      }),
      readContract({
        address: chainConfig.iTokenStakingContractAddress,
        abi: v3stakingAbi,
        functionName: 'astraPerBlock',
      }),
    ])
    const totalStakedAmount = poolInfo[3] * BigInt(10 ** 12)
    const iTokenAPR =
      100 *
      ((Number(astraPerBlock) * astraPrice) / Number(totalStakedAmount)) *
      appConfig.numberofBlocksInYear
    const iTokenAPRResponse =
      isNaN(iTokenAPR) || !isFinite(iTokenAPR) ? '0' : iTokenAPR.toFixed(2)
    return iTokenAPRResponse
  }

  public static investmentTokens = async (_req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      // const query = `select TOKEN_SYMBOL, TOKEN_ADDRESS, DECIMAL from ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INVESTMENT_TOKEN_DETAILS} where STATUS = 'ACTIVE' LIMIT 300`
      const query = `select TOKEN_SYMBOL, TOKEN_ADDRESS, DECIMAL, DATE_TRUNC('MINUTE', CREATED_AT) AS CREATED_AT_MIN from ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INVESTMENT_TOKEN_DETAILS} where STATUS = 'ACTIVE' AND CREATED_AT_MIN = (SELECT DATE_TRUNC('MINUTE', max(CREATED_AT)) FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INVESTMENT_TOKEN_DETAILS} WHERE STATUS = 'ACTIVE')`
      const [resp] = await db.query(query)
      res.send({
        status: 200,
        data: resp,
      })
    } catch (error) {
      res.status(500).send({
        error: error,
      })
    }
  }

  public static uniswapTokensList = async (_req: Request, res: Response) => {
    try {
      const apiKey = process.env.COINGECKO_API_KEY
      if (!apiKey) {
        return res.status(500).send({ err: 'CoinGecko API key not set' })
      }

      const result = await axios.get(
        'https://api.coingecko.com/api/v3/exchanges/uniswap_v3_arbitrum'
      )
      const tokenList: any[] = []

      result.data.tickers.forEach((item: any) => {
        if (item.converted_volume.usd >= 50000) {
          tokenList.push({
            token: item.base,
            _totalValueLockedUSD: item.converted_volume.usd,
          })
          tokenList.push({
            token: item.target,
            _totalValueLockedUSD: item.converted_volume.usd,
          })
        }
      })

      const uniqueTokens = [
        ...new Map(tokenList.map((item) => [item.token, item])).values(),
      ]

      const tokenDetailsPromises = uniqueTokens.map(({ token }) =>
        fetchTokenDetailsWithRetries(token, apiKey)
      )
      const tokenDetails = await Promise.all(tokenDetailsPromises)

      tokenDetails.forEach((details, index) => {
        if (details) {
          uniqueTokens[index] = { ...uniqueTokens[index], ...details }
        }
      })

      return res.send({
        data: uniqueTokens.filter((token) => token.id),
        status: 200,
      })
    } catch (err) {
      res.status(500).send({ err })
    }
  }

  public static uniswapTokenDetail = async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.COINGECKO_API_KEY
      if (!apiKey) {
        return res.status(500).send({ err: 'CoinGecko API key not set' })
      }

      const { tokenAddress } = req.query

      const response = await axios.get(
        `https://pro-api.coingecko.com/api/v3/coins/arbitrum-one/contract/${tokenAddress}`,
        {
          headers: {
            'x-cg-pro-api-key': apiKey,
          },
        }
      )
      const { id, symbol, name, image, market_data } = response.data
      res.status(200).json({
        data: {
          id,
          name,
          symbol,
          img: image.thumb,
          token: tokenAddress,
          _totalValueLockedUSD: market_data.total_value_locked.usd,
        },
      })
    } catch (error) {
      console.error(error)
      return null
    }
  }

  public static uniswapTokenListBk = async (_req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const finalData: TToken[] = []

      if (appConfig.prod === false) {
        return res.send({
          status: 200,
          data: testTokens,
        })
      }

      const allResults = await Promise.allSettled([
        axios.get('https://tokens.uniswap.org/'),
        // axios.get(
        //   'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json'
        // ),
        // axios.get('https://tokens.coingecko.com/uniswap/all.json'),
        // axios.get('https://static.optimism.io/optimism.tokenlist.json'),
        // axios.get('https://app.tryroll.com/tokens.json'),
      ])

      allResults.forEach((results) => {
        if (results.status === 'rejected') {
          return
        } else {
          results.value.data.tokens.forEach((token: TToken) => {
            if (appConfig.prod === true && token.chainId === 1) {
              finalData.push({
                img: token.logoURI!,
                name: token.name,
                symbol: token.symbol,
                contractAddress: token.address!,
                isBaseToken: false,
                balanceLoaded: false,
                chainId: token.chainId,
              })
            } else if (token.chainId === 80001) {
              finalData.push({
                img: token.logoURI!,
                name: token.name,
                symbol: token.symbol,
                contractAddress: token.address!,
                isBaseToken: false,
                balanceLoaded: false,
                chainId: token.chainId,
              })
            }
          })
        }
      })

      res.send({
        status: 200,
        data: finalData,
      })
    } catch (err) {
      res.status(500).send({ err })
    }
  }
}

const fetchTokenDetails = async (tokenAddress: string, apiKey: string) => {
  try {
    const response = await axios.get(
      `https://pro-api.coingecko.com/api/v3/coins/arbitrum-one/contract/${tokenAddress}`,
      {
        headers: {
          'x-cg-pro-api-key': apiKey,
        },
      }
    )
    const { id, symbol, name, image } = response.data
    return { id, name, symbol, img: image.thumb }
  } catch (error) {
    console.error(`Error fetching details for ${tokenAddress}:`, error)
    return null
  }
}

const fetchTokenDetailsWithRetries = async (
  tokenAddress: string,
  apiKey: string,
  retries = 3
) => {
  for (let i = 0; i < retries; i++) {
    const result = await fetchTokenDetails(tokenAddress, apiKey)
    if (result) return result
  }
  return null
}
