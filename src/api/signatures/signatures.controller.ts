import { chefAbi, daoAbi } from '@/abi'
import { appConfig, databaseDetails } from '@/config'
import { Request, Response } from 'express'
import { db } from '@/App'
import _ from 'lodash'
import { fetchBlockNumber } from '@wagmi/core'
import { chainConfig } from '@/config/chain.config'
import { readContract } from '@wagmi/core'

export class SignaturesController {
  public static saveGaselessVoteSignature = async (
    req: Request,
    res: Response
  ) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const r = req.params['sigR']
      const s = req.params['sigS']
      const v = req.params['sigV']
      const signature = req.params['signature']
      const proposalId = req.params['proposalId']
      const walletAddress = req.params['walletAddress']
      const support = req.params['support']
      console.log('support', support)
      if (!walletAddress) {
        res.send({
          status: 204,
          error: 'Invalid Params.',
        })
      }

      const query = `select * from ${databaseDetails.SCHEMA_NAME}.${
        databaseDetails.PROPOSAL_SIGNATURES
      } where PROPOSAL_ID = '${proposalId}' AND LOWER(WALLET_ADDRESS)='${_.toLower(
        walletAddress
      )}'`
      const [checkExist] = await db.query(query)

      if (_.isEmpty(checkExist)) {
        const insertQuery = `INSERT INTO ${databaseDetails.SCHEMA_NAME}.${databaseDetails.PROPOSAL_SIGNATURES}(PROPOSAL_ID, SUPPORT, SIGNATURE_V, SIGNATURE_R, SIGNATURE_S, WALLET_ADDRESS, SIGNATURE) VALUES('${proposalId}', '${support}', '${v}', '${r}', '${s}', '${walletAddress}', '${signature}')`
        /* const insertQueryExecution =  */ await db.query(insertQuery)
        res.send({
          status: 200,
          data: {},
        })
      } else {
        const updateQuery = `UPDATE ${databaseDetails.SCHEMA_NAME}.${databaseDetails.PROPOSAL_SIGNATURES} SET SIGNATURE_V = '${v}', SIGNATURE_R = '${r}', SIGNATURE_S = '${s}', SUPPORT = '${support}', SIGNATURE = '${signature}' WHERE PROPOSAL_ID = '${proposalId}' AND WALLET_ADDRESS = '${walletAddress}'`
        /* const updateQueryExec = */ await db.query(updateQuery)
        res.send({
          status: 200,
          message: 'You have voted successfully.',
          data: {},
        })
      }
    } catch (error) {
      res.status(500).send({
        error,
      })
    }
  }

  public static signatures = async (req: Request, res: Response) => {
    try {
      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*')
      const proposalId = req.params['proposalId']

      const proposalQuery = `SELECT * FROM ${databaseDetails.SCHEMA_NAME}.PROPOSAL_CREATED_DETAILS WHERE ID = '${proposalId}'`
      const [proposalDetails] = await db.query(proposalQuery)

      const query = `select * from ${databaseDetails.SCHEMA_NAME}.${databaseDetails.PROPOSAL_SIGNATURES} where PROPOSAL_ID='${proposalId}' AND STATUS = 'PENDING' ORDER BY SUPPORT LIMIT 300`

      const [data] = await db.query(query)

      const currentBlockNumber = await fetchBlockNumber()
      const proposalFasttrackBlock =
        parseInt(proposalDetails[0].STARTBLOCK) + appConfig.fastTrackBlocks

      if (!_.isEmpty(data)) {
        const finalData = await Promise.all(
          data.map(async (element) => {
            const temp = {
              proposalId: element.PROPOSAL_ID,
              support: element.SUPPORT,
              v: element.SIGNATURE_V,
              r: element.SIGNATURE_R,
              s: element.SIGNATURE_S,
            }
            return temp
          })
        )

        if (Number(currentBlockNumber) >= proposalFasttrackBlock) {
          return res.send({
            status: 200,
            data: finalData,
          })
        } else {
          let finalForVotes = 0
          let finalAgainstVotes = 0
          let totalHighestStakers = 0
          const [
            rewardMultiplierDecimals,
            proposalVoteDetails,
            proposalsVotersInfo,
          ] = await Promise.all([
            readContract({
              address: chainConfig.chefContractAddress,
              abi: chefAbi,
              functionName: 'MULTIPLIER_DECIMAL',
            }),
            readContract({
              address: chainConfig.DAOContractAddress,
              abi: daoAbi,
              functionName: 'proposals',
              args: [BigInt(proposalId)],
            }),
            readContract({
              address: chainConfig.DAOContractAddress,
              abi: daoAbi,
              functionName: 'votersInfo',
              args: [BigInt(proposalId)],
            }),
          ])

          const forVotesDetails = Number(proposalVoteDetails[5])

          finalForVotes =
            Number(forVotesDetails) > 0 ? forVotesDetails / Math.pow(10, 18) : 0

          const againstVoteDetails = Number(proposalVoteDetails[6])

          finalAgainstVotes =
            Number(againstVoteDetails) > 0
              ? againstVoteDetails / Math.pow(10, 18)
              : 0

          /** Get voters info */
          // const proposalsVotersInfo = await daoContract.methods
          //   .votersInfo(proposalId)
          //   .call()
          const activeGovernors = Number(proposalsVotersInfo[1])
          totalHighestStakers = activeGovernors
          // const activeVoterCount = proposalsVotersInfo.voterCount;

          let finalData = await Promise.all(
            data.map(async (element) => {
              const [userStakeInfo, checkHighestStakerFlag] = await Promise.all(
                [
                  readContract({
                    address: chainConfig.chefContractAddress,
                    abi: chefAbi,
                    functionName: 'userInfo',
                    args: [BigInt(0), element.WALLET_ADDRESS],
                  }),
                  readContract({
                    address: chainConfig.chefContractAddress,
                    abi: chefAbi,
                    functionName: 'checkHighestStaker',
                    args: [element.WALLET_ADDRESS],
                  }),
                ]
              ) // const userStakeInfo = await chefContract.methods
              //   .userInfo(0, element.WALLET_ADDRESS)
              //   .call()
              const stakedAmount = userStakeInfo[0]
              const rewardScoreMultiplierDetails = await readContract({
                address: chainConfig.chefContractAddress,
                abi: chefAbi,
                functionName: 'stakingScoreAndMultiplier',
                args: [element.WALLET_ADDRESS, stakedAmount],
              })
              // const rewardScoreMultiplierDetails = await chefContract.methods
              //   .stakingScoreAndMultiplier(element.WALLET_ADDRESS, stakedAmount)
              //   .call()

              const stackingScore =
                Number(rewardScoreMultiplierDetails[0]) / Math.pow(10, 18)
              const rewardMultiplier =
                Number(rewardScoreMultiplierDetails[1]) /
                Number(rewardMultiplierDecimals)
              const userLiveVotingPower = stackingScore * rewardMultiplier

              /** check user is highest staker or not */
              // const checkHighestStakerFlag = await chefContract.methods
              //   .checkHighestStaker(element.WALLET_ADDRESS)
              //   .call()

              if (element.SUPPORT) {
                finalForVotes = finalForVotes + userLiveVotingPower
              } else {
                finalAgainstVotes = finalAgainstVotes + userLiveVotingPower
              }

              const totalVotes = finalAgainstVotes + finalForVotes
              const forPercentage = (finalForVotes / totalVotes) * 100
              const againstPercentage = (finalAgainstVotes / totalVotes) * 100
              const percentageDifference = forPercentage - againstPercentage

              if (
                !element.SUPPORT ||
                percentageDifference < 10 ||
                totalHighestStakers < appConfig.requiredGovernorsForProposal
              ) {
                if (element.SUPPORT && checkHighestStakerFlag) {
                  totalHighestStakers = totalHighestStakers + 1
                }
                const temp = {
                  proposalId: element.PROPOSAL_ID,
                  support: element.SUPPORT,
                  v: element.SIGNATURE_V,
                  r: element.SIGNATURE_R,
                  s: element.SIGNATURE_S,
                }
                return temp
              }
            })
          )
          finalData = _.compact(finalData)
          return res.send({
            status: 200,
            data: finalData,
          })
        }
      }

      const [resp] = await db.query(query)
      return res.send({
        status: 200,
        data: resp,
      })
    } catch (error) {
      res.status(500).send({
        error: error,
      })
    }
  }
}
