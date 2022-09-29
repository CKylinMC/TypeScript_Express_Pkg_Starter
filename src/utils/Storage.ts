export class Cache {
    private static cache: { [key: string]: any } = {};
    public static get(key: string): any {
        return Cache.cache[key];
    }
    public static set(key: string, value: any): void {
        Cache.cache[key] = value;
    }
    public static delete(key: string): void {
        delete Cache.cache[key];
    }
    public static exists(key: string): boolean {
        return Cache.cache[key] !== undefined;
    }
    public static getOrDefault(key: string, defaultValue?: any): any {
        return Cache.exists(key) ? Cache.get(key) : defaultValue;
    }
}