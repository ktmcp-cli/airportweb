import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig, getAllConfig } from './config.js';
import {
  listAirports,
  getAirportByIata,
  listAirportsByCountry,
  searchAirports,
  listAirlines,
  getAirline,
  searchAirlines,
  getRoutes,
  searchRoutes
} from './api.js';

const program = new Command();

// ============================================================
// Helpers
// ============================================================

function printSuccess(message) {
  console.log(chalk.green('✓') + ' ' + message);
}

function printError(message) {
  console.error(chalk.red('✗') + ' ' + message);
}

function printTable(data, columns) {
  if (!data || data.length === 0) {
    console.log(chalk.yellow('No results found.'));
    return;
  }

  const widths = {};
  columns.forEach(col => {
    widths[col.key] = col.label.length;
    data.forEach(row => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      if (val.length > widths[col.key]) widths[col.key] = val.length;
    });
    widths[col.key] = Math.min(widths[col.key], 40);
  });

  const header = columns.map(col => col.label.padEnd(widths[col.key])).join('  ');
  console.log(chalk.bold(chalk.cyan(header)));
  console.log(chalk.dim('─'.repeat(header.length)));

  data.forEach(row => {
    const line = columns.map(col => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      return val.substring(0, widths[col.key]).padEnd(widths[col.key]);
    }).join('  ');
    console.log(line);
  });

  console.log(chalk.dim(`\n${data.length} result(s)`));
}

function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

async function withSpinner(message, fn) {
  const spinner = ora(message).start();
  try {
    const result = await fn();
    spinner.stop();
    return result;
  } catch (error) {
    spinner.stop();
    throw error;
  }
}

// ============================================================
// Program metadata
// ============================================================

program
  .name('airportweb')
  .description(chalk.bold('Airport Web CLI') + ' - Airports, airlines, and routes from your terminal')
  .version('1.0.0');

// ============================================================
// CONFIG
// ============================================================

const configCmd = program.command('config').description('Manage CLI configuration');

configCmd
  .command('get <key>')
  .description('Get a configuration value')
  .action((key) => {
    const value = getConfig(key);
    if (value === undefined) {
      printError(`Key '${key}' not found`);
    } else {
      console.log(value);
    }
  });

configCmd
  .command('set <key> <value>')
  .description('Set a configuration value')
  .action((key, value) => {
    setConfig(key, value);
    printSuccess(`Config '${key}' set`);
  });

configCmd
  .command('list')
  .description('List all configuration values')
  .action(() => {
    const all = getAllConfig();
    if (Object.keys(all).length === 0) {
      console.log(chalk.yellow('No configuration set. Airport Web API is public — no auth required.'));
    } else {
      console.log(chalk.bold('\nAirport Web CLI Configuration\n'));
      Object.entries(all).forEach(([k, v]) => {
        console.log(`${k}: ${chalk.cyan(String(v))}`);
      });
    }
  });

// ============================================================
// AIRPORTS
// ============================================================

const airportsCmd = program.command('airports').description('Search and browse airports');

