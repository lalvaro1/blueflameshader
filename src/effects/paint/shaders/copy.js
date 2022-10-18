class PaintEffect extends CanvasDemoEffect {
    constructor() {

        super();

        this.pageOptions.messageText = "";
        this.pageOptions.textColor = "#FFFFFFAA";   
        this.pageOptions.buttonColor = "#FF0000AA";                

        this.uniforms = {};
        this.scene = null;
        this.camera = null;
        this.material = null;
        this.nbParticules = 200;
    }

    init() {

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
      //  this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
        this.camera.position.z = 40;


        this.scene  = new THREE.Scene();
        
        this.uniforms = {
          iTime: { value: 0 },
          iResolution:  { value: new THREE.Vector3() },
          iMouse:  { value: new THREE.Vector4(0,0,0,0) },          
        };
        
        this.material = new THREE.ShaderMaterial({
          fragmentShader : paint_fragmentShader,
          vertexShader : paint_vertexShader,          
          uniforms : this.uniforms,
          glslVersion: THREE.GLSL3, 
        });

        const geometry = new THREE.InstancedBufferGeometry();

        const plane = new THREE.PlaneGeometry(0.2, 0.2);

        // positions
        const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3);

        positions.setXYZ(0, -50, 50, 0.0);
        positions.setXYZ(1, 50, 50, 0.0);
        positions.setXYZ(2, 50, -50, 0.0);
        positions.setXYZ(3, -50, -50, 0.0);

/*
        positions.setXYZ(0, -0.5, 0.5, 0.0);
        positions.setXYZ(1, 0.5, 0.5, 0.0);
        positions.setXYZ(2, -0.5, -0.5, 0.0);
        positions.setXYZ(3, 0.5, -0.5, 0.0);
*/

        //geometry.setAttribute('position', positions);
        geometry.setAttribute('position', plane.getAttribute('position'));
        
        // uvs
        const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2);
        uvs.setXYZ(0, 0.0, 0.0);
        uvs.setXYZ(1, 1.0, 0.0);
        uvs.setXYZ(2, 0.0, 1.0);
        uvs.setXYZ(3, 1.0, 1.0);
        geometry.setAttribute('uv', uvs);
        
        // index
//        geometry.setIndex(new THREE.BufferAttribute(new Uint16Array([ 0, 2, 1, 2, 3, 1 ]), 1));
        geometry.index = plane.index;


        const offsets = new Float32Array(this.nbParticules * 3);

        for (let i = 0; i < this.nbParticules; i++) {
            offsets[i * 3 + 0] = Math.random() * 10.;
            offsets[i * 3 + 1] = Math.random() * 10.;
            offsets[i * 3 + 2] = Math.random() * 10.;
        }

        geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsets, 3, false));

        geometry.instanceCount = this.nbParticules;


        const mesh = new THREE.Mesh( geometry, this.material);
        this.scene.add(mesh);


      
        this.scene.add(new THREE.Mesh(plane, this.material));


    }

    setSize(w, h) {
        this.uniforms.iResolution.value.set(w, h, 1);
    }

    update(time, frame) {
        this.uniforms.iTime.value = time;
        const height = this.uniforms.iResolution.value.y;
        this.uniforms.iMouse.value = new THREE.Vector4(this.mouse.x, height-this.mouse.y, 1, 1);        
    }

    render(renderer) {
        renderer.setRenderTarget(null);
        renderer.render(this.scene, this.camera); 
    }

    release() {
        
    }

    onClick(x, y) {
    }
}  
  
