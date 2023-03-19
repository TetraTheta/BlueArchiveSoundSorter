# Blue Archive Sound Sorter

Python scripts written for Blue Archive JP version.

## BGM JP Sorter

Based on the information in the `MediaCatalog.json` file, it restores the original names of BGM files as simple numeric names.

### [BGM JP Sorter] Usage

```bash
python 00-sorter.py [-i input] [-o output] [-c catalog] [-t theme_only]
```

* `input`: Path to the `MediaPatch` directory
 (Default: `MediaPatch`)
* `output`: Directory where the BGM files will be copied with the name change (Default: `output`)
* `catalog`: Path to the `MediaCatalog.json` file (Default: `MediaPatch/MediaCatalog.json`)
* `theme_only`: Should we only process Theme audio files? (Default: `True`)

If you placed the `MediaPatch` directory in the path where this script is located, you only need to care about the `-t` switch.

### [BGM JP Sorter] Requirements

This script requires a `MediaPatch` directory that contains `MediaCatalog.json`. Place the `MediaPatch` directory on the same path as this script.

```plaintext
BlueArchiveSoundSorter.
│  00-sorter.py
│
└─MediaPatch
        MediaCatalog.json
```

### [BGM JP Sorter] Note

The following BGM files are not included in the MediaPatch directory:  
Therefore, the files below must be extracted from inside the APK or obtained in another way.

* Theme 001
* Theme 008
* Theme 009
* Theme 011
* Theme 012
* Theme 018
* Theme 023
* Theme 029
* Theme 031
* Theme 032
* Theme 034
* Theme 040
* Theme 041
* Theme 042

## MP3 IDv3 Tagger

Apply IDv3 tags to MP3 files based on pre-built information.

## [MP3 IDv3 Tagger] Usage

```bash
python 01-tagger.py [-i input_directory] [-d database_file]
```

* `input_directory`: Directory path containing Blue Archive BGM files converted to MP3 format (Default: `mp3`)
* `database_file`: Path of JSON file with MP3 tag information (Default: `asset/database.json`)

If you place the `mp3` directory in the path where this script is located, you can just execute the script without flags.

## [MP3 IDv3 Tagger] Requirements

This script requires the pip packages `eyed3` and `python-magic-bin`.  
This script also requires a directory containing Blue Archive BGM files converted to MP3 format. Place the directory with this script in the directory where it is located.

```bash
pip install -r requirements.txt
# or
pip install eyed3 python-magic-bin
```

```plaintext
BlueArchiveSoundSorter.
│  01-tagger.py
│
└─mp3
        Theme_02.mp3
        Theme_03.mp3
        ...
```

## [MP3 IDv3 Tagger] Note

This script will write IDv3 tags directly to MP3 files. Please make a backup of the original MP3 files before proceeding.
