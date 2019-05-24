import EventsEmitter from './EventsEmitter'
import Toolkit from "./Toolkit";
/*global THREE*/
/*global Autodesk*/
export default class TranslateHelper extends EventsEmitter {
  
  constructor(viewer) {
    
    super();
    
    this.dbIds = [];
    
    this.active = false;
    
    this.register = false;
    
    this.viewer = viewer;
    
    this.isDragging = false;
    
    this.fullTransform = true;
    
    this.transformMesh = null;
    
    this.selectedFragProxyMap = {};
    
    this.transformControlTx = null;
    
    // eslint-disable-next-line no-undef
    this.hitPoint = new THREE.Vector3();
    
    this.onTxChange = this.onTxChange.bind(this);
    
    this.onAggregateSelectionChanged =
      this.onAggregateSelectionChanged.bind(this);
    
    this.onCameraChanged =
      this.onCameraChanged.bind(this);
    
    this._selectionMode = 'SELECTION_MODE_TRANSFORM';
    
    if (this.viewer.toolController && !this.register) {
      this.viewer.toolController.registerTool(this);
      this.register = true;
    }
  }
  
  getNames() {
    return ['Viewing.Tool.Translate']
  }
  
  getName() {
    return 'Viewing.Tool.Translate'
  }
  
  setFullTransform(fullTransform) {
    this.fullTransform = fullTransform;
    this.clearSelection()
  }
  
