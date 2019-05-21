import Model = Autodesk.Viewing.Model;

interface ModelTransformation {
  translation: { x: Number, y: Number, z: Number };
  rotation: { x: Number, y: Number, z: Number };
  scale: { x: Number, y: Number, z: Number };
}

export class ModelMetaData {
  public modelPath: string;
  public modelId: string;
  public partId: string;
  public model: Model;
  public transformation: ModelTransformation;
  public loaded: Boolean = false;


  constructor(path: string, model: Model, partId?: string) {

    this.modelPath = path;
    // @ts-ignore
    this.modelId = model.id;
    this.model = model;
    this.partId = partId;
    this.transformation = {
      translation: {x: 0, y: 0, z: 0},
      rotation: {x: 0, y: 0, z: 0},
      scale: {x: 0, y: 0, z: 0}
    }
  };

  getTranformation(): ModelTransformation{
      return this.transformation;
  }

  getTranslation(): { x: Number, y: Number, z: Number } {
    return this.transformation.translation;
  }


  getScale(): { x: Number, y: Number, z: Number } {
    return this.transformation.scale;
  }

  getRotation(): { x: Number, y: Number, z: Number } {
    return this.transformation.rotation;
  }

  setTransformation(transformation: ModelTransformation){
    this.transformation = transformation;
  }
  setTranslation(translation: { x: Number, y: Number, z: Number }) {
    this.transformation.translation = translation;
  }

  setRotation(rotation: { x: Number, y: Number, z: Number }) {
    this.transformation.rotation = rotation;
  }

  setScale(scale: { x: Number, y: Number, z: Number }) {
    this.transformation.scale = scale
  }

}
