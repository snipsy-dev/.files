import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import path from 'node:path';
// C:/

const envFile = process.env.WINDOWS_TERMINAL_CONFIG_PATH_FILE;
const bwa =
    process.env.WINDOWS_TERMINAL_BACKGROUND_PATHS ||
    homedir() + path.sep + 'backgrounds';

if (!envFile) {
    err(
        [
            'failed to connect to the terminal file.',

            'please set the WINDOWS_TERMINAL_CONFIG_PATH_FILE',
            'environment variable and run the Script again',
        ].join(' ')
    );
}
const p = path.join(
    path.resolve(process.cwd(), process.env.WINDOWS_TERMINAL_CONFIG_PATH_FILE)
);
const d = createRequire(import.meta.url)(p);
const imageFiles = path.join(path.resolve(bwa));
const data = d;
if (!data) {
    err(
        [
            'the given file appears to be empty.',
            'please provide the correct file.',
        ].join('\n')
    );
    process.exit(0);
}
if (!data.profiles) {
    err(['failed parse the given file.', 'no "profiles" property'].join(' '));
}
/**
 * @type {string[]}
 */
const paths = [];

for (const file of await fs.readdir(imageFiles)) {
    const _file = path.join(imageFiles, file);
    if ((await fs.stat(_file)).isDirectory()) continue;
    paths.push(_file);
}

let imgPath = paths[Math.floor(Math.random() * paths.length)];

if (process.env.WSLENV) {
    imgPath = convertUnixToWin32(imgPath);
}
if (!data.profiles.defaults) {
    err(
        [
            'failed parse the given file.',
            'no "profiles.defaults" property',
        ].join(' ')
    );
}
if (!data?.profiles.defaults) {
    data.profiles.defaults = {
        backgroundImageStretchMode:
            process.env.WINDOWS_TERMINAL_BACKGROUND_MODE || 'fill',
        backgroundImageOpacity:
            process.env.WINDOWS_TERMINAL_BACKGROUND_OPACITY || 0.3,
        backgroundImage: imgPath,
    };
} else {
    data.profiles.defaults = {
        ...data.profiles.defaults,
        backgroundImageStretchMode:
            process.env.WINDOWS_TERMINAL_BACKGROUND_MODE || 'fill',
        backgroundImageOpacity:
            process.env.WINDOWS_TERMINAL_BACKGROUND_OPACITY || 0.3,
        backgroundImage: imgPath,
    };
}
await fs.writeFile(p, JSON.stringify(data));

function err(e) {
    console.error(e);
    process.exit(0);
}
function convertUnixToWin32(unixPath) {
    // Special handling for Unix mount points like /mnt/<drive>
    const drivePattern = /^\/mnt\/([a-zA-Z])\//;
    if (drivePattern.test(unixPath)) {
        const driveLetter = unixPath.match(drivePattern)[1].toUpperCase();
        unixPath = unixPath.replace(drivePattern, `${driveLetter}:\\`);
    }
    const win32Path = unixPath.split('/').join(path.win32.sep);
    return win32Path;
}
