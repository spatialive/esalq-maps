export const normalize = (value: string): string => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const fixEncoding = (str: string): string => {
    return decodeURIComponent(str);
};

