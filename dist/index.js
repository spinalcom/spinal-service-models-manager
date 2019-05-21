"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModelsManagerService_1 = require("./ModelsManagerService");
const G_ROOT = typeof window !== "undefined" ? window : global;
if (typeof G_ROOT.spinal === "undefined") {
    G_ROOT.spinal = {};
}
if (typeof G_ROOT.spinal.ModelManagerService === 'undefined')
    G_ROOT.spinal.ModelManagerService = new ModelsManagerService_1.default();
if (!G_ROOT.spinal.ModelManagerService.isInitialize()) {
    const interval = setInterval(() => {
        if (G_ROOT.spinal.ForgeViewer && typeof G_ROOT.spinal.ForgeViewer.viewer !== "undefined") {
            clearInterval(interval);
            G_ROOT.spinal.ModelManagerService.initialize();
        }
    }, 1000);
}
exports.default = G_ROOT.spinal.ModelManagerService;
//# sourceMappingURL=index.js.map