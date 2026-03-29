import AnalogChannelInfo from "./analog-channel-info";
import ChannelsInfo from "./channels-info";
import DigitalChannelInfo from "./digital-channel-info";
import SamplingRate from "./sampling-rate";

export enum DataFileType {
    ASCII,
    BINARY,
    BINARY32,
    FLOAT32,
}

type Config = {

    /**
     * "station_name" is the name of the substation location. Non-critical, alphanumeric, minimum length = 0
     * characters, maximum length = 64 characters.
     *
     * Re-labeled as "stationName"
     */
    stationName: string;

    /**
     * "rec_dev_id"
     * is the identification number or name of the recording device. Non-critical, alphanumeric,
     * minimum length = 0 characters, maximum length = 64 characters.
     *
     * Re-labeled as "recordingDeviceId"
     */
    recordingDeviceId: string | undefined;

    /**
     * "rev_year" is the year of the standard revision, e.g. 1999, that identifies the COMTRADE file version.
     * Critical, numeric, minimum length = 4 characters, maximum length = 4 characters.
     * This field shall identify that the file structure differs from the file structure requirement
     * in the original IEEE Std C37.111-1991 COMTRADE Standard. Absence of the field or
     * an empty field is interpreted to mean that the file complies with the 1991 version of the
     * standard.
     *
     * Re-labeled as "revisionYear"
     */
    revisionYear: string;

    /**
     * Contains the information about channels, including amount of both analog and digital, as well
     * as both combined
     */
    channelsInfo: ChannelsInfo;

    /**
     * Contains information about each analog channel
     */
    analogChannelInfo: Array<AnalogChannelInfo>;

    /**
     * Contains information about each digital channel
     */
    digitalChannelInfo: Array<DigitalChannelInfo>;

    /**
     * "lf" is the nominal line frequency in Hz (for example, 50, 60, 33.333). Non-critical, real, numeric,
     * minimum length = 0 characters, maximum length = 32 characters. Standard floating point
     * notation may be used (Kreyszig [B7])
     *
     * Re-labeled as "lineFrequency"
     */
    lineFrequency: number;

    /**
     * "nrates" is the number of sampling rates in the data file. Critical, integer, numeric, minimum length =
     * 1 character, maximum length = 3 characters, minimum value = 0, maximum value = 999.
     *
     * Re-labeled as "nRates"
     * */
    nRates: number;

    /**
     * Contains the sampling rates for the data file
     *
     * TODO: Implement this
     */
    samplingRates: Array<SamplingRate>;

    /**
     * There are to be two date/time stamps in the configuration file. The first one is for the time of the first data
     * value in the data file. The second one is for the time of the trigger point. They shall be displayed in the following format:
     * dd/mm/yyyy,hh:mm:ss.ssssss <CR/LF>
     * dd/mm/yyyy,hh:mm:ss.ssssss <CR/LF>
     *
     * labeled as "firstDataPointDateTime" and "triggerDataPointDateTime"
     * Type: Date, not string as in the COMTRADE standard
     */
    firstDataPointDateTime: Date;
    triggerDataPointDateTime: Date;

    // Can't get microseconds from a Date object, so we'll store the microseconds (since epoch) separately
    firstDataPointMicroseconds: number;
    triggerDataPointMicroseconds: number;

    /**
     * "ft" is the file type. Critical, alphabetical, non-case sensitive, minimum length =
     * 5 characters, maximum length = 6 characters. Only text allowed = ASCII or ascii, BINARY or binary
     *
     */
    dataFileType: DataFileType;

    /**
     * timemult is the multiplication factor for the time differential (timestamp) field in the data file. Critical,
     * real, numeric, minimum length = 1 character, maximum length = 32 characters. Standard floating point notation
     * may be used (Kreyszig [B7]).
     *
     * Re-labeled as "timeStampMultiplier"
     */

    // TODO: Implement this
    timeStampMultiplier: number;

    /**
     * time_code is the same as the time code defined in IEEE Std C37.232-2007.Critical,alphanumeric, minimum length
     * = 1 character, maximum length = 6 characters.
     *
     * Re-labeled as "timeCode"
     *
     * NOTE: Added in the 2013 revision of the COMTRADE standard
     */
    timeCode: string | undefined;

    /**
     * "local_code" is the time difference between the local time zone of the recording location and UTC and is in
     * the same format as time_code. Critical, alphanumeric, minimum length = 1 character, maximum length = 6 characters.
     *
     * Re-labeled as "localCode"
     *
     * NOTE: Added in the 2013 revision of the COMTRADE standard
     */
    localCode: string | undefined;

    /**
     * "tmq_code" is the time quality indicator code of the recording device’s clock. It is an indication of synchronization
     * relative to a source and is similar to the time quality indicator code as defined in IEEE Std C37.118TM. Critical,
     * hexadecimal, minimum length = 1 character, maximum length = 1 character. The time quality value used shall be the quality
     * at the time of time stamp.
     *
     * Re-labeled as "tmqCode"
     *
     * NOTE: Added in the 2013 revision of the COMTRADE standard
     */
    tmqCode: string | undefined;

    /**
     * "leapsec" is the leap second indicator. It indicates that a leap second may have been added or deleted during the recording
     * resulting in either two pieces of data having the same Second of Century time stamp or a missing second. Critical, integer,
     * numeric, minimum length = 1 character, maximum length = 1 character.
     * The only valid values are:
     * 3 = time source does not have the capability to address leap second,
     * 2 = leap second subtracted in the record,
     * 1 = leap second added in the record, and
     * 0 = no leap second in the record.
     *
     * Re-labeled as "leapSeconds"
     *
     * NOTE: Added in the 2013 revision of the COMTRADE standard
     */
    leapSeconds: string | undefined;
};

export default Config;
