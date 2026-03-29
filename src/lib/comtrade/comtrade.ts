import Config from "./config/config";
import Header from "./header/header";
import AnalogChannel from "./channel/analog/analog-channel";
import DigitalChannel from "./channel/digital/digital-channel";

type Comtrade = {
    // configuration
    config: Config;

    // header file
    header: Header;

    // analog channels
    analogChannels: AnalogChannel[];

    // digital channels
    digitalChannels: DigitalChannel[];

    // a generated id used to identify the comtrade in-software
    id: string;
};

export default Comtrade;
