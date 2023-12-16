#!/usr/bin/env node
import chalk from 'chalk'; // chalk is from commander!
import { exec, execSync } from 'child_process'
import { Command } from 'commander'
import fs from 'fs'
import yaml from 'js-yaml'
import { compare } from 'natural-orderby'
import NodeID3 from 'node-id3'
import path from 'path'

chalk.level = 1 // Use color in VS Code Debug Window
const program = new Command()
program
  .name('bass')
  .description('')
  .version('2.0.0')
// Sort
program
  .command('sort')
  .description('Renames BGM files based on data of \'MediaCatalog.json\' file.')
  .option('-s, --source <path>', 'Path which have \'MediaCatalog.json\' and media files', './.source/MediaPatch/')
  .option('-o, --output <path>', 'Path to save renamed media files', './.source/RenamedOGG/')
  .option('-c, --catalog <file>', 'Path of \'MediaCatalog.json\'', './.source/MediaPatch/MediaCatalog.json')
  .option('-t, --theme-only', 'Process OST file only?', true)
  .action((options) => {
    // check options
    if (!isDir(options.source)) error('Given source path is not valid directory: ', options.source)
    if (!isFile(options.catalog)) error('Given catalog path is not valid file: ', options.catalog)
    // create dictionary for file (name, size)
    console.log('Scanning MediaPatch dictionary... This will take a while. Please wait.')
    const fileDict = {}
    fs.readdirSync(options.source, {withFileTypes: true}).forEach(f => {
      // f is Dirent
      if (!f.isFile()) return // extra file check
      let ext = getExtension(f.name)
      if (ext == 'dat' || ext == 'hash' || ext == 'json') return
      fileDict[f.name] = fs.statSync(f.path + f.name).size
    })
    // create array for save files already warned
    const noticed = {}
    // read catalog
    const catalog = JSON.parse(fs.readFileSync(options.catalog, 'utf8'))
    // create directory for output
    if (!fs.existsSync(options.output)) {
      fs.mkdirSync(options.output, {recursive: true})
    }
    // start job
    console.log('Starting sort...')
    // loop catalog for sorting
    for (const item of Object.values(catalog['Table']).sort(compare())) {
      for (const [fk, fv] of Object.entries(fileDict).sort(compare())) {
        if (options.themeOnly && !item['path'].startsWith('Audio/BGM/')) continue
        if (item['IsPrologue'] === true && !noticed[item['FileName']]) {
          warn(`${item['FileName']} is not in MediaPatch directory! Extract it from APK or OBB file.`)
          noticed[item['FileName']] = true
          continue
        }
        if (parseInt(fv) === parseInt(item['Bytes'])) {
          const outputPath = path.join(path.resolve(options.output, item['FileName']))
          console.log(outputPath)
          fs.copyFileSync(path.resolve(options.source, fk), outputPath)
        }
      }
    }
    console.log('Job done.')
  })
// Convert
program
  .command('convert')
  .description('Convert OGG files to MP3 format (320kbps, 48000Hz)')
  .option('-s, --source <path>', 'Path which have OGG files to convert', './.source/RenamedOGG/')
  .option('-o, --output <path>', 'Path to save converted MP3 files', './.source/MP3/')
  .action((options) => {
    // check options
    if (!isDir(options.source)) error('Given source path is not valid directory: ', options.source)
    // check FFmpeg
    isFFmpegInPath().catch(() => {
      error('FFmpeg is not found in PATH. Aborting...')
      process.exit(1)
    })
    // create directory for output
    if (!fs.existsSync(options.output)) {
      fs.mkdirSync(options.output, {recursive: true})
    }
    // convert files
    fs.readdirSync(options.source).filter(file => file.toLowerCase().endsWith('.ogg')).forEach(file => {
      const oggPath = path.join(options.source, file)
      const mp3Path = path.join(options.output, path.basename(file, '.ogg') + '.mp3')

      try {
        console.log('Converting ' + chalk.yellow(file) + ' ...')
        execSync(`ffmpeg -i "${oggPath}" -c:a libmp3lame -b:a 320k -ar 48000 "${mp3Path}"`, {stdio: 'ignore'})
      } catch (err) {
        error(`Failed to convert ${oggPath}:\n${err.stderr.toString()}`)
      }
    })
  })
// Tag
program
  .command('tag')
  .description('Apply IDv3 tags to MP3 files and rename them. This is irreversible!')
  .option('-s, --source <path>', 'Path which contains MP3 files for tagging', './.source/MP3/')
  .option('-d, --database <file>', 'YAML file which have tag information', './asset/tag_db.yml')
  .option('-a, --album-art <file>', 'Album Art file', './asset/game_ost_album_art.webp')
  .action((options) => {
    // check options
    if (!isDir(options.source)) error('Given source path is not valid directory: ', options.source)
    if (!isFile(options.database)) error('Given database path is not valid file: ', options.catalog)
    // read database
    const db = yaml.load(fs.readFileSync(options.database, 'utf8'))
    fs.readdirSync(options.source).filter(file => file.toLowerCase().endsWith('.mp3')).forEach(file => {
      for (const entry of db['database']) {
        //console.log(entry)
        if (path.basename(file, '.mp3') === entry['name_old']) {
          console.log('Applying tag to ' + chalk.yellow(file) + ' ...')
          const aaBuffer = fs.readFileSync(options.albumArt)
          const tag = {
            title: entry['title'],
            artist: entry['artist'],
            album: db['common']['album'],
            performerInfo: db['common']['album_artist'],
            trackNumber: entry['track'],
            year: db['common']['year'],
            image: {
              mime: 'image/webp',
              imageBuffer: aaBuffer
            }
          }
          if (NodeID3.write(tag, path.join(options.source, file)) != true) {
            error('Failed to write IDv3 tag to ', file)
            return
          }
          const validName = entry['name_new'].replace(/[/\\?%*:|"<>]/g, '')
          fs.renameSync(path.join(options.source, file), path.join(options.source, validName + '.mp3'))
        }
      }
    })
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
  console.error(chalk.red('ERROR') + chalk.reset(': ' + msg) + chalk.yellow(yellow))
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
/**
 * 
 */
function isFFmpegInPath() {
  return new Promise((resolve, reject) => {
    exec('ffmpeg -version', (error, stdout, stderr) => {
      if (error) {
        reject(false)
      } else {
        resolve(true)
      }
    })
  })
}
/**
 * Print warning message
 * @param {*} msg message to print
 */
function warn(msg) {
  console.error(chalk.yellow('WARN') + chalk.reset(': ' + msg))
}
