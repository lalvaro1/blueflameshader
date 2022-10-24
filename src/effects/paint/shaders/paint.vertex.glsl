const paint_vertexShader = `

attribute vec3 offset;
attribute float particleTime;
attribute float particleFrame;
attribute vec3 color;

varying float v_particleTime;
varying float v_particleFrame;
varying vec3 v_position;
varying vec3 v_color;


void main() {
    //gl_Position = projectionMatrix * modelViewMatrix * vec4(position+offset, 1.0);

    gl_Position = projectionMatrix * vec4(position+offset, 1.0);

    v_particleTime = particleTime;
    v_particleFrame = particleFrame;
    v_position = position;
    v_color = color;
}



















`;


