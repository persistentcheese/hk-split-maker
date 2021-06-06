import logo from "../asset/image/logo.png";

// eslint-disable-next-line max-len
const LIVESPLIT_ICON_DATA_HEADER = "AAEAAAD/////AQAAAAAAAAAMAgAAAFFTeXN0ZW0uRHJhd2luZywgVmVyc2lvbj00LjAuMC4wLCBDdWx0dXJlPW5ldXRyYWwsIFB1YmxpY0tleVRva2VuPWIwM2Y1ZjdmMTFkNTBhM2EFAQAAABVTeXN0ZW0uRHJhd2luZy5CaXRtYXABAAAABERhdGEHAgIAAAAJAwAAAA8DAAAA";
const extraHeader = "Nh0AAA"; // TODO: what

function binaryByteStr(n: number): string {
    return n.toString(2).padStart(8, "0");
}

function bitString(uint8Array: Uint8Array) {
    let binString = "";
    for (const byte of uint8Array) {
        binString += binaryByteStr(byte);
    }
    return binString;
}

function groupBy8(str: string): RegExpMatchArray {
    const match = str.match(/.{1,8}/g);
    if (!match) {
        throw new Error(`groupBy8 failed on ${str}`);
    }
    return match;
}

function binaryTransform(uint8Array: Uint8Array, transform: (byteStr: string) => string) {
    const binStr = bitString(uint8Array);
    const transformedBinStr = transform(binStr);
    const groupedTransformedBinStr = groupBy8(transformedBinStr);
    const transformedBytes = groupedTransformedBinStr.map(n => parseInt(n, 2));
    return Uint8Array.from(transformedBytes);
}

function shiftIntoLivesplitFormat(uint8Array: Uint8Array): Uint8Array {
    return binaryTransform(uint8Array, binStr => `0010${binStr}`);
}

function toBase64(uint8Array: Uint8Array): string {
    return btoa(String.fromCharCode(...uint8Array));
}

async function fetchAsArrayBuffer(imageUrl: string): Promise<ArrayBuffer> {
    const headers = new Headers({
        "Content-Type": "text/xml",
    });
    const response = await fetch(imageUrl, { headers, });
    if (!response.ok) {
        throw new Error(`ERROR ${response.status}: ${response.statusText}`);
    }
    return response.arrayBuffer();
}

const sRGB_START_INDEX = 0x118;
const sRGB_END_INDEX = 0x12A;

function liveSplitifyThePNG(uint8Array: Uint8Array): Uint8Array {
    const copy = new Array<number>(uint8Array.length);
    for (let i = 0; i < uint8Array.length; i++) {
        copy[i] = uint8Array[i];
    }
    copy[copy.length - 1] = 0x80;
    copy.push(0x02);
    return new Uint8Array(copy);
}

export async function createLiveSplitIconData(imageUrl: string): Promise<string> {
    console.log(imageUrl);
    const imageBuffer = await fetchAsArrayBuffer(imageUrl);
    const uint8Array = liveSplitifyThePNG(new Uint8Array(imageBuffer));
    const shiftedArray = shiftIntoLivesplitFormat(uint8Array);
    console.log(shiftedArray);
    const base64 = toBase64(shiftedArray);
    return `${LIVESPLIT_ICON_DATA_HEADER}${extraHeader}${base64}`;

    // return toBase64(new Uint8Array(imageBuffer));
}
