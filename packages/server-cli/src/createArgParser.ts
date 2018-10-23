import { Command } from 'commander';

export function createArgParser(): Command {
  return new Command()
    .version('1.0.0-alpha.0')
    .command('add <type>', 'Add an item')
    .command('list <type> [filters...]', 'List items in db')
    .command('remove <type> <ids...>', 'Remove items from db')
    .command('build <spec id> <sdkConfigIds...>', 'Runs the build process for an SDK');
}