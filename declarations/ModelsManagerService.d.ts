/// <reference types="forge-viewer" />
import GuiViewer3D = Autodesk.Viewing.Private.GuiViewer3D;
import { ModelMetaData } from "./Models/ModelMetaData";
export default class ModelsManagerService {
    modelsMetas: {
        [key: number]: ModelMetaData;
    };
    viewer: GuiViewer3D;
    initialized: Promise<Boolean>;
    translateHelper: any;
    rotateHelper: any;
    listeners: {
        [key: string]: Function[];
    };
    constructor();
    on(eventName: string, func: (event: any) => {}): void;
    emit(eventName: string, event: any): void;
    initialize(): void;
    isInitialize(): Boolean;
    waitForInitialize(): Promise<Boolean>;
    private createModelMetaData;
    loadModelFromNode(node: any): void;
    loadModel(path: any, partId: any): Promise<ModelMetaData>;
    transformModel(modelId: number, transformation: any): void;
    rotateModel(modelId: number, rotation: {
        x: Number;
        y: Number;
        z: Number;
        w: Number;
    }): void;
    translateModel(modelId: number, translate: {
        x: Number;
        y: Number;
        z: Number;
        w: Number;
    }): void;
    setPartId(partId: any, modelId: any): void;
    onTranslate(event: any): void;
    onRotate(event: any): void;
    setTranslateHelperSelection(modelId: any): void;
    setRotateHelperSelection(modelId: any): void;
}
