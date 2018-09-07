import program from 'commander';

import packageJson from '../package';

program
  .version(packageJson.version)
  .command('add [type]', 'Add an item')
  .command('list [type]', 'List items in db')
  .command('remove [type]', 'Remove items from db')
  .command('build [SDK]', 'Runs the build process for an SDK');

program.parse(process.argv);
