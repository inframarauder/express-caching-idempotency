const express = require("express");
const bodyParser = require("body-parser");
const memoryCache = require("memory-cache");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

let transactionStore = []; //simulation of a transaction table in a database

const cacheMiddlware = duration => (req, res, next) => {
  const key = req.get("Idempotency_Key");
  const cacheBody = memoryCache.get(key);
  if (cacheBody) {
    return res.send(JSON.parse(cacheBody));
  } else {
    res.sendResponse = res.send;
    res.send = body => {
      memoryCache.put(key, body, duration * 1000);
      res.sendResponse(body);
    };
    next();
  }
};

app.post("/", cacheMiddlware(60), (req, res) => {
  console.log("Inside Route Handler");
  transactionStore.push({
    id: transactionStore.length + 1,
    amount: req.body.amount
  });

  return res.send(transactionStore);
});

app.listen(4000, () => {
  console.log("Server running");
});
