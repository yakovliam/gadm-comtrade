import * as papa from "papaparse";
import { ParseResult } from "papaparse";
import AnalogChannel from "../../../types/data/comtrade/channel/analog/analog-channel";
import DigitalChannel from "../../../types/data/comtrade/channel/digital/digital-channel";
import TimestampedValue from "../../../types/data/comtrade/channel/timestamped-value";
import AnalogChannelInfo from "../../../types/data/comtrade/config/analog-channel-info";
import Config, { DataFileType } from "../../../types/data/comtrade/config/config";
import DigitalChannelInfo from "../../../types/data/comtrade/config/digital-channel-info";

interface ParseChannelsReturnType {
    analogChannels: AnalogChannel[];
    digitalChannels: DigitalChannel[];
}

const shiftArray = (arr: Array<Array<string>>): Array<Array<string>> =>
    arr.map((row) => {
        row.shift();
        return row;
    });

const getColumnArray = (arr: Array<Array<string>>, n: number): Array<string> =>
    arr.map((x) => x[n]);

const parseAnalogChannelValue = (
    kind: DataFileType,
    dataView: DataView<ArrayBuffer>,
    offset: number
): number => {
    switch (kind) {
        case DataFileType.ASCII:
            throw 'ASCII not implemented'

        case DataFileType.BINARY:
            return dataView.getInt16(offset, true)

        case DataFileType.BINARY32:
            return dataView.getInt32(offset, true)

        case DataFileType.FLOAT32:
            return dataView.getFloat32(offset, true)

        default:
            throw `Unknown DAT type: ${kind}`
    }
}

const getAnalogChannelValueLength = (kind: DataFileType): number => {
    switch (kind) {
        case DataFileType.ASCII:
            throw 'ASCII not implemented'

        case DataFileType.BINARY:
            return 2

        case DataFileType.BINARY32:
            return 4

        case DataFileType.FLOAT32:
            return 4

        default:
            throw `Unknown DAT type: ${kind}`
    }
}

const parseBinaryChannels = (
    config: Config,
    dataContents: ArrayBuffer
): ParseChannelsReturnType => {
    // Initialize channels
    const analogChannels: AnalogChannel[] = [];
    for (let i = 0; i < config.analogChannelInfo.length; i++) {
        analogChannels.push({
            idx: i,
            values: [],
            info: config.analogChannelInfo[i],
            multiplier: 1,
        });
    }
    const digitalChannels: DigitalChannel[] = [];
    for (let i = 0; i < config.digitalChannelInfo.length; i++) {
        digitalChannels.push({
            idx: i,
            values: [],
            info: config.digitalChannelInfo[i],
        });
    }

    let bytesRead = 0;
    let previousSampleNumber = 0;

    const dataView = new DataView(dataContents);
    // we use dataView.byteLength - 1 because the last byte will be the end of file mark <CR/LF>
    while (bytesRead < dataView.byteLength - 1) {
        // the sample number is always on 4 bytes
        const sampleNumber = dataView.getUint32(bytesRead, true);
        if (
            previousSampleNumber > 0 &&
            previousSampleNumber + 1 !== sampleNumber
        ) {
            throw new Error(
                "Comtrade Error: Sample numbers are not sequential"
            );
        }

        previousSampleNumber = sampleNumber;
        // the timestamp is always on 4 bytes
        bytesRead += 4;

        const timeStamp =
            dataView.getInt32(bytesRead, true) * config.timeStampMultiplier;
        bytesRead += 4;

        // Read analog channels
        for (let i = 0; i < config.analogChannelInfo.length; i++) {
            const value: number =
                parseAnalogChannelValue(config.dataFileType, dataView, bytesRead) *
                    config.analogChannelInfo[i].multiplier +
                Number(config.analogChannelInfo[i].offset);
            analogChannels[i].values.push({
                timestamp: timeStamp,
                value,
            });
            bytesRead += getAnalogChannelValueLength(config.dataFileType);
        }

        // Read digital channels (status channel data)
        // Always unsigned binary on 2 bytes
        for (
            let i = 0;
            i < Math.ceil(config.digitalChannelInfo.length / 16);
            i++
        ) {
            const digitalValue = dataView.getUint16(bytesRead);
            for (let cnt = 8; cnt < 16; cnt++) {
                const mask = 1 << cnt;
                const idx = i * 16 + (cnt - 8);

                // If we've reached the last digital channel, break
                if (idx >= config.digitalChannelInfo.length) {
                    break;
                }

                if ((digitalValue & mask) > 0) {
                    digitalChannels[idx].values.push({
                        timestamp: timeStamp,
                        value: 1,
                    });
                } else {
                    digitalChannels[idx].values.push({
                        timestamp: timeStamp,
                        value: 0,
                    });
                }
            }

            for (let cnt = 0; cnt < 8; cnt++) {
                const mask = 1 << cnt;
                const idx = i * 16 + (cnt + 8);

                // If we've reached the last digital channel, break
                if (idx >= config.digitalChannelInfo.length) {
                    break;
                }

                if ((digitalValue & mask) > 0) {
                    digitalChannels[idx].values.push({
                        timestamp: timeStamp,
                        value: 1,
                    });
                } else {
                    digitalChannels[idx].values.push({
                        timestamp: timeStamp,
                        value: 0,
                    });
                }
            }

            // Status channel data
            // Always unsigned binary on 2 bytes
            bytesRead += 2;
        }
    }

    return { analogChannels, digitalChannels };
};