  createTransformMesh() {
    
    const material = new THREE.MeshPhongMaterial(
      {color: 0xff0000});
    
    this.viewer.impl.matman().addMaterial(
      'transform-tool-material',
      material,
      true);
    
    
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.0001, 5),
      material);
    
    sphere.position.set(0, 0, 0);
    
    return sphere
  }
  
  static getFragIds(model) {
    const fragCount = model.getFragmentList().fragments.fragId2dbId.length;
    const fragIds = [];
    
    for (let fragId = 0; fragId < fragCount; ++fragId) {
      fragIds.push(fragId)
    }
    
    return fragIds;
  }
  
  static move(position, model) {
    const fragIds = TranslateHelper.getFragIds(model);
    fragIds.forEach((fragId) => {
      // eslint-disable-next-line no-undef
      const fragProxy = NOP_VIEWER.impl.getFragmentProxy(
        model,
        fragId);
      fragProxy.getAnimTransform();
      fragProxy.position = new THREE.Vector3(
        position.x,
        position.y,
        position.z);
      fragProxy.updateAnimTransform()
    });
    
    // eslint-disable-next-line no-undef
    NOP_VIEWER.impl.sceneUpdated(true)
  }
  
  onTxChange(m) {
    if (this.isDragging && this.transformControlTx.visible) {
      
      let position;
      for (let fragId in this.selectedFragProxyMap) {
        const fragProxy = this.selectedFragProxyMap[fragId];
        
        // eslint-disable-next-line no-undef
        position = new THREE.Vector3(
          this.transformMesh.position.x - fragProxy.offset.x,
          this.transformMesh.position.y - fragProxy.offset.y,
          this.transformMesh.position.z - fragProxy.offset.z);
        fragProxy.position = position;
        fragProxy.updateAnimTransform()
        
      }
      this.emit('translate', {
        fragIds: Object.keys(this.selectedFragProxyMap),
        model: this._selection.model,
        translation: position
      });
      this._selection.model.transform = {translation: {x: position.x, y: position.y, z: position.z}}
    }
    
    this.viewer.impl.sceneUpdated(true)
  }
  
  onCameraChanged() {
    
    if (this.transformControlTx) {
      
      this.transformControlTx.update()
    }
  }
  
  onAggregateSelectionChanged(event) {
    switch (this._selectionMode) {
      
      case 'SELECTION_MODE_TRANSFORM':
        
        if (this._selection && this.pointerDown) {
          
          this._selectionMode = 'SELECTION_MODE_RESUME_TRANSFORM';
          
          this.viewer.clearSelection();
          
          if (this._selection.model.selector) {
            
            this._selection.model.selector.setSelection(
              this.dbIds)
          }
          
          return
        }
        
        if (event.selections.length) {
          
          const selection = event.selections[0];
          
          this.setSelection(selection)
          
        } else {
          
          this.clearSelection()
        }
        
        break;
      
      
      case 'SELECTION_MODE_RESUME_TRANSFORM':
        
        setTimeout(() => {
          
          this._selectionMode = 'SELECTION_MODE_TRANSFORM'
        }, 300);
        
        break;
    }
  }
  
  setSelection(selection) {
    
    this._selection = selection;
    
    this.dbIds = this._selection.dbIdArray;
    
    if (this.fullTransform) {
      
      this._selection.fragIdsArray = [];
      this._selection.dbIdArray = [];
      
      const fragCount = this._selection.model.getFragmentList().fragments.fragId2dbId.length;
      
      for (let fragId = 0; fragId < fragCount; ++fragId) {
        
        this._selection.fragIdsArray.push(fragId)
      }
      
      
      const instanceTree =
        this._selection.model.getData().instanceTree;
      
      const rootId = instanceTree.getRootId();
      
      this._selection.dbIdArray.push(rootId)
    }
    
    this.initializeSelection(this.hitPoint);
  }
  
  async initializeSelection(hitPoint) {
    
    this.selectedFragProxyMap = {};
    
    const modelTransform = this._selection.model.transform ||
      {translation: {x: 0, y: 0, z: 0}};
    
    this._selection.model.offset = {
      x: hitPoint.x - modelTransform.translation.x,
      y: hitPoint.y - modelTransform.translation.y,
      z: hitPoint.z - modelTransform.translation.z
    };
    
    this.transformControlTx.visible = true;
    
    this.transformControlTx.setPosition(
      hitPoint);
    
    this.transformControlTx.addEventListener(
      'change', this.onTxChange);
    
    this.viewer.addEventListener(
      // eslint-disable-next-line no-undef
      Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      this.onCameraChanged);
    
    const dbIds = this._selection.dbIdArray;
    
    const model = this._selection.model;
    
    const fragIds = !this._selection.fragIdsArray.length
      ? await Toolkit.getFragIds(model, dbIds)
      : this._selection.fragIdsArray;
    
    fragIds.forEach((fragId) => {
      
      const fragProxy = this.viewer.impl.getFragmentProxy(
        this._selection.model,
        fragId);
      
      fragProxy.getAnimTransform();
      
      fragProxy.offset = {
        x: hitPoint.x - fragProxy.position.x,
        y: hitPoint.y - fragProxy.position.y,
        z: hitPoint.z - fragProxy.position.z
      };
      
      this.selectedFragProxyMap[fragId] = fragProxy
    });
    
    this.viewer.impl.sceneUpdated(true)
  }
  
  clearSelection() {
    
    if (this.active) {
      
      this.transformControlTx.visible = false;
      
      this.selectedFragProxyMap = {};
      
      this._selection = null;
      
      this.dbIds = [];
      
      this.transformControlTx.removeEventListener(
        'change', this.onTxChange);
      
      this.viewer.removeEventListener(
        // eslint-disable-next-line no-undef
        Autodesk.Viewing.CAMERA_CHANGE_EVENT,
        this.onCameraChanged);
      
      this.viewer.impl.sceneUpdated(true);
      
    }
  }
  
  normalize(screenPoint) {
    
    const viewport = this.viewer.navigation.getScreenViewport();
    
    return {
      x: (screenPoint.x - viewport.left) / viewport.width,
      y: (screenPoint.y - viewport.top) / viewport.height
    }
  }
  
  getHitPoint(event) {
    
    const screenPoint = {
      x: event.clientX,
      y: event.clientY
    };
    
    const n = this.normalize(screenPoint);
    
    return this.viewer.utilities.getHitPoint(n.x, n.y);
  }
  
  hitPoint() {
    
    return this.transformControlTx.position
  }
  
  activate() {
    
    if (!this.active) {
      
      this.active = true;
      
      this.viewer.toolController.activateTool(this.getName());
      
      const bbox = this.viewer.model.getBoundingBox();
      
      this.viewer.impl.createOverlayScene(
        'TranslateToolOverlay');
      
      this.transformControlTx = new THREE.TransformControls(
        this.viewer.impl.camera,
        this.viewer.impl.canvas,
        'translate');
      this.transformControlTx.setSize(
        bbox.getBoundingSphere().radius * 10);
      
      this.transformControlTx.visible = false;
      
      this.viewer.impl.addOverlay(
        'TranslateToolOverlay',
        this.transformControlTx);
      
      this.transformMesh = this.createTransformMesh();
      this.transformControlTx.attach(
        this.transformMesh);
      
      this.viewer.addEventListener(
        // eslint-disable-next-line no-undef
        Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
        this.onAggregateSelectionChanged);
      
      this.emit('activate')
    }
  }
  
  
  deactivate() {
    
    if (this.active) {
      
      this.active = false;
      
      this.viewer.toolController.deactivateTool(this.getName());
      
      this.viewer.impl.removeOverlay(
        'TranslateToolOverlay',
        this.transformControlTx);
      
      this.transformControlTx.removeEventListener(
        'change', this.onTxChange);
      
      this.viewer.impl.removeOverlayScene(
        'TranslateToolOverlay');
      
      this.viewer.removeEventListener(
        // eslint-disable-next-line no-undef
        Autodesk.Viewing.CAMERA_CHANGE_EVENT,
        this.onCameraChanged);
      
      this.viewer.removeEventListener(
        // eslint-disable-next-line no-undef
        Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
        this.onAggregateSelectionChanged);
      
      this.emit('deactivate')
    }
  }
  
  handleButtonDown(event) {
    
    this.isDragging = true;
    
    this.pointerDown = this.transformControlTx.onPointerDown(event);
    
    if (this.pointerDown && this._selection)
      return true;
    
    const hitPoint = this.getHitPoint(event);
    
    if (hitPoint) {
      this.hitPoint.copy(hitPoint)
    }
    
    return false
  }
  
  handleButtonUp(event) {
    
    this.isDragging = false;
    
    return !!this.transformControlTx.onPointerUp(event);
    
    
  }
  
  handleMouseMove(event) {
    
    if (this.isDragging) {
      return !!this.transformControlTx.onPointerMove(event);
    }
    
    return !!this.transformControlTx.onPointerHover(event);
    
    
  }
  
  handleKeyDown(event, keyCode) {
    
    if (keyCode === 27) { //ESC
      this.viewer.clearSelection();
      this.deactivate();
    }
    
    return false
  }
}