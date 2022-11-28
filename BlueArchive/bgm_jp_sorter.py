#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
This script compares Blue Archive JP's media files in MediaPatch directory
with MediaCatalog.json file via their file size
and copy them to target directory with renamed file names

Since I couldn't understand what CRC means in MediaCatalog.json, this is only way to get files sorted

Usage:
python bgm_jp_sorter.py [-i input_directory] [-o output_directory] [-c catalog_file] [-t should_process_theme_file_only]

Requirements:
  - MediaPatch directory from Blue Archive JP
	You can get Android/data/com.YostarJP.BlueArchive/files/MediaPatch
  - Edited MediaCatalog.json
	Unless you want to sort all of those assets, it is advised to cleanup that file first
	If you don't, whole process time will increase a lot!

Note:
  - These files are inside APK file, not MediaPatch directory
	It is advised to extract them from BA KR APK, not JP APK because they are encrypted too
	  - Theme 01
	  - Theme 08
	  - Theme 09
	  - Theme 11
	  - Theme 12
	  - Theme 18
	  - Theme 23
	  - Theme 29
	  - Theme 31
	  - Theme 32
	  - Theme 34
	  - Theme 40
	  - Theme 41

"""

import json
import shutil
import argparse
import os
from pathlib import Path

# Do not use this script as module
if __name__ != '__main__':
    print('This script must run as main, not module!')
    exit()


# Change current working directory for scripting
os.chdir(Path(__file__).resolve().parent)


# Define argument-related method first
def dir_path(string: str):
    if isinstance(string, str):
        given_path = Path(string)

    given_path = given_path.resolve().absolute()

    if given_path.is_dir():
        return given_path
    else:
        os.mkdir(given_path)
        return given_path


def str2bool(string: str):
    if isinstance(string, bool):
        return str
    if string.lower() in ('1', 't', 'true', 'y', 'yes'):
        return True
    elif string.lower() in ('0', 'f', 'false', 'n', 'no'):
        return False
    else:
        raise argparse.ArgumentTypeError('Boolean value is expected')


def is_json(obj):
    try:
        json_object = json.loads(obj)
        iterator = iter(json_object)
    except Exception as e:
        return False
    return True


# Define arguments
parser = argparse.ArgumentParser()
parser.description = 'Copy files listed in MediaCatalog.json to output directory with renaming them'
parser.add_argument('-i', '--input', type=dir_path,
                    default='source')
parser.add_argument('-o', '--output', type=dir_path,
                    default='target')
parser.add_argument('-c', '--catalog', type=argparse.FileType('r', encoding='utf-8'),
                    default='MediaCatalog.json')
parser.add_argument('-t', '--only-theme', type=str2bool, default=False)

# Parse arguments
argument = parser.parse_args()
# print(argument)


# Process catalog file
# if not is_json(argument.catalog):
#	raise ValueError('Given MediaCatalog.json file is not JSON')
catalog = json.load(argument.catalog)

# Process source directory
input_dict = dict()
for filename in argument.input.glob('*'):
    if filename.name.endswith('.dat') or filename.name.endswith('.hash') or filename.name.endswith('.json'):
        continue
    input_dict[filename.resolve()] = filename.stat().st_size

for dict_key, dict_value in input_dict.items():
    for catalog_item in catalog['Table'].values():
        # Skip non-Theme files when '--only-theme' flag is set to True
        # TODO: Skip items which is set 'isInBuild' while iterating
        if argument.only_theme and not catalog_item['path'].startswith('Audio/BGM'):
            continue
        if catalog_item['isInbuild'] == True:
            print(
                f"WARNING: {catalog_item['fileName']} is not in MediaPatch directory! Extract it from APK.")
            continue
        if int(dict_value) == int(catalog_item['bytes']):
            shutil.copy(dict_key, Path(argument.output).absolute() /
                        catalog_item['fileName'])
            del catalog_item

# Close MediaCatalog.json file for safety
argument.catalog.close()
