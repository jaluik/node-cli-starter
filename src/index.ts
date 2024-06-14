#!/usr/bin/env node

import { Command } from 'commander';
const program = new Command();

program
  .name(process.env.NAME)
  .description(process.env.DESCRIPTION)
  .version(process.env.VERSION);

program.parse(process.argv);

const options = program.opts();

console.log('options', options);
