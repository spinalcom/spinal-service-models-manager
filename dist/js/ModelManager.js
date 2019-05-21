import TranslateHelper from "./TranslateHelper";
import RotateHelper from "./RotateHelper";
import { assemblyManagerService } from "spinal-service-assembly-manager";


export class ModelManager {
  
  constructor( viewer ) {
    this.viewer = viewer;
    this.assemblyManager = assemblyManagerService;
    this.assemblyManager
      .isInitialized()
      .then( () => {
        this.assemblyManager.autoLoadPart()
          .then(async parts => {
            
              const res = [];
            for (let i = 0; i < parts.length; i++) {
              try {
                const transformation = await this.assemblyManager.getTransformation( parts[i].id.get())
                if (transformation) {
                  const model = this.assemblyManager.getModel( parts[i].id.get() );
                  this.transformModel( model, transformation.transform.get() )
                }
              }
              catch ( e ) {
                console.log(`Model manager error while loading` +
                   `transformation: ${parts[i].id.get()}`, e);
              }
            }
            return Promise.all(res);
          })
          .then(children => {
          
          })
      } );
    
    this.translateHelper = new TranslateHelper( viewer );
    this.rotateHelper = new RotateHelper( viewer );
    this.translateHelper
      .on( 'translate', this.onTranslate.bind( this ) );
    this.rotateHelper
      .on( 'rotate', this.onRotate.bind( this ) );
    
  }
  
  onTranslate( event ) {
    const partId = this.assemblyManager.getPart( event.model.id );
    const transformation = { translate: event.translation };
    this.assemblyManager.setTransformation( partId, transformation )
  }
  
  onRotate( event ) {
    const partId = this.assemblyManager.getPart( event.model.id );
    const transformation = { rotate: event.rotation };
    transformation.rotate.rad = true;
    this.assemblyManager.setTransformation( partId, transformation )
  }
  
  getScale( scale ) {
    scale = scale ? scale : 1.0;
    let x = isNaN( scale ) ? 1.0 : scale;
    let y = isNaN( scale ) ? 1.0 : scale;
    let z = isNaN( scale ) ? 1.0 : scale;
    
    return new window.THREE.Vector3( x, y, z );
  }
  
  getTranslation( obj ) {
    obj = obj ? obj : { x: 0, y: 0, z: 0 };
    let x = isNaN( obj.x ) ? 0.0 : obj.x;
    let y = isNaN( obj.y ) ? 0.0 : obj.y;
    let z = isNaN( obj.z ) ? 0.0 : obj.z;
    
    return new window.THREE.Vector3( x, y, z );
  }
  
  getRotation( obj ) {
    obj = obj ? obj : { x: 0, y: 0, z: 0 };
    let x = isNaN( obj.x ) ? 0.0 : obj.x;
    let y = isNaN( obj.y ) ? 0.0 : obj.y;
    let z = isNaN( obj.z ) ? 0.0 : obj.z;
    
    let q = new window.THREE.Quaternion();
    q.set( obj.x, obj.y, obj.z, obj.w );
    //q.setFromEuler( euler );
    return q;
  }
  
  _transformModel( model, transform, viewer ) {
    function _transformFragProxy( fragId ) {
      let fragProxy = viewer.impl.getFragmentProxy( model, fragId );
      fragProxy.getAnimTransform();
      if (transform.translation)
        fragProxy.position = transform.translation;
      if (transform.scale)
        fragProxy.scale = transform.scale;
      if (transform.rotation) {
        const quaternion = new THREE.Quaternion();
        const angle = new THREE.Euler(
          (transform.rotation.x * Math.PI) / 180,
          (transform.rotation.y * Math.PI) / 180,
          (transform.rotation.z * Math.PI) / 180,
          "XYZ"
        );
        quaternion.setFromEuler( angle );
        fragProxy.quaternion.set(
          quaternion._x,
          quaternion._y,
          quaternion._z,
          quaternion._w
        );
      }
      fragProxy.updateAnimTransform();
    }
    
    return new Promise(  resolve => {
      const fragCount = model.getFragmentList().fragments.fragId2dbId.length;
      
      //fragIds range from 0 to fragCount-1
      for (let fragId = 0; fragId < fragCount; ++fragId) {
        _transformFragProxy( fragId );
      }
      
      return resolve();
    } );
  }
  
  transformModel( model, tranform ) {
    
    let transformation = {
      translation: this.getTranslation( tranform.translate ),
      rotation: this.getRotation( tranform.rotate ),
      scale: this.getScale( tranform.scale )
    };
    const partId = this.assemblyManager.getPart( model.id );
    
    this._transformModel( model, transformation, this.viewer )
      .then( () => {
        return this.assemblyManager.setTransformation( partId, tranform );
      } )
      .then( () => {
        this.viewer.impl.sceneUpdated( true );
      } );
  }
  
  loadModel( node ) {
    
    return window.spinal.ForgeViewer.loadModel( node )
      .then( model => {
        this.assemblyManager.createPart( node.info.name, model )
      } )
    
  }
  
  loadPart( part ) {
    return this.assemblyManager.loadPart( part )
      .then( nodeId => {
        return this.assemblyManager.getTransformation( nodeId );
      } )
      .then( transformation => {
        if (transformation) {
          const model = this.assemblyManager.getModel( part.id.get() );
          this.transformModel( model, transformation.transform.get() )
        }
      } )
  }
  
  getFragIdArray( model ) {
    const res = [];
    
    const fragCount = model.getFragmentList().fragments.fragId2dbId.length
    
    for (let fragId = 0; fragId < fragCount; ++fragId) {
      
      res.push( fragId )
    }
    
    return res;
  }
  
  setTranslateHelperSelection( nodeInfo ) {
    const model = this.assemblyManager.getModel( nodeInfo.id.get() );
    this.translateHelper.setSelection( { model: model } );
  }
  
  setRotateHelperSelection( nodeInfo ) {
    const model = this.assemblyManager.getModel( nodeInfo.id.get() );
    this.rotateHelper.setSelection( { model: model } );
  }
  
}

