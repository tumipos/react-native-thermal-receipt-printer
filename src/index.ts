import { NativeModules, NativeEventEmitter, Platform } from "react-native";

import * as EPToolkit from "./utils/EPToolkit";

const RNUSBPrinter = NativeModules.RNUSBPrinter;
const RNBLEPrinter = NativeModules.RNBLEPrinter;
const RNNetPrinter = NativeModules.RNNetPrinter;

export interface PrinterOptions {
  beep?: boolean;
  cut?: boolean;
  tailingLine?: boolean;
  encoding?: string;
}

export interface IUSBPrinter {
  device_name: string;
  vendor_id: string;
  product_id: string;
}

export interface IBLEPrinter {
  device_name: string;
  inner_mac_address: string;
}

export interface INetPrinter {
  device_name: string;
  host: string;
  port: number;
}

export enum PrinterWidth {
  '58mm' = 58,
  '80mm' = 80
}

export interface PrinterImageOptions {
  beep?: boolean;
  cut?: boolean;
  tailingLine?: boolean;
  encoding?: string;
  imageWidth?: number,
  imageHeight?: number,
  printerWidthType?: PrinterWidth,
  // only ios
  paddingX?: number,
}

const defaultOptions = {
  beep: false,
  cut: false,
  tailingLine: false,
  encoding: "UTF8",
};

const textTo64Buffer = (text: string, opts: PrinterOptions) => {
  const defaultOptions = {
    beep: false,
    cut: false,
    tailingLine: false,
    encoding: "UTF8",
  };

  const options = {
    ...defaultOptions,
    ...opts,
  };
  const buffer = EPToolkit.exchange_text(text, options);
  return buffer.toString("base64");
};

const billTo64Buffer = (text: string, opts: PrinterOptions) => {
  const defaultOptions = {
    beep: true,
    cut: true,
    encoding: "UTF8",
    tailingLine: true,
  };
  const options = {
    ...defaultOptions,
    ...opts,
  };
  const buffer = EPToolkit.exchange_text(text, options);
  return buffer.toString("base64");
};

