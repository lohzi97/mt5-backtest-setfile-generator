/**
 * Function to return the config object
 * @return {Object}  config object
 */
function config() {
  return {
    setFiletemplate: String.raw`C:\Users\LohziIdeaPad3\OneDrive\Documents HDD\Investment\forex\Trading\Backtest\DTS\V4\backtestTemplate.set`,
    manualAdjustmentCsv: String.raw`C:\Users\LohziIdeaPad3\OneDrive\Documents HDD\Investment\forex\Trading\Backtest\DTS\V4\ManualAdjustment.xlsx`,
    queueBacktestXml: String.raw`C:\Users\LohziIdeaPad3\OneDrive\Documents HDD\Investment\forex\Trading\Backtest\DTS\V4\queueBacktest.xml`,
    backtestResultBaseFolder: String.raw`C:\Users\LohziIdeaPad3\OneDrive\Documents HDD\Investment\forex\Trading\Backtest\DTS\V4`,
    eaName: 'DTS_V4.ex5',
  };
}

export default config;
