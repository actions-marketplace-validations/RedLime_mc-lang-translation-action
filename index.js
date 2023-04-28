const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');
const glob = require('@actions/glob');

const fs = require('fs');
const path = require('path');

async function run() {
    try {
        const basePath = getInput('base-path');
        const fileSuffix = getInput('end-with');
        const editableSuffix = getInput('editable-suffix');
        const defaultName = getInput('default-language');
    
        core.debug('reading base-path files...');
        const pathFiles = fs.readdirSync(path.join(basePath));
        core.debug(`read ${pathFiles.length} base-path files.`);
    
        for (const pathName of pathFiles) {
            if (!pathName.endsWith(fileSuffix)) return;
            
            let finalizeName = pathName.substring(0, pathName.length - fileSuffix.length);
            
            const isEditable = finalizeName.endsWith(editableSuffix);
            if (isEditable) {
                finalizeName = finalizeName.substring(0, finalizeName.length - editableSuffix.length);
            }
    
            const isDefault = finalizeName == defaultName;
    
            core.debug(`found '${pathName}'. (editable: ${isEditable}, default: ${isDefault})`);
        }
    } catch (error) {
        core.setFailed(error.message);
    }


}

run();