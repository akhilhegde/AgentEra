import algosdk from "algosdk";
import { getAlgodClient, USDC_ASA_ID } from "./algorand";
import { getPeraWallet } from "./peraWallet";

export const optInToUsdc = async (senderAddress: string) => {
  const algodClient = getAlgodClient();
  const peraWallet = getPeraWallet();

  const suggestedParams = await algodClient.getTransactionParams().do();

  // ASA Opt-in is a 0 amount transfer to self
  const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: senderAddress,
    to: senderAddress,
    amount: 0,
    assetIndex: USDC_ASA_ID,
    suggestedParams,
  } as any);

  const singleTxnGroups = [{ txn: optInTxn, signers: [senderAddress] }];

  try {
    const signedTxns = await peraWallet.signTransaction([singleTxnGroups]);
    
    const sendResult = await algodClient.sendRawTransaction(signedTxns).do() as any;
    const confirmedTxId = sendResult.txId || sendResult.txid || optInTxn.txID().toString();
    
    // Wait for confirmation
    await algosdk.waitForConfirmation(algodClient, confirmedTxId, 4);
    
    return confirmedTxId;
  } catch (error) {
    console.error("Error opting into USDC:", error);
    throw error;
  }
};

export const sendUsdc = async (senderAddress: string, receiverAddress: string, amountStr: string) => {
  const algodClient = getAlgodClient();
  const peraWallet = getPeraWallet();

  const suggestedParams = await algodClient.getTransactionParams().do();
  
  // Convert price string to micro USDC (6 decimals)
  const amount = Math.floor(parseFloat(amountStr) * 1_000_000);

  const transferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: senderAddress,
    to: receiverAddress,
    amount: amount,
    assetIndex: USDC_ASA_ID,
    suggestedParams,
  } as any);

  const singleTxnGroups = [{ txn: transferTxn, signers: [senderAddress] }];

  try {
    const signedTxns = await peraWallet.signTransaction([singleTxnGroups]);
    
    const sendResult = await algodClient.sendRawTransaction(signedTxns).do() as any;
    const confirmedTxId = sendResult.txId || sendResult.txid || transferTxn.txID().toString();
    
    // Wait for confirmation
    await algosdk.waitForConfirmation(algodClient, confirmedTxId, 4);
    
    return confirmedTxId;
  } catch (error) {
    console.error("Error sending USDC:", error);
    throw error;
  }
};
