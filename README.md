# Blue Archive Sound Sorter

Extract BGM files from MediaPatch directory of Blue Archive JP.

> **LEGAL NOTICE**  
> You must not redistribute files from MediaPatch. This includes files created/converted from MediaPatch.

## Requirement

1. Node +20
2. FFmpeg executable in `PATH`  
   Only if you use `convert` subcommand

## Usage

### 1. Clone or download repository

This is not NPM package. You have to either clone or download this repository. It is intentional.

```bash
# Clone
git clone https://github.com/TetraTheta/BlueArchiveSoundSorter
# Download
# Just click 'Code - Download ZIP' and extract it somewhere
```

### 2. Get MediaPatch from Blue Archive JP

If you experience problems logging in as a guest, try to install the Android Webview package.

You must finish a tutorial (Battle with Wakamo & S.C.H.A.L.E. Recapture) to get the full MediaPatch directory. Files are downloaded while you are playing the tutorial. After finishing the tutorial, you can close the game.

Run these commands in the terminal.

```bash
# cd to /sdcard
cd /sdcard
# (Optional) get root permission
su
# pack MediaPatch directory
tar -czvf /sdcard/MediaPatch.tar.gz /sdcard/Android/data/com.YostarJP.BlueArchive/files/MediaPatch/
# (Optional) copy OBB file
cp /sdcard/Android/obb/com.YostarJP.BlueArchive/main.246192.com.YostarJP.BlueArchive.obb /sdcard/obb.zip
```

Now, copy `MediaPatch.tar.gz` and `obb.zip` file to your PC.

Extract contents of `MediaPatch.tar.gz` to `BlueArchiveSoundSorter` like this:
```
/path/to/BlueArchiveSoundSorter/.source/MediaPatch/<lots of files>
```

### 3. Install required packages

Run this command in `BlueArchiveSoundSorter`.

```bash
npm ci
```

### 4. Run commands

Now you can run commands of BlueArchiveSoundSorter.

#### `sort`

Renames BGM files based on data of 'MediaCatalog.json' file.

```
node ./index.mjs sort [-s|--source <path>] [-o|--output <path>] [-c|--catalog <file>] [-t|--theme-only <boolean>]
```

- `--source`, `-s`: Path which have 'MediaCatalog.json' and media files. (Default: `./.source/MediaPatch/`)
- `--output`, `-o`: Path to save renamed media files. (Default: `./.source/RenamedOGG/`)
- `--catalog`, `-c`: Path of 'MediaCatalog.json' (Default: `./.source/MediaPatch/MediaCatalog.json`)
- `--theme-only`, `-t`: Process OST file only? (Default: `true`)

If you followed the instructions above, you don't need to provide any options except for `--theme-only` which is your preference. Do note that if you provide `false` to `--theme-only`, it will take very long time to finish the process because it will try to *sort* other audio files like Character Voice etc.

Some files are not in `MediaPatch` directory. In this case, they should be inside of `obb.zip`. That's why I instructed you to copy OBB file too.

#### `convert`

Convert OGG files to MP3 format (320kbps, 48000Hz)

```
node ./index.mjs convert [-s|--source <path>] [-o|--output <path>]
```

- `--source`, `-s`: Path which have OGG files to convert. (Default: `./.source/RenamedOGG/`)
- `--output`, `-o`: Path to save converted MP3 files. (Default: `./.source/MP3/`)

I know that this is overkill to convert OGG files to MP3 format, but I couldn't find any way to apply metadata(tag) to OGG file.

#### `tag`

Apply IDv3 tags to MP3 files and rename them. This is irreversible!

```
node ./index.mjs sort [-s|--source <path>] [-d|--database <file>] [-a|--album-art <file>]
```

- `--source`, `-s`: Path which contains MP3 files for tagging. (Default: `./.source/MP3/`)
- `--database`, `-d`: YAML file which have tag information. (Default: `./asset/tag_db.yml`)
- `--album-art`, `-a`: Album Art file. (Default: `./asset/game_ost_album_art.webp`)
