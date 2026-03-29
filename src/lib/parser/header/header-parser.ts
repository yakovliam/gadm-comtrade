import Header from "../../../types/data/comtrade/header/header";

const parseHeaderContentsToHeader = (headerContents: string): Header => {
    if (!headerContents) {
        return null;
    }
    return headerContents;
};

export default parseHeaderContentsToHeader;
