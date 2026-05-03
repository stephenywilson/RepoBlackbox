import chalk from 'chalk';
import { RiskLevel } from './risk';

export const log = {
  info: (msg: string): void => console.log(chalk.blue('ℹ'), msg),
  success: (msg: string): void => console.log(chalk.green('✔'), msg),
  warn: (msg: string): void => console.log(chalk.yellow('⚠'), msg),
  error: (msg: string): void => console.log(chalk.red('✖'), msg),
  skip: (msg: string): void => console.log(chalk.gray('→'), chalk.gray(msg)),
  section: (msg: string): void => console.log('\n' + chalk.bold.white(msg)),
  raw: (msg: string): void => console.log(msg),
  dim: (msg: string): void => console.log(chalk.dim(msg)),
};

export function riskBadge(level: RiskLevel): string {
  if (level === 'HIGH') return chalk.bgRed.white.bold(` ${level} `);
  if (level === 'MEDIUM') return chalk.bgYellow.black.bold(` ${level} `);
  return chalk.bgGreen.white.bold(` ${level} `);
}

export function riskText(level: RiskLevel): string {
  if (level === 'HIGH') return chalk.red.bold(level);
  if (level === 'MEDIUM') return chalk.yellow.bold(level);
  return chalk.green.bold(level);
}

export function printBanner(title: string): void {
  console.log();
  console.log(chalk.bold.cyan('RepoBlackbox') + chalk.dim(' by Catalayer'));
  console.log(chalk.dim('─'.repeat(40)));
  console.log(chalk.bold(title));
  console.log();
}