airportsCmd
  .command('search <query>')
  .description('Search airports by name, city, or IATA code')
  .option('--limit <n>', 'Maximum number of results', '50')
  .option('--json', 'Output as JSON')
  .action(async (query, options) => {
    try {
      const airports = await withSpinner(`Searching airports for "${query}"...`, () =>
        searchAirports(query)
      );

      if (options.json) {
        printJson(airports);
        return;
      }

      const data = Array.isArray(airports) ? airports.slice(0, parseInt(options.limit)) : [];
      printTable(data, [
        { key: 'iata_code', label: 'IATA' },
        { key: 'icao_code', label: 'ICAO' },
        { key: 'name', label: 'Name' },
        { key: 'city', label: 'City' },
        { key: 'country', label: 'Country' },
        { key: 'latitude', label: 'Lat', format: (v) => v ? String(parseFloat(v).toFixed(4)) : '' },
        { key: 'longitude', label: 'Lon', format: (v) => v ? String(parseFloat(v).toFixed(4)) : '' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

airportsCmd
  .command('get <iata>')
  .description('Get airport details by IATA code')
  .option('--json', 'Output as JSON')
  .action(async (iata, options) => {
    try {
      const airport = await withSpinner(`Fetching airport ${iata.toUpperCase()}...`, () =>
        getAirportByIata(iata)
      );

      if (!airport) {
        printError('Airport not found');
        process.exit(1);
      }

      if (options.json) {
        printJson(airport);
        return;
      }

      console.log(chalk.bold('\nAirport Details\n'));
      console.log('IATA Code:     ', chalk.cyan(airport.iata_code || iata.toUpperCase()));
      console.log('ICAO Code:     ', airport.icao_code || 'N/A');
      console.log('Name:          ', chalk.bold(airport.name || 'N/A'));
      console.log('City:          ', airport.city || 'N/A');
      console.log('Country:       ', airport.country || 'N/A');
      console.log('Latitude:      ', airport.latitude || 'N/A');
      console.log('Longitude:     ', airport.longitude || 'N/A');
      console.log('Timezone:      ', airport.timezone || 'N/A');
      console.log('Elevation:     ', airport.altitude ? `${airport.altitude} ft` : 'N/A');
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

airportsCmd
  .command('list')
  .description('List airports')
  .option('--limit <n>', 'Maximum number of results', '50')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const airports = await withSpinner('Fetching airports...', () =>
        listAirports({ limit: parseInt(options.limit) })
      );

      if (options.json) {
        printJson(airports);
        return;
      }

      const data = Array.isArray(airports) ? airports : [];
      printTable(data, [
        { key: 'iata_code', label: 'IATA' },
        { key: 'icao_code', label: 'ICAO' },
        { key: 'name', label: 'Name' },
        { key: 'city', label: 'City' },
        { key: 'country', label: 'Country' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

airportsCmd
  .command('by-country <country>')
  .description('List airports by country code (e.g. US, DE, GB)')
  .option('--json', 'Output as JSON')
  .action(async (country, options) => {
    try {
      const airports = await withSpinner(`Fetching airports in ${country}...`, () =>
        listAirportsByCountry(country)
      );

      if (options.json) {
        printJson(airports);
        return;
      }

      const data = Array.isArray(airports) ? airports : [];
      printTable(data, [
        { key: 'iata_code', label: 'IATA' },
        { key: 'icao_code', label: 'ICAO' },
        { key: 'name', label: 'Name' },
        { key: 'city', label: 'City' },
        { key: 'country', label: 'Country' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// AIRLINES
// ============================================================

const airlinesCmd = program.command('airlines').description('Search and browse airlines');

airlinesCmd
  .command('list')
  .description('List airlines')
  .option('--limit <n>', 'Maximum number of results', '50')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const airlines = await withSpinner('Fetching airlines...', () =>
        listAirlines({ limit: parseInt(options.limit) })
      );

      if (options.json) {
        printJson(airlines);
        return;
      }

      const data = Array.isArray(airlines) ? airlines : [];
      printTable(data, [
        { key: 'iata_code', label: 'IATA' },
        { key: 'icao_code', label: 'ICAO' },
        { key: 'name', label: 'Name' },
        { key: 'country', label: 'Country' },
        { key: 'active', label: 'Active', format: (v) => v ? 'Yes' : 'No' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

airlinesCmd
  .command('get <iata>')
  .description('Get airline details by IATA code')
  .option('--json', 'Output as JSON')
  .action(async (iata, options) => {
    try {
      const airline = await withSpinner(`Fetching airline ${iata.toUpperCase()}...`, () =>
        getAirline(iata)
      );

      if (!airline) {
        printError('Airline not found');
        process.exit(1);
      }

      if (options.json) {
        printJson(airline);
        return;
      }

      console.log(chalk.bold('\nAirline Details\n'));
      console.log('IATA Code:     ', chalk.cyan(airline.iata_code || iata.toUpperCase()));
      console.log('ICAO Code:     ', airline.icao_code || 'N/A');
      console.log('Name:          ', chalk.bold(airline.name || 'N/A'));
      console.log('Country:       ', airline.country || 'N/A');
      console.log('Active:        ', airline.active ? chalk.green('Yes') : chalk.red('No'));
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

airlinesCmd
  .command('search <query>')
  .description('Search airlines by name or code')
  .option('--json', 'Output as JSON')
  .action(async (query, options) => {
    try {
      const airlines = await withSpinner(`Searching airlines for "${query}"...`, () =>
        searchAirlines(query)
      );

      if (options.json) {
        printJson(airlines);
        return;
      }

      const data = Array.isArray(airlines) ? airlines : [];
      printTable(data, [
        { key: 'iata_code', label: 'IATA' },
        { key: 'icao_code', label: 'ICAO' },
        { key: 'name', label: 'Name' },
        { key: 'country', label: 'Country' },
        { key: 'active', label: 'Active', format: (v) => v ? 'Yes' : 'No' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// ROUTES
// ============================================================

const routesCmd = program.command('routes').description('Search and browse flight routes');

routesCmd
  .command('get')
  .description('Get routes between airports')
  .option('--from <iata>', 'Departure airport IATA code')
  .option('--to <iata>', 'Arrival airport IATA code')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    if (!options.from && !options.to) {
      printError('Please specify at least --from or --to');
      process.exit(1);
    }

    try {
      const routes = await withSpinner('Fetching routes...', () =>
        getRoutes({ from: options.from, to: options.to })
      );

      if (options.json) {
        printJson(routes);
        return;
      }

      const data = Array.isArray(routes) ? routes : [];
      printTable(data, [
        { key: 'dep_iata', label: 'From' },
        { key: 'arr_iata', label: 'To' },
        { key: 'airline_iata', label: 'Airline' },
        { key: 'codeshare', label: 'Codeshare', format: (v) => v ? 'Yes' : 'No' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

routesCmd
  .command('search')
  .description('Search routes with filters')
  .option('--from <iata>', 'Departure airport IATA code')
  .option('--to <iata>', 'Arrival airport IATA code')
  .option('--airline <iata>', 'Filter by airline IATA code')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const routes = await withSpinner('Searching routes...', () =>
        searchRoutes({ from: options.from, to: options.to, airline: options.airline })
      );

      if (options.json) {
        printJson(routes);
        return;
      }

      const data = Array.isArray(routes) ? routes : [];
      printTable(data, [
        { key: 'dep_iata', label: 'From' },
        { key: 'arr_iata', label: 'To' },
        { key: 'airline_iata', label: 'Airline' },
        { key: 'codeshare', label: 'Codeshare', format: (v) => v ? 'Yes' : 'No' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// Parse
// ============================================================

program.parse(process.argv);

if (process.argv.length <= 2) {
  program.help();
}
