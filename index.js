const core = require('@actions/core');
// const github = require('@actions/github');
// const exec = require('@actions/exec');
// const glob = require('@actions/glob');

const fs = require('fs');
const path = require('path');

async function run() {
    try {
        const basePath = core.getInput('base-path');
        const fileSuffix = core.getInput('end-with');
        const editableSuffix = core.getInput('editable-suffix');
        const defaultName = core.getInput('default-language');
    
        core.info('loading base-path files...');
        const pathFiles = fs.readdirSync(path.join(basePath));
        core.info(`loaded ${pathFiles.length} base-path files.`);
    
        for (const pathName of pathFiles) {
            if (!pathName.endsWith(fileSuffix)) return;
            
            let finalizeName = pathName.substring(0, pathName.length - fileSuffix.length);
            
            const isEditable = finalizeName.endsWith(editableSuffix);
            if (isEditable) {
                finalizeName = finalizeName.substring(0, finalizeName.length - editableSuffix.length);
            }
    
            const isDefault = finalizeName == defaultName;
    
            core.info(`found '${pathName}'. (editable: ${isEditable}, default: ${isDefault})`);

            core.info(`reading '${pathName}'...`);
            const langData = JSON.parse(fs.readFileSync(path.join(basePath, pathName), 'utf8'));
            core.info(`read '${pathName}' json. lang keys: ${Object.keys(langData).length}`);
        }
    } catch (error) {
        core.setFailed(error.message);
    }


}

run();