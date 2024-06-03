import { formatEther } from 'viem'

export const convertToEther = (number: any) => {
  // return vfromWei(number, 'ether')
  return formatEther(number)
}
