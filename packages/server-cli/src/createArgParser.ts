import { Command } from 'commander';

import { addItems } from './add';
import { buildSdks } from './build';
import { listItems } from './list';
import { remove } from './remove';

export function createArgParser(): Command {
  const root = new Command();

  root.version('1.0.0-alpha.0');

  root
    .command('add <type>')
    .description('Add an item to the db')
    .action(addItems);

  root
    .command('list <type> [filters...]')
    .description('List items in db')
    .action(listItems);

  root
    .command('remove <type> [ids...]')
    .description('Remove items from db')
    .action(remove);

  root
    .command('build <specId> <sdkConfigIds...>')
    .description('Runs the build process for an SDK')
    .action(buildSdks);

  return root;
}