const textPreprocessingIOS = (text: string) => {
  let options = {
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

export const USBPrinter = {
  init: (): Promise<void> =>
    new Promise((resolve, reject) =>
      RNUSBPrinter.init(
        () => resolve(),
        (error: Error) => reject(error)
      )
    ),

  getDeviceList: (): Promise<IUSBPrinter[]> =>
    new Promise((resolve, reject) =>
      RNUSBPrinter.getDeviceList(
        (printers: IUSBPrinter[]) => resolve(printers),
        (error: Error) => reject(error)
      )
    ),

  connectPrinter: (vendorId: number, productId: number): Promise<IUSBPrinter> =>
    new Promise((resolve, reject) =>
      RNUSBPrinter.connectPrinter(
        vendorId,
        productId,
        (printer: IUSBPrinter) => resolve(printer),
        (error: Error) => reject(error)
      )
    ),

  closeConn: (): Promise<void> =>
    new Promise((resolve) => {
      RNUSBPrinter.closeConn();
      resolve();
    }),

  printText: (text: string, opts: PrinterOptions = {}) =>
    new Promise((resolve, reject)=>{
      RNUSBPrinter.printRawData(textTo64Buffer(text, opts),reject, resolve
    )
  }),
  printBill: (text: string, opts: PrinterOptions = {}) =>
    new Promise((resolve, reject)=>{
      RNUSBPrinter.printRawData(billTo64Buffer(text, opts),reject, resolve
    )
  }),
  print: (buffer: Buffer): Promise<void> =>
    new Promise((resolve, reject)=>{
      RNUSBPrinter.printRawData(buffer.toString("base64"), reject, resolve) 
    }),
};

export const BLEPrinter = {
  init: (): Promise<void> =>
    new Promise((resolve, reject) =>
      RNBLEPrinter.init(
        () => resolve(),
        (error: Error) => reject(error)
      )
    ),

  getDeviceList: (): Promise<IBLEPrinter[]> =>
    new Promise((resolve, reject) =>
      RNBLEPrinter.getDeviceList(
        (printers: IBLEPrinter[]) => resolve(printers),
        (error: Error) => reject(error)
      )
    ),

  connectPrinter: (inner_mac_address: string): Promise<IBLEPrinter> =>
    new Promise((resolve, reject) =>
      RNBLEPrinter.connectPrinter(
        inner_mac_address,
        (printer: IBLEPrinter) => resolve(printer),
        (error: Error) => reject(error)
      )
    ),

  closeConn: (): Promise<void> =>
    new Promise((resolve) => {
      RNBLEPrinter.closeConn();
      resolve();
    }),

  printText: (text: string, opts: PrinterOptions = {}) => {
    return new Promise((resolve, reject)=>{
      if (Platform.OS === "ios") {
        const processedText = textPreprocessingIOS(text);
        RNBLEPrinter.printRawData(
          processedText.text,
          opts,
          reject,
          resolve
        );
      } else {
        RNBLEPrinter.printRawData(
          textTo64Buffer(text, opts), 
          reject,
          resolve
        );
      }
    })
  },

  printBill: (text: string, opts: PrinterOptions = {}) => {
    return new Promise((resolve, reject)=>{
      if (Platform.OS === "ios") {
        const processedText = textPreprocessingIOS(text);
        RNBLEPrinter.printRawData(
          processedText.text,
          opts,
          reject,
          resolve
        );
      } else {
        RNBLEPrinter.printRawData(
          billTo64Buffer(text, opts), 
          reject,
          resolve
        );
      }
    })
  },
  print: (buffer: Buffer): Promise<void> =>
    new Promise((resolve, reject)=>{
      if (Platform.OS === "ios") {
        RNBLEPrinter.printRawData(  
          buffer.toString("base64"),
          defaultOptions, 
          reject, 
          resolve
        ) 
      } else {
        RNBLEPrinter.printRawData(buffer.toString("base64"), reject, resolve) 
      }
    }),
    printImage: (imgUrl: string, opts: PrinterImageOptions = {}) => new Promise((resolve, reject)=>{
      if (Platform.OS === "ios") {
        RNBLEPrinter.printImageData(imgUrl, opts, reject, resolve);
      } else {
        RNBLEPrinter.printImageData(imgUrl, opts?.imageWidth ?? 0, opts?.imageHeight ?? 0, reject, resolve);
      }
    }),
    printImageBase64: (Base64: string, opts: PrinterImageOptions = {}) => new Promise((resolve, reject)=>{
      if (Platform.OS === "ios") {
        RNBLEPrinter.printImageBase64(Base64, opts, reject, resolve);
      } else {
        RNBLEPrinter.printImageBase64(Base64, opts?.imageWidth ?? 0, opts?.imageHeight ?? 0, reject, resolve);
      }
    }),
};

export const NetPrinter = {
  init: (): Promise<void> =>
    new Promise((resolve, reject) =>
      RNNetPrinter.init(
        () => resolve(),
        (error: Error) => reject(error)
      )
    ),

  getDeviceList: (): Promise<INetPrinter[]> =>
    new Promise((resolve, reject) =>
      RNNetPrinter.getDeviceList(
        (printers: INetPrinter[]) => resolve(printers),
        (error: Error) => reject(error)
      )
    ),

  connectPrinter: (host: string, port: number): Promise<INetPrinter> =>
    new Promise((resolve, reject) =>
      RNNetPrinter.connectPrinter(
        host,
        port,
        (printer: INetPrinter) => resolve(printer),
        (error: Error) => reject(error)
      )
    ),

  closeConn: (): Promise<void> =>
    new Promise((resolve) => {
      RNNetPrinter.closeConn();
      resolve();
    }),

  printText: (text: string, opts = {}) => {
    return new Promise((resolve, reject)=>{
      if (Platform.OS === "ios") {
        const processedText = textPreprocessingIOS(text);
        RNNetPrinter.printRawData(
          processedText.text,
          opts,
          reject,
          resolve
        );
      } else {
        RNNetPrinter.printRawData(
          textTo64Buffer(text, opts), 
          reject,
          resolve
        );
      }
    })
  },
  printBill: (text: string, opts = {}) => {
    return new Promise((resolve, reject)=>{
      if (Platform.OS === "ios") {
        const processedText = textPreprocessingIOS(text);
        RNNetPrinter.printRawData(
          processedText.text,
          opts,
          reject,
          resolve
        );
      } else {
        RNNetPrinter.printRawData(
          billTo64Buffer(text, opts), 
          reject,
          resolve
        );
      }
    })
  },
  print: (buffer: Buffer): Promise<void> =>
    new Promise((resolve, reject)=>{
      if (Platform.OS === "ios") {
        RNNetPrinter.printRawData(  
          buffer.toString("base64"),
          defaultOptions, 
          reject, 
          resolve
        ) 
      } else {
        RNNetPrinter.printRawData(buffer.toString("base64"), reject, resolve) 
      }
    }),
  printImage: (imgUrl: string, opts: PrinterImageOptions = {}) => new Promise((resolve, reject)=>{
    if (Platform.OS === "ios") {
      RNNetPrinter.printImageData(imgUrl, opts, reject, resolve);
    } else {
      RNNetPrinter.printImageData(imgUrl, opts?.imageWidth ?? 0, opts?.imageHeight ?? 0, reject, resolve);
    }
  }),
  printImageBase64: (Base64: string, opts: PrinterImageOptions = {}) => new Promise((resolve, reject)=>{
    if (Platform.OS === "ios") {
      RNNetPrinter.printImageBase64(Base64, opts, reject, resolve);
    } else {
      RNNetPrinter.printImageBase64(Base64, opts?.imageWidth ?? 0, opts?.imageHeight ?? 0, reject, resolve);
    }
  }),
};

export const NetPrinterEventEmitter = new NativeEventEmitter(RNNetPrinter);

export enum RN_THERMAL_RECEIPT_PRINTER_EVENTS {
  EVENT_NET_PRINTER_SCANNED_SUCCESS = "scannerResolved",
  EVENT_NET_PRINTER_SCANNING = "scannerRunning",
  EVENT_NET_PRINTER_SCANNED_ERROR = "registerError",
}
