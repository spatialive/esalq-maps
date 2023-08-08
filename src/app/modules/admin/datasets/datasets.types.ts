export interface Dataset {
    _id: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    file_name: string;
    username: string;
    public: boolean;
    columns: string[];
    epsg: number;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    created_at: Date;
}
