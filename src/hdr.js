import Env from './env'
import * as THREE from 'three'

import vertexShader from './shaders/final/vertex.glsl'
import fragmentShader from './shaders/final/fragment.glsl'

export default class HDR {
  
  constructor() {
    this.env = new Env()
    this.pane = this.env.pane
    this.scene1 = this.env.scene
    this.camera = this.env.camera
    this.renderer = this.env.renderer

    this._createHDR1()
    this._createHDR2()

    this._createFinalScene()

    this._setConfig()
  }

  _setConfig() {
    const params = {
      progress: 0
    }
    this.pane.addInput(params, 'progress', {
      min: 0,
      max: 1,
      step: 0.1
    }).on('change', e=> {
      this.finalMaterial.uniforms.uProgress.value = e.value
    })
  }

  _createFinalScene() {
    this.renderTarget1 = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight, {
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        encoding: THREE.sRGBEncoding
      }
    )

    this.renderTarget2 = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight, {
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        encoding: THREE.sRGBEncoding
      }
    )

    this.cameraFinal = new THREE.OrthographicCamera(
      -0.5,
      0.5,
      0.5, 
      -0.5,
      -1000,
      1000
    )
    this.cameraFinal.position.set(0, 0, 2)
    this.uniforms = {
      uTime: {
        value: 0
      },
      uTexture1: {
        value: null
      },
      uTexture2: {
        value: null
      },
      uProgress: {
        value: 0
      }
    }

    this.finalMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      uniforms: this.uniforms
    })
    

    this.finalGeo = new THREE.PlaneGeometry(1, 1)
    const mesh = new THREE.Mesh(this.finalGeo, this.finalMaterial)

    this.sceneFinal = new THREE.Scene()
    this.sceneFinal.add(mesh)
  }

  _createHDR2() {
    this.scene2 = new THREE.Scene()
    const tex = new THREE.TextureLoader().load('textures/02.jpg')
    tex.wrapS = THREE.RepeatWrapping
    tex.repeat.x = -1
    
    tex.encoding = THREE.sRGBEncoding
    const geo = new THREE.SphereGeometry(2, 30, 30)
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.BackSide
    })
    const mesh = new THREE.Mesh(geo, mat)
    this.scene2.add(mesh)
  }

  _createHDR1() {
    const tex = new THREE.TextureLoader().load('textures/01.jpg')
    tex.wrapS = THREE.RepeatWrapping
    tex.repeat.x = -1
    
    tex.encoding = THREE.sRGBEncoding
    const geo = new THREE.SphereGeometry(2, 30, 30)
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.BackSide
    })
    const mesh = new THREE.Mesh(geo, mat)
    this.scene1.add(mesh)
    
  }

  update() {

    //this.renderer.render(this.scene2, this.camera)
    this.renderer.setRenderTarget(this.renderTarget1)
    this.renderer.render(this.scene1, this.camera)
    this.renderer.setRenderTarget(this.renderTarget2)
    this.renderer.render(this.scene2, this.camera)

    this.finalMaterial.uniforms.uTexture1.value = this.renderTarget1.texture
    this.finalMaterial.uniforms.uTexture2.value = this.renderTarget2.texture

    this.renderer.setRenderTarget(null)
    this.renderer.render(this.sceneFinal, this.cameraFinal)
  }

}


