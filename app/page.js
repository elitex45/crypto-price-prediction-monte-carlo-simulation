"use client";
import Image from "next/image";
import { useState } from "react";
import Chart from "chart.js/auto";
import axios from "axios";
let chart;

export default function Home() {
  const [simulations, setSimulations] = useState([]);
  const [mean, setMean] = useState(0);
  const [lowerPrice, setlowerPrice] = useState(0);
  const [upperPrice, setupperPrice] = useState(0);

  const runSimulation = async () => {
    const options = {
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_COINRANKING_URL}/coin/Qwsogvtv82FCd/history`,
      params: {
        referenceCurrencyUuid: "yhjMzLPhuIDl",
        timePeriod: "1y",
      },
      headers: {
        "x-access-token": process.env.NEXT_PUBLIC_COINRANKING_API,
      },
    };
    // const options = {
    //   method: "GET",
    //   url: "https://coinranking1.p.rapidapi.com/coin/Qwsogvtv82FCd/history",
    //   params: {
    //     referenceCurrencyUuid: "yhjMzLPhuIDl",
    //     timePeriod: "1y",
    //   },
    //   headers: {
    //     "X-RapidAPI-Key": "979025566bmsh2cffc81f3b1dc28p1a86f5jsn1701c185b152",
    //     "X-RapidAPI-Host": "coinranking1.p.rapidapi.com",
    //   },
    // };
    let priceHistoryArray;
    try {
      const response = await axios.request(options);
      console.log("response data:", response.data);
      priceHistoryArray = response.data.data.history.map((entry) =>
        parseFloat(entry.price)
      );
      console.log("pricehistoryArray:", priceHistoryArray);
    } catch (error) {
      console.error(error);
    }
    const validPercentageChanges = priceHistoryArray.filter(
      (value) => !isNaN(value) && value !== undefined
    );

    // Calculate the mean (average) of the validPercentageChanges array
    const meanVar =
      validPercentageChanges.length > 0
        ? validPercentageChanges.reduce((sum, value) => sum + value, 0) /
          validPercentageChanges.length
        : 0; // Set mean to 0 if there are no valid values

    // const meanVar =
    //   priceHistoryArray.reduce((sum, value) => sum + value, 0) /
    //   priceHistoryArray.length;

    setMean(meanVar);
    setlowerPrice(meanVar * 0.9);
    setupperPrice(meanVar * 1.1);

    const dailChanges = calculateDailyChanges(priceHistoryArray);

    // const percentageChanges = dailChanges.map((price, index, array) => {
    //   if (index === 0) {
    //     return 0; // No percentage change for the first entry
    //   }
    //   const previousPrice = array[index - 1];
    //   return (price - previousPrice) / previousPrice;
    // });

    console.log("inside dailyChanges:", dailChanges);
    const response = await fetch("/api/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        initialPrice: priceHistoryArray[0],
        historicalReturns: dailChanges,
        simulationDays: 30,
        numberOfSimulations: 1000,
      }),
    });
    console.log("after that");

    const data = await response.json();
    console.log("data is:", data);
    setSimulations(data.x1);
    //console.log("simulations:", simulations);
    updateChart(data.x1);
  };

  function calculateDailyChanges(prices) {
    if (!Array.isArray(prices) || prices.length < 2) {
      throw new Error(
        "Invalid input. Provide an array of daily prices with at least two elements."
      );
    }

    const dailyChanges = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      const ratio = change / prices[i - 1];
      dailyChanges.push(ratio);
    }

    return dailyChanges;
  }

  const updateChart = (simulationsData) => {
    const ctx = document.getElementById("myChart").getContext("2d");

    const datasets = simulationsData.map((prices, index) => ({
      label: `Simulation ${index + 1}`,
      data: prices,
      borderColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
        Math.random() * 255
      }, 1)`,
      fill: false,
    }));

    const chartData = {
      labels: Array.from(
        { length: simulationsData[0].length },
        (_, i) => i + 1
      ),
      datasets: datasets,
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "linear",
          position: "bottom",
        },
      },
    };
    const configuration = {
      type: "line",
      data: chartData,
      options: chartOptions,
    };

    if (chart) {
      chart.destroy();
      chart = new Chart(ctx, configuration);
    } else {
      chart = new Chart(ctx, configuration);
    }

    //new Chart(ctx);
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      LowerPrice:{lowerPrice} Mean:{mean} UpperPrice:{upperPrice}
      <button onClick={runSimulation}>Run Simulation</button>
      {/* {simulations?.map((value, key) => {
        //console.log("value:", value);
        return <div key={key}>{value.toString()}</div>;
      })} */}
      <div style={{ height: "600px", width: "1000px" }}>
        <canvas id="myChart" width={400} height={20}></canvas>
      </div>
    </main>
  );
}
