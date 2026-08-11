async function fetchTxn() {
  const url = 'https://testnet-api.4160.nodely.dev/v2/transactions/pending/MXKFCFZZX4ZVUJR5PHBIIJEQ3IX5CUARBSRF4HS3ISVWBBX7ETMQ';
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
fetchTxn();
