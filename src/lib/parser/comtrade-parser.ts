import { v4 as uuidv4 } from "uuid";
import parseChannels from "./channels/comtrade-channels-parser";
import parseConfigContentsToConfig from "./config/config-parser";
import parseHeaderContentsToHeader from "./header/header-parser";
import Header from "../comtrade/header/header";
import Config from "../comtrade/config/config";
import { Event } from "@/core/store/useEventStore";

const parseFileContentsToComtrade = (
    configContents: string,
    headerContents: string | undefined,
    dataContents: ArrayBuffer | string,
    incrementedEventId: number,
): Event => {
    // TODO: add support for single file comtrade format .CFF (added in 2013 standard)

    const header: Header = headerContents
        ? parseHeaderContentsToHeader(headerContents)
        : null;

    const config: Config = parseConfigContentsToConfig(configContents);

    if (
        config.channelsInfo.analogChannels +
        config.channelsInfo.digitalChannels !==
        config.channelsInfo.totalChannels
    ) {
        throw new Error(
            "Comtrade Error: Total channels does not match sum of analog and digital channels"
        );
    }

    // generate random id
    const id = uuidv4();

    // parse channel
    const { analogChannels, digitalChannels } = parseChannels(
        config,
        dataContents
    );

    return {
        config,
        header,
        analogChannels,
        digitalChannels,
        id,
        eventId: incrementedEventId,
    } as Event;
};

enum ComtradeCFFPartType {
    CFG,
    HDR,
    DAT_BINARY,
    DAT_ASCII,
}

async function* parseLine(stream: ReadableStream<Uint8Array<ArrayBuffer>>) {
    const reader = stream.getReader()
    const utf8Encoder = new TextEncoder();
    const lineBreak = utf8Encoder.encode('\n')[0]
    let remainder = new Uint8Array(0)

    while (true) {
        const { done, value } = await reader.read()

        if (!value) {
            break
        }

        let startIndex = 0
        for (const [i, byte] of value.entries()) {
            if (byte === lineBreak) {
                if (remainder.length > 0) {
                    const slice = value.slice(startIndex, i + 1)
                    const line = new Uint8Array(remainder.length + slice.length)
                    line.set(remainder)
                    line.set(slice, remainder.length)
                    yield line
                    remainder = new Uint8Array(0)
                } else {
                    yield value.slice(startIndex, i + 1)
                }
                startIndex = i + 1
            }
        }

        remainder = value.slice(startIndex)

        if (done) {
            break
        }
    }

    yield remainder
}

export const parseCffFile = async (stream: ReadableStream<Uint8Array<ArrayBuffer>>) => {
    const decoder = new TextDecoder("utf-8");

    let partType: ComtradeCFFPartType | null = null
    let cfg = '';
    let hdr = '';
    let datAscii = '';
    let datBinary = new Uint8Array(0)

    for await (const bytes of parseLine(stream)) {
        const line = decoder.decode(bytes)

        if (line.toLowerCase().includes('--- file type: cfg')) {
            // CFG
            partType = ComtradeCFFPartType.CFG
            continue
        } else if (line.toLowerCase().includes('--- file type: hdr')) {
            // HDR
            partType = ComtradeCFFPartType.HDR
            continue
        } else if (line.toLowerCase().includes('--- file type: dat binary')) {
            // DAT
            partType = ComtradeCFFPartType.DAT_BINARY
            continue
        } else if (line.toLowerCase().includes('--- file type: dat ascii')) {
            // DAT
            partType = ComtradeCFFPartType.DAT_ASCII
            continue
        } else if (line.toLowerCase().includes('--- file type:')) {
            // we ignore other file type
            partType = null
        }

        if (partType === ComtradeCFFPartType.CFG) {
            cfg += line
        } else if (partType === ComtradeCFFPartType.HDR) {
            hdr += line
        } else if (partType === ComtradeCFFPartType.DAT_ASCII) {
            datAscii += line
        } else if (partType === ComtradeCFFPartType.DAT_BINARY) {
            // TODO: Use total length specified in the file (if available)
            const newDat = new Uint8Array(datBinary.length + bytes.length)
            newDat.set(datBinary)
            newDat.set(bytes, datBinary.length)
            datBinary = newDat
        }
    }

    return parseFileContentsToComtrade(
        cfg,
        hdr,
        datAscii.length > 0 ? datAscii : datBinary.buffer,
        0,
    )
}

export default parseFileContentsToComtrade;
