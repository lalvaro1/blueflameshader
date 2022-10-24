const PARTICLE_SIZE = 0.95;
const PARTICLE_SPEED = 0.0;
const COLOR_PERIOD = 2.0;
const NB_PARTICLES = 100;
const POSITION_NOISE = 0.0;

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

        this.nbParticules = NB_PARTICLES;
        this.particulesOffsets = new Float32Array(this.nbParticules * 3);
        this.particulesColor = new Float32Array(this.nbParticules * 3);        
        this.particulesTime = new Float32Array(this.nbParticules);        
        this.particulesFrame = new Float32Array(this.nbParticules);                
        this.igeometry = new THREE.InstancedBufferGeometry();
        this.currentIndex = 0;
        this.frame = 0;
    }

    init() {

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, -1, 1000);

        const ratio = window.innerWidth/window.innerHeight;
        this.camera = new THREE.OrthographicCamera(-ratio, ratio, 1, -1, -1, 1);

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

        this.material.transparent = true;
        this.material.blending = THREE.AdditiveBlending;

        const plane = new THREE.PlaneGeometry(PARTICLE_SIZE, PARTICLE_SIZE);

        this.igeometry.copy(plane);

        for (let i = 0; i < this.nbParticules; i++) {
            this.particulesOffsets[i * 3 + 0] = 0;
            this.particulesOffsets[i * 3 + 1] = 0;
            this.particulesOffsets[i * 3 + 2] = 0;

            this.particulesColor[i * 3 + 0] = 0.;
            this.particulesColor[i * 3 + 1] = 0.;
            this.particulesColor[i * 3 + 2] = 0.;                        

            this.particulesTime[i] = this.nbParticules;
            this.particulesFrame[i] = 0;            
        }

        this.igeometry.setAttribute('offset', new THREE.InstancedBufferAttribute(this.particulesOffsets, 3, false));
        this.igeometry.setAttribute('color', new THREE.InstancedBufferAttribute(this.particulesColor, 3, false));
        this.igeometry.setAttribute('particleTime', new THREE.InstancedBufferAttribute(this.particulesTime, 1, false));        
        this.igeometry.setAttribute('particleFrame', new THREE.InstancedBufferAttribute(this.particulesFrame, 1, false));                

        this.igeometry.instanceCount = this.nbParticules;
        const mesh = new THREE.Mesh( this.igeometry, this.material);

        this.scene.add(mesh);
    }

    setSize(w, h) {
        this.uniforms.iResolution.value.set(w, h, 1);
    }

    colormix(col1, col2, mix) {

        function lerp(v1, v2, mix) {
            return v1 + (v2-v1) * mix;
        }

        return [lerp(col1[0], col2[0], mix), lerp(col1[1], col2[1], mix), lerp(col1[2], col2[2], mix)];
    }


    computePaletteAnimation(time) {

        const col1 = [23/255, 11/255, 248/255];
        const col2 = [54/255, 39/255, 127/255];
        const col3 = [12/255, 192/255, 254/255];
        const col4 = [10/255, 120/255, 98/255];
    
        const cycle = COLOR_PERIOD;
        const colorAnim = (time % cycle)/cycle;
    
        if(colorAnim<0.25) return this.colormix(col1, col2, (colorAnim-0.00)/0.25);
        if(colorAnim<0.50) return this.colormix(col2, col3, (colorAnim-0.25)/0.25);    
        if(colorAnim<0.75) return this.colormix(col3, col4, (colorAnim-0.50)/0.25);        
    
        return this.colormix(col4, col1, (colorAnim-0.75)/0.25);        
    }


    updateMouseTrail(time, dt) {

        for(let i=0; i<this.nbParticules; i++) {
            this.particulesTime[i]++;
        }

        const width = this.uniforms.iResolution.value.x;        
        const height = this.uniforms.iResolution.value.y;

        const index = (this.currentIndex++) % this.nbParticules;

        const ratio = window.innerWidth/window.innerHeight;

        const x = (this.mouse.x/width* 2. - 1) * ratio; 
        const y = - (this.mouse.y / height * 2. - 1.);         

        this.particulesOffsets[index * 3 + 0] = x;
        this.particulesOffsets[index * 3 + 1] = y;
        this.particulesOffsets[index * 3 + 2] = 0;

        const color = this.computePaletteAnimation(time);
       
        this.particulesColor[index * 3 + 0] = color[0];
        this.particulesColor[index * 3 + 1] = color[1];
        this.particulesColor[index * 3 + 2] = color[2];

        this.particulesTime[index] = 0;
        this.particulesFrame[index] = this.frame;

        for(let i=0; i<this.nbParticules; i++) {

            const noise = POSITION_NOISE / (1 + this.particulesTime[i]);

            this.particulesOffsets[i * 3 + 0] += (Math.random()-0.5) * noise + PARTICLE_SPEED * dt;
            this.particulesOffsets[i * 3 + 1] += (Math.random()-0.5) * noise + PARTICLE_SPEED * dt;
        }
    }


    update(time, frame) {

        this.frame++;    
        let dt = time - this.uniforms.iTime.value;
        this.uniforms.iTime.value = time;
        const height = this.uniforms.iResolution.value.y;
        const width = this.uniforms.iResolution.value.x;

        this.uniforms.iMouse.value = new THREE.Vector4(this.mouse.x, height-this.mouse.y, 1, 1);        

        this.updateMouseTrail(time, dt);

        this.igeometry.attributes.offset.needsUpdate = true;
        this.igeometry.attributes.particleTime.needsUpdate = true;        
        this.igeometry.attributes.color.needsUpdate = true;                
        this.igeometry.attributes.particleFrame.needsUpdate = true;                
       
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
  
