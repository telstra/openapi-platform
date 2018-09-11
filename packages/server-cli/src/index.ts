import program from 'commander';

program
  .version('1.0.0-alpha.0')
  .command('add <type>', 'Add an item')
  .command('list <type> [filters...]', 'List items in db')
  .command('remove <type> <ids...>', 'Remove items from db')
  .command('build <sdk>', 'Runs the build process for an SDK');

program.parse(process.argv);
