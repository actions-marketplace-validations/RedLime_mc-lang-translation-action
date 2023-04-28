const core = require('@actions/core');
// const github = require('@actions/github');
// const exec = require('@actions/exec');
// const glob = require('@actions/glob');

const fs = require('fs');
const path = require('path');

async function run() {
    let defaultData = {};
    const languageData = {};
    const editableExist = {};

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

            if (isDefault) {
                defaultData = langData;
            } else {
                if (editableExist[finalizeName] == undefined) editableExist[finalizeName] = false;
                
                if (isEditable) {
                    languageData[finalizeName] = langData;
                    editableExist[finalizeName] = true;
                }
            }
        }

        if (!defaultData) {
            core.setFailed('Failed to load default lang file.');
            return;
        }
        
        core.info('done with reading lang files, try updating...');

        for (const [langName, exist] of Object.entries(editableExist)) {
            if (!exist) {
                languageData[langName] = JSON.parse(JSON.stringify(defaultData));
                fs.writeFileSync(path.join(basePath, langName + editableSuffix + fileSuffix), JSON.stringify(languageData[langName], null, 4), 'utf8');
                core.info(`'${langName}' editable file wasn't exist, created new.`);
            }

            core.info(`start updating '${langName}'...`);

            const resultData = {};
            for (const [key, value] of Object.entries(languageData[langName])) {
                const defaultValue = defaultData[key];
                if (defaultValue) {
                    if (defaultValue == value) continue;
                }

                resultData[key] = value;
            }
            
            fs.writeFileSync(path.join(basePath, langName + fileSuffix), JSON.stringify(resultData, null, 4), 'utf8');
            core.info(`done with update '${langName}'.`);
        }
        core.info(`complete!`);
    } catch (error) {
        core.setFailed(error.message);
    }


}

run();