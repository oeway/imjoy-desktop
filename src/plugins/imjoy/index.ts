// @ts-ignore
import * as imjoyCore from 'imjoy-core'
import axios from "axios";

import {ModuleApp, useDesktop} from "@owd-client/core/index";
import {OwdModuleAppInfo} from "@owd-client/types";

import WindowImJoyPlugin from "./components/WindowImJoyPlugin.vue";

const imjoyManifest = 'https://raw.githubusercontent.com/imjoy-team/imjoy-plugins/master/manifest.imjoy.json'

const imjoy = new imjoyCore.ImJoy({
  imjoy_api: {},
});

export default async function installImJoy() {
  const desktop = useDesktop()

  // create imjoy module app
  const imjoyModuleApp = desktop.modulesApp.createModuleApp(class ImJoyModule extends ModuleApp {
    setup(): OwdModuleAppInfo {
      return {
        name: 'imjoy',
        singleton: true
      }
    }
  })

  const windowPlugins = await axios.get(imjoyManifest).then(async response => {
    return response.data.plugins.filter((plugin: any) => plugin.type === 'window')
  })

  await imjoy.start({workspace: 'default'})
    .then(() => {
      console.log('ImJoy started')
      imjoy.event_bus.on("add_window", async w => {
        const imjoyWindowInstance = imjoyModuleApp.createWindow({
          component: WindowImJoyPlugin,
          name: `Window${w.name.replace(' ', '')}`,
          title: w.name,
          category: 'plugins',
          icon: "mdi-puzzle",
          size: {
            width: 648,
            height: 440
          },
          position: {
            x: -1,
            y: 0,
            z: 0
          },
          resizable: true,
          theme: {
            noContentSpacing: true
          },
          metaData: {
            iframeUrl: ""
          }
        })
        if (imjoyWindowInstance) {
          imjoyWindowInstance.open(true)
        }

        setTimeout(()=>{
          const container = document.createElement('div')
          container.id = w.window_id;
          container.style.height = "100%";
          container.style.width = "100%";
          const windowElem = document.getElementById(`imjoy-${imjoyWindowInstance.uniqueID}`);
          if(!windowElem) throw new Error("Failed to get the window element.");
          windowElem.appendChild(container);
        }, 0)
   
      })

      // for (const plugin of windowPlugins) {
        desktop.store.commit('core/launcher/ADD', {
          title: "Kaibu",
          icon: 'mdi-puzzle',
          category: 'plugins',
          callback: async () => {
            const viewer = await imjoy.api.createWindow({src: "https://kaibu.org/#/app", name: "Kaibu"})
            await viewer.view_image("https://images.proteinatlas.org/61448/1319_C10_2_blue_red_green.jpg")
            await viewer.add_shapes([[[110, 303], [1512, 1800], [520, 2000]]], {shape_type:"polygon", edge_color:"red", name:"triangle"})
          }
        })
        desktop.store.commit('core/launcher/ADD', {
          title: "ImageJ.JS",
          icon: 'mdi-puzzle',
          category: 'plugins',
          callback: async () => {
            await imjoy.api.createWindow({src: "https://ij.imjoy.io", name: "ImageJ.JS"})
          }
        })
        desktop.store.commit('core/launcher/ADD', {
          title: "elFinder",
          icon: 'mdi-puzzle',
          category: 'plugins',
          callback: async () => {
            await imjoy.api.createWindow({src: "https://fm.imjoy.io", name: "elFinder"})
          }
        })

      // }
      
    })
    .catch((e: ErrorEvent) => console.error('Error while starting ImJoy', e))
}

export function useImJoy() {
  return imjoy
}
