// import {ConsoleTransportInstance, FileTransportInstance} from "winston/lib/winston/transports"
// import path from "path"
// import winston, {Logger} from "winston"
// import {Presets, SingleBar} from "cli-progress"
// todo : wait for bun support
// export const initProgressBar = (format: string): SingleBar => {
//     return new SingleBar({
//         format: format,
//         etaBuffer: 100,
//         barCompleteChar: '\u2588',
//         barIncompleteChar: '\u2591',
//         hideCursor: true
//     }, Presets.shades_classic)
// }
//
// export const initConsoleLogger = (): Logger => {
//     const consoleTransport: ConsoleTransportInstance = new winston.transports.Console({
//         format: winston.format.combine(
//             winston.format.colorize(),
//             winston.format.simple()
//         )
//     })
//
//     return winston.createLogger({
//         transports: [
//             consoleTransport
//         ]
//     })
// }
//
// export const initFileLogger = (): Logger => {
//     const date = new Date().valueOf()
//     const fileTransport: FileTransportInstance = new winston.transports.File({
//         filename: path.join(path.dirname('src'), 'var', 'log', `${date}_combined.log`),
//         format: winston.format.combine(
//             winston.format.timestamp(),
//             winston.format.json()
//         )
//     })
//
//     return winston.createLogger({
//         transports: [
//             fileTransport
//         ]
//     })
// }