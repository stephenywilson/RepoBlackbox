#!/usr/bin/env node

function main(): void {
  const args = process.argv.slice(2);

  if (args.includes('--version') || args.includes('-v')) {
    // BUG: this should match package.json (currently 0.2.0)
    console.log('0.1.1');
    return;
  }

  console.log('Hello from demo CLI');
}

main();
