import { Command } from 'commander';

import { remove } from './remove';

export function createArgParser(): Command {
  const root = new Command();
  root.version('1.0.0-alpha.0').command('add <type>', 'Add an item');

  root.command('list <type> [filters...]', 'List items in db');

  root
    .command('remove <type> [ids...]')
    .description('Remove items from db')
    .action(remove)
    .command('build <spec id> <sdkConfigIds...>', 'Runs the build process for an SDK');
  return root;
}
