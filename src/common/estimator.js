const debug = require('debug')('my-covid19-api:debug');

const currentlyInfected = (current, days) => {
  const fac = Math.trunc(days / 3);
  const infected = Math.trunc(current * 2 ** fac);
  return infected;
};

const availableBeds = (severeCasesByRequestedTime, totalHospitalBeds) => {
  const hospitalBedsByRequestedTime = Math.trunc(
    (35 / 100) * totalHospitalBeds - severeCasesByRequestedTime
  );
  return hospitalBedsByRequestedTime;
};

const getNumberOfDays = (periodType, timeSpan) => {
  switch (periodType.trim().toLowerCase()) {
    case 'days':
      return timeSpan;
      break;
    case 'weeks':
      return timeSpan * 7;
      break;
    case 'months':
      return timeSpan * 30;
      break;

    default:
      return 0;
      break;
  }
};

const generateImpact = (
  covid19Cases,
  timeInDays,
  hospitalBeds,
  avgIncome,
  avgIncomePopulation
) => {
  debug('time', timeInDays);
  const currentInfections = covid19Cases * 10;

  const infectionsByRequestedTime = currentlyInfected(
    currentInfections,
    timeInDays
  );

  const severeCasesByRequestedTime = Math.trunc(
    (15 / 100) * infectionsByRequestedTime
  );

  const hospitalBedsByRequestedTime = availableBeds(
    severeCasesByRequestedTime,
    hospitalBeds
  );

  const casesForICUByRequestedTime = Math.trunc(
    (5 / 100) * infectionsByRequestedTime
  );

  const casesForVentilatorsByRequestedTime = Math.trunc(
    (2 / 100) * infectionsByRequestedTime
  );

  const dollarsInFlight = Math.trunc(
    (infectionsByRequestedTime * avgIncomePopulation * avgIncome) / timeInDays
  );

  const impact = {
    currentlyInfected: currentInfections,
    infectionsByRequestedTime: infectionsByRequestedTime,
    severeCasesByRequestedTime: severeCasesByRequestedTime,
    hospitalBedsByRequestedTime: hospitalBedsByRequestedTime,
    casesForICUByRequestedTime: casesForICUByRequestedTime,
    casesForVentilatorsByRequestedTime: casesForVentilatorsByRequestedTime,
    dollarsInFlight: dollarsInFlight,
  };
  debug(impact);
  return impact;
};

const generateSevereImpact = (
  covid19Cases,
  timeInDays,
  hospitalBeds,
  avgIncome,
  avgIncomePopulation
) => {
  debug('time', timeInDays);
  const currentInfections = covid19Cases * 50;

  const infectionsByRequestedTime = currentlyInfected(
    currentInfections,
    timeInDays
  );

  const severeCasesByRequestedTime = Math.trunc(
    (15 / 100) * infectionsByRequestedTime
  );

  const hospitalBedsByRequestedTime = availableBeds(
    severeCasesByRequestedTime,
    hospitalBeds
  );

  const casesForICUByRequestedTime = Math.trunc(
    (5 / 100) * infectionsByRequestedTime
  );

  const casesForVentilatorsByRequestedTime = Math.trunc(
    (2 / 100) * infectionsByRequestedTime
  );

  const dollarsInFlight = Math.trunc(
    (infectionsByRequestedTime * avgIncomePopulation * avgIncome) / timeInDays
  );

  const severeImpact = {
    currentlyInfected: currentInfections,
    infectionsByRequestedTime: infectionsByRequestedTime,
    severeCasesByRequestedTime: severeCasesByRequestedTime,
    hospitalBedsByRequestedTime: hospitalBedsByRequestedTime,
    casesForICUByRequestedTime: casesForICUByRequestedTime,
    casesForVentilatorsByRequestedTime: casesForVentilatorsByRequestedTime,
    dollarsInFlight: dollarsInFlight,
  };
  debug(severeImpact);
  return severeImpact;
};

const Covid19 = {
  async estimator(data) {
    // genearte impact report
    const impact = await generateImpact(
      data.reportedCases,
      await getNumberOfDays(data.periodType, data.timeToElapse),
      data.totalHospitalBeds,
      data.region.avgDailyIncomeInUSD,
      data.region.avgDailyIncomePopulation
    );

    // generate Severe impact report

    const severeImpact = await generateSevereImpact(
      data.reportedCases,
      await getNumberOfDays(data.periodType, data.timeToElapse),
      data.totalHospitalBeds,
      data.region.avgDailyIncomeInUSD,
      data.region.avgDailyIncomePopulation
    );

    return { data: data, impact: impact, severeImpact: severeImpact };
  },
};

module.exports = Covid19;
