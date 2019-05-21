"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ModelMetaData {
    constructor(path, model, partId) {
        this.loaded = false;
        this.modelPath = path;
        // @ts-ignore
        this.modelId = model.id;
        this.model = model;
        this.partId = partId;
        this.transformation = {
            translation: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 0, y: 0, z: 0 }
        };
    }
    ;
    getTranformation() {
        return this.transformation;
    }
    getTranslation() {
        return this.transformation.translation;
    }
    getScale() {
        return this.transformation.scale;
    }
    getRotation() {
        return this.transformation.rotation;
    }
    setTransformation(transformation) {
        this.transformation = transformation;
    }
    setTranslation(translation) {
        this.transformation.translation = translation;
    }
    setRotation(rotation) {
        this.transformation.rotation = rotation;
    }
    setScale(scale) {
        this.transformation.scale = scale;
    }
}
exports.ModelMetaData = ModelMetaData;
//# sourceMappingURL=ModelMetaData.js.map