const earth_demo_url = 'http://lalvaro-test.s3-website-eu-west-1.amazonaws.com/babylon-earth-demo/';
const canvasEffects = [ new PaintEffect() ];

class AutumnChallenge {

    constructor() {
      this.renderer = null;
      this.frame = 0;
      this.currentEffect = null;
      this.effectIndex = -1;
      this.mouse = {x:0, y:0};
    }
    
    nextEffect = () => {

      if(this.currentEffect) {
        this.currentEffect.release();
      }
    
      this.effectIndex = (this.effectIndex + 1) % canvasEffects.length;

      this.currentEffect = canvasEffects[this.effectIndex];

      if(this.currentEffect == null) {
        document.location.href = earth_demo_url;
      }
      else {
        this.currentEffect.init();
        this.currentEffect.mouse = this.mouse;
      }
    
      const canvas = this.renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
    
      this.currentEffect.setSize(width, height);
    
      this.frame = 0;
    }
    
    canvasSetup() {
      this.renderer = new THREE.WebGLRenderer();
      document.body.appendChild(this.renderer.domElement);  
    }

    onClick = (event) => {
      this.currentEffect.onClick(event.pageX, event.pageY);
    }

    mouseSetup() {
      document.onmousemove = (event) => {
          this.mouse = {x:event.pageX, y: event.pageY};      
          this.currentEffect.mouse = this.mouse;
      }
    
      document.addEventListener("click", this.onClick);
    
    }

    resizeRendererToDisplaySize() {
      const canvas = this.renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
  
      if (needResize) {
        this.renderer.setSize(width, height, false);
        this.currentEffect.setSize(width, height);
        this.frame = 0;
      }
      return needResize;
    }
  
    render = (time) => {
  
      this.resizeRendererToDisplaySize();
  
      this.currentEffect.update(time*0.001, this.frame);
      this.currentEffect.render(this.renderer);
      
      this.frame++;
  
      requestAnimationFrame(this.render);
    }

    run() {

      this.canvasSetup();
      this.nextEffect();
      this.mouseSetup();
      
      requestAnimationFrame(this.render);
    }

}

const demo = new AutumnChallenge();
demo.run();

/*
therascience : complements alimentaires, formations webinars
formations en VR au pro de la santé
300 personnes

remplacer un événement en présentiel par un événement VR
virbela
*/