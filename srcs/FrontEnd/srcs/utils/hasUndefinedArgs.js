import ErrorPage from '../pages/ErrorPage.js'
/**
 * @param  {...any} args 
 */

export default function hasUndefinedArgs(...args) {
    const $container = args[0];
    const hasUndefinedArg = args.some(arg => arg === undefined);
    if (hasUndefinedArg) {
        new ErrorPage($container, 401);
        return true;
    }
    return false;
}

