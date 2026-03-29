import { ParseResult, parse } from "papaparse";
import parseAnalogChannelsContentToAnalogChannels from "./analog/analog-channels-parser";
import parseChannelsInfoContentToChannelsInfo from "./channels-info/channels-info-parser";
import parseDigitalChannelsContentToDigitalChannels from "./digital/digital-channels-parser";
import AnalogChannelInfo from "../../../types/data/comtrade/config/analog-channel-info";
import ChannelsInfo from "../../../types/data/comtrade/config/channels-info";
import Config, { DataFileType } from "../../../types/data/comtrade/config/config";
import DigitalChannelInfo from "../../../types/data/comtrade/config/digital-channel-info";
import samplingRate from "../../../types/data/comtrade/samp/sampling-rate";

const convertToDate = (dateString: string): Date => {
    // dd/mm/yyyy,hh:mm:ss.ssssss
    const [datePart, timePart] = dateString.split(",");
    const [day, month, year] = datePart.split("/");
    const formattedDateString = `${month}/${day}/${year},${timePart}`;
    return new Date(formattedDateString);
};

const convertToEpochTime = (dateString: string): number => {
    const [date, time] = dateString.split(",");
    const [hours, minutes, secondsMiliseconds] = time
        .split(":")
        .map((part) => part.padStart(2, "0"));
    const [seconds, microseconds] = secondsMiliseconds
        .split(".")
        .map((part) => part.padStart(2, "0"));
    const dateParts = date.split("/").map((part) => part.padStart(2, "0"));
    const dateInUTC = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${hours}:${minutes}:${seconds}Z`;
    const epochTimeInMilliseconds = new Date(dateInUTC).getTime();
    const epochTimeInMicroseconds =
        epochTimeInMilliseconds * 1000 + Number(microseconds);
    return epochTimeInMicroseconds;
};

const changeTimezone = (date: Date, ianatz: string): Date => {
    const invdate = new Date(
        date.toLocaleString("en-US", { timeZone: ianatz })
    );
    const diff = date.getTime() - invdate.getTime();
    return new Date(date.getTime() + diff);
};

const getDataFileType = (fileType: string): DataFileType => {
    switch (fileType.toUpperCase()) {
        case 'ASCII':
            return DataFileType.ASCII
    
        case 'BINARY':
            return DataFileType.BINARY

        case 'BINARY32':
            return DataFileType.BINARY32
        
        case 'FLOAT32':
            return DataFileType.FLOAT32

        default:
            throw `Unknown file type: ${fileType}`;
    }
}

const parseConfigContentsToConfig = (configContents: string): Config => {
    // parse from csv to json
    const jsonData: ParseResult<Array<string>> = parse(configContents);
    const { data } = jsonData;

    // get data
    const stationName: string = data[0][0];
    let recordingDeviceId: string | undefined;
    let revisionYear: string;
    if (data[0].length < 3) {
        recordingDeviceId = undefined;
        revisionYear = data[0][1];
    } else {
        recordingDeviceId = data[0][1];
        revisionYear = data[0][2];
    }

    // create channels info
    const channelsInfo: ChannelsInfo = parseChannelsInfoContentToChannelsInfo(
        data[1] as Array<string>
    );

    // get the rows of data that are analog/digital channels
    const analogChannelLines: Array<Array<string>> = data.slice(
        2,
        2 + channelsInfo.analogChannels
    );
    const digitalChannelLines: Array<Array<string>> = data.slice(
        2 + channelsInfo.analogChannels,
        2 + channelsInfo.analogChannels + channelsInfo.digitalChannels
    );
    // create analog channel info
    const analogChannelInfo: Array<AnalogChannelInfo> =
        parseAnalogChannelsContentToAnalogChannels(analogChannelLines);
    // create digital channel info
    const digitalChannelInfo: Array<DigitalChannelInfo> =
        parseDigitalChannelsContentToDigitalChannels(digitalChannelLines);

    let currentLine: number =
        2 + channelsInfo.analogChannels + channelsInfo.digitalChannels;
    const lineFrequency: number = parseFloat(data[currentLine][0]);

    const nRates: number = parseInt(data[++currentLine][0]);
    const samplingRates: Array<samplingRate> = [];
    for (let i = 0; i < nRates; i++) {
        const sampleRate: number = parseFloat(data[++currentLine][0]);
        const lastSampleIdx: number = parseInt(data[currentLine][1]);
        samplingRates.push({ sampleRate, lastSampleIdx });
    }

    // Note that, if nrates and samp are zero, 
    // the timestamp in the data file becomes critical and
    // endsamp must be set to the number of the last sample in the file. 
    if (nRates === 0) {
        currentLine += 1
    }

    // NOTE: Stores date in the computer's local time zone, not the time zone of the data
    let firstDataPointDateTime: Date = convertToDate(
        data[++currentLine][0] + "," + data[currentLine][1]
    );

    // Can't retrieve microseconds from a Date object, so we'll store it separately
    const firstDataPointMicroseconds: number = convertToEpochTime(
        data[currentLine][0] + "," + data[currentLine][1]
    );

    let triggerDataPointDateTime: Date = convertToDate(
        data[++currentLine][0] + "," + data[currentLine][1]
    );
    const triggerDataPointMicroseconds: number = convertToEpochTime(
        data[currentLine][0] + "," + data[currentLine][1]
    );

    const dataFileType = getDataFileType(data[++currentLine][0]);

    const timeStampMultiplier: number = parseFloat(data[++currentLine][0]);

    // The following fiends were added in the 2013 COMTRADE standard
    // TODO: implement these fields
    let timeCode = undefined;
    let localCode = undefined;
    let tmqCode = undefined;
    let leapSeconds = undefined;

    if (revisionYear === "2013" && nRates > 0) {
        timeCode = data[++currentLine][0];
        // If we get the real time zone, we can convert the time to the correct time zone
        // TODO: sometimes the triggerDataPointDateTime will be the number of samples,
        // so we can't actually use changeTimezone...
        firstDataPointDateTime = changeTimezone(
            firstDataPointDateTime,
            timeCode
        );
        triggerDataPointDateTime = changeTimezone(
            triggerDataPointDateTime,
            timeCode
        );

        localCode = data[++currentLine][0];
        tmqCode = data[++currentLine][0];
        leapSeconds = data[++currentLine][0];
    }

    return {
        stationName,
        recordingDeviceId,
        revisionYear,
        channelsInfo,
        analogChannelInfo,
        digitalChannelInfo,
        lineFrequency,
        nRates,
        samplingRates,
        firstDataPointDateTime,
        triggerDataPointDateTime,
        firstDataPointMicroseconds,
        triggerDataPointMicroseconds,
        dataFileType,
        timeStampMultiplier,
        timeCode,
        localCode,
        tmqCode,
        leapSeconds,
    } as Config;
};

export default parseConfigContentsToConfig;
