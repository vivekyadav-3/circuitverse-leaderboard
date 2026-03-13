import { execSync } from 'child_process';

try {
    const output = execSync('npx eslint . --format json', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    console.log(output);
} catch (error) {
    if (error.stdout) {
        console.log(error.stdout);
    } else {
        console.error(error);
    }
}
