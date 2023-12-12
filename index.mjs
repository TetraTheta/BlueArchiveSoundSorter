#!/usr/bin/env node
import { Command } from 'commander'
import fs from 'fs'
import chalk from 'chalk' // chalk is from commander!
chalk.level = 1 // Use color in VS Code Debug Window
const program = new Command()
program
  .name('bass')
  .description('')
  .version('2.0.0')
// Sort
program
  .command('sort')
  .description('Renames BGM files based on \'MediaCatalog.json\' file.')
  .option('-s, --source <path>', 'Path which includes \'MediaCatalog.json\' and media files', './.source/MediaPatch/')
  .option('-o, --output <path>', 'Path to save renamed media files', './.source/RenamedOGG/')
  .option('-c, --catalog <file>', 'Path of \'MediaCatalog.json\'', './.source/MediaPatch/MediaCatalog.json')
  .option('-t, --theme-only', 'Process OST file only?', true)
  .action((options) => {
    // check options
    if (!isDir(options.source)) error('Given source path is not valid directory: ', options.source)
    if (!isFile(options.catalog)) error('Given catalog path is not valid file: ', options.catalog)
    // create dictionary for file (name, size)
    let fileDict = {}
    fs.readdirSync(options.source, {withFileTypes: true}).forEach(f => {
      // f is Dirent
      if (!f.isFile()) return // extra file check
      let ext = getExtension(f.name)
      if (ext == 'dat' || ext == 'hash' || ext == 'json') return
      fileDict[f.name] = fs.statSync(f.path + f.name).size
    })
    console.table(fileDict)
    // read catalog
    const catalog = fs.readFileSync(options.catalog, 'utf8')
    const catalogData = JSON.parse(catalog)
    // loop catalog for sorting
    catalogData.Table.forEach(item => {
      if (options.themeOnly && item.path.startsWith(''))
    })
  })
// Convert
program
  .command('convert')
  .description('Convert OGG files to MP3 format')
  .option('-s, --source <path>', 'Path which includes OGG files', './.source/RenamedOGG/')
  .option('-o, --output <path>', 'Path to save converted MP3 files', './.source/MP3/')
  .action((options) => {
    // check options
    if (!isDir(options.source)) error('Given source path is not valid directory: ', options.source)
    console.log('convert...')
  })
// Tag
program
  .command('tag')
  .description('Apply IDv3 tags to MP3 files. This is irreversible!')
  .option('-s, --source <path>', 'Path which includes MP3 files for tagging', './.source/MP3/')
  .option('-d, --database <file>', 'YAML file which have tag information', './asset/tag_db.yml')
  .action((options) => {
    // check options
    if (!isDir(options.source)) error('Given source path is not valid directory: ', options.source)
    if (!isFile(options.database)) error('Given database path is not valid file: ', options.catalog)
    console.log('tag...')
    console.log(options.source + ' ' + options.database)
  })
program.parse()

//
// functions
//
/**
 * Print error message
 * @param {*} msg message to print
 * @param {*} yellow anything to print as yellow text
 */
function error(msg, yellow = '') {
  console.error(chalk.red('ERR') + chalk.reset(': ' + msg) + chalk.yellow(yellow))
}
/**
 * Get extension from file name
 * @param {string} filename file name as string
 * @returns filename's extension
 */
function getExtension(filename) {
  // source: https://stackoverflow.com/a/12900504
  return filename.split('.').pop()
}
/**
 * Check given path is existing directory
 * @param {string} path Path to check if it is existing directory or not
 * @returns {boolean} true only when given path does exist and directory
 */
function isDir(path) {
  try {
    return fs.lstatSync(path).isDirectory()
  } catch (err) {
    return false
  }
}
/**
 * Check given path is existing file
 * @param {string} path Path to check if it is existing file or not
 * @return {boolean} true only when given path does exist and file
 */
function isFile(path) {
  try {
    return fs.lstatSync(path).isFile()
  } catch (err) {
    return false
  }
}
