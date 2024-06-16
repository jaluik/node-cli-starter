#!/usr/bin/env node

import { Command } from 'commander';
import init from './init';
import update from './update';
const program = new Command();

// add basic info
program
  .name(process.env.NAME)
  .description(process.env.DESCRIPTION)
  .version(process.env.VERSION);

// add command options
program
  .command('init')
  .description('init command')
  .option('-p, --path <path>', 'project path', process.cwd())
  .action(({ path }: { path: string }) => {
    return init(path);
  });
program.command('update').description('update command').action(update);

program.parse(process.argv);
