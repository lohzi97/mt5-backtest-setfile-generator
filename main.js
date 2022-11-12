import exceljs from 'exceljs';
import fsp from 'fs/promises';
import moment from 'moment';
import xml2js, { Builder } from 'xml2js';

import config from './config.js'

const MANUAL_ADJUSTMENT_CSV = config().manualAdjustmentCsv;
const SET_FILE_TEMPLATE = config().setFiletemplate;
const BACKTEST_RESULT_BASE_FOLDER = config().backtestResultBaseFolder;
const EA_NAME = config().eaName;
const QUEUE_BACKTEST_XML = config().queueBacktestXml;

/**
 * Main function.
 * @param {string[]} args an array of programe argument
 */
async function main(args) {
  console.log('Start of Programe.');

  // read manualAdjustmentCsv
  const manualAdjustmentCsvData = [];
  const manualAdjustmentCsvHeader = [];
  const workbook = new exceljs.Workbook();
  await workbook.xlsx.readFile(MANUAL_ADJUSTMENT_CSV);
  workbook.worksheets[0].eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      row.eachCell((cell, colNumber) => {
        manualAdjustmentCsvHeader.push(cell.value);
      });
    } else {
      const rowData = {};
      row.eachCell((cell, colNumber) => {
        rowData[manualAdjustmentCsvHeader[colNumber - 1]] = cell.value;
      });
      manualAdjustmentCsvData.push(rowData);
    }
  });

  // read template .set file
  const setFileTemplate = await fsp.readFile(SET_FILE_TEMPLATE, 'utf16le');

  // generate all the .set file
  const generateSetFilePromises = [];
  for (const data of manualAdjustmentCsvData) {
    if (data.Generate) {
      generateSetFilePromises.push((async _ => {
        let setFileContent = setFileTemplate;

        // replace datetime in template
        setFileContent = setFileContent.replaceAll('{{datetime}}', moment().format('YYYY.MM.DD HH:mm:ss'));

        // replace params in template
        for (const paramName of manualAdjustmentCsvHeader) {
          setFileContent = setFileContent.replaceAll(`{{${paramName}}}`, data[paramName]);
        }

        // write *.set file
        const filePath = BACKTEST_RESULT_BASE_FOLDER + '\\' + data.Adjustment + '\\input.set';
        await fsp.writeFile(filePath, setFileContent, {
          encoding: 'utf16le',
        });

      })());
    }
  }
  await Promise.all(generateSetFilePromises);

  // generate queueBacktest xml file
  const xmlObject = {
    queued: {
      backtest: []
    }
  }
  for (const data of manualAdjustmentCsvData) {
    if (data.Generate) {
      xmlObject.queued.backtest.push({
        eaName: EA_NAME,
        InputSetFile: BACKTEST_RESULT_BASE_FOLDER + '\\' + data.Adjustment + '\\input.set',
        backtestResultFolder: BACKTEST_RESULT_BASE_FOLDER + '\\' + data.Adjustment + '\\Backtest',
        forwardtestResultFolder: BACKTEST_RESULT_BASE_FOLDER + '\\' + data.Adjustment + '\\Forwardtest',
        completed: 'false'
      });
    }
  }
  const xmlBuilder = new xml2js.Builder();
  const xml = xmlBuilder.buildObject(xmlObject);
  await fsp.writeFile(QUEUE_BACKTEST_XML, xml);

  console.log('End of Programe.');
}

export default main;
