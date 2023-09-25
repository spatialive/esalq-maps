export const normalize = (value: string): string => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

export const escape = (str): string => {
    const nonAsciiPattern = /[^\x00-\x7F]/g;
    return str.replace(nonAsciiPattern,  (char) => {
        const hex = char.charCodeAt(0).toString(16);
        return hex.length === 2 ? '%'+hex : '%u00'+hex;
    });
};
export const fixEncoding = (str: string): string => {
    try {
        return decodeURIComponent(escape(str));
    }catch (e){
        return str;
    }
};

