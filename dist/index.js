var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { NativeModules, NativeEventEmitter, Platform } from "react-native";
import * as EPToolkit from "./utils/EPToolkit";
var RNUSBPrinter = NativeModules.RNUSBPrinter;
var RNBLEPrinter = NativeModules.RNBLEPrinter;
var RNNetPrinter = NativeModules.RNNetPrinter;
export var PrinterWidth;
(function (PrinterWidth) {
    PrinterWidth[PrinterWidth["58mm"] = 58] = "58mm";
    PrinterWidth[PrinterWidth["80mm"] = 80] = "80mm";
})(PrinterWidth || (PrinterWidth = {}));
var defaultOptions = {
    beep: false,
    cut: false,
    tailingLine: false,
    encoding: "UTF8",
};
var textTo64Buffer = function (text, opts) {
    var defaultOptions = {
        beep: false,
        cut: false,
        tailingLine: false,
        encoding: "UTF8",
    };
    var options = __assign(__assign({}, defaultOptions), opts);
    var buffer = EPToolkit.exchange_text(text, options);
    return buffer.toString("base64");
};
var billTo64Buffer = function (text, opts) {
    var defaultOptions = {
        beep: true,
        cut: true,
        encoding: "UTF8",
        tailingLine: true,
    };
    var options = __assign(__assign({}, defaultOptions), opts);
    var buffer = EPToolkit.exchange_text(text, options);
    return buffer.toString("base64");
};
var textPreprocessingIOS = function (text) {
    var options = {
        beep: true,
        cut: true,
    };
    return {
        text: text
            .replace(/<\/?CB>/g, "")
            .replace(/<\/?CM>/g, "")
            .replace(/<\/?CD>/g, "")
            .replace(/<\/?C>/g, "")
            .replace(/<\/?D>/g, "")
            .replace(/<\/?B>/g, "")
            .replace(/<\/?M>/g, ""),
        opts: options,
    };
};
// const imageToBuffer = async (imagePath: string, threshold: number = 60) => {
//   const buffer = await EPToolkit.exchange_image(imagePath, threshold);
//   return buffer.toString("base64");
// };
export var USBPrinter = {
    init: function () {
        return new Promise(function (resolve, reject) {
            return RNUSBPrinter.init(function () { return resolve(); }, function (error) { return reject(error); });
        });
    },
    getDeviceList: function () {
        return new Promise(function (resolve, reject) {
            return RNUSBPrinter.getDeviceList(function (printers) { return resolve(printers); }, function (error) { return reject(error); });
        });
    },
    connectPrinter: function (vendorId, productId) {
        return new Promise(function (resolve, reject) {
            return RNUSBPrinter.connectPrinter(vendorId, productId, function (printer) { return resolve(printer); }, function (error) { return reject(error); });
        });
    },
    closeConn: function () {
        return new Promise(function (resolve) {
            RNUSBPrinter.closeConn();
            resolve();
        });
    },
    printText: function (text, opts) {
        if (opts === void 0) { opts = {}; }
        return new Promise(function (resolve, reject) {
            RNUSBPrinter.printRawData(textTo64Buffer(text, opts), reject, resolve);
        });
    },
    printBill: function (text, opts) {
        if (opts === void 0) { opts = {}; }
        return new Promise(function (resolve, reject) {
            RNUSBPrinter.printRawData(billTo64Buffer(text, opts), reject, resolve);
        });
    },
    print: function (buffer) {
        return new Promise(function (resolve, reject) {
            RNUSBPrinter.printRawData(buffer.toString("base64"), reject, resolve);
        });
    },
};
export var BLEPrinter = {
    init: function () {
        return new Promise(function (resolve, reject) {
            return RNBLEPrinter.init(function () { return resolve(); }, function (error) { return reject(error); });
        });
    },
    getDeviceList: function () {
        return new Promise(function (resolve, reject) {
            return RNBLEPrinter.getDeviceList(function (printers) { return resolve(printers); }, function (error) { return reject(error); });
        });
    },
    connectPrinter: function (inner_mac_address) {
        return new Promise(function (resolve, reject) {
            return RNBLEPrinter.connectPrinter(inner_mac_address, function (printer) { return resolve(printer); }, function (error) { return reject(error); });
        });
    },
    closeConn: function () {
        return new Promise(function (resolve) {
            RNBLEPrinter.closeConn();
            resolve();
        });
    },
    printText: function (text, opts) {
        if (opts === void 0) { opts = {}; }
        return new Promise(function (resolve, reject) {
            if (Platform.OS === "ios") {
                var processedText = textPreprocessingIOS(text);
                RNBLEPrinter.printRawData(processedText.text, opts, reject, resolve);
            }
            else {
                RNBLEPrinter.printRawData(textTo64Buffer(text, opts), reject, resolve);
            }
        });
    },
    printBill: function (text, opts) {
        if (opts === void 0) { opts = {}; }
        return new Promise(function (resolve, reject) {
            if (Platform.OS === "ios") {
                var processedText = textPreprocessingIOS(text);
                RNBLEPrinter.printRawData(processedText.text, opts, reject, resolve);
            }
            else {
                RNBLEPrinter.printRawData(billTo64Buffer(text, opts), reject, resolve);
            }
        });
    },
    print: function (buffer) {
        return new Promise(function (resolve, reject) {
            if (Platform.OS === "ios") {
                RNBLEPrinter.printRawData(buffer.toString("base64"), defaultOptions, reject, resolve);
            }
            else {
                RNBLEPrinter.printRawData(buffer.toString("base64"), reject, resolve);
            }
        });
    },
    printImage: function (imgUrl, opts) {
        if (opts === void 0) { opts = {}; }
        return new Promise(function (resolve, reject) {
            var _a, _b;
            if (Platform.OS === "ios") {
                RNBLEPrinter.printImageData(imgUrl, opts, reject, resolve);
            }
            else {
                RNBLEPrinter.printImageData(imgUrl, (_a = opts === null || opts === void 0 ? void 0 : opts.imageWidth) !== null && _a !== void 0 ? _a : 0, (_b = opts === null || opts === void 0 ? void 0 : opts.imageHeight) !== null && _b !== void 0 ? _b : 0, reject, resolve);
            }
        });
    },
    printImageBase64: function (Base64, opts) {
        if (opts === void 0) { opts = {}; }
        return new Promise(function (resolve, reject) {
            var _a, _b;
            if (Platform.OS === "ios") {
                RNBLEPrinter.printImageBase64(Base64, opts, reject, resolve);
            }
            else {
                RNBLEPrinter.printImageBase64(Base64, (_a = opts === null || opts === void 0 ? void 0 : opts.imageWidth) !== null && _a !== void 0 ? _a : 0, (_b = opts === null || opts === void 0 ? void 0 : opts.imageHeight) !== null && _b !== void 0 ? _b : 0, reject, resolve);
            }
        });
    },
};
export var NetPrinter = {
    init: function () {
        return new Promise(function (resolve, reject) {
            return RNNetPrinter.init(function () { return resolve(); }, function (error) { return reject(error); });
        });
    },
    getDeviceList: function () {
        return new Promise(function (resolve, reject) {
            return RNNetPrinter.getDeviceList(function (printers) { return resolve(printers); }, function (error) { return reject(error); });
        });
    },
    connectPrinter: function (host, port) {
        return new Promise(function (resolve, reject) {
            return RNNetPrinter.connectPrinter(host, port, function (printer) { return resolve(printer); }, function (error) { return reject(error); });
        });
    },
    closeConn: function () {
        return new Promise(function (resolve) {
            RNNetPrinter.closeConn();
            resolve();
        });
    },
    printText: function (text, opts) {
        if (opts === void 0) { opts = {}; }
        return new Promise(function (resolve, reject) {
            if (Platform.OS === "ios") {
                var processedText = textPreprocessingIOS(text);
                RNNetPrinter.printRawData(processedText.text, opts, reject, resolve);
            }
            else {
                RNNetPrinter.printRawData(textTo64Buffer(text, opts), reject, resolve);
            }
        });
    },
    printBill: function (text, opts) {
        if (opts === void 0) { opts = {}; }
        return new Promise(function (resolve, reject) {
            if (Platform.OS === "ios") {
                var processedText = textPreprocessingIOS(text);
                RNNetPrinter.printRawData(processedText.text, opts, reject, resolve);
            }
            else {
                RNNetPrinter.printRawData(billTo64Buffer(text, opts), reject, resolve);
            }
        });
    },
    print: function (buffer) {
        return new Promise(function (resolve, reject) {
            if (Platform.OS === "ios") {
                RNNetPrinter.printRawData(buffer.toString("base64"), defaultOptions, reject, resolve);
            }
            else {
                RNNetPrinter.printRawData(buffer.toString("base64"), reject, resolve);
            }
        });
    },
    printImage: function (imgUrl, opts) {
        if (opts === void 0) { opts = {}; }
        return new Promise(function (resolve, reject) {
            var _a, _b;
            if (Platform.OS === "ios") {
                RNNetPrinter.printImageData(imgUrl, opts, reject, resolve);
            }
            else {
                RNNetPrinter.printImageData(imgUrl, (_a = opts === null || opts === void 0 ? void 0 : opts.imageWidth) !== null && _a !== void 0 ? _a : 0, (_b = opts === null || opts === void 0 ? void 0 : opts.imageHeight) !== null && _b !== void 0 ? _b : 0, reject, resolve);
            }
        });
    },
    printImageBase64: function (Base64, opts) {
        if (opts === void 0) { opts = {}; }
        return new Promise(function (resolve, reject) {
            var _a, _b;
            if (Platform.OS === "ios") {
                RNNetPrinter.printImageBase64(Base64, opts, reject, resolve);
            }
            else {
                RNNetPrinter.printImageBase64(Base64, (_a = opts === null || opts === void 0 ? void 0 : opts.imageWidth) !== null && _a !== void 0 ? _a : 0, (_b = opts === null || opts === void 0 ? void 0 : opts.imageHeight) !== null && _b !== void 0 ? _b : 0, reject, resolve);
            }
        });
    },
};
export var NetPrinterEventEmitter = new NativeEventEmitter(RNNetPrinter);
export var RN_THERMAL_RECEIPT_PRINTER_EVENTS;
(function (RN_THERMAL_RECEIPT_PRINTER_EVENTS) {
    RN_THERMAL_RECEIPT_PRINTER_EVENTS["EVENT_NET_PRINTER_SCANNED_SUCCESS"] = "scannerResolved";
    RN_THERMAL_RECEIPT_PRINTER_EVENTS["EVENT_NET_PRINTER_SCANNING"] = "scannerRunning";
    RN_THERMAL_RECEIPT_PRINTER_EVENTS["EVENT_NET_PRINTER_SCANNED_ERROR"] = "registerError";
})(RN_THERMAL_RECEIPT_PRINTER_EVENTS || (RN_THERMAL_RECEIPT_PRINTER_EVENTS = {}));
