/// <reference types="forge-viewer" />
import Model = Autodesk.Viewing.Model;
interface ModelTransformation {
    translation: {
        x: Number;
        y: Number;
        z: Number;
    };
    rotation: {
        x: Number;
        y: Number;
        z: Number;
    };
    scale: {
        x: Number;
        y: Number;
        z: Number;
    };
}
export declare class ModelMetaData {
    modelPath: string;
    modelId: string;
    partId: string;
    model: Model;
    transformation: ModelTransformation;
    loaded: Boolean;
    constructor(path: string, model: Model, partId?: string);
    getTranformation(): ModelTransformation;
    getTranslation(): {
        x: Number;
        y: Number;
        z: Number;
    };
    getScale(): {
        x: Number;
        y: Number;
        z: Number;
    };
    getRotation(): {
        x: Number;
        y: Number;
        z: Number;
    };
    setTransformation(transformation: ModelTransformation): void;
    setTranslation(translation: {
        x: Number;
        y: Number;
        z: Number;
    }): void;
    setRotation(rotation: {
        x: Number;
        y: Number;
        z: Number;
    }): void;
    setScale(scale: {
        x: Number;
        y: Number;
        z: Number;
    }): void;
}
export {};
