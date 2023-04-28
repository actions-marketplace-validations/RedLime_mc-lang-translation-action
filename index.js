const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');
const glob = require('@actions/glob');

const fs = require('fs');
const path = require('path');

try {
    const basePath = core.getInput('base-path');
    const fileSuffix = core.getInput('end-with');
    const editableSuffix = core.getInput('editable-suffix');

    core.debug('reading base-path files...');
    const pathFiles = fs.readdirSync(path.join(basePath));
    core.debug(`read ${pathFiles.length} base-path files.`);

    for (const pathName of pathFiles) {
        if (!pathName.endsWith(fileSuffix)) return;
        
        const isEditable = pathName.substring(0, pathName.length - fileSuffix.length).endsWith(fileSuffix);
        core.debug(`found '${pathName}'. (editable: ${isEditable})`);
    }
} catch (error) {
    core.setFailed(error.message);
}