const parseChannels = (
    config: Config,
    dataContents: ArrayBuffer | string
): ParseChannelsReturnType => {
    if (
        config.dataFileType === DataFileType.BINARY ||
        config.dataFileType === DataFileType.BINARY32  ||
        config.dataFileType === DataFileType.FLOAT32 
    ) {
        return parseBinaryChannels(config, dataContents as ArrayBuffer);
    }

    // get number of each type of channel
    const numberOfAnalogChannels = config.channelsInfo.analogChannels;
    const numberOfDigitalChannels = config.channelsInfo.digitalChannels;

    // create array of analog channel
    const analogChannels: AnalogChannel[] = [];

    // create array of digital channel
    const digitalChannels: DigitalChannel[] = [];

    // parse data into json
    if (!(typeof dataContents === "string")) {
        let decoder = new TextDecoder("utf-8");
        dataContents = decoder.decode(dataContents);
    }
    const jsonData: ParseResult<Array<string>> = papa.parse(dataContents);

    let { data } = jsonData;

    // create array of indexes
    const indexes = getColumnArray(data, 0).map(Number);

    // remove first column (indexes of samples)
    data = shiftArray(data);

    // create array of timestamps
    // loop through only first column (now only timestamps) to gather timestamps
    const timestamps = getColumnArray(data, 0) as unknown as number[];

    // shift again to remove timestamps
    data = shiftArray(data);

    // get analog channel data
    for (let i = 0; i < numberOfAnalogChannels; i += 1) {
        const analogValues = getColumnArray(data, i);

        const output: Array<TimestampedValue> = analogValues
            .filter((value, index) => {
                if (
                    timestamps[index] >= 0 &&
                    value !== "" &&
                    value !== undefined &&
                    timestamps[index] !== undefined
                ) {
                    return true;
                }
                return false;
            })
            .map((value, index) => {
                const valuePair: TimestampedValue = {
                    timestamp: timestamps[index],
                    value: (parseFloat(value)*
                            config.analogChannelInfo[i].multiplier) +
                           Number(config.analogChannelInfo[i].offset),
                };
                return valuePair;
            });

        // get associated info
        const info: AnalogChannelInfo | undefined =
            config.analogChannelInfo.find((c) => c.idx === indexes[i]);

        if (info !== undefined) {
            // create analog channel
            const analogChannel: AnalogChannel = {
                idx: indexes[i],
                values: output,
                info,
                multiplier: 1,
            };

            analogChannels.push(analogChannel);
        }
    }

    // loop through digital channel
    for (
        let i = numberOfAnalogChannels;
        i < numberOfDigitalChannels + numberOfAnalogChannels;
        i++
    ) {
        const digitalValues = getColumnArray(data, i);

        const output: Array<TimestampedValue> = digitalValues
            .filter((value, index) => {
                if (
                    timestamps[index] >= 0 &&
                    value !== "" &&
                    value !== undefined &&
                    timestamps[index] !== undefined
                ) {
                    return true;
                }
                return false;
            })
            .map((value, index) => {
                const valuePair: TimestampedValue = {
                    timestamp: timestamps[index],
                    value: parseFloat(value),
                };
                return valuePair;
            });

        // get associated info
        const info: DigitalChannelInfo | undefined =
            config.digitalChannelInfo.find(
                (c) => c.idx === indexes[i] - numberOfAnalogChannels
            );

        if (info !== undefined) {
            // create digital channel
            const digitalChannel: DigitalChannel = {
                idx: indexes[i],
                values: output,
                info,
            };

            digitalChannels.push(digitalChannel);
        } else {
            console.log(
                "Error, could not find digital channel info for index",
                i
            );
        }
    }

    return { analogChannels, digitalChannels };
};

export default parseChannels;
