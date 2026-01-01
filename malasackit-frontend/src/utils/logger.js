/**
 * Secure logging utility for production applications
 * Only logs in development environment to prevent information disclosure
 */

const isDevelopment = import.meta.env.MODE === 'development';

export const logger = {
    log: (...args) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },
    
    error: (...args) => {
        if (isDevelopment) {
            console.error(...args);
        }
    },
    
    warn: (...args) => {
        if (isDevelopment) {
            console.warn(...args);
        }
    },
    
    info: (...args) => {
        if (isDevelopment) {
            console.info(...args);
        }
    },
    
    debug: (...args) => {
        if (isDevelopment) {
            console.debug(...args);
        }
    }
};

// For production error tracking, you could integrate with services like:
// - Sentry
// - LogRocket  
// - Bugsnag
// Example:
// export const trackError = (error, context) => {
//     if (production) {
//         Sentry.captureException(error, { extra: context });
//     }
// };