/** Convert data URL to Blob */
export function dataURLtoBlob(dataurl: string): Blob {
    const [header, base64] = dataurl.split(',');
    const mime = header.match(/:(.*?);/)?.[1] || 'image/png';

    const binary = atob(base64);
    const array = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
    }

    return new Blob([array], { type: mime });
}