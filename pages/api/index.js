const math = require("mathjs");

let previousTime = 10;
let timeDifference = 10;
let x = 10;
let y = 20;
let running = false; // to avoid race condition
let simulations;

export default function handler(req, res) {
  const { method, query, body } = req;
  console.log("method and query:", method, body);
  // Example usage
  const initialPrice = body.initialPrice; // Initial asset price
  const historicalReturns = body.historicalReturns; // Sample daily returns
  const simulationDays = body.simulationDays; // Number of days to simulate
  const numberOfSimulations = body.numberOfSimulations; // Number of simulation runs

  switch (method) {
    case "GET":
      var currentTime = new Date().getTime() / 1000;
      if (currentTime - previousTime > timeDifference) {
        try {
          simulations = monteCarloSimulation(
            initialPrice,
            historicalReturns,
            simulationDays,
            numberOfSimulations
          );

          console.log(simulations);
          res.status(200).json({ x1: simulations });
        } catch (error) {
          console.error(error.message);
        }
        // const values = getValues(query.id);
        // x = values[0];
        // y = values[1];
        previousTime = currentTime;
      } else {
        const values = simulations;
        res.status(200).json({ x1: values });
      }
    case "POST":
      var currentTime = new Date().getTime() / 1000;
      if (currentTime - previousTime > timeDifference) {
        try {
          simulations = monteCarloSimulation(
            initialPrice,
            historicalReturns,
            simulationDays,
            numberOfSimulations
          );

          console.log(simulations);
          res.status(200).json({ x1: simulations });
        } catch (error) {
          console.error(error.message);
        }
        // const values = getValues(query.id);
        // x = values[0];
        // y = values[1];
        previousTime = currentTime;
      } else {
        const values = simulations;
        res.status(200).json({ x1: values });
      }
  }
}

const getValues = (id) => {
  const a = x + id;
  const b = y + id;
  return [a, b];
};

function monteCarloSimulation(initialPrice, returns, days, simulations) {
  if (
    typeof initialPrice !== "number" ||
    !Array.isArray(returns) ||
    returns.length === 0 ||
    typeof days !== "number" ||
    days <= 0 ||
    typeof simulations !== "number" ||
    simulations <= 0
  ) {
    throw new Error("Invalid input parameters");
  }

  const simulationsData = [];

  for (let i = 0; i < simulations; i++) {
    let prices = [initialPrice];

    for (let day = 1; day < days; day++) {
      const dailyReturn = math.pickRandom(returns);
      const newPrice = prices[day - 1] * (1 + dailyReturn);
      prices.push(newPrice);
    }

    simulationsData.push(prices);
  }

  return simulationsData;
}
