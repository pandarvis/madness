import { Service } from "./service";
export function useService(): number { const service = new Service(); return service.act(); }
