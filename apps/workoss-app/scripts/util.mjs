import chalk from 'chalk';
import ProgressBar from 'progress';

const common_text = chalk.blue;
const info_text = chalk.green;
const error_text = chalk.red;
const warn_text = chalk.yellow;
const debug_text = chalk.gray;

export const downloadProgressBar = (total) => {
  const progressBar = new ProgressBar(
    chalk.green('downloading [:bar] :rate/bps :percent :etas'),
    {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: total,
    },
  );
};

export const log = (message, ...optionalParams) => {
  console.log(common_text(`[LOG] ${message}`), ...optionalParams);
};
export const log_debug = (message, ...optionalParams) => {
  console.debug(debug_text(`[DEBUG] ${message}`), ...optionalParams);
};
export const log_info = (message, ...optionalParams) => {
  console.info(info_text(`[INFO] ${message}`), ...optionalParams);
};
export const log_warn = (message, ...optionalParams) => {
  console.warn(warn_text(`[WARN] ${message}`), ...optionalParams);
};
export const log_error = (message, ...optionalParams) => {
  console.error(error_text(`[ERROR] ${message}`), ...optionalParams);
};
