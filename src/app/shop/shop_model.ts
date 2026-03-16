export interface AutoModel {
    id?: number;
    model: string;
    year: number;
    color: string;
    milage: number;
    price: number;
    quantity: number;
    imageUrl: string;
}

export interface AllAutosModel {
   allAutos: AutoModel[];
}