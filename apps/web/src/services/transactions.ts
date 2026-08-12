import algosdk from "algosdk";
import { getAlgodClient, USDC_ASA_ID } from "./algorand";
import { getPeraWallet } from "./peraWallet";

export const optInToUsdc = async (senderAddress: string) => {
  const algodClient = getAlgodClient();
  const peraWallet = getPeraWallet();

  const suggestedParams = await algodClient.getTransactionParams().do();

  // ASA Opt-in is a 0 amount transfer to self
  const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: senderAddress,
    receiver: senderAddress,
    amount: 0,
    assetIndex: USDC_ASA_ID,
    suggestedParams,
  });

  const singleTxnGroups = [{ txn: optInTxn, signers: [senderAddress] }];

  try {
    const signedTxns = await peraWallet.signTransaction([singleTxnGroups]);

    // Convert Uint8Array to format acceptable by algod
    const txId = optInTxn.txID().toString();
    const { txid: confirmedTxId } = await algodClient.sendRawTransaction(signedTxns).do();

    // Wait for confirmation
    await algosdk.waitForConfirmation(algodClient, confirmedTxId, 4);

    return confirmedTxId;
  } catch (error) {
    console.error("Error opting into USDC:", error);
    throw error;
  }
};

export const sendUsdc = async (senderAddress: string, receiverAddress: string, amountStr: string, skillId?: string) => {
  const algodClient = getAlgodClient();
  const peraWallet = getPeraWallet();

  const suggestedParams = await algodClient.getTransactionParams().do();

  // Convert price string to micro USDC (6 decimals)
  const amount = Math.floor(parseFloat(amountStr) * 1_000_000);

  const txnParams: any = {
    sender: senderAddress,
    receiver: receiverAddress,
    amount: amount,
    assetIndex: USDC_ASA_ID,
    suggestedParams,
  };

  if (skillId) {
    txnParams.note = new TextEncoder().encode(`agenthub:${skillId}`);
  }

  const transferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject(txnParams);

  const singleTxnGroups = [{ txn: transferTxn, signers: [senderAddress] }];

  try {
    const signedTxns = await peraWallet.signTransaction([singleTxnGroups]);

    const txId = transferTxn.txID().toString();
    const { txid: confirmedTxId } = await algodClient.sendRawTransaction(signedTxns).do();

    // Wait for confirmation
    await algosdk.waitForConfirmation(algodClient, confirmedTxId, 4);

    return confirmedTxId;
  } catch (error) {
    console.error("Error sending USDC:", error);
    throw error;
  }
};
