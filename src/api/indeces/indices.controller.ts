import { databaseDetails, sqlQueries } from '@/config'
import { Request, Response } from 'express'
import { db } from '@/App'
import _ from 'lodash'

export class IndicesController {
  constructor() {}

  public static indicesPriceDaily = async (_req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const query = `select * from ${sqlQueries.indicesPriceDaily}`
      const [response] = await db.query(query)
      res.send({
        status: 200,
        data: response,
      })
    } catch (err) {
      res.status(500).send({
        error: err,
      })
    }
  }

  public static indicesLatestSnapshot = async (
    _req: Request,
    res: Response
  ) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const query = `select * from ${sqlQueries.indicesLatestSnapshot}`
      const [resp] = await db.query(query)
      res.send({
        status: 200,
        data: resp,
      })
    } catch (err) {
      res.status(500).send({
        error: err,
      })
    }
  }

  public static indexBTCPriceDaily = async (_req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const query = `select * from ${sqlQueries.indexBTCValueDaily}`
      const [resp] = await db.query(query)
      res.send({
        status: 200,
        data: resp,
      })
    } catch (err) {
      res.status(500).send({
        error: err,
      })
    }
  }

  public static indicesDetailsLatest = async (_req: Request, res: Response) => {
    try {
      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*')
      const query = `select * from ${sqlQueries.indicesDetailsLatest}`
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

  // TODO: Make a Paginated Query Implementation
  public static allIndicesPaginated = async (_req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const query = `select ID.*, IA.* from ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INDICES_DETAILS_LATEST_SNAPSHOT_VIEW} IA LEFT JOIN ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INDICES_AGGREGATES_LATEST_SNAPSHOT_VIEW} ID ON ID.ITOKEN_ADDR = IA.ITOKEN_ADDR ORDER BY IA.CREATED_AT DESC`
      const [response] = await db.query(query)
      // const job = await bigQuery.createQueryJob(query)
      // const finalResponse = await Promise.all(
      //   response.map(async (value) => {
      //     const indiceCreateDate = `SELECT THRESHOLD, CREATED_AT FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INDEX_DETAILS}  WHERE ITOKEN_ADDR = '${value.ITOKEN_ADDR}' ORDER BY CREATED_AT ASC LIMIT 1`
      //     const indiceDelistedDate = `SELECT * FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.DELIST_INDEX}  WHERE ITOKEN_ADDRESS = '${value.ITOKEN_ADDR}' LIMIT 1`

      //     const [[record], [delistedRecords]] = await Promise.all([
      //       bigQuery.query(indiceCreateDate),
      //       bigQuery.query(indiceDelistedDate),
      //     ])
      //     const thresold = record[0].THRESHOLD / Math.pow(10, 6)
      //     const TVLCount = value.TVL / Math.pow(10, 6)
      //     value.TVL_REQUIRED_TO_START_INDEX_PER =
      //       TVLCount > 0 ? _.round((TVLCount * 100) / thresold) : 0
      //     value.thresold_display = thresold
      //     value.IS_DELISTED = !_.isEmpty(delistedRecords) ? true : false
      //     return value
      //   })
      // )
      res.send({
        status: 200,
        data: response,
      })
    } catch (error) {
      res.status(500).send({
        error,
      })
    }
  }

  public static allIndices = async (_req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')

      const query = `WITH LatestIndicesDetails AS (
        SELECT IA.*, ROW_NUMBER() OVER(PARTITION BY IA.ITOKEN_ADDR ORDER BY IA.CREATED_AT DESC) AS rn
        FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INDICES_DETAILS_LATEST_SNAPSHOT_VIEW} IA
    ), 
    LatestAggregates AS (
        SELECT ID.*, ROW_NUMBER() OVER(PARTITION BY ID.ITOKEN_ADDR ORDER BY ID.CREATED_AT DESC) AS rn 
        FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INDICES_AGGREGATES_LATEST_SNAPSHOT_VIEW} ID
    ), 
    LatestIndexDetails AS (
        SELECT ID.*, ROW_NUMBER() OVER(PARTITION BY ID.ITOKEN_ADDR ORDER BY ID.CREATED_AT DESC) AS rn 
        FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INDEX_DETAILS} ID
    ), 
    LatestCumulativeROI AS (
        SELECT IA.ITOKEN_ADDR AS ITOKEN_ADDR1, IA.INDEX_CUMULATIVE_ROI*100 as ROI_NEW, IA.DATE, IA.DAILY_ROI_INDEX,
               ROW_NUMBER() OVER(PARTITION BY IA.ITOKEN_ADDR ORDER BY IA.DATE DESC) AS rn
        FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INDEX_CUMULATIVE_ROI_VIEW} IA
    ),
    IndexRiskScore AS (
        SELECT ITOKEN_ADDR, "RANK" AS RISK_SCORE_NEW, RANK() OVER(PARTITION BY ITOKEN_ADDR ORDER BY CREATED_AT DESC) AS rn
        FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INDEX_RISK_SCORE_PERCENTAGE}
    )
    SELECT DISTINCT LA.*, LI.*, LID.THRESHOLD AS INDEX_THRESHOLD, LC.ITOKEN_ADDR1, LC.ROI_NEW, LC.DATE, LC.DAILY_ROI_INDEX,
        ${databaseDetails.SCHEMA_NAME}.${databaseDetails.DELIST_INDEX}.ITOKEN_ADDRESS AS DELISTED_ADDRESS, IRS.RISK_SCORE_NEW
    FROM LatestIndicesDetails LI 
    LEFT JOIN LatestAggregates LA ON LA.ITOKEN_ADDR = LI.ITOKEN_ADDR AND LA.rn = 1 
    LEFT JOIN LatestIndexDetails LID ON LID.ITOKEN_ADDR = LI.ITOKEN_ADDR AND LID.rn = 1 
    LEFT JOIN LatestCumulativeROI LC ON LC.ITOKEN_ADDR1 = LI.ITOKEN_ADDR AND LC.rn = 1 
    LEFT JOIN IndexRiskScore IRS ON IRS.ITOKEN_ADDR = LI.ITOKEN_ADDR AND IRS.rn = 1
    LEFT JOIN ${databaseDetails.SCHEMA_NAME}.${databaseDetails.DELIST_INDEX} ON ${databaseDetails.DELIST_INDEX}.ITOKEN_ADDRESS = LI.ITOKEN_ADDR 
    WHERE LI.rn = 1 
    ORDER BY LI.CREATED_AT DESC;`
      const [response] = await db.query(query)

      const finalResponse = response.map((value) => {
        if (!value.ITOKEN_ADDR)
          return { ...value, ITOKEN_ADDR: value.ITOKEN_ADDR_1 }

        const thresold = value.INDEX_THRESHOLD / Math.pow(10, 6)
        const TVLCount = value.TVL / Math.pow(10, 6)

        value.TVL_REQUIRED_TO_START_INDEX_PER =
          TVLCount > 0
            ? thresold === 0
              ? 100
              : _.round((TVLCount * 100) / thresold)
            : 0
        value.thresold_display = thresold
        value.IS_DELISTED = !!value.DELISTED_ADDRESS

        return value
      })

      res.send({
        status: 200,
        data: finalResponse,
      })
    } catch (error) {
      res.status(500).send({
        error,
      })
    }
  }

  public static getIndex = async (req: Request, res: Response) => {
    try {
      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*')
      const iTokenAddress = req.params['iTokenAddress']

      const indiceCreateDate = `SELECT THRESHOLD, CREATED_AT FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INDEX_DETAILS}  WHERE ITOKEN_ADDR = '${iTokenAddress}' ORDER BY CREATED_AT ASC LIMIT 1`
      const itokenStakingEnabled = `SELECT * FROM ${
        databaseDetails.SCHEMA_NAME
      }.${
        databaseDetails.ITOKEN_DETAILS
      } WHERE LOWER(ITOKEN_ADDRESS) = '${_.toLower(iTokenAddress)}' LIMIT 1`
      const indiceDelistedDate = `SELECT * FROM ${
        databaseDetails.SCHEMA_NAME
      }.${
        databaseDetails.DELIST_INDEX
      }  WHERE LOWER(ITOKEN_ADDRESS) = '${_.toLower(iTokenAddress)}' LIMIT 1`
      const query = `
      WITH LatestCumulativeROI AS (
        SELECT
          IA.ITOKEN_ADDR AS ITOKEN_ADDR,
          IA.INDEX_CUMULATIVE_ROI * 100 AS ROI_NEW,
          IA.DATE,
          ROW_NUMBER() OVER(PARTITION BY IA.ITOKEN_ADDR ORDER BY IA.DATE DESC) AS rn
        FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INDEX_CUMULATIVE_ROI_VIEW} IA
      ),
      LatestRiskScore AS (
        SELECT 
          ITOKEN_ADDR,
          "RANK" AS RISK_SCORE_NEW,
          RANK() OVER(PARTITION BY ITOKEN_ADDR ORDER BY CREATED_AT DESC) AS rn
        FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INDEX_RISK_SCORE_PERCENTAGE}
      )
      SELECT
        ID.*,
        IA.*,
        LC.ROI_NEW,
        LC.DATE AS ROI_DATE,
        LR.RISK_SCORE_NEW
      FROM
        ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INDICES_DETAILS_LATEST_SNAPSHOT_VIEW} IA
      LEFT JOIN
        ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INDICES_AGGREGATES_LATEST_SNAPSHOT_VIEW} ID
      ON
        ID.ITOKEN_ADDR = IA.ITOKEN_ADDR
      LEFT JOIN
        LatestCumulativeROI LC
      ON
        LC.ITOKEN_ADDR = IA.ITOKEN_ADDR AND LC.rn = 1
      LEFT JOIN
        LatestRiskScore LR
      ON
        LR.ITOKEN_ADDR = IA.ITOKEN_ADDR AND LR.rn = 1
      WHERE
        IA.ITOKEN_ADDR = '${iTokenAddress}'
      ORDER BY
        IA.CREATED_AT DESC;
      `
      const [[record], [iTokenEnabledDetails], [delistedRecords], [resp]] =
        await Promise.all([
          db.query(indiceCreateDate),
          db.query(itokenStakingEnabled),
          db.query(indiceDelistedDate),
          db.query(query),
        ])

      if (record[0]['THRESHOLD']) {
        resp[0]['ORIGINAL_THRESHOLD'] = record[0]['THRESHOLD'] / Math.pow(10, 6)
      }

      // check for itoken staking enabled or not
      resp[0]['ITOKEN_STAKING_ENABLED'] =
        !_.isEmpty(iTokenEnabledDetails) &&
        iTokenEnabledDetails[0]['ITOKEN_ADDRESS']
          ? 'Yes'
          : 'No'

      resp[0]['IS_DELISTED'] = !_.isEmpty(delistedRecords) ? true : false

      res.send({
        status: 200,
        data: resp[0],
      })
    } catch (error) {
      res.status(500).send({
        error: error,
      })
    }
  }

  public static indexChartData = async (req: Request, res: Response) => {
    try {
      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*')
      const iTokenAddress = req.params['iTokenAddress']
      const now = new Date()
      const oneMonthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      )

      const min = isFinite(Number(req.query['min']))
        ? Number(req.query['min'])
        : oneMonthAgo.getTime()

      const max = isFinite(Number(req.query['max']))
        ? Number(req.query['max'])
        : new Date().getTime()
      const type = req.query['type'] ?? '1D'
      let query = ''
      // let dateFilter = ''
      if (type === '1D') {
        query = `WITH CHART_DATES as (select IRDV.*, DATE(IRDV.DATE) as ONLY_DATE, TRDL.ETH_CUMULATIVE_ROI,TRDL.TOTAL_MARKET_CUMULATIVE_ROI from ${
          databaseDetails.SCHEMA_NAME
        }.${databaseDetails.INDEX_ROI_DTLS_LATEST_VIEW} as IRDV LEFT JOIN ${
          databaseDetails.SCHEMA_NAME
        }.${
          databaseDetails.TOKEN_ROI_DTLS_LATEST_VIEW
        } as TRDL ON IRDV.DATE = TRDL.DATE where ITOKEN_ADDR='${iTokenAddress}' AND DATE(IRDV.DATE) >= DATE('${new Date(
          min
        ).toISOString()}') AND DATE(IRDV.DATE) <= DATE('${new Date(
          max
        ).toISOString()}') ORDER BY IRDV.DATE) SELECT * FROM ( SELECT ONLY_DATE, MAX(DATE) as MAX_DATE FROM CHART_DATES GROUP BY ONLY_DATE) t JOIN CHART_DATES m on m.ONLY_DATE = t.ONLY_DATE and m.DATE = t.MAX_DATE`
        // dateFilter = `AND EXTRACT(TIME FROM DATETIME(IRDV.DATE)) = "00:00:00"`
        // dateFilter = `AND EXTRACT(HOUR FROM TO_TIMESTAMP(IRDV.DATE)) = '0' AND EXTRACT(MINUTE FROM TO_TIMESTAMP(IRDV.DATE)) = '0'`
      } else if (type === '1H') {
        // dateFilter = `AND EXTRACT(MINUTE FROM TO_TIMESTAMP(IRDV.DATE)) = '0'`
      }
      const roiQuery = `SELECT 
                          IALS.ITOKEN_ADDR,
                          DATE(IALS.CREATED_AT) AS ONLY_DATE,
                          TRDL.ETH_CUMULATIVE_ROI,
                          TRDL.TOTAL_MARKET_CUMULATIVE_ROI,
                          CAST(IALS.TOTALPOOLBALANCE AS BIGINT) / POW(10, 6) AS INVESTMENT,
                          IALS.INDEX_CUMULATIVE_ROI * 100 AS INDEX_CUMULATIVE_ROI,
                          IALS.CREATED_AT,
                          TRDL.DATE
                        FROM 
                        ${databaseDetails.SCHEMA_NAME}.${
                          databaseDetails.INDEX_CUMULATIVE_ROI_VIEW
                        } AS IALS 
                        RIGHT JOIN 
                        ${databaseDetails.SCHEMA_NAME}.${
                          databaseDetails.TOKEN_ROI_DETAILS_LATEST_VIEW_GRAPH
                        } AS TRDL 
                        ON 
                            TRDL.DATE >= DATEADD(SECOND, -15, IALS.DATE)
                            AND TRDL.DATE <= DATEADD(SECOND, 15, IALS.DATE)
                            AND LOWER(IALS.ITOKEN_ADDR) = LOWER(TRDL.ITOKEN)
                        WHERE 
                            LOWER(IALS.ITOKEN_ADDR) = LOWER('${iTokenAddress}') 
                            AND DATE(IALS.CREATED_AT) >= DATE('${new Date(
                              min
                            ).toISOString()}') 
                            AND DATE(IALS.CREATED_AT) <= DATE('${new Date(
                              max
                            ).toISOString()}')
                        ORDER BY 
                            IALS.DATE;
                        `
      const [chartDetails] = await db.query(
        type === '1D' ? query : roiQuery,
        0,
        null
      )

      const finalData = chartDetails.reduce((acc, cur) => {
        acc[cur.DATE] = cur
        return acc
      }, {})
      res.send({
        status: 200,
        message: 'Records found',
        data: finalData,
      })
    } catch (error) {
      res.status(500).send({
        error: error,
      })
    }
  }

  public static indexChartDataDates = async (req: Request, res: Response) => {
    try {
      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*')
      const iTokenAddress = req.params['iTokenAddress']

      const roiQuery = `SELECT MAX(DATE) as max, MIN(DATE) as min from ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INDEX_ROI_DTLS_LATEST_VIEW} where ITOKEN_ADDR='${iTokenAddress}'`
      const [chartDates] = await db.query(roiQuery)

      if (chartDates.length === 0) {
        return res.status(400).send({
          message: 'No records found',
          data: {},
        })
      }
      res.send({
        status: 200,
        message: 'Records found',
        data: {
          min: chartDates[0].MIN,
          max: chartDates[0].MAX,
        },
      })
    } catch (error) {
      res.status(500).send({
        error: error,
      })
    }
  }

  public static getIndexByCategory = async (_req: Request, res: Response) => {
    const data = {
      mostInvested: {},
      highestEarner: {},
      lowestRisk: {},
    }
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*')
    // A.NET_PROFIT IS NULL ASC
    const indexAggregatesView = `.${databaseDetails.SCHEMA_NAME}."INDICES_AGGREGATES_LATEST_SNAPSHOT`
    const indexDetailsView = `.${databaseDetails.SCHEMA_NAME}."INDICES_DETAILS_LATEST_SNAPSHOT_VIEW`

    const mostInvestedQuery = `select A.*, B.* from "${indexAggregatesView}" A LEFT JOIN "${indexDetailsView}" B ON A.ITOKEN_ADDR = B.ITOKEN_ADDR ORDER BY A.CREATED_AT DESC, A.INVESTMENT DESC LIMIT 1`
    const highestEarnQuery = `select A.*, B.* from "${indexAggregatesView}" A LEFT JOIN "${indexDetailsView}" B ON A.ITOKEN_ADDR = B.ITOKEN_ADDR ORDER BY A.CREATED_AT DESC, A.NET_PROFIT DESC LIMIT 1`
    const lowestRiskQuery = `select A.*, B.* from "${indexAggregatesView}" A LEFT JOIN "${indexDetailsView}" B ON A.ITOKEN_ADDR = B.ITOKEN_ADDR ORDER BY A.CREATED_AT DESC, A.NET_PROFIT DESC LIMIT 1`

    const [[mostInvestedIndex], [highestEarnIndex], [lowestRiskQueryIndex]] =
      await Promise.all([
        db.query(mostInvestedQuery),
        db.query(highestEarnQuery),
        db.query(lowestRiskQuery),
      ])
    data.mostInvested = mostInvestedIndex ? _.first(mostInvestedIndex) : {}
    data.highestEarner = highestEarnIndex ? _.first(highestEarnIndex) : {}
    data.lowestRisk = lowestRiskQueryIndex ? _.first(lowestRiskQueryIndex) : {}

    res.send({
      status: 200,
      data,
    })
  }

  public static getTokensOfIndices = async (req: Request, res: Response) => {
    try {
      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*')
      const iTokenAddress = req.params['iTokenAddress']
      // const query = `select DISTINCT TOKEN_CONTRACT_ADDR, TOKEN_WEIGHT from ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INDEX_TOKEN_DETAILS} where ITOKEN_ADDR='${iTokenAddress}' AND CREATED_AT = (SELECT MAX(CREATED_AT) FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INDEX_TOKEN_DETAILS} WHERE ITOKEN_ADDR = '${iTokenAddress}')`
      const query = `select TOKEN_CONTRACT_ADDR, TOKEN_WEIGHT,DATE_TRUNC('MINUTE', CREATED_AT) AS CREATED_AT_MIN from ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INDEX_TOKEN_DETAILS}
where ITOKEN_ADDR='${iTokenAddress}' AND 
 CREATED_AT_MIN = 
 (SELECT DATE_TRUNC('MINUTE', max(CREATED_AT)) FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INDEX_TOKEN_DETAILS} WHERE ITOKEN_ADDR = '${iTokenAddress}')`
      const [resp] = await db.query(query)

      // const finalResponse = resp.reduce((acc, cur) => {
      //   acc[cur.TOKEN_CONTRACT_ADDR] = cur
      //   return acc
      // }, {})

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

  public static mostInvested = async (_: Request, res: Response) => {
    try {
      const query = `select MAX(TVL) from ${sqlQueries.indicesPriceDaily} where TVL = SELECT(SELECT MAX(TVL) )`
      const [response] = await db.query(query)
      res.send({
        status: 200,
        data: response,
      })
    } catch (err) {
      res.status(500).send({
        error: err,
      })
    }
  }

  public static highestEarner = async (_: Request, res: Response) => {
    try {
      const query = `select * from ${sqlQueries.indicesPriceDaily}`
      const [response] = await db.query(query)
      res.send({
        status: 200,
        data: response,
      })
    } catch (err) {
      res.status(500).send({
        error: err,
      })
    }
  }

  public static lowestRisk = async (_: Request, res: Response) => {
    try {
      const query = `select * from ${sqlQueries.indicesPriceDaily}`
      const [response] = await db.query(query)
      res.send({
        status: 200,
        data: response,
      })
    } catch (err) {
      res.status(500).send({
        error: err,
      })
    }
  }
}
