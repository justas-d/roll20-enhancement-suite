export interface ITool {
    show: () => HTMLElement;
}

export interface IToolConfig{
    id: string;
    description: string;
    name: string;
    factory: () => ITool;
}
