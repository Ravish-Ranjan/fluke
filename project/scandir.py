from os import scandir
from sys import argv
import json


def traverser(fold):
    data = scandir(fold)
    folders = []
    files = []
    for node in data:
        if node.is_dir():
            folders.append(node.name)
        elif node.is_file:
            files.append(node.name)
    res = []
    if len(folders) != 0:
        for subfold in folders:
            res.append(traverser(fold+"/"+subfold))
    locdir = {
        "root":fold.replace("/","//").replace("\\","//").replace("//","/")+"/",
        "name":(fold.replace("/","//").replace("\\","//").replace("//","/")+"/").split("/")[-2],
        "files":files,
        "folders":res
    }
    return locdir

def scanfold(folderpath,destfold):
    with open(destfold+"/scandir.json",'w') as jsn:
        obj = json.dumps(traverser(folderpath),indent=4)
        jsn.write(obj)

scanfold(argv[1],argv[2])