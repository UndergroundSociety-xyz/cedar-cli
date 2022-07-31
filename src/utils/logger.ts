import path from "path"
import {ConsoleTransportInstance, FileTransportInstance} from "winston/lib/winston/transports"
import {Presets, SingleBar} from "cli-progress"
import winston, {Logger} from "winston";

/**
 * Returns a progress bar
 * @param format
 */
export const initProgressBar = (format: string): SingleBar => {
    return new SingleBar({
        format: format,
        etaBuffer: 100,
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    }, Presets.shades_classic)
}

/**
 * Returns a logger with transports depending on quiet mode
 * @param isQuiet
 */
export const initLogger = (isQuiet = false): Logger => {
    const transports = isQuiet ? [initFileTransport()] : [initFileTransport(), initConsoleTransport()]

    return winston.createLogger({
        transports: transports
    })
}

/**
 * Returns a winston console transport instance (logs to console op)
 */
export const initConsoleTransport = (): ConsoleTransportInstance => {
    return new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    })
}

/**
 * Returns a winston file transport instance (logs to a file)
 */
export const initFileTransport = (): FileTransportInstance => {
    const date = new Date().valueOf()

    return new winston.transports.File({
        filename: path.join(path.dirname('src'), 'var', 'log', `${date}_combined.log`),
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        )
    })
}