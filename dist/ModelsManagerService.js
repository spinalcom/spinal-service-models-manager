"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TranslateHelper_1 = require("./js/TranslateHelper");
const RotateHelper_1 = require("./js/RotateHelper");
const ModelMetaData_1 = require("./Models/ModelMetaData");
class ModelsManagerService {
    constructor() {
        this.listeners = {};
        this.modelsMetas = {};
    }
    on(eventName, func) {
        if (!this.listeners.hasOwnProperty(eventName))
            this.listeners[eventName] = [];
        this.listeners[eventName].push(func);
    }
    emit(eventName, event) {
        const listeners = this.listeners[eventName];
        if (!listeners)
            return;
        for (let i = 0; i < listeners.length; i++) {
            listeners[i](event);
        }
    }
    initialize() {
        // @ts-ignore
        this.viewer = window.spinal.ForgeViewer.viewer;
        this.translateHelper = new TranslateHelper_1.default(this.viewer);
        this.rotateHelper = new RotateHelper_1.default(this.viewer);
        this.rotateHelper.on('rotate', this.onRotate.bind(this));
        this.translateHelper.on('translate', this.onTranslate.bind(this));
    }
    isInitialize() {
        return typeof this.viewer !== "undefined";
    }
    waitForInitialize() {
        if (typeof this.initialized === "undefined") {
            this.initialized = new Promise(resolve => {
                const interval = setInterval(() => {
                    if (typeof this.viewer !== "undefined") {
                        clearInterval(interval);
                        resolve(true);
                    }
                }, 1000);
            });
        }
        return this.initialized;
    }
    createModelMetaData(path, model, partId) {
        console.log(path, model.id);
        if (!this.modelsMetas[model.id])
            this.modelsMetas[model.id] = new ModelMetaData_1.ModelMetaData(path, model, partId);
    }
    loadModelFromNode(node) {
        this.loadModel(node.urn.get(), node.id.get());
    }
    loadModel(path, partId) {
        if (!path)
            return Promise.resolve(null);
        if (path.indexOf('http://') === -1 && path.indexOf('https://') === -1)
            path = window.location.origin + path;
        return new Promise((resolve, reject) => {
            const part = partId;
            const _onGeometryLoaded = event => {
                this.viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, _onGeometryLoaded);
                return resolve(this.modelsMetas[event.model.id]);
            };
            // @ts-ignore
            this.viewer.loadModel(path, {}, (m) => {
                this.viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, _onGeometryLoaded);
                // @ts-ignore
                this.createModelMetaData(path, m, part);
            }, (errorCode, errorMessage, statusCode, statusText) => {
                this.viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, _onGeometryLoaded);
                reject({
                    errorCode: errorCode,
                    errorMessage: errorMessage,
                    statusCode: statusCode,
                    statusText: statusText
                });
            });
        });
    }
    transformModel(modelId, transformation) {
        this.translateModel(modelId, transformation.translate);
        this.rotateModel(modelId, transformation.rotate);
    }
    rotateModel(modelId, rotation) {
        if (!rotation)
            return;
        this.modelsMetas[modelId].setRotation(rotation);
        if (rotation.hasOwnProperty('_attribute_names'))
            rotation = rotation.get();
        RotateHelper_1.default.rotate(rotation, this.modelsMetas[modelId].model);
    }
    translateModel(modelId, translate) {
        if (!translate)
            return;
        this.modelsMetas[modelId].setTranslation(translate);
        TranslateHelper_1.default.move(translate, this.modelsMetas[modelId].model);
    }
    setPartId(partId, modelId) {
        if (!this.modelsMetas.hasOwnProperty(modelId)) {
            return;
        }
        this.modelsMetas[modelId].partId = partId;
    }
    onTranslate(event) {
        this.modelsMetas[event.model.id].setTranslation({
            x: event.translation.x,
            y: event.translation.y,
            z: event.translation.z
        });
        this.emit('translate', event.model.id);
    }
    onRotate(event) {
        console.log(this.modelsMetas, event.model.id);
        this.modelsMetas[event.model.id].setRotation({
            x: event.rotation.x,
            y: event.rotation.y,
            z: event.rotation.z
        });
        this.emit('rotate', event.model.id);
    }
    setTranslateHelperSelection(modelId) {
        if (this.modelsMetas.hasOwnProperty(modelId)) {
            const model = this.modelsMetas[modelId].model;
            this.translateHelper.setSelection({ model: model });
        }
    }
    setRotateHelperSelection(modelId) {
        if (this.modelsMetas.hasOwnProperty(modelId)) {
            const model = this.modelsMetas[modelId].model;
            this.rotateHelper.setSelection({ model: model });
        }
    }
}
exports.default = ModelsManagerService;
//# sourceMappingURL=ModelsManagerService.js.map