import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import numeral from "numeral";
import axios from 'axios'

const options = {
  legend: {
    display: false,
  },
  elements: {
    point: {
      radius: 0,
    },
  },
  maintainAspectRatio: false,
  tooltips: {
    mode: "index",
    intersect: false,
    callbacks: {
      label: function (tooltipItem, data) {
        return numeral(tooltipItem.value).format("+0,0");
      },
    },
  },
  scales: {
    xAxes: [
      {
        type: "time",
        time: {
          format: "MM/DD/YY",
          tooltipFormat: "ll",
        },
      },
    ],
    yAxes: [
      {
        gridLines: {
          display: false,
        },
        ticks: {
          // Include a dollar sign in the ticks
          callback: function (value, index, values) {
            return numeral(value).format("0a");
          },
        },
      },
    ],
  },
};



const buildChartData = (data, casesType) => {
  console.log(data)
  let chartData = [];
  let lastDataPoint;
  for (let date in data) {
    if (lastDataPoint) {
      let newDataPoint = {
        x: date,
        y: data[date] - lastDataPoint,
      };
      chartData.push(newDataPoint);
    }
    lastDataPoint = data[date];
  }
  return chartData;
};

let cases = []

function LineGraph({ casesType = "cases", country }) {
  var countryCode = country;
  if (countryCode === "worldwide") {
    countryCode = "all"
  };
  console.log(countryCode);
  const [data, setData] = useState({});

  useEffect(() => {
    if (countryCode === "all") {
      const fetchData = async () => {
        await axios.get("https://disease.sh/v3/covid-19/historical/all?lastdays=120")
          .then((response) => {
            console.log('response', response.data.cases)
            cases.push(response.data.cases)
            setData(cases)
            return response.data.cases
          })
          .then((data) => {
            let chartData = buildChartData(data, casesType);
            setData(chartData);
            console.log(chartData);
            // buildChart(chartData);
          });
      };

      fetchData();
    } else {
      const fetchData = async () => {
        await axios.get(`https://disease.sh/v3/covid-19/historical/${countryCode}?lastdays=120`)
          .then((response) => {
            console.log('responce', response.data.timeline.cases)
            cases.push(response.data.timeline.cases)
            setData(cases)
            return response.data.timeline.cases
          })
          .then((data) => {
            let chartData = buildChartData(data, casesType);
            setData(chartData);
            console.log(chartData);
            // buildChart(chartData);
          });
      };

      fetchData();
    }
  }, [casesType, countryCode]);
  console.log(countryCode);

  return (
    <div>
      {data?.length > 0 && (
        <Line
          data={{
            datasets: [
              {
                backgroundColor: "rgba(204, 16, 52, 0.5)",
                borderColor: "#CC1034",
                data: data,
              },
            ],
          }}
          options={options}
        />
      )}
    </div>
  );
}

export default LineGraph;
