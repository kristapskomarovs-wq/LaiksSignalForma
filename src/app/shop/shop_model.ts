export interface AutoModel {
    id?: number;
    model: string;
    year: number;
    color: string;
    milage: number;
    price: number;
    quantity: number;
}

export interface AllAutosModel {
   allAutos: AutoModel[];
}