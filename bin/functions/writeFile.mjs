import fs from 'fs';

import { createFolder } from './createFolder.mjs';
import { loadFile } from './loadFile.mjs';

import { errorWriteFile, errorWriteFileWrongType, errorWrite } from '../meta/errors.mjs';

/**
 * Exposed function that handles writing files to disk
 *
 * @exports
 * @function
 * @param {string} file - File contents
 * @param {string} path - File path minus file name
 * @param {string} name - File name
 * @param {string} type - What type of file is going to be written
 * @param {string} format - File format
 */
export async function writeFile(file, path, name, type, format = 'mjs') {
  if (!file || !path || !name || !type) throw new Error(errorWriteFile);

  const _TYPE = type.toLowerCase();

  if (
    _TYPE !== 'raw' &&
    _TYPE !== 'token' &&
    _TYPE !== 'component' &&
    _TYPE !== 'style' &&
    _TYPE !== 'css'
  )
    throw new Error(errorWriteFileWrongType);

  createFolder(path);

  const { filePath, fileContent } = await prepareWrite(_TYPE, file, path, name, format);

  await write(filePath, fileContent);
}

/**
 * Local helper that does most of the actual formatting and writing of the file
 *
 * @async
 * @function
 * @param {string} file - File contents
 * @param {string} path - File path minus file name
 * @param {string} name - File name
 * @param {string} type - What type of file is going to be written
 * @param {string} format - File format
 * @returns {Promise} - Returns promise from wrapped fs.writeFile
 */
async function write(filePath, fileContent) {
  return await new Promise((resolve, reject) => {
    try {
      fs.writeFile(filePath, fileContent, 'utf-8', error => {
        if (error) throw new Error(`${errorWrite}: ${error}`);
        resolve(true);
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function prepareWrite(type, file, path, name, format) {
  let fileContent = ``;

  // Clean name from any slashes
  name = name.replace('/', '');

  let filePath = `${path}/${name}`;

  if (type === 'raw') {
    fileContent = `${JSON.stringify(file, null, ' ')}`;
    filePath += `.${format}`;
  } else if (type === 'token') {
    fileContent = `const ${name} = ${JSON.stringify(file, null, ' ')}\n\nexport default ${name};`;
    filePath += `.${format}`;
  } else if (type === 'component') {
    const SUFFIX = 'Styled';
    let reactTemplate = await loadFile('templates/react.jsx', true);
    reactTemplate = reactTemplate.replace(/{{NAME}}/g, name);
    reactTemplate = reactTemplate.replace(/{{NAME_STYLED}}/g, `${name}${SUFFIX}`);
    fileContent = `${reactTemplate}`;
    filePath += `.${format}`;
  } else if (type === 'style') {
    const SUFFIX = 'Styled';
    let cssTemplate = await loadFile('templates/styled.jsx', true);
    cssTemplate = cssTemplate.replace(/{{NAME_CSS}}/g, `${name}Css`);
    cssTemplate = cssTemplate.replace(/{{NAME_STYLED}}/g, `${name}${SUFFIX}`);
    fileContent = `${cssTemplate}`;
    filePath += `${SUFFIX}.${format}`;
  } else if (type === 'css') {
    const SUFFIX = 'Css';
    fileContent = `const ${name}${SUFFIX} = \`${file}\`\n\nexport default ${name}${SUFFIX};`;
    filePath += `${SUFFIX}.${format}`;
  }

  return { fileContent, filePath };
}
