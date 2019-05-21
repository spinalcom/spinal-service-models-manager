import ModelsManagerService from "./ModelsManagerService";
const G_ROOT =  typeof window !== "undefined" ?  window : global;


if (typeof G_ROOT.spinal === "undefined"){
  G_ROOT.spinal = {};
}

if (typeof G_ROOT.spinal.ModelManagerService === 'undefined')

  G_ROOT.spinal.ModelManagerService = new ModelsManagerService();
if (!G_ROOT.spinal.ModelManagerService.isInitialize())
{
  const interval = setInterval(()=>{
    if (G_ROOT.spinal.ForgeViewer && typeof G_ROOT.spinal.ForgeViewer.viewer !== "undefined")
    {
      clearInterval(interval);
      G_ROOT.spinal.ModelManagerService.initialize();
    }
  }, 1000);
}


export default G_ROOT.spinal.ModelManagerService;

