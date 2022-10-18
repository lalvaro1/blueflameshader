const paint_fragmentShader = `

precision highp float;

out vec4 fragColor;

varying float v_particleTime;
varying vec3 v_position;
varying vec3 v_color;

uniform float iTime;

void main() {

    float fade = 1. * max(0., 1.- v_particleTime*0.025);
    float radius = max(0.001, 0.25075 - v_particleTime*0.005);
    float l = length(v_position);

    float alpha = smoothstep(0., 0.5, 1. - l/radius);

    fragColor = vec4(v_color, alpha * fade);
}

`;
