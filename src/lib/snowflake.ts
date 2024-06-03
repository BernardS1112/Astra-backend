import { SnowflakeQueryInterface, SnowflakeResultInterface } from '@/types'
import { configure, createPool } from 'snowflake-sdk'
import dotenv from 'dotenv'
import path from 'path'
import { databaseDetails } from '@/config'
import { EventEmitter } from 'stream'

dotenv.config({
  path: path.join(__dirname, `../.env`),
})

export class SnowflakeServiceAbstract {
  private connectionPool: ReturnType<typeof createPool>

  constructor() {
    configure({
      insecureConnect: true,
      ocspFailOpen: true,
    })
    this.connectionPool = createPool(
      {
        authenticator: 'SNOWFLAKE',
        account: 'bta69289.us-east-1',
        password: 'Astra123#',
        username: 'ASTRA_DI_USER',
        role: 'ASTRADAO',
        warehouse: 'TM_DI_WH',
        database: databaseDetails.DATABASE_NAME,
        schema: 'BLOCKCHAIN',
        accessUrl: 'https://bta69289.us-east-1.snowflakecomputing.com',
        clientSessionKeepAlive: true,
      },
      {
        max: 10,
        min: 0,
      }
    )
    const emitter = new EventEmitter()
    emitter.setMaxListeners(50)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public query = async <T = any>(
    query: string,
    startIndex: number | null = 0,
    endIndex: number | null = 0
  ): Promise<T[][]> => {
    const res = await this.executeQuery<T>({
      query,
      startIndex,
      endIndex,
    })
    return [res.results]
  }

  public executeQuery = async <T>(
    req: SnowflakeQueryInterface
  ): Promise<SnowflakeResultInterface<T>> =>
    new Promise(async (resolve, reject) => {
      try {
        /* PAGINATION */
        const startIndex: number | null = req.startIndex ? req.startIndex : 0
        const endIndex =
          req.endIndex === null
            ? undefined
            : req.count
            ? startIndex + Math.min(req.count, 999) - 1
            : startIndex + 999

        await this.connectionPool.use(async (connection: any) =>
          connection.execute({
            sqlText: req.query,
            binds: req.binds ? req.binds : [],
            streamResult: true,
            complete: (completeErr: any, statement: any) => {
              if (completeErr) {
                console.error(completeErr)
                reject(completeErr)
              }
              const rowsArr: T[] = []
              const stream = statement.streamRows({
                start: startIndex,
                end: endIndex,
              })
              stream.on('error', async (streamErr: Error) => {
                try {
                  await this.cancelStatementSnowflake(statement)
                } catch (err) {
                  console.error(err)
                }
                reject(streamErr)
              })
              stream.on('data', (row: T) => {
                rowsArr.push(row)
              })
              stream.on('end', async () => {
                resolve({
                  total: statement.getNumRows(),
                  pageSize: rowsArr.length,
                  hasNextPage: endIndex
                    ? endIndex < statement.getNumRows() - 1
                    : false,
                  results: rowsArr,
                })
              })
            },
          })
        )
      } catch (err) {
        reject(err)
      }
    })

  private cancelStatementSnowflake = async (statement: any) =>
    new Promise((resolve, reject) => {
      try {
        statement.cancel((err: any, stmt: any) => {
          if (err) {
            console.error('Error while cancel statement: ', err.message)
            reject(err)
          } else {
            resolve(stmt)
          }
        })
      } catch (err) {
        reject(err)
      }
    })
}
