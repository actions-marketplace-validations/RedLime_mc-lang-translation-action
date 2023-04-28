const core = require('@actions/core');

const fs = require('fs');
const path = require('path');

async function run() {
    let defaultData = null;
    let backupData = {};
    const languageData = {};
    const editableExist = {};

    try {
        const basePath = core.getInput('base-path');
        const fileSuffix = core.getInput('end-with');
        const editableSuffix = core.getInput('editable-suffix');
        const backupSuffix = core.getInput('backup-suffix');
        const defaultName = core.getInput('default-language');
    
        core.info('loading base-path files...');
        const pathFiles = fs.readdirSync(path.join(basePath));
        core.info(`loaded ${pathFiles.length} base-path files.`);
    
        for (const pathName of pathFiles) {
            if (!pathName.endsWith(fileSuffix)) return;
            
            let finalizeName = pathName.substring(0, pathName.length - fileSuffix.length);
            
            const isEditable = finalizeName.endsWith(editableSuffix);
            if (isEditable) finalizeName = finalizeName.substring(0, finalizeName.length - editableSuffix.length);
            
            const isBackup = finalizeName.endsWith(backupSuffix);
            if (isBackup) finalizeName = finalizeName.substring(0, finalizeName.length - backupSuffix.length);
    
            const isDefault = !isBackup && finalizeName == defaultName;
    
            core.info(`found '${pathName}'. (editable: ${isEditable}, default: ${isDefault}, backup: ${isBackup})`);

            core.info(`reading '${pathName}'...`);
            const langData = JSON.parse(fs.readFileSync(path.join(basePath, pathName), 'utf8'));
            core.info(`read '${pathName}' json. lang keys: ${Object.keys(langData).length}`);

            if (isDefault) {
                defaultData = langData;
            } else if (isBackup) {
                backupData = langData;
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
                const oldValue = backupData[key];

                if (defaultValue) {
                    // check same value
                    if (defaultValue == value) continue;

                    // check outdated original value
                    if (oldValue && defaultValue != oldValue) continue;
                }

                resultData[key] = value;
            }
            
            fs.writeFileSync(path.join(basePath, langName + fileSuffix), JSON.stringify(resultData, null, 4), 'utf8');
            core.info(`done with update '${langName}'.`);
        }

        core.info(`backup old default strings...`);
        fs.writeFileSync(path.join(basePath, defaultData + backupSuffix + fileSuffix), JSON.stringify(defaultData, null, 4), 'utf8');
        core.info(`done with backup default strings.`);

        core.info(`complete!`);
    } catch (error) {
        core.setFailed(error.message);
    }


}

run();