type SamplingRate = {

    /**
     * "samp" is the sample rate in Hertz (Hz). Critical, real, numeric, minimum length = 1 character,
     * maximum length = 32 characters. Standard floating point notation may be used (Kreyszig [B7]).
     *
     * Re-labeled as "sampleRate"
     */
    sampleRate: number;

    /**
     * "endsamp" is the last sample number at sample rate. Critical, integer, numeric, minimum length = 1 character,
     * maximum length = 10 characters, minimum value = 1, maximum value = 9999999999.
     *
     * Re-labeled as "lastSampleIdx"
     */
    lastSampleIdx: number;
};

export default SamplingRate;
