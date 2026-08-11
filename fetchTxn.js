async function fetchTxn() {
  const url = 'https://testnet-idx.algonode.cloud/v2/transactions/MXKFCFZZX4ZVUJR5PHBIIJEQ3IX5CUARBSRF4HS3ISVWBBX7ETMQ';
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
fetchTxn();
