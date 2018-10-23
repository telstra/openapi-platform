import { Command } from 'commander';
import { createArgParser } from './createArgParser';

createArgParser().parse(process.argv);